"""用户模型"""
import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, Float, Numeric, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.sqlite import TEXT

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    balance: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(index=True)
    key: Mapped[str] = mapped_column(String(64), unique=True, index=True, default=lambda: f"sk-{uuid.uuid4().hex}")
    name: Mapped[str] = mapped_column(String(100), default="默认")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ModelConfig(Base):
    """模型配置（管理后台配置）"""
    __tablename__ = "model_configs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)  # 如 gpt-4o-mini
    display_name: Mapped[str] = mapped_column(String(200))  # 展示名
    provider: Mapped[str] = mapped_column(String(100))  # openai, anthropic, deepseek 等
    upstream_base_url: Mapped[str] = mapped_column(String(500))  # 上游 API 地址
    upstream_api_key: Mapped[str] = mapped_column(String(500))  # 上游 API Key
    model_name: Mapped[str] = mapped_column(String(200))  # 上游模型名
    price_per_input: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)  # 每1M输入token价格
    price_per_output: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)  # 每1M输出token价格
    model_type: Mapped[str] = mapped_column(String(50), default="chat")  # chat/image/embedding/rerank/audio/video
    scene_tags: Mapped[str] = mapped_column(String(500), default="")  # 逗号分隔场景标签
    context_length: Mapped[int] = mapped_column(default=0)  # 上下文窗口
    parameter_size: Mapped[str] = mapped_column(String(50), default="")  # 参数量 如 "671B"
    model_icon: Mapped[str] = mapped_column(String(500), default="")  # 模型图标URL
    description: Mapped[str] = mapped_column(Text, default="")  # 模型介绍
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UsageLog(Base):
    """调用日志"""
    __tablename__ = "usage_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(index=True)
    api_key_id: Mapped[int] = mapped_column(index=True, nullable=True)
    model_id: Mapped[int] = mapped_column(index=True)
    model_name: Mapped[str] = mapped_column(String(100))
    prompt_tokens: Mapped[int] = mapped_column(default=0)
    completion_tokens: Mapped[int] = mapped_column(default=0)
    cost: Mapped[float] = mapped_column(Numeric(10, 4), default=0.0)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RechargeOrder(Base):
    """充值订单"""
    __tablename__ = "recharge_orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(index=True)
    order_no: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2))
    pay_method: Mapped[str] = mapped_column(String(20))  # alipay, wechat
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, success, failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    paid_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
