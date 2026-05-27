"""种子数据脚本 — 从环境变量读取上游 API Key 并填充模型配置。

用法：
    cd ~/projects/api-platform/backend
    source venv/bin/activate
    DEEPSEEK_API_KEY=sk-xxx python scripts/seed_with_keys.py

支持的提供商环境变量：
    DEEPSEEK_API_KEY  — DeepSeek
    DASHSCOPE_API_KEY — 阿里云 (DashScope)
    ZHIPU_API_KEY     — 智谱AI
    YI_API_KEY        — 零一万物
    MOONSHOT_API_KEY  — 月之暗面 (Moonshot)
    STEPFUN_API_KEY   — 阶跃星辰
    BAAI_API_KEY      — 智源 (embedding，可选)
"""

import os, sys

# 确保 backend 在 sys.path 中
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

from app.core.config import settings

# ====== 解析 DB 路径（与 database.py 一致）======
_db_url = settings.DATABASE_URL
if "/./" in _db_url:
    _, rel_part = _db_url.split("/./")
    abs_db = os.path.join(backend_dir, rel_part)
else:
    abs_db = os.path.expanduser(_db_url.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", ""))
    if not os.path.isabs(abs_db):
        abs_db = os.path.join(backend_dir, abs_db)

print(f"📁 DB path: {abs_db}")

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.user import Base, User, ModelConfig
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"])
sync_url = f"sqlite:///{abs_db}"
engine = create_engine(sync_url)

# 确保表存在
Base.metadata.create_all(engine)

# ====== 模型定义（有 key 才创建）======
MODEL_DEFS = [
    {
        "name": "deepseek-v3",
        "display_name": "DeepSeek V3",
        "provider": "DeepSeek",
        "upstream_base_url": "https://api.deepseek.com/v1",
        "model_name": "deepseek-chat",
        "env_key": "DEEPSEEK_API_KEY",
        "price_per_input": 1.50,
        "price_per_output": 6.00,
        "model_type": "chat",
        "scene_tags": "通用助手,代码生成,数学推理,长文本处理",
        "context_length": 131072,
        "parameter_size": "671B",
        "sort_order": 1,
        "description": "DeepSeek 最新一代 MoE 大语言模型，671B 参数，128K 上下文",
    },
    {
        "name": "deepseek-r1",
        "display_name": "DeepSeek R1",
        "provider": "DeepSeek",
        "upstream_base_url": "https://api.deepseek.com/v1",
        "model_name": "deepseek-reasoner",
        "env_key": "DEEPSEEK_API_KEY",
        "price_per_input": 2.00,
        "price_per_output": 8.00,
        "model_type": "chat",
        "scene_tags": "数学推理,Vibe Coding,代码生成,旗舰全能",
        "context_length": 131072,
        "parameter_size": "671B",
        "sort_order": 2,
        "description": "DeepSeek 深度推理模型，强化学习训练，擅长数学/代码复杂推理",
    },
    {
        "name": "qwen-2.5",
        "display_name": "Qwen 2.5",
        "provider": "阿里云",
        "upstream_base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "model_name": "qwen-plus",
        "env_key": "DASHSCOPE_API_KEY",
        "price_per_input": 1.00,
        "price_per_output": 4.00,
        "model_type": "chat",
        "scene_tags": "通用助手,RAG,文案创作,内容翻译",
        "context_length": 131072,
        "parameter_size": "72B",
        "sort_order": 3,
        "description": "通义千问 2.5，阿里云自研大语言模型，中文能力出色",
    },
    {
        "name": "qwen-3",
        "display_name": "Qwen 3",
        "provider": "阿里云",
        "upstream_base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "model_name": "qwen-max",
        "env_key": "DASHSCOPE_API_KEY",
        "price_per_input": 2.00,
        "price_per_output": 8.00,
        "model_type": "chat",
        "scene_tags": "旗舰全能,Vibe Coding,多模态理解,领域知识综合",
        "context_length": 262144,
        "parameter_size": "235B",
        "sort_order": 4,
        "description": "通义千问 3 代旗舰，MoE 架构，256K 超长上下文",
    },
    {
        "name": "glm-4",
        "display_name": "GLM-4",
        "provider": "智谱AI",
        "upstream_base_url": "https://open.bigmodel.cn/api/paas/v4",
        "model_name": "glm-4-plus",
        "env_key": "ZHIPU_API_KEY",
        "price_per_input": 1.20,
        "price_per_output": 4.80,
        "model_type": "chat",
        "scene_tags": "通用助手,文案创作,角色扮演,RAG",
        "context_length": 131072,
        "parameter_size": "130B",
        "sort_order": 5,
        "description": "智谱 AI GLM-4，全面升级，支持工具调用",
    },
    {
        "name": "yi-large",
        "display_name": "Yi-Large",
        "provider": "零一万物",
        "upstream_base_url": "https://api.lingyiwanwu.com/v1",
        "model_name": "yi-large",
        "env_key": "YI_API_KEY",
        "price_per_input": 1.80,
        "price_per_output": 7.20,
        "model_type": "chat",
        "scene_tags": "通用助手,长文本处理,内容翻译,领域知识综合",
        "context_length": 262144,
        "parameter_size": "34B",
        "sort_order": 6,
        "description": "零一万物 Yi 系列，深度优化，强大推理能力",
    },
    {
        "name": "moonshot-v1",
        "display_name": "Moonshot v1",
        "provider": "月之暗面",
        "upstream_base_url": "https://api.moonshot.cn/v1",
        "model_name": "moonshot-v1-8k",
        "env_key": "MOONSHOT_API_KEY",
        "price_per_input": 1.00,
        "price_per_output": 4.00,
        "model_type": "chat",
        "scene_tags": "通用助手,长文本处理,RAG,快速响应",
        "context_length": 131072,
        "parameter_size": "128K",
        "sort_order": 7,
        "description": "月之暗面 Kimi 大模型，擅长长文本理解和多轮对话",
    },
    {
        "name": "step-2",
        "display_name": "Step-2",
        "provider": "阶跃星辰",
        "upstream_base_url": "https://api.stepfun.com/v1",
        "model_name": "step-2-16k",
        "env_key": "STEPFUN_API_KEY",
        "price_per_input": 1.50,
        "price_per_output": 6.00,
        "model_type": "chat",
        "scene_tags": "数学推理,Vibe Coding,代码生成",
        "context_length": 131072,
        "parameter_size": "130B",
        "sort_order": 8,
        "description": "阶跃星辰 Step-2，专注推理与代码能力",
    },
    {
        "name": "bge-large-zh",
        "display_name": "BGE-Large-zh",
        "provider": "智源(BAAI)",
        "upstream_base_url": "https://placeholder/v1",
        "model_name": "bge-large-zh-v1.5",
        "env_key": "BAAI_API_KEY",
        "price_per_input": 0.10,
        "price_per_output": 0.10,
        "model_type": "embedding",
        "scene_tags": "RAG,语义搜索,文本相似度",
        "context_length": 512,
        "parameter_size": "326M",
        "sort_order": 9,
        "description": "BAAI BGE 中文嵌入模型，RAG 检索效果业界领先",
    },
]

with Session(engine) as s:
    created = 0
    skipped = 0
    skipped_no_key = 0

    # ====== 用户 ======
    existing_admin = s.query(User).filter(User.email == "admin@aiburj.com").first()
    if not existing_admin:
        s.add(
            User(
                email="admin@aiburj.com",
                username="admin",
                hashed_password=pwd.hash("admin123"),
                balance=100.0,
                is_admin=True,
            )
        )
        print("✅ 创建用户: admin@aiburj.com")
    else:
        print("⏭️  用户已存在: admin@aiburj.com")

    existing_test = s.query(User).filter(User.email == "test@aiburj.com").first()
    if not existing_test:
        s.add(
            User(
                email="test@aiburj.com",
                username="test",
                hashed_password=pwd.hash("test123"),
                balance=10.0,
            )
        )
        print("✅ 创建用户: test@aiburj.com")
    else:
        print("⏭️  用户已存在: test@aiburj.com")

    # ====== 模型 ======
    for m in MODEL_DEFS:
        existing = s.query(ModelConfig).filter(ModelConfig.name == m["name"]).first()
        if existing:
            print(f"⏭️  模型已存在: {m['name']} — 跳过")
            skipped += 1
            continue

        api_key = os.environ.get(m["env_key"], "").strip()
        if not api_key:
            print(f"⚠️  缺少环境变量 {m['env_key']} — 跳过模型: {m['name']}")
            skipped_no_key += 1
            continue

        s.add(
            ModelConfig(
                name=m["name"],
                display_name=m["display_name"],
                provider=m["provider"],
                upstream_base_url=m["upstream_base_url"],
                upstream_api_key=api_key,
                model_name=m["model_name"],
                price_per_input=m["price_per_input"],
                price_per_output=m["price_per_output"],
                model_type=m["model_type"],
                scene_tags=m["scene_tags"],
                context_length=m["context_length"],
                parameter_size=m["parameter_size"],
                sort_order=m["sort_order"],
                description=m["description"],
            )
        )
        print(f"✅ 创建模型: {m['name']} ({m['provider']})")
        created += 1

    s.commit()

# ====== 总结 ======
print()
print("══" * 20)
print(f"📊 结果: 创建 {created} 个模型, 跳过 {skipped} 个(已存在), {skipped_no_key} 个(缺Key)")
print(f"📊 模型总数: {len(MODEL_DEFS)}")
print()
if created == 0 and skipped_no_key > 0:
    print("💡 提示: 请设置环境变量后再运行，例如:")
    print("   DEEPSEEK_API_KEY=sk-xxx python scripts/seed_with_keys.py")
else:
    print("✅ 完成!")
    print("   管理员: admin@aiburj.com / admin123")
    print("   用户:   test@aiburj.com  / test123")
print("══" * 20)
