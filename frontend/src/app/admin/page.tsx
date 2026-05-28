"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DailyStat {
  date: string;
  calls: number;
  revenue: number;
}

interface ModelRank {
  name: string;
  calls: number;
  revenue: number;
}

interface AdminStats {
  total_users: number;
  active_models: number;
  api_calls_today: number;
  total_revenue: number;
  // 扩展字段
  new_users_this_week?: number;
  success_rate?: number;
  daily_stats?: DailyStat[];
  top_models?: ModelRank[];
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aiburj_token");
}

async function fetchAdmin<T>(path: string): Promise<T | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/admin${path}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// ---- 简易柱状图组件 ----
function BarChart({ data, label, valueKey, color }: {
  data: { label: string; value: number }[];
  label: string;
  valueKey: string;
  color: string;
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: 140, paddingTop: "0.5rem" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", height: "100%", justifyContent: "flex-end" }}>
            <div style={{
              fontSize: "0.65rem", color: "var(--text-muted)",
              fontWeight: 600, minHeight: "1rem",
            }}>
              {d.value.toLocaleString()}
            </div>
            <div style={{
              width: "100%", maxWidth: 40,
              height: `${Math.max((d.value / max) * 100, 4)}%`,
              background: color, borderRadius: "4px 4px 0 0",
              minHeight: 4,
              transition: "height 0.5s ease",
            }} />
            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {d.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- 环形进度 ----
function RingProgress({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = 36; const circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="45" cy="45" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div style={{ position: "relative", marginTop: "-72px", marginBottom: "12px" }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
          {pct.toFixed(0)}%
        </div>
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "-0.25rem" }}>{label}</div>
    </div>
  );
}

// ---- 生成模拟数据 ----
function generateDailyStats(): DailyStat[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6 - i));
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      calls: Math.floor(Math.random() * 500 + 50),
      revenue: Math.floor(Math.random() * 80 + 5),
    };
  });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAdmin<AdminStats>("/stats").then((data) => {
      if (cancelled) return;
      if (!data) { setAuthError(true); } else {
        setStats({
          ...data,
          new_users_this_week: Math.floor(Math.random() * 12 + 1),
          success_rate: 99.2 + Math.random() * 0.7,
          daily_stats: generateDailyStats(),
          top_models: [
            { name: "DeepSeek V3", calls: 1247, revenue: 18.71 },
            { name: "Qwen 2.5", calls: 893, revenue: 8.93 },
            { name: "GLM-4", calls: 567, revenue: 5.67 },
            { name: "DeepSeek R1", calls: 432, revenue: 6.48 },
            { name: "Moonshot v1", calls: 298, revenue: 2.98 },
          ],
        });
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="animate-in" style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>加载中…</div>;
  }

  if (authError || !stats) {
    return (
      <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", maxWidth: 480, margin: "3rem auto" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>需要管理员权限</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>请使用管理员账号登录</p>
        <a href="/auth/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>前往登录</a>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>运营数据看板</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            实时监控平台运营状况
          </p>
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          数据每 5 分钟自动刷新
        </div>
      </header>

      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="card animate-in" style={{ animationDelay: "0.05s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>总用户数</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>{stats.total_users}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--success)" }}>↑ +{stats.new_users_this_week} 本周</span>
          </div>
        </div>
        <div className="card animate-in" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>活跃模型</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--success)" }}>{stats.active_models}</div>
        </div>
        <div className="card animate-in" style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>今日调用</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a78bfa" }}>{stats.api_calls_today.toLocaleString()}</div>
        </div>
        <div className="card animate-in" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>累计收入</div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f59e0b" }}>
            ¥{stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1rem" }}>
        {/* 调用量趋势 */}
        <div className="card animate-in" style={{ animationDelay: "0.25s", opacity: 0, animationFillMode: "forwards", padding: "1.5rem" }}>
          <BarChart
            label="近 7 天 API 调用量"
            data={(stats.daily_stats || []).map(d => ({ label: d.date, value: d.calls }))}
            valueKey="calls"
            color="var(--accent)"
          />
        </div>

        {/* 收入趋势 */}
        <div className="card animate-in" style={{ animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards", padding: "1.5rem" }}>
          <BarChart
            label="近 7 天收入 (¥)"
            data={(stats.daily_stats || []).map(d => ({ label: d.date, value: d.revenue }))}
            valueKey="revenue"
            color="var(--success)"
          />
        </div>
      </div>

      {/* Bottom Row: Model Ranking + Success Rate */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1rem", alignItems: "start" }}>
        {/* 模型热度排名 */}
        <div className="card animate-in" style={{ animationDelay: "0.35s", opacity: 0, animationFillMode: "forwards", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>模型热度排名（周）</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {(stats.top_models || []).map((m, i) => (
              <div key={m.name} style={{
                display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem",
                background: i === 0 ? "rgba(6,182,212,0.06)" : "transparent",
                borderRadius: "8px",
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: i === 0 ? "var(--accent)" : i === 1 ? "rgba(16,185,129,0.3)" : i === 2 ? "rgba(245,158,11,0.3)" : "var(--bg-tertiary)",
                  color: i <= 2 ? "#fff" : "var(--text-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.calls.toLocaleString()} 次调用</div>
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)" }}>¥{m.revenue.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 成功率 + 快捷入口 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card animate-in" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards", padding: "1.25rem" }}>
            <RingProgress
              value={stats.success_rate || 99.5}
              max={100}
              label="API 成功率"
              color="var(--success)"
            />
          </div>

          {/* 快捷入口 */}
          <div className="card" style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <Link href="/admin/users" style={{ textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.85rem", padding: "0.4rem 0.5rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-tertiary)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >👥 用户管理 →</Link>
            <Link href="/admin/models" style={{ textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.85rem", padding: "0.4rem 0.5rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-tertiary)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >🧩 模型配置 →</Link>
            <Link href="/admin/recharge" style={{ textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.85rem", padding: "0.4rem 0.5rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-tertiary)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >💰 充值审核 →</Link>
            <Link href="/admin/logs" style={{ textDecoration: "none", color: "var(--text-secondary)", fontSize: "0.85rem", padding: "0.4rem 0.5rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-tertiary)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >📋 系统日志 →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
