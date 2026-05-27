export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem", paddingTop: "2rem" }}>
      {/* ========== Hero Section ========== */}
      <section className="animate-in" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto", padding: "4rem 1rem 2rem" }}>
        {/* Status badge */}
        <div
          className="badge badge-success"
          style={{ marginBottom: "1.5rem", fontSize: "0.8rem", padding: "0.2rem 0.8rem" }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} />
          服务正常运行中 · 99.9% 可用
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          margin: "0 0 1.25rem",
          background: "linear-gradient(135deg, var(--text-primary) 0%, #c8d6e5 50%, var(--accent) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          一个 API，调用全球 AI
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "1.125rem",
          color: "var(--text-secondary)",
          lineHeight: 1.7,
          margin: "0 auto 2.5rem",
          maxWidth: 520,
        }}>
          统一接入 GPT-4o、Claude 3.5、DeepSeek、Gemini 等主流大模型，
          一行代码切换，无需管理多个 API Key
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/auth/register" className="btn-primary" style={{
            fontSize: "1rem",
            padding: "0.75rem 2rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            免费开始
            <span style={{ fontSize: "0.85rem" }}>→</span>
          </a>
          <a href="/models" className="btn-ghost" style={{
            fontSize: "1rem",
            padding: "0.75rem 2rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}>
            查看模型
          </a>
        </div>

        {/* Subtle hint */}
        <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          无需信用卡 · 新用户赠送 ¥2 体验额度
        </p>
      </section>

      {/* ========== Feature Cards ========== */}
      <section style={{ padding: "0 1rem" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
          maxWidth: 960,
          margin: "0 auto",
        }}>
          {/* Card 1: Unified API */}
          <div className="card animate-in" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(6,182,212,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
              marginBottom: "1rem", fontSize: "1.3rem",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>
              统一 API 接入
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              兼容 OpenAI SDK 格式，无缝切换 GPT、Claude、DeepSeek 等模型。
              一套代码调用所有 AI，零迁移成本。
            </p>
          </div>

          {/* Card 2: Pay-as-you-go */}
          <div className="card animate-in" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(16,185,129,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
              marginBottom: "1rem", fontSize: "1.3rem",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                <path d="M12 18V6"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>
              按量计费
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              用多少付多少，无月费无最低消费。透明定价，按 token 精确计费，
              成本直降 40%+。
            </p>
          </div>

          {/* Card 3: Streaming */}
          <div className="card animate-in" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(245,158,11,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
              marginBottom: "1rem", fontSize: "1.3rem",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>
              实时流式
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              支持 SSE 流式输出，首 token 延迟低于 50ms。
              像打字机一样实时呈现 AI 回复。
            </p>
          </div>
        </div>
      </section>

      {/* ========== Stats Row ========== */}
      <section style={{ padding: "0 1rem" }}>
        <div className="glass animate-in" style={{
          maxWidth: 960, margin: "0 auto", padding: "2.5rem 2rem",
          display: "flex", flexWrap: "wrap", justifyContent: "space-around",
          gap: "2rem", textAlign: "center",
        }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", marginBottom: "0.25rem" }}>
              10+
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              接入模型
            </div>
          </div>
          <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch" }} />
          <div>
            <div className="amber-text" style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.25rem" }}>
              &lt;50ms
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              平均延迟
            </div>
          </div>
          <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch" }} />
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--success)", marginBottom: "0.25rem" }}>
              99.9%
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              服务可用性
            </div>
          </div>
        </div>
      </section>

      {/* ========== Supported Models Preview ========== */}
      <section style={{ padding: "0 1rem 3rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          支持模型
        </p>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "0.75rem",
          justifyContent: "center", maxWidth: 800, margin: "0 auto",
        }}>
          {[
            { name: "GPT-4o", provider: "OpenAI" },
            { name: "GPT-4.1", provider: "OpenAI" },
            { name: "Claude 3.5 Sonnet", provider: "Anthropic" },
            { name: "Claude 3 Opus", provider: "Anthropic" },
            { name: "DeepSeek V3", provider: "DeepSeek" },
            { name: "DeepSeek R1", provider: "DeepSeek" },
            { name: "Gemini 2.0 Flash", provider: "Google" },
            { name: "Qwen 2.5", provider: "Alibaba" },
          ].map((model) => (
            <div key={model.name} className="btn-ghost" style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.8rem", padding: "0.35rem 0.75rem",
              cursor: "default",
            }}>
              <span style={{ color: "var(--accent)", fontWeight: 700 }}>{model.name}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{model.provider}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
