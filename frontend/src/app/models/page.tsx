"use client";

import { useEffect, useMemo, useState } from "react";
import ProviderLogo from "@/components/ProviderLogo";

interface ModelInfo {
  id: number;
  name: string;
  display_name: string;
  provider: string;
  description?: string;
  price_per_input: number;
  price_per_output: number;
  model_type?: string;
  scene_tags?: string;
  context_length?: number;
  parameter_size?: string;
  model_icon?: string;
  available?: boolean;
}

const MODEL_TYPE_LABELS: Record<string, string> = {
  chat: "对话",
  image: "生图",
  embedding: "嵌入",
  rerank: "重排序",
  audio: "语音",
  video: "视频",
};

const FALLBACK_MODELS: ModelInfo[] = [
  {
    id: 1, name: "deepseek-v3", display_name: "DeepSeek V3", provider: "DeepSeek",
    price_per_input: 1.50, price_per_output: 6.00, model_type: "chat",
    scene_tags: "通用助手,代码生成,数学推理,长文本处理",
    context_length: 131072, parameter_size: "671B",
    description: "DeepSeek 最新一代 MoE 大语言模型，671B 参数，支持 128K 上下文",
    available: true,
  },
  {
    id: 2, name: "deepseek-r1", display_name: "DeepSeek R1", provider: "DeepSeek",
    price_per_input: 2.00, price_per_output: 8.00, model_type: "chat",
    scene_tags: "数学推理,Vibe Coding,代码生成,旗舰全能",
    context_length: 131072, parameter_size: "671B",
    description: "DeepSeek 深度推理模型，通过强化学习训练，擅长数学/代码等复杂推理任务",
    available: true,
  },
  {
    id: 3, name: "qwen-2.5", display_name: "Qwen 2.5", provider: "阿里云",
    price_per_input: 1.00, price_per_output: 4.00, model_type: "chat",
    scene_tags: "通用助手,RAG,文案创作,内容翻译",
    context_length: 131072, parameter_size: "72B",
    description: "通义千问 2.5，阿里云自研大语言模型，中文能力出色",
    available: true,
  },
  {
    id: 4, name: "qwen-3", display_name: "Qwen 3", provider: "阿里云",
    price_per_input: 2.00, price_per_output: 8.00, model_type: "chat",
    scene_tags: "旗舰全能,Vibe Coding,多模态理解,领域知识综合",
    context_length: 262144, parameter_size: "235B",
    description: "通义千问 3 代旗舰模型，MoE 架构，支持 256K 超长上下文",
    available: true,
  },
  {
    id: 5, name: "glm-4", display_name: "GLM-4", provider: "智谱AI",
    price_per_input: 1.20, price_per_output: 4.80, model_type: "chat",
    scene_tags: "通用助手,文案创作,角色扮演,RAG",
    context_length: 131072, parameter_size: "130B",
    description: "智谱 AI 新一代大语言模型 GLM-4，全面升级，支持工具调用",
    available: true,
  },
  {
    id: 6, name: "yi-large", display_name: "Yi-Large", provider: "零一万物",
    price_per_input: 1.80, price_per_output: 7.20, model_type: "chat",
    scene_tags: "通用助手,长文本处理,内容翻译,领域知识综合",
    context_length: 262144, parameter_size: "34B",
    description: "零一万物 Yi 系列大语言模型，经过深度优化，具备强大的推理能力",
    available: true,
  },
  {
    id: 7, name: "moonshot-v1", display_name: "Moonshot v1", provider: "月之暗面",
    price_per_input: 1.00, price_per_output: 4.00, model_type: "chat",
    scene_tags: "通用助手,长文本处理,RAG,快速响应",
    context_length: 131072, parameter_size: "128K",
    description: "月之暗面 Kimi 大模型，擅长长文本理解和多轮对话",
    available: true,
  },
  {
    id: 8, name: "step-2", display_name: "Step-2", provider: "阶跃星辰",
    price_per_input: 1.50, price_per_output: 6.00, model_type: "chat",
    scene_tags: "数学推理,Vibe Coding,代码生成",
    context_length: 131072, parameter_size: "130B",
    description: "阶跃星辰 Step-2 大语言模型，专注推理与代码能力",
    available: true,
  },
  {
    id: 9, name: "bge-large-zh", display_name: "BGE-Large-zh", provider: "智源(BAAI)",
    price_per_input: 0.10, price_per_output: 0.10, model_type: "embedding",
    scene_tags: "RAG,语义搜索,文本相似度",
    context_length: 512, parameter_size: "326M",
    description: "BAAI BGE 中文嵌入模型，RAG 检索效果业界领先",
    available: true,
  },
  {
    id: 10, name: "stable-diffusion-xl", display_name: "SDXL", provider: "StabilityAI",
    price_per_input: 0.20, price_per_output: 0.20, model_type: "image",
    scene_tags: "图像生成,AIGC 内容创作,游戏互动",
    context_length: 0, parameter_size: "3.5B",
    description: "Stable Diffusion XL，高质量文本到图像生成模型",
    available: true,
  },
];

