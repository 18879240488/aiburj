"""计费相关接口"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User, ApiKey, UsageLog, RechargeOrder

router = APIRouter()


class ApiKeyResponse(BaseModel):
    id: int
    name: str
    key: str
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_str(cls, obj):
        data = {
            "id": obj.id,
            "name": obj.name,
            "key": obj.key,
            "is_active": obj.is_active,
            "created_at": obj.created_at.isoformat() if obj.created_at else "",
        }
        return cls(**data)


class UsageSummary(BaseModel):
    total_prompt_tokens: int
    total_completion_tokens: int
    total_cost: float


@router.get("/balance")
async def get_balance(user: User = Depends(get_current_user)):
    return {"balance": user.balance}


class CreateApiKeyRequest(BaseModel):
    name: str = "默认"


@router.post("/api-keys", response_model=ApiKeyResponse)
async def create_api_key(
    req: CreateApiKeyRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    key = ApiKey(user_id=user.id, name=req.name)
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return ApiKeyResponse.from_orm_with_str(key)


@router.get("/api-keys", response_model=list[ApiKeyResponse])
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.user_id == user.id).order_by(desc(ApiKey.id))
    )
    return result.scalars().all()


@router.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user.id)
    )
    key = result.scalar_one_or_none()
    if not key:
        return {"error": "Key not found"}
    key.is_active = False
    await db.commit()
    return {"status": "ok"}


@router.get("/usage", response_model=UsageSummary)
async def get_usage(
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(
            func.coalesce(func.sum(UsageLog.prompt_tokens), 0),
            func.coalesce(func.sum(UsageLog.completion_tokens), 0),
            func.coalesce(func.sum(UsageLog.cost), 0),
        ).where(UsageLog.user_id == user.id)
    )
    row = result.one()
    return UsageSummary(
        total_prompt_tokens=row[0],
        total_completion_tokens=row[1],
        total_cost=round(row[2], 4),
    )


@router.get("/orders")
async def list_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(RechargeOrder)
        .where(RechargeOrder.user_id == user.id)
        .order_by(desc(RechargeOrder.id))
        .offset((page - 1) * size)
        .limit(size)
    )
    return result.scalars().all()
