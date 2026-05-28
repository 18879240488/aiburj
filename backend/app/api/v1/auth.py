"""认证接口：注册、登录、获取用户信息"""
import time
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from jose import jwt

from app.core.config import settings
from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.security import hash_password, verify_password
from app.models.user import User

router = APIRouter()

# 登录暴力破解防护：同一 IP 连续失败 5 次后锁定 60 秒
_login_failures: dict[str, tuple[int, float]] = {}  # ip -> (fail_count, lock_until)


def _check_login_rate_limit(ip: str) -> None:
    now = time.time()
    entry = _login_failures.get(ip)
    if entry:
        fail_count, lock_until = entry
        if lock_until > now:
            raise HTTPException(status_code=429, detail="登录尝试过于频繁，请 60 秒后再试")
    # 清理过期条目
    stale = [k for k, v in _login_failures.items() if v[1] <= now]
    for k in stale:
        del _login_failures[k]


def _record_login_failure(ip: str) -> None:
    now = time.time()
    entry = _login_failures.get(ip, (0, 0))
    fail_count = entry[0] + 1 if entry[1] > now else 1
    if fail_count >= 5:
        _login_failures[ip] = (fail_count, now + 60)
    else:
        _login_failures[ip] = (fail_count, 0)


def _clear_login_failures(ip: str) -> None:
    _login_failures.pop(ip, None)


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    balance: float
    is_admin: bool

    class Config:
        from_attributes = True


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user_id), "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # 检查邮箱和用户名是否已存在
    result = await db.execute(select(User).where(
        (User.email == req.email) | (User.username == req.username)
    ))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="邮箱或用户名已存在")

    user = User(
        email=req.email,
        username=req.username,
        hashed_password=hash_password(req.password),
        balance=1.0,  # 新用户赠送 1 元体验金
    )
    db.add(user)
    await db.commit()
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    _check_login_rate_limit(ip)

    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        _record_login_failure(ip)
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="用户已被禁用")

    _clear_login_failures(ip)
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user


class LogoutResponse(BaseModel):
    detail: str = "已退出登录"


@router.post("/logout", response_model=LogoutResponse)
async def logout(user: User = Depends(get_current_user)):
    """退出登录。客户端应删除本地 token。"""
    return LogoutResponse(detail="已退出登录")
