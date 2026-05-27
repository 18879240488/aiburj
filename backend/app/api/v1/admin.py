"""管理后台接口"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel

from typing import Optional

from app.core.database import get_db
from app.core.auth import get_admin_user
from app.models.user import User, ModelConfig

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


class ModelUpdateRequest(BaseModel):
    display_name: Optional[str] = None
    provider: Optional[str] = None
    upstream_base_url: Optional[str] = None
    upstream_api_key: Optional[str] = None
    price_per_input: Optional[float] = None
    price_per_output: Optional[float] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class ModelResponse(BaseModel):
    id: int
    name: str
    display_name: str
    provider: str
    price_per_input: float
    price_per_output: float
    is_active: bool
    sort_order: int

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
