"use client";

import { useEffect, useState } from "react";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description?: string;
  input_price?: number;   // per 1M tokens
  output_price?: number;  // per 1M tokens
  category?: string;
  available?: boolean;
}

const FALLBACK_MODELS: ModelInfo[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI", input_price: 15.00, output_price: 60.00, category: "chat", available: true },
  { id: "gpt-4.1", name: "GPT-4.1", provider: "OpenAI", input_price: 10.00, output_price: 40.00, category: "chat", available: true },
  { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", input_price: 12.00, output_price: 48.00, category: "chat", available: true },
  { id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic", input_price: 18.00, output_price: 72.00, category: "chat", available: true },
  { id: "deepseek-v3", name: "DeepSeek V3", provider: "DeepSeek", input_price: 1.50, output_price: 6.00, category: "chat", available: true },
  { id: "deepseek-r1", name: "DeepSeek R1", provider: "DeepSeek", input_price: 2.00, output_price: 8.00, category: "reasoning", available: true },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", input_price: 0.50, output_price: 2.00, category: "chat", available: true },
  { id: "qwen-2.5", name: "Qwen 2.5", provider: "Alibaba", input_price: 1.00, output_price: 4.00, category: "chat", available: true },
  { id: "gpt-4o-mini", name: "GPT-4o-mini", provider: "OpenAI", input_price: 0.60, output_price: 2.40, category: "chat", available: true },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google", input_price: 3.50, output_price: 14.00, category: "chat", available: true },
];

function providerColor(provider: string): string {
  const map: Record<string, string> = {
    OpenAI: "var(--success)",
    Anthropic: "#a78bfa",
    DeepSeek: "var(--accent)",
    Google: "var(--accent-amber)",
    Alibaba: "#f97316",
  };
  return map[provider] ?? "var(--text-secondary)";
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>(FALLBACK_MODELS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("http://localhost:8001/api/v1/models", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then((data: ModelInfo[]) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setModels(data);
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

  const categories = [...new Set(models.map((m) => m.category ?? "other"))];

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingTop: "0.5rem" }}>
      {/* ========== Header ========== */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            模型市场
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            浏览所有可用模型，查看定价信息
          </p>
        </div>
        {(loading || error) && (
          <div className={loading ? "badge badge-success" : "badge badge-warning"} style={{ padding: "0.3rem 0.9rem", fontSize: "0.8rem" }}>
            {loading ? "加载中…" : error}
          </div>
        )}
      </header>

      {/* ========== Model Grid ========== */}
      {categories.map((cat) => {
        const catModels = models.filter((m) => (m.category ?? "other") === cat);
        if (catModels.length === 0) return null;
        return (
          <section key={cat}>
            <h2 style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1rem",
              fontWeight: 600,
            }}>
              {cat === "chat" ? "对话模型" : cat === "reasoning" ? "推理模型" : cat}
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}>
              {catModels.map((model, i) => (
                <div
                  key={model.id}
                  className="card animate-in"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    opacity: 0,
                    animationFillMode: "forwards",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {/* Top row: provider badge + availability */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div
                      className="badge"
                      style={{
                        background: `${providerColor(model.provider)}18`,
                        color: providerColor(model.provider),
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.55rem",
                      }}
                    >
                      {model.provider}
                    </div>
                    <div
                      className="badge"
                      style={{
                        background: model.available !== false
                          ? "rgba(16,185,129,0.12)"
                          : "rgba(239,68,68,0.12)",
                        color: model.available !== false ? "var(--success)" : "var(--danger)",
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.55rem",
                      }}
                    >
                      {model.available !== false ? "可用" : "维护中"}
                    </div>
                  </div>

                  {/* Model name */}
                  <h3 style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--text-primary)",
                  }}>
                    {model.name}
                  </h3>

                  {/* Description */}
                  {model.description && (
                    <p style={{
                      fontSize: "0.83rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      margin: 0,
                    }}>
                      {model.description}
                    </p>
                  )}

                  {/* Pricing - per 1M tokens */}
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
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                        输入价格
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        ¥{(model.input_price ?? 0).toFixed(2)}
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 400 }}>
                          {" "}/ 1M tokens
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>
                        输出价格
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent)" }}>
                        ¥{(model.output_price ?? 0).toFixed(2)}
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 400 }}>
                          {" "}/ 1M tokens
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <a
                    href="/dashboard"
                    className="btn-primary"
                    style={{
                      textDecoration: "none",
                      textAlign: "center" as const,
                      fontSize: "0.85rem",
                      padding: "0.5rem 0",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    开始使用
                  </a>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* ========== Empty state ========== */}
      {!loading && models.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "1rem", margin: 0 }}>暂无可用模型</p>
        </div>
      )}
    </div>
  );
}