function formatContext(ctx: number): string {
  if (ctx >= 1000 * 1000) return (ctx / (1000 * 1000)).toFixed(0) + "M";
  if (ctx >= 1000) return (ctx / 1000).toFixed(0) + "K";
  return String(ctx);
}

function providerColor(provider: string): string {
  const map: Record<string, string> = {
    DeepSeek: "var(--accent)",
    阿里云: "#f97316",
    智谱AI: "#a78bfa",
    零一万物: "#22d3ee",
    月之暗面: "#f59e0b",
    阶跃星辰: "#34d399",
    "智源(BAAI)": "#818cf8",
    StabilityAI: "#f472b6",
  };
  return map[provider] ?? "var(--text-secondary)";
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>(FALLBACK_MODELS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部");
  const [sceneFilter, setSceneFilter] = useState("全部");
  const [sortBy, setSortBy] = useState("default");

  // Code modal
  const [codeModel, setCodeModel] = useState<ModelInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("http://localhost:8001/api/v1/models", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then((data: ModelInfo[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setModels(data.map(m => ({ ...m, available: true })));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Models fetch failed, using fallback:", err);
          setError("使用本地数据");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // All unique model types
  const allTypes = useMemo(() => {
    const types = new Set(models.map((m) => m.model_type || "chat"));
    return ["全部", ...Array.from(types)];
  }, [models]);

  // All unique scene tags
  const allScenes = useMemo(() => {
    const scenes = new Set<string>();
    models.forEach((m) => {
      (m.scene_tags || "").split(",").forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) scenes.add(trimmed);
      });
    });
    return ["全部", ...Array.from(scenes).sort()];
  }, [models]);

  // Filtered & sorted models
  const filteredModels = useMemo(() => {
    let result = models;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.display_name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          (m.description || "").toLowerCase().includes(q) ||
          (m.scene_tags || "").toLowerCase().includes(q)
      );
    }

    // Type filter
    if (typeFilter !== "全部") {
      result = result.filter((m) => (m.model_type || "chat") === typeFilter);
    }

    // Scene filter
    if (sceneFilter !== "全部") {
      result = result.filter((m) =>
        (m.scene_tags || "").split(",").map((s) => s.trim()).includes(sceneFilter)
      );
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        result = [...result].sort((a, b) => a.price_per_input - b.price_per_input);
        break;
      case "price_desc":
        result = [...result].sort((a, b) => b.price_per_input - a.price_per_input);
        break;
      case "context":
        result = [...result].sort((a, b) => (b.context_length || 0) - (a.context_length || 0));
        break;
      // default: keep original order
    }

    return result;
  }, [models, search, typeFilter, sceneFilter, sortBy]);

  const typeLabel = (t: string) => MODEL_TYPE_LABELS[t] || t;

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", paddingTop: "0.25rem" }}>
      {/* ========== Header ========== */}
      <header>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
          模型市场
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
          浏览所有可用模型，查看定价与参数信息
        </p>
      </header>

      {/* ========== Search + Sort Row ========== */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260, position: "relative" }}>
          <svg
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-muted)" }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="搜索模型名称、提供商、场景…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "0.6rem 0.9rem 0.6rem 2.4rem",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {(loading || error) && (
            <span className={loading ? "badge badge-success" : "badge badge-warning"} style={{ fontSize: "0.75rem" }}>
              {loading ? "加载中…" : error}
            </span>
          )}
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            {filteredModels.length} 个模型
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "0.5rem 0.75rem",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="default">默认排序</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
            <option value="context">按上下文长度</option>
          </select>
        </div>
      </div>

      {/* ========== Filter Tabs: Model Type ========== */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap", paddingTop: "0.4rem" }}>
          模型类型
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: 6,
                fontSize: "0.8rem",
                fontWeight: 500,
                border: typeFilter === t ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: typeFilter === t ? "var(--accent-glow)" : "transparent",
                color: typeFilter === t ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t === "全部" ? t : typeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* ========== Filter Tabs: Scenes ========== */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap", paddingTop: "0.4rem" }}>
          应用场景
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {allScenes.map((s) => (
            <button
              key={s}
              onClick={() => setSceneFilter(s)}
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: 6,
                fontSize: "0.8rem",
                fontWeight: 500,
                border: sceneFilter === s ? "1px solid var(--accent)" : "1px solid var(--border)",
                background: sceneFilter === s ? "var(--accent-glow)" : "transparent",
                color: sceneFilter === s ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ========== Model Cards Grid ========== */}
      {filteredModels.length === 0 && !loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
          没有匹配的模型
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1rem",
        }}>
          {filteredModels.map((model, i) => (
            <div
              key={model.id}
              className="card animate-in"
              style={{
                animationDelay: `${i * 0.03}s`,
                opacity: 0,
                animationFillMode: "forwards",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {/* Header: icon + provider + availability */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {model.model_icon ? (
                    <img src={model.model_icon} alt="" style={{ width: 24, height: 24, borderRadius: 4 }} />
                  ) : (
                    <ProviderLogo provider={model.provider} size={24} />
                  )}
                  <span
                    className="badge"
                    style={{
                      background: `${providerColor(model.provider)}18`,
                      color: providerColor(model.provider),
                      fontSize: "0.7rem",
                      padding: "0.15rem 0.55rem",
                    }}
                  >
                    {model.provider}
                  </span>
                </div>
                <span
                  className="badge"
                  style={{
                    background: model.available !== false ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                    color: model.available !== false ? "var(--success)" : "var(--danger)",
                    fontSize: "0.7rem",
                    padding: "0.15rem 0.55rem",
                  }}
                >
                  {model.available !== false ? "可用" : "维护中"}
                </span>
              </div>

              {/* Model Name */}
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                  {model.display_name}
                </h3>
                <code style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  background: "var(--bg-secondary)",
                  padding: "0.1rem 0.35rem",
                  borderRadius: 4,
                  marginTop: "0.25rem",
                  display: "inline-block",
                }}>
                  {model.name}
                </code>
              </div>

              {/* Meta: parameter size + context length */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {model.parameter_size && (
                  <span style={{
                    fontSize: "0.72rem",
                    color: "var(--accent)",
                    background: "var(--accent-glow)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: 999,
                    fontWeight: 600,
                  }}>
                    {model.parameter_size}
                  </span>
                )}
                {model.context_length && model.context_length > 0 && (
                  <span style={{
                    fontSize: "0.72rem",
                    color: "var(--accent-amber)",
                    background: "rgba(245,158,11,0.12)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: 999,
                    fontWeight: 600,
                  }}>
                    {formatContext(model.context_length)} 上下文
                  </span>
                )}
                {model.model_type && model.model_type !== "chat" && (
                  <span style={{
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    background: "rgba(255,255,255,0.05)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: 999,
                    fontWeight: 600,
                  }}>
                    {typeLabel(model.model_type)}
                  </span>
                )}
              </div>

              {/* Description */}
              {model.description && (
                <p style={{
                  fontSize: "0.83rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  margin: 0,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}>
                  {model.description}
                </p>
              )}

              {/* Scene Tags */}
              {model.scene_tags && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                  {model.scene_tags.split(",").map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                        padding: "0.1rem 0.4rem",
                        cursor: "pointer",
                      }}
                      onClick={() => setSceneFilter(tag.trim())}
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Pricing */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                padding: "0.75rem",
                borderRadius: 8,
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
              }}>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>
                    输入价格
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    ¥{model.price_per_input.toFixed(2)}
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 400 }}>
                      {" "}/ 1M tokens
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>
                    输出价格
                  </div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent)" }}>
                    ¥{model.price_per_output.toFixed(2)}
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 400 }}>
                      {" "}/ 1M tokens
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href="/dashboard"
                  className="btn-primary"
                  style={{
                    textDecoration: "none",
                    textAlign: "center",
                    fontSize: "0.85rem",
                    padding: "0.5rem 0",
                    flex: 1,
                  }}
                >
                  开始使用
                </a>
                <button
                  className="btn-ghost"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 0.9rem" }}
                  onClick={() => setCodeModel(model)}
                >
                  代码示例
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== Code Modal ========== */}
      {codeModel && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)", display: "flex",
            alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: "1rem",
          }}
          onClick={() => setCodeModel(null)}
        >
          <div
            className="card animate-in"
            style={{ maxWidth: 560, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                {codeModel.display_name}
              </h3>
              <button
                onClick={() => setCodeModel(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.25rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              使用以下代码快速接入 {codeModel.display_name}：
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 600 }}>
                cURL
              </div>
              <pre style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "0.9rem",
                fontSize: "0.8rem",
                overflowX: "auto",
                color: "var(--text-primary)",
                margin: 0,
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
              }}>
{`curl https://api.aiburj.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $AIBURJ_API_KEY" \\
  -d '{
    "model": "${codeModel.name}",
    "messages": [{"role": "user", "content": "你好"}]
  }'`}
              </pre>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 600 }}>
                Python
              </div>
              <pre style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "0.9rem",
                fontSize: "0.8rem",
                overflowX: "auto",
                color: "var(--text-primary)",
                margin: 0,
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
              }}>
{`from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.aiburj.com/v1"
)

response = client.chat.completions.create(
    model="${codeModel.name}",
    messages=[{"role": "user", "content": "你好"}]
)

print(response.choices[0].message.content)`}
              </pre>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
              <a href="/api-keys" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 1rem", textAlign: "center", flex: 1 }}>
                获取 API Key
              </a>
              <a href="/dashboard" className="btn-ghost" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 1rem", textAlign: "center" }}>
                控制台
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========== Loading skeleton ========== */}
      {loading && filteredModels.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <p>加载模型数据…</p>
        </div>
      )}
    </div>
  );
}