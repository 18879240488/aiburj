"""模型列表接口（用户可见）"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import ModelConfig

router = APIRouter()


class ModelResponse(BaseModel):
    id: int
    name: str
    display_name: str
    price_per_input: float  # 每1M token
    price_per_output: float

    class Config:
        from_attributes = True


@router.get("/", response_model=list[ModelResponse])
async def list_models(db: AsyncSession = Depends(get_db)):
    """获取所有上架模型"""
    result = await db.execute(
        select(ModelConfig).where(ModelConfig.is_active == True).order_by(ModelConfig.sort_order)
    )
    return result.scalars().all()
