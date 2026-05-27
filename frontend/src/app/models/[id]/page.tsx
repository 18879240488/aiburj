"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

export default function ModelDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [model, setModel] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

    fetch(`${apiBase}/api/v1/models`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then((data: ModelInfo[]) => {
        if (cancelled) return;
        const found = Array.isArray(data)
          ? data.find((m) => String(m.id) === id)
          : undefined;
        if (found) {
          setModel(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const typeLabel = (t: string) => MODEL_TYPE_LABELS[t] || t;

  // ── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="animate-in"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "var(--text-muted)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ margin: 0, fontSize: "0.95rem" }}>加载模型详情…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Not Found State ────────────────────────────────────────────
  if (notFound || !model) {
    return (
      <div
        className="animate-in"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div
          className="card"
          style={{
            textAlign: "center",
            maxWidth: 420,
            width: "100%",
            padding: "2.5rem 2rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
            模型未找到
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
            未找到 ID 为 {id} 的模型，可能已被移除或不存在。
          </p>
          <Link
            href="/models"
            className="btn-primary"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            返回模型市场
          </Link>
        </div>
      </div>
    );
  }

  // ── Scene tags array ───────────────────────────────────────────
  const sceneTags = (model.scene_tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // ── Model Detail View ──────────────────────────────────────────
  return (
    <div
      className="animate-in"
      style={{
        maxWidth: 800,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        paddingTop: "0.25rem",
      }}
    >
      {/* Back link */}
      <Link
        href="/models"
        style={{
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: "0.85rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          width: "fit-content",
          transition: "color 0.2s",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        返回模型市场
      </Link>

      {/* ── Hero Card ─────────────────────────────────────────── */}
      <div className="card">
        {/* Header row: logo + provider + availability */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            {model.model_icon ? (
              <img
                src={model.model_icon}
                alt=""
                style={{ width: 36, height: 36, borderRadius: 8 }}
              />
            ) : (
              <ProviderLogo provider={model.provider} size={36} />
            )}
            <span
              className="badge"
              style={{
                background: `${providerColor(model.provider)}18`,
                color: providerColor(model.provider),
                fontSize: "0.75rem",
                padding: "0.2rem 0.65rem",
              }}
            >
              {model.provider}
            </span>
          </div>
          <span
            className="badge"
            style={{
              background:
                model.available !== false
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(239,68,68,0.12)",
              color:
                model.available !== false ? "var(--success)" : "var(--danger)",
              fontSize: "0.75rem",
              padding: "0.2rem 0.65rem",
            }}
          >
            {model.available !== false ? "可用" : "维护中"}
          </span>
        </div>

        {/* Model name */}
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            margin: "0 0 0.25rem",
            letterSpacing: "-0.01em",
          }}
        >
          {model.display_name}
        </h1>
        <code
          style={{
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            background: "var(--bg-secondary)",
            padding: "0.15rem 0.45rem",
            borderRadius: 4,
            display: "inline-block",
            marginBottom: "0.75rem",
          }}
        >
          {model.name}
        </code>

        {/* Description */}
        {model.description && (
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              lineHeight: 1.65,
              margin: "0 0 1rem",
            }}
          >
            {model.description}
          </p>
        )}

        {/* Meta badges: parameter size, context length, model type */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
          }}
        >
          {model.parameter_size && (
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--accent)",
                background: "var(--accent-glow)",
                padding: "0.2rem 0.65rem",
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {model.parameter_size}
            </span>
          )}
          {model.context_length && model.context_length > 0 && (
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--accent-amber)",
                background: "rgba(245,158,11,0.12)",
                padding: "0.2rem 0.65rem",
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {formatContext(model.context_length)} 上下文
            </span>
          )}
          {model.model_type && (
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                background: "rgba(255,255,255,0.05)",
                padding: "0.2rem 0.65rem",
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {typeLabel(model.model_type)}
            </span>
          )}
        </div>

        {/* Scene tags — clickable badges navigating to /models?scene=TAG */}
        {sceneTags.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              marginBottom: "1rem",
            }}
          >
            {sceneTags.map((tag) => (
              <Link
                key={tag}
                href={`/models?scene=${encodeURIComponent(tag)}`}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  padding: "0.15rem 0.55rem",
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Pricing grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            padding: "1rem",
            borderRadius: 8,
            background: "rgba(0,0,0,0.2)",
            border: "1px solid var(--border)",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                marginBottom: "0.2rem",
              }}
            >
              输入价格
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              ¥{model.price_per_input.toFixed(2)}
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  fontWeight: 400,
                }}
              >
                {" "}/ 1M tokens
              </span>
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                marginBottom: "0.2rem",
              }}
            >
              输出价格
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              ¥{model.price_per_output.toFixed(2)}
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--text-muted)",
                  fontWeight: 400,
                }}
              >
                {" "}/ 1M tokens
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            href="/dashboard"
            className="btn-primary"
            style={{
              textDecoration: "none",
              textAlign: "center",
              fontSize: "0.9rem",
              padding: "0.625rem 0",
              flex: 1,
            }}
          >
            开始使用
          </Link>
          <Link
            href="/dashboard"
            className="btn-ghost"
            style={{
              textDecoration: "none",
              textAlign: "center",
              fontSize: "0.9rem",
              padding: "0.5rem 1.25rem",
            }}
          >
            API 文档
          </Link>
        </div>
      </div>

      {/* ── Code Examples Card ─────────────────────────────────── */}
      <div className="card">
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            margin: "0 0 0.25rem",
          }}
        >
          代码示例
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            margin: "0 0 1.25rem",
          }}
        >
          使用以下代码快速接入 {model.display_name}：
        </p>

        {/* cURL */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: "0.4rem",
              fontWeight: 600,
            }}
          >
            cURL
          </div>
          <pre
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "1rem",
              fontSize: "0.8rem",
              overflowX: "auto",
              color: "var(--text-primary)",
              margin: 0,
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}
          >
            {`curl https://api.aiburj.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{
    "model": "${model.name}",
    "messages": [{"role": "user", "content": "你好"}]
  }'`}
          </pre>
        </div>

        {/* Python SDK */}
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginBottom: "0.4rem",
              fontWeight: 600,
            }}
          >
            Python SDK
          </div>
          <pre
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "1rem",
              fontSize: "0.8rem",
              overflowX: "auto",
              color: "var(--text-primary)",
              margin: 0,
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
            }}
          >
            {`from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.aiburj.com/v1"
)

response = client.chat.completions.create(
    model="${model.name}",
    messages=[{"role": "user", "content": "你好"}]
)

print(response.choices[0].message.content)`}
          </pre>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem" }}>
          <Link
            href="/api-keys"
            className="btn-primary"
            style={{
              textDecoration: "none",
              fontSize: "0.85rem",
              padding: "0.5rem 1rem",
              textAlign: "center",
              flex: 1,
            }}
          >
            获取 API Key
          </Link>
          <Link
            href="/dashboard"
            className="btn-ghost"
            style={{
              textDecoration: "none",
              fontSize: "0.85rem",
              padding: "0.5rem 1rem",
              textAlign: "center",
            }}
          >
            控制台
          </Link>
        </div>
      </div>
    </div>
  );
}
