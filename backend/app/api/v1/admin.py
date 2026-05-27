"""管理后台接口"""
from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from pydantic import BaseModel

from typing import Optional

from app.core.database import get_db
from app.core.auth import get_admin_user
from app.models.user import User, ModelConfig, UsageLog, RechargeOrder

router = APIRouter(dependencies=[Depends(get_admin_user)])


class ModelCreateRequest(BaseModel):
    name: str
    display_name: str
    provider: str
    upstream_base_url: str
    upstream_api_key: str
    model_name: str
    price_per_input: float = 0.0
    price_per_output: float = 0.0
    sort_order: int = 0
    model_type: str = "chat"
    scene_tags: str = ""
    context_length: int = 0
    parameter_size: str = ""
    model_icon: str = ""
    description: str = ""


class ModelUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    provider: Optional[str] = None
    upstream_base_url: Optional[str] = None
    upstream_api_key: Optional[str] = None
    price_per_input: Optional[float] = None
    price_per_output: Optional[float] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    model_type: Optional[str] = None
    scene_tags: Optional[str] = None
    context_length: Optional[int] = None
    parameter_size: Optional[str] = None
    model_icon: Optional[str] = None
    description: Optional[str] = None


class ModelResponse(BaseModel):
    id: int
    name: str
    display_name: str
    provider: str
    price_per_input: float
    price_per_output: float
    is_active: bool
    sort_order: int
    model_type: str = "chat"
    scene_tags: str = ""
    context_length: int = 0
    parameter_size: str = ""
    model_icon: str = ""
    description: str = ""

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    balance: float
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True


class BalanceRequest(BaseModel):
    amount: float
    action: str = "add"  # add / subtract


@router.get("/users", response_model=list[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(desc(User.id)))
    return result.scalars().all()


@router.post("/users/{user_id}/balance")
async def adjust_balance(
    user_id: int,
    req: BalanceRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.action == "add":
        user.balance += req.amount
    else:
        user.balance = max(0, user.balance - req.amount)
    await db.commit()
    return {"balance": user.balance}


@router.post("/models", response_model=ModelResponse)
async def create_model(req: ModelCreateRequest, db: AsyncSession = Depends(get_db)):
    model = ModelConfig(**req.model_dump())
    db.add(model)
    await db.commit()
    return model


@router.put("/models/{model_id}", response_model=ModelResponse)
async def update_model(model_id: int, req: ModelUpdateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ModelConfig).where(ModelConfig.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    for key, val in req.model_dump(exclude_none=True).items():
        setattr(model, key, val)
    await db.commit()
    return model


@router.delete("/models/{model_id}")
async def delete_model(model_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ModelConfig).where(ModelConfig.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    model.is_active = False
    await db.commit()
    return {"status": "ok"}


@router.get("/models", response_model=list[ModelResponse])
async def list_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ModelConfig).order_by(ModelConfig.sort_order))
    return result.scalars().all()


class StatsResponse(BaseModel):
    total_users: int
    active_models: int
    api_calls_today: int
    total_revenue: float


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    # 总用户数
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0

    # 活跃模型数
    active_models_result = await db.execute(
        select(func.count(ModelConfig.id)).where(ModelConfig.is_active == True)
    )
    active_models = active_models_result.scalar() or 0

    # 今日 API 调用次数
    today_start = datetime.combine(date.today(), datetime.min.time())
    calls_result = await db.execute(
        select(func.count(UsageLog.id)).where(UsageLog.created_at >= today_start)
    )
    api_calls_today = calls_result.scalar() or 0

    # 总收入（充值成功总额）
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(RechargeOrder.amount), 0.0)).where(
            RechargeOrder.status == "success"
        )
    )
    total_revenue = revenue_result.scalar() or 0.0

    return StatsResponse(
        total_users=total_users,
        active_models=active_models,
        api_calls_today=api_calls_today,
        total_revenue=round(total_revenue, 2),
    )


class UserUpdateRequest(BaseModel):
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    balance: Optional[float] = None


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    req: UserUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.is_admin is not None:
        user.is_admin = req.is_admin
    if req.is_active is not None:
        user.is_active = req.is_active
    if req.balance is not None:
        user.balance = req.balance
    await db.commit()
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "balance": user.balance,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
    }
