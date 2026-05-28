from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import init_db
from app.api.v1 import auth, billing, proxy, admin, models as models_api, recharge


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="aiburj API",
    description="AI Model API Aggregation Platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["计费"])
app.include_router(proxy.router, prefix="/v1", tags=["API代理"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["管理后台"])
app.include_router(models_api.router, prefix="/api/v1/models", tags=["模型"])
app.include_router(recharge.router, prefix="/api/v1/recharge", tags=["充值"])
app.include_router(recharge.admin_router, prefix="/api/v1/admin", tags=["充值管理"])


@app.get("/")
async def root():
    return {"message": "aiburj API Platform Running", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
