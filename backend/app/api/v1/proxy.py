"""OpenAI 兼容 API 代理 - 核心转发逻辑"""
import json
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, ApiKey, ModelConfig, UsageLog

router = APIRouter()


async def verify_api_key(request: Request, db: AsyncSession) -> tuple[User, ApiKey]:
    """验证 API Key"""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid API key")

    key = auth_header.replace("Bearer ", "").strip()
    result = await db.execute(select(ApiKey).where(
        ApiKey.key == key, ApiKey.is_active == True
    ))
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    result = await db.execute(select(User).where(User.id == api_key.user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found or disabled")

    return user, api_key


async def get_model_config(model_name: str, db: AsyncSession) -> ModelConfig:
    """获取模型配置"""
    result = await db.execute(
        select(ModelConfig).where(ModelConfig.name == model_name, ModelConfig.is_active == True)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found")
    return config


@router.post("/chat/completions")
async def chat_completions(request: Request, db: AsyncSession = Depends(get_db)):
    """OpenAI 兼容的聊天补全接口"""
    user, api_key = await verify_api_key(request, db)
    body = await request.json()
    model_name = body.get("model", "")

    model_config = await get_model_config(model_name, db)

    # 检查余额
    estimated_cost = 0.001  # 预扣最小值
    if user.balance < estimated_cost:
        raise HTTPException(status_code=402, detail="Insufficient balance")

    # 转发到上游
    headers = {
        "Authorization": f"Bearer {model_config.upstream_api_key}",
        "Content-Type": "application/json",
    }
    upstream_url = f"{model_config.upstream_base_url}/chat/completions"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(upstream_url, json=body, headers=headers)
        result = response.json()

    # 统计 token
    prompt_tokens = result.get("usage", {}).get("prompt_tokens", 0)
    completion_tokens = result.get("usage", {}).get("completion_tokens", 0)
    cost = (prompt_tokens / 1_000_000 * model_config.price_per_input +
            completion_tokens / 1_000_000 * model_config.price_per_output)

    # 记录用量
    log = UsageLog(
        user_id=user.id,
        api_key_id=api_key.id,
        model_id=model_config.id,
        model_name=model_config.name,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        cost=cost,
        ip_address=request.client.host if request.client else None,
    )
    db.add(log)

    # 扣费
    user.balance -= cost
    await db.commit()

    return result


@router.post("/completions")
async def completions(request: Request, db: AsyncSession = Depends(get_db)):
    """OpenAI 兼容的补全接口（简化版）"""
    user, api_key = await verify_api_key(request, db)
    body = await request.json()
    model_name = body.get("model", "")
    model_config = await get_model_config(model_name, db)

    if user.balance < 0.001:
        raise HTTPException(status_code=402, detail="Insufficient balance")

    headers = {
        "Authorization": f"Bearer {model_config.upstream_api_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{model_config.upstream_base_url}/completions", json=body, headers=headers
        )
        result = response.json()

    prompt_tokens = result.get("usage", {}).get("prompt_tokens", 0)
    completion_tokens = result.get("usage", {}).get("completion_tokens", 0)
    cost = (prompt_tokens / 1_000_000 * model_config.price_per_input +
            completion_tokens / 1_000_000 * model_config.price_per_output)

    log = UsageLog(
        user_id=user.id, api_key_id=api_key.id, model_id=model_config.id,
        model_name=model_config.name, prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens, cost=cost,
    )
    db.add(log)
    user.balance -= cost
    await db.commit()

    return result


@router.get("/models")
async def list_upstream_models(request: Request, db: AsyncSession = Depends(get_db)):
    """返回可用的模型列表（兼容 OpenAI SDK）"""
    result = await db.execute(
        select(ModelConfig).where(ModelConfig.is_active == True)
    )
    models = result.scalars().all()
    return {
        "object": "list",
        "data": [
            {
                "id": m.name,
                "object": "model",
                "created": int(time.time()),
                "owned_by": m.provider,
            }
            for m in models
        ]
    }
