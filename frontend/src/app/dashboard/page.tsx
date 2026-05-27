"use client";

import { useEffect, useState } from "react";

interface UserData {
  username?: string;
  email?: string;
  balance?: number;
  api_calls_today?: number;
  total_tokens?: number;
}

const STATIC_USER: UserData = {
  username: "用户",
  email: "user@aiburj.com",
  balance: 128.50,
  api_calls_today: 342,
  total_tokens: 1250000,
};

const RECENT_ACTIVITY = [
  { action: "API 调用", model: "GPT-4o", time: "2 分钟前", tokens: 1420, cost: 0.03 },
  { action: "API 调用", model: "Claude 3.5 Sonnet", time: "15 分钟前", tokens: 3800, cost: 0.06 },
  { action: "API 调用", model: "DeepSeek V3", time: "1 小时前", tokens: 9200, cost: 0.01 },
  { action: "充值", model: null, time: "3 小时前", tokens: null, cost: 50.00, isRecharge: true },
  { action: "API Key 创建", model: "sk-a1b2...", time: "昨天", tokens: null, cost: null, isKey: true },
  { action: "API 调用", model: "GPT-4o-mini", time: "昨天", tokens: 560, cost: 0.01 },
];

export default function DashboardPage() {
  const [user, setUser] = useState<UserData>(STATIC_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/auth/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("not authed");
        return res.json();
      })
      .then((data: UserData) => {
        if (!cancelled) setUser({ ...STATIC_USER, ...data });
      })
      .catch(() => {
        // use static fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>
      {/* ========== Welcome Header ========== */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            欢迎回来，{user.username}
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            {user.email}
          </p>
        </div>
        {loading && (
          <div className="badge badge-warning" style={{ padding: "0.3rem 0.9rem", fontSize: "0.8rem" }}>
            正在加载…
          </div>
        )}
      </header>

      {/* ========== Stats Cards Row ========== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1rem",
      }}>
        {/* Balance Card */}
        <div className="card animate-in" style={{ animationDelay: "0.05s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                账户余额
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", lineHeight: 1.1 }}>
                ¥{user.balance?.toFixed(2)}
              </div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(6,182,212,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                <path d="M12 18V6"/>
              </svg>
            </div>
          </div>
        </div>

        {/* API Calls Today Card */}
        <div className="card animate-in" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                今日 API 调用
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
                {user.api_calls_today?.toLocaleString()}
              </div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(16,185,129,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Tokens Card */}
        <div className="card animate-in" style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                累计 Token
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
                {(user.total_tokens ?? 0) >= 1000000
                  ? `${((user.total_tokens ?? 0) / 1000000).toFixed(1)}M`
                  : (user.total_tokens ?? 0).toLocaleString()}
              </div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "rgba(245,158,11,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Quick Actions ========== */}
      <div className="card animate-in" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginRight: "0.25rem", fontWeight: 600 }}>
          快捷操作
        </span>
        <a href="/api-keys" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 1.25rem" }}>
          创建 API Key
        </a>
        <a href="/recharge" className="btn-ghost" style={{ textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
          </svg>
          充值
        </a>
        <a href="/docs" className="btn-ghost" style={{ textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          查看文档
        </a>
      </div>

      {/* ========== Recent Activity ========== */}
      <div className="card animate-in" style={{ animationDelay: "0.25s", opacity: 0, animationFillMode: "forwards" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-primary)" }}>
          最近活动
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {RECENT_ACTIVITY.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 0",
                borderBottom: i < RECENT_ACTIVITY.length - 1 ? "1px solid var(--border)" : "none",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                {/* Icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: 8, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                  background: item.isRecharge
                    ? "rgba(16,185,129,0.12)"
                    : item.isKey
                    ? "rgba(6,182,212,0.12)"
                    : "rgba(139,92,246,0.12)",
                }}>
                  {item.isRecharge ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                    </svg>
                  ) : item.isKey ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  )}
                </div>
                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.action}{item.model ? ` · ${item.model}` : ""}
                  </div>
                  {item.tokens && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                      {item.tokens.toLocaleString()} tokens
                      {item.cost != null && ` · ¥${item.cost.toFixed(2)}`}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", flexShrink: 0, marginLeft: "auto" }}>
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
