export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5rem", paddingTop: "1rem" }}>

      {/* ========== Hero Section ========== */}
      <section className="animate-in" style={{
        textAlign: "center", maxWidth: 780, margin: "0 auto",
        padding: "4rem 1rem 2rem",
      }}>
        {/* Status badge */}
        <div className="badge badge-success" style={{
          marginBottom: "1.5rem", fontSize: "0.8rem", padding: "0.25rem 0.9rem",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block", marginRight: "0.4rem" }} />
          服务运行中 · 99.9% 可用性
        </div>

        {/* Main title */}
        <h1 style={{
          fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)",
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          margin: "0 0 1.25rem",
          background: "linear-gradient(135deg, #e8edf5 0%, #b0c4de 40%, #06b6d4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          国产大模型，一站调用
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "1.15rem",
          color: "var(--text-secondary)",
          lineHeight: 1.75,
          margin: "0 auto 2.5rem",
          maxWidth: 520,
        }}>
          统一接入 DeepSeek、Qwen、GLM、Yi、Moonshot 等国产大模型，
          OpenAI 兼容格式，一行代码即可调用
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/auth/register" className="btn-primary" style={{
            fontSize: "1.05rem",
            padding: "0.8rem 2.2rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            borderRadius: 10,
          }}>
            免费开始
            <span style={{ fontSize: "0.9rem" }}>→</span>
          </a>
          <a href="/models" className="btn-ghost" style={{
            fontSize: "1.05rem",
            padding: "0.8rem 2.2rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 10,
          }}>
            查看模型
          </a>
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          无需信用卡 · 新用户赠送 ¥2 体验额度
        </p>
      </section>

      {/* ========== Model Showcase Grid ========== */}
      <section style={{ padding: "0 1rem" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
          }}>
            已接入模型
          </h2>
          <p style={{
            textAlign: "center",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            marginBottom: "2rem",
          }}>
            精选国产主流大模型，持续更新中
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "1rem",
          }}>
            {[
              { name: "DeepSeek V3", provider: "DeepSeek · 深度求索", desc: "高性能通用大模型，长上下文 128K，推理速度快" },
              { name: "DeepSeek R1", provider: "DeepSeek · 深度求索", desc: "强化推理模型，擅长数学、编程和逻辑分析" },
              { name: "Qwen 2.5", provider: "Alibaba · 通义千问", desc: "阿里自研多模态大模型，72B 参数旗舰版" },
              { name: "Qwen 3", provider: "Alibaba · 通义千问", desc: "新一代通义千问，推理能力大幅提升" },
              { name: "GLM-4", provider: "Zhipu · 智谱AI", desc: "智谱自研双语大模型，128K 上下文" },
              { name: "Yi-Large", provider: "01.AI · 零一万物", desc: "零一万物旗舰模型，中英双语能力均衡" },
              { name: "Moonshot-v1", provider: "Moonshot · 月之暗面", desc: "Kimi 同款模型，擅长长文本理解与分析" },
              { name: "Step-2", provider: "StepFun · 阶跃星辰", desc: "万亿参数 MoE 模型，多领域知识覆盖" },
            ].map((model) => (
              <div key={model.name} className="card animate-in" style={{
                padding: "1.25rem",
                display: "flex", flexDirection: "column", gap: "0.5rem",
              }}>
                <div style={{
                  fontSize: "0.95rem", fontWeight: 700,
                  color: "var(--text-primary)",
                }}>
                  {model.name}
                </div>
                <div style={{
                  fontSize: "0.72rem", color: "var(--accent)",
                  background: "rgba(6,182,212,0.1)",
                  padding: "0.15rem 0.5rem", borderRadius: 4,
                  display: "inline-block", alignSelf: "flex-start",
                }}>
                  {model.provider}
                </div>
                <p style={{
                  fontSize: "0.8rem", color: "var(--text-secondary)",
                  lineHeight: 1.55, margin: "0.25rem 0 0",
                }}>
                  {model.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== Feature Section ========== */}
      <section style={{ padding: "0 1rem" }}>
        <h2 style={{
          textAlign: "center", fontSize: "1.5rem", fontWeight: 700,
          color: "var(--text-primary)", marginBottom: "2rem",
        }}>
          为什么选择 aiburj
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
          maxWidth: 960, margin: "0 auto",
        }}>
          {/* Feature 1: Unified API */}
          <div className="card animate-in" style={{ animationDelay: "0.08s", opacity: 0, animationFillMode: "forwards" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(6,182,212,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>
              统一 API 格式
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
              OpenAI 兼容接口，标准 chat/completions 格式。
              只需修改 model 参数即可切换不同模型，零迁移成本。
            </p>
          </div>

          {/* Feature 2: Pay as you go */}
          <div className="card animate-in" style={{ animationDelay: "0.16s", opacity: 0, animationFillMode: "forwards" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(16,185,129,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>
              按量计费
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
              用多少付多少，无月费、无最低消费。按 token 精确计费，
              用量清晰透明，成本直降 50%+。
            </p>
          </div>

          {/* Feature 3: Speed */}
          <div className="card animate-in" style={{ animationDelay: "0.24s", opacity: 0, animationFillMode: "forwards" }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "rgba(245,158,11,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1rem",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>
              极速响应
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
              SSE 流式输出，首 token 延迟低于 50ms。
              国内网络直连，告别代理和超时烦恼。
            </p>
          </div>
        </div>
      </section>

      {/* ========== Code Demo Section ========== */}
      <section style={{ padding: "0 1rem" }}>
        <h2 style={{
          textAlign: "center", fontSize: "1.5rem", fontWeight: 700,
          color: "var(--text-primary)", marginBottom: "0.5rem",
        }}>
          快速开始
        </h2>
        <p style={{
          textAlign: "center", fontSize: "0.9rem",
          color: "var(--text-secondary)", marginBottom: "2rem",
        }}>
          兼容 OpenAI SDK，一行代码切换模型
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.25rem",
          maxWidth: 960, margin: "0 auto",
        }}>
          {/* cURL Example */}
          <div className="card" style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
          }}>
            <div style={{
              fontSize: "0.75rem", color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.06em",
              marginBottom: "1rem",
            }}>
              cURL
            </div>
            <pre style={{
              margin: 0,
              fontSize: "0.8rem",
              lineHeight: 1.8,
              color: "var(--text-secondary)",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              overflowX: "auto",
            }}>
              <code>{`curl https://api.aiburj.com/v1/chat/completions \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-v3",
    "messages": [
      {"role": "user", "content": "你好"}
    ],
    "stream": true
  }'`}</code>
            </pre>
          </div>

          {/* Python SDK Example */}
          <div className="card" style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
          }}>
            <div style={{
              fontSize: "0.75rem", color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.06em",
              marginBottom: "1rem",
            }}>
              Python SDK
            </div>
            <pre style={{
              margin: 0,
              fontSize: "0.8rem",
              lineHeight: 1.8,
              color: "var(--text-secondary)",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              overflowX: "auto",
            }}>
              <code>
                <span style={{ color: "var(--accent)" }}>from</span> openai <span style={{ color: "var(--accent)" }}>import</span> OpenAI{"\n\n"}
                client = <span style={{ color: "var(--success)" }}>OpenAI</span>({"\n"}
                {"  "}api_key=<span style={{ color: "var(--accent-amber)" }}>"your-api-key"</span>{",\n"}
                {"  "}base_url=<span style={{ color: "var(--accent-amber)" }}>"https://api.aiburj.com/v1"</span>{",\n"}
                ){"\n\n"}
                response = client.chat.completions.<span style={{ color: "var(--accent)" }}>create</span>({"\n"}
                {"  "}model=<span style={{ color: "var(--accent-amber)" }}>"deepseek-v3"</span>{",\n"}
                {"  "}messages=[{"{"}"role": <span style={{ color: "var(--accent-amber)" }}>"user"</span>
                {", "}"content": <span style={{ color: "var(--accent-amber)" }}>"你好"</span>{"}"}],{"\n"}
                {"  "}stream=<span style={{ color: "var(--accent-amber)" }}>True</span>{",\n"}
                ){"\n\n"}
                <span style={{ color: "var(--accent)" }}>for</span> chunk <span style={{ color: "var(--accent)" }}>in</span> response:{"\n"}
                {"  "}<span style={{ color: "var(--success)" }}>print</span>(chunk.choices[0].delta.content, end=<span style={{ color: "var(--accent-amber)" }}>""</span>)
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ========== Stats Bar ========== */}
      <section style={{ padding: "0 1rem" }}>
        <div className="glass animate-in" style={{
          maxWidth: 960, margin: "0 auto", padding: "2.5rem 2rem",
          display: "flex", flexWrap: "wrap", justifyContent: "space-around",
          gap: "2rem", textAlign: "center",
        }}>
          <div>
            <div style={{
              fontSize: "2.2rem", fontWeight: 800,
              color: "var(--accent)", marginBottom: "0.25rem",
            }}>
              8+
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              已接入模型
            </div>
          </div>
          <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch" }} />
          <div>
            <div className="amber-text" style={{
              fontSize: "2.2rem", fontWeight: 800,
              marginBottom: "0.25rem",
            }}>
              &lt;50ms
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              平均延迟
            </div>
          </div>
          <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch" }} />
          <div>
            <div style={{
              fontSize: "2.2rem", fontWeight: 800,
              color: "var(--success)", marginBottom: "0.25rem",
            }}>
              99.9%
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              可用性
            </div>
          </div>
        </div>
      </section>

      {/* ========== Footer padding ========== */}
      <div style={{ height: "2rem" }} />

    </div>
  );
}
