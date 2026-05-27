"use client";

import { useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────
interface UsageTotals {
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost: number;
}

interface DailyUsage {
  date: string;
  label: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost: number;
}

interface ModelUsage {
  name: string;
  percentage: number;
  color: string;
}

// ─── Mock Data ───────────────────────────────────────────
function generateDailyData(): DailyUsage[] {
  const days: DailyUsage[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const label = `${m}月${day}日`;
    const date = `${d.getFullYear()}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // Vary data — weekends lower
    const dow = d.getDay(); // 0=Sun
    const isWeekend = dow === 0 || dow === 6;
    const base = isWeekend ? 15000 : 45000;
    const prompt = Math.round(base + Math.random() * base * 0.6);
    const completion = Math.round(prompt * (0.15 + Math.random() * 0.25));
    const costNum = +(prompt * 0.000002 + completion * 0.000008).toFixed(2);
    days.push({ date, label, prompt_tokens: prompt, completion_tokens: completion, cost: costNum });
  }
  return days;
}

const MOCK_MODEL_USAGE: ModelUsage[] = [
  { name: "GPT-4o", percentage: 45, color: "var(--success)" },
  { name: "Claude", percentage: 30, color: "#a78bfa" },
  { name: "DeepSeek", percentage: 25, color: "var(--accent)" },
];

const MOCK_TOTAL_REQUESTS = 1247;

// ─── Helpers ─────────────────────────────────────────────
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtCost(n: number): string {
  return `¥${n.toFixed(2)}`;
}

// ─── Page Component ──────────────────────────────────────
export default function UsagePage() {
  const [totals, setTotals] = useState<UsageTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dailyData = generateDailyData();

  // Compute derived values
  const totalTokens =
    (totals?.total_prompt_tokens ?? 0) + (totals?.total_completion_tokens ?? 0);
  const promptPct =
    totalTokens > 0
      ? ((totals?.total_prompt_tokens ?? 0) / totalTokens) * 100
      : 0;
  const completionPct = 100 - promptPct;

  // Max daily token for bar scaling
  const maxDailyToken = Math.max(
    ...dailyData.map((d) => d.prompt_tokens + d.completion_tokens),
    1
  );

  // ─── Fetch real totals ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch("http://localhost:8001/api/v1/usage", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then((data: UsageTotals) => {
        if (!cancelled) {
          setTotals(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("Usage fetch failed, using mock:", err);
          setError("使用本地数据");
          // Fallback mock totals
          setTotals({
            total_prompt_tokens: 285000,
            total_completion_tokens: 62000,
            total_cost: 1.07,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── shared card icon style
  const iconBox = (bg: string, stroke: string) => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  } as const);

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>
      {/* ========== Header ========== */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            用量分析
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            Token 用量、消费与模型分布
          </p>
        </div>
        {(loading || error) && (
          <div className={loading ? "badge badge-success" : "badge badge-warning"} style={{ padding: "0.3rem 0.9rem", fontSize: "0.8rem" }}>
            {loading ? "加载中…" : error}
          </div>
        )}
      </header>

      {/* ========== Stats Cards Row ========== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
      }}>
        {/* 总请求数 */}
        <div className="card animate-in" style={{ animationDelay: "0.05s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                总请求数
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
                {MOCK_TOTAL_REQUESTS.toLocaleString()}
              </div>
            </div>
            <div style={iconBox("rgba(6,182,212,0.12)", "var(--accent)")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
          </div>
          <div style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            累计 API 调用次数
          </div>
        </div>

        {/* 总 Token 用量 */}
        <div className="card animate-in" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                总 Token 用量
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", lineHeight: 1.1 }}>
                {fmtNum(totalTokens)}
              </div>
            </div>
            <div style={iconBox("rgba(245,158,11,0.12)", "var(--accent-amber)")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
          </div>
          <div style={{ marginTop: "0.6rem", display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <span>Prompt: {fmtNum(totals?.total_prompt_tokens ?? 0)}</span>
            <span>Completion: {fmtNum(totals?.total_completion_tokens ?? 0)}</span>
          </div>
        </div>

        {/* 总消费 */}
        <div className="card animate-in" style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                总消费
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--success)", lineHeight: 1.1 }}>
                {fmtCost(totals?.total_cost ?? 0)}
              </div>
            </div>
            <div style={iconBox("rgba(16,185,129,0.12)", "var(--success)")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                <path d="M12 18V6"/>
              </svg>
            </div>
          </div>
          <div style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            累计消费金额
          </div>
        </div>
      </div>

      {/* ========== Two-column layout: Daily Chart + Pie + Model ========== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
        gap: "1rem",
      }}>
        {/* ── Left: Daily breakdown bar chart ── */}
        <div className="card animate-in" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-primary)" }}>
            近 7 天 Token 用量
          </h2>

          {/* Legend */}
          <div style={{ display: "flex", gap: "1.25rem", marginBottom: "1rem", fontSize: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent)", display: "inline-block" }}/>
              <span style={{ color: "var(--text-secondary)" }}>Prompt</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent-amber)", display: "inline-block" }}/>
              <span style={{ color: "var(--text-secondary)" }}>Completion</span>
            </div>
          </div>

          {/* Bar chart area */}
          <div style={{ position: "relative", height: 200, display: "flex", alignItems: "flex-end", gap: "0.5rem", padding: "0 0 0.05rem" }}>
            {/* Grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={`grid-${i}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: `${(i / 3) * 100}%`,
                  borderTop: "1px dashed rgba(30,45,69,0.5)",
                  zIndex: 0,
                }}
              />
            ))}

            {dailyData.map((day, i) => {
              const total = day.prompt_tokens + day.completion_tokens;
              const pct = (total / maxDailyToken) * 100;
              const promptHeight = (day.prompt_tokens / maxDailyToken) * 100;
              const completionHeight = (day.completion_tokens / maxDailyToken) * 100;

              return (
                <div
                  key={day.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "100%",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {/* Tooltip bar group */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 40,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      height: `${pct}%`,
                      minHeight: 4,
                      transition: "height 0.3s",
                    }}
                    title={`${day.label}: Prompt ${day.prompt_tokens.toLocaleString()} · Completion ${day.completion_tokens.toLocaleString()} · ¥${day.cost}`}
                  >
                    {/* Completion bar (on top in stacked) */}
                    <div
                      className="chart-bar"
                      style={{
                        width: "100%",
                        height: `${(completionHeight / pct) * 100}%`,
                        minHeight: pct > 0 ? 4 : 0,
                        background: "linear-gradient(180deg, var(--accent-amber), rgba(245,158,11,0.25))",
                        borderRadius: "2px 2px 0 0",
                      }}
                    />
                    {/* Prompt bar (bottom in stacked) */}
                    <div
                      className="chart-bar"
                      style={{
                        width: "100%",
                        height: `${(promptHeight / pct) * 100}%`,
                        minHeight: pct > 0 ? 4 : 0,
                        background: "linear-gradient(180deg, var(--accent), rgba(6,182,212,0.2))",
                        borderRadius: pct > 0 && completionHeight === 0 ? "2px 2px 0 0" : "0",
                      }}
                    />
                  </div>

                  {/* Day label */}
                  <span style={{
                    fontSize: "0.68rem",
                    color: "var(--text-muted)",
                    marginTop: "0.4rem",
                    writingMode: i > 3 ? undefined : "horizontal-tb",
                    whiteSpace: "nowrap",
                  }}>
                    {day.label}
                  </span>

                  {/* Cost below */}
                  <span style={{
                    fontSize: "0.62rem",
                    color: "var(--text-muted)",
                    marginTop: "0.15rem",
                    opacity: 0.7,
                  }}>
                    ¥{day.cost}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Prompt vs Completion ratio + Model breakdown ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Prompt vs Completion donut */}
          <div className="card animate-in" style={{ animationDelay: "0.25s", opacity: 0, animationFillMode: "forwards", flex: 1 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-primary)" }}>
              Prompt / Completion 比例
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", justifyContent: "center" }}>
              {/* CSS Donut */}
              <div style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `conic-gradient(
                  var(--accent) 0deg ${promptPct * 3.6}deg,
                  var(--accent-amber) ${promptPct * 3.6}deg 360deg
                )`,
                position: "relative",
                flexShrink: 0,
              }}>
                {/* Donut hole */}
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "var(--bg-card)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {fmtNum(totalTokens)}
                  </span>
                  <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>tokens</span>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.15rem" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent)", display: "inline-block" }}/>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Prompt</span>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)" }}>
                    {promptPct.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {fmtNum(totals?.total_prompt_tokens ?? 0)} tokens
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.15rem" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--accent-amber)", display: "inline-block" }}/>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Completion</span>
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-amber)" }}>
                    {completionPct.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    {fmtNum(totals?.total_completion_tokens ?? 0)} tokens
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model usage breakdown */}
          <div className="card animate-in" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards", flex: 1 }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-primary)" }}>
              模型用量分布
            </h2>

            {/* Horizontal stacked bar */}
            <div style={{
              width: "100%",
              height: 32,
              borderRadius: 6,
              overflow: "hidden",
              display: "flex",
              marginBottom: "1rem",
            }}>
              {MOCK_MODEL_USAGE.map((m) => (
                <div
                  key={m.name}
                  style={{
                    width: `${m.percentage}%`,
                    height: "100%",
                    background: m.color,
                    transition: "width 0.3s",
                  }}
                />
              ))}
            </div>

            {/* Model legend rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {MOCK_MODEL_USAGE.map((m) => (
                <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: m.color,
                      display: "inline-block",
                      flexShrink: 0,
                    }}/>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600 }}>
                      {m.name}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {/* Mini progress bar */}
                    <div style={{
                      width: 80,
                      height: 6,
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.06)",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${m.percentage}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: m.color,
                        transition: "width 0.4s",
                      }}/>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", minWidth: 36, textAlign: "right" }}>
                      {m.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div style={{
              marginTop: "0.75rem",
              padding: "0.5rem 0.75rem",
              borderRadius: 6,
              background: "rgba(6,182,212,0.06)",
              border: "1px solid rgba(6,182,212,0.12)",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
            }}>
              📊 模型分布为预估数据，按 Token 消耗占比计算
            </div>
          </div>
        </div>
      </div>

      {/* ========== Daily Detail Table ========== */}
      <div className="card animate-in" style={{ animationDelay: "0.35s", opacity: 0, animationFillMode: "forwards", padding: 0, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr 1.2fr 1fr",
          gap: "0.75rem",
          padding: "0.85rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}>
          <span>日期</span>
          <span>Prompt Tokens</span>
          <span>Completion Tokens</span>
          <span>消费</span>
        </div>

        {dailyData.map((day, i) => (
          <div
            key={day.date}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.2fr 1.2fr 1fr",
              gap: "0.75rem",
              padding: "0.8rem 1.5rem",
              borderBottom: i < dailyData.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "center",
              fontSize: "0.84rem",
            }}
          >
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {day.label}
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "0.35rem", fontWeight: 400 }}>
                {day.date}
              </span>
            </span>
            <span style={{ color: "var(--accent)", fontFamily: "monospace", fontSize: "0.82rem" }}>
              {day.prompt_tokens.toLocaleString()}
            </span>
            <span style={{ color: "var(--accent-amber)", fontFamily: "monospace", fontSize: "0.82rem" }}>
              {day.completion_tokens.toLocaleString()}
            </span>
            <span style={{ color: "var(--success)", fontWeight: 700 }}>
              ¥{day.cost.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
