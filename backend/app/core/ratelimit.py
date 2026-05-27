"""速率限制 — 基于滑动窗口的简单实现"""
import time
from collections import defaultdict
from fastapi import HTTPException, Request


class RateLimiter:
    """简单的内存速率限制器"""

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _cleanup(self, key: str, now: float):
        """清理过期记录"""
        cutoff = now - self.window
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]
        if not self._requests[key]:
            del self._requests[key]

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        self._cleanup(key, now)
        if len(self._requests[key]) >= self.max_requests:
            return False
        self._requests[key].append(now)
        return True

    def remaining(self, key: str) -> int:
        now = time.time()
        self._cleanup(key, now)
        return max(0, self.max_requests - len(self._requests[key]))


# 默认限制：每 60 秒 60 次请求
rate_limiter = RateLimiter(max_requests=60, window_seconds=60)


async def check_rate_limit(request: Request):
    """FastAPI 依赖：检查速率限制"""
    # 用 API Key 或 IP 作为 key
    auth = request.headers.get("Authorization", "")
    ip = request.client.host if request.client else "unknown"
    key = auth if auth.startswith("Bearer ") else f"ip:{ip}"

    if not rate_limiter.is_allowed(key):
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": f"每分钟最多 {rate_limiter.max_requests} 次请求",
                "retry_after": rate_limiter.window,
            }
        )

    return True
