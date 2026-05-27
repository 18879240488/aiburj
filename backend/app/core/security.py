"""密码哈希工具 - 直接使用 bcrypt（避免 passlib 兼容问题）"""
import bcrypt


def hash_password(password: str) -> str:
    """对密码进行哈希"""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(password.encode(), hashed.encode())
