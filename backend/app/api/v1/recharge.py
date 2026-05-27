"""充值系统接口"""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from pydantic import BaseModel

from app.core.database import get_db
from app.core.auth import get_current_user, get_admin_user
from app.models.user import User, RechargeOrder

router = APIRouter()

# 充值套餐
RECHARGE_PLANS = [
    {"id": "plan_10", "amount": 10, "bonus": 0, "label": "10元"},
    {"id": "plan_50", "amount": 50, "bonus": 5, "label": "50元（送5元）"},
    {"id": "plan_100", "amount": 100, "bonus": 15, "label": "100元（送15元）"},
    {"id": "plan_200", "amount": 200, "bonus": 40, "label": "200元（送40元）"},
    {"id": "plan_500", "amount": 500, "bonus": 120, "label": "500元（送120元）"},
]


class RechargeRequest(BaseModel):
    plan_id: str
    pay_method: str = "manual"  # manual, alipay, wechat


class RechargeOrderResponse(BaseModel):
    id: int
    order_no: str
    amount: float
    pay_method: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


class AdminConfirmRequest(BaseModel):
    order_id: int


@router.get("/plans")
async def get_plans():
    """获取充值套餐列表"""
    return {"plans": RECHARGE_PLANS}


@router.post("/recharge", response_model=RechargeOrderResponse)
async def create_recharge(
    req: RechargeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """创建充值订单"""
    plan = next((p for p in RECHARGE_PLANS if p["id"] == req.plan_id), None)
    if not plan:
        raise HTTPException(status_code=400, detail="无效的充值套餐")

    order = RechargeOrder(
        user_id=user.id,
        order_no=f"RC{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}",
        amount=plan["amount"] + plan["bonus"],  # 含赠送
        pay_method=req.pay_method,
        status="pending",
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    return RechargeOrderResponse(
        id=order.id,
        order_no=order.order_no,
        amount=order.amount,
        pay_method=order.pay_method,
        status=order.status,
        created_at=order.created_at.isoformat() if order.created_at else "",
    )


@router.get("/orders")
async def list_my_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """我的充值订单"""
    result = await db.execute(
        select(RechargeOrder)
        .where(RechargeOrder.user_id == user.id)
        .order_by(desc(RechargeOrder.id))
        .offset((page - 1) * size)
        .limit(size)
    )
    orders = result.scalars().all()
    return [
        {
            "id": o.id,
            "order_no": o.order_no,
            "amount": o.amount,
            "pay_method": o.pay_method,
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else "",
            "paid_at": o.paid_at.isoformat() if o.paid_at else None,
        }
        for o in orders
    ]


# === 管理后台 ===
admin_router = APIRouter(dependencies=[Depends(get_admin_user)])


@admin_router.get("/recharge/orders")
async def admin_list_orders(
    status: str = Query("pending"),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """管理后台：充值订单列表"""
    query = select(RechargeOrder)
    if status != "all":
        query = query.where(RechargeOrder.status == status)
    query = query.order_by(desc(RechargeOrder.id)).offset((page - 1) * size).limit(size)

    result = await db.execute(query)
    orders = result.scalars().all()
    return [
        {
            "id": o.id,
            "user_id": o.user_id,
            "order_no": o.order_no,
            "amount": o.amount,
            "pay_method": o.pay_method,
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else "",
            "paid_at": o.paid_at.isoformat() if o.paid_at else None,
        }
        for o in orders
    ]


@admin_router.post("/recharge/confirm")
async def admin_confirm_recharge(
    req: AdminConfirmRequest,
    db: AsyncSession = Depends(get_db),
):
    """管理后台：确认充值到账"""
    result = await db.execute(select(RechargeOrder).where(RechargeOrder.id == req.order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="订单已处理")

    # 更新订单状态
    order.status = "success"
    order.paid_at = datetime.utcnow()

    # 给用户加余额
    result = await db.execute(select(User).where(User.id == order.user_id))
    user = result.scalar_one_or_none()
    if user:
        user.balance += order.amount

    await db.commit()
    return {"status": "ok", "order_no": order.order_no, "amount": order.amount}


@admin_router.post("/recharge/reject")
async def admin_reject_recharge(
    req: AdminConfirmRequest,
    db: AsyncSession = Depends(get_db),
):
    """管理后台：拒绝充值"""
    result = await db.execute(select(RechargeOrder).where(RechargeOrder.id == req.order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="订单已处理")

    order.status = "failed"
    await db.commit()
    return {"status": "ok", "order_no": order.order_no}
