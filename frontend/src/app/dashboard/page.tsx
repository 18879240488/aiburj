"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/* ---------- API response types ---------- */

interface UserData {
  id: number;
  email: string;
  username: string;
  balance: number;
  is_admin: boolean;
}

interface UsageData {
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_cost: number;
}

interface OrderItem {
  id: number;
  order_no: string;
  amount: number;
  pay_method: string;
  status: string;
  created_at: string;
  paid_at: string | null;
}

/* ---------- helpers ---------- */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string | undefined | null): string {
  if (!iso) return "—";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return formatDate(iso);
}

/* ---------- status helpers ---------- */

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  success: { label: "已支付", color: "var(--success)", bg: "rgba(16,185,129,0.12)" },
  pending: { label: "待支付", color: "var(--accent-amber)", bg: "rgba(245,158,11,0.12)" },
  failed: { label: "失败", color: "var(--danger)", bg: "rgba(239,68,68,0.12)" },
};

const PAY_METHOD_MAP: Record<string, string> = {
  alipay: "支付宝",
  wechat: "微信支付",
};

/* ---------- skeleton ---------- */

function Skeleton({ width, height, style }: { width?: string; height?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--border)",
        borderRadius: 6,
        width: width || "100%",
        height: height || "1rem",
        animation: "pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

/* ---------- page ---------- */

export default function DashboardPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [orders, setOrders] = useState<OrderItem[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalTokens =
    usage != null ? usage.total_prompt_tokens + usage.total_completion_tokens : null;

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError("");

    if (!token) {
      setError("未登录，请先登录");
      setLoading(false);
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Fetch user info
    const userPromise = fetch(`${API_BASE}/api/v1/auth/me`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("获取用户信息失败");
        return res.json();
      })
      .then((data: UserData) => setUser(data));

    // Fetch usage
    const usagePromise = fetch(`${API_BASE}/api/v1/billing/usage?days=7`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("获取用量统计失败");
        return res.json();
      })
      .then((data: UsageData) => setUsage(data));

    // Fetch recent orders
    const ordersPromise = fetch(`${API_BASE}/api/v1/billing/orders?page=1&size=5`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("获取订单列表失败");
        return res.json();
      })
      .then((data: OrderItem[]) => setOrders(Array.isArray(data) ? data : []));

    Promise.all([userPromise, usagePromise, ordersPromise])
      .catch((err: Error) => {
        console.warn("Dashboard fetch error:", err);
        setError(err.message || "加载失败，请重试");
      })
      .finally(() => setLoading(false));
  }, [token]);

  // 重定向未登录用户
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/auth/login");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (token) fetchAll();
  }, [fetchAll, token]);

  /* ---------- render: loading skeleton ---------- */

  if (loading) {
    return (
      <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>
        {/* header skeleton */}
        <header>
          <Skeleton width="200px" height="2rem" style={{ marginBottom: "0.4rem" }} />
          <Skeleton width="160px" height="1rem" />
        </header>

        {/* 3 stat cards skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="card" style={{ padding: "1.5rem" }}>
              <Skeleton width="80px" height="0.75rem" style={{ marginBottom: "0.6rem" }} />
              <Skeleton width="120px" height="2rem" />
            </div>
          ))}
        </div>

        {/* quick actions skeleton */}
        <div className="card">
          <Skeleton width="100px" height="1rem" style={{ marginBottom: "0.75rem" }} />
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Skeleton width="100px" height="2.2rem" />
            <Skeleton width="80px" height="2.2rem" />
            <Skeleton width="80px" height="2.2rem" />
          </div>
        </div>

        {/* recent orders skeleton */}
        <div className="card">
          <Skeleton width="100px" height="1.1rem" style={{ marginBottom: "1rem" }} />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", gap: "0.75rem", padding: "0.75rem 0", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
              <Skeleton width="34px" height="34px" style={{ borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton width="60%" height="0.85rem" style={{ marginBottom: "0.3rem" }} />
                <Skeleton width="40%" height="0.75rem" />
              </div>
              <Skeleton width="60px" height="0.8rem" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- render: error ---------- */

  if (error && !user) {
    return (
      <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.5rem", fontWeight: 600 }}>
            加载失败
          </div>
          <p style={{ color: "var(--text-secondary)", margin: "0 0 1.25rem", fontSize: "0.9rem" }}>
            {error}
          </p>
          <button className="btn-primary" onClick={fetchAll} style={{ fontSize: "0.9rem" }}>
            重试
          </button>
        </div>
      </div>
    );
  }

  /* ---------- render: normal ---------- */

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>
      {/* ========== Welcome Header ========== */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            欢迎回来，{user?.username || "用户"}
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            {user?.email || ""}
          </p>
        </div>
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-warning" style={{ padding: "0.3rem 0.9rem", fontSize: "0.8rem" }}>
              部分数据加载失败
            </span>
            <button className="btn-ghost" onClick={fetchAll} style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem" }}>
              重试
            </button>
          </div>
        )}
      </header>

      {/* ========== Stats Cards Row ========== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Balance Card */}
        <div className="card animate-in" style={{ animationDelay: "0.05s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.35rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                账户余额
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)", lineHeight: 1.1 }}>
                ¥{user?.balance?.toFixed(2) ?? "0.00"}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(6,182,212,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
              </svg>
            </div>
          </div>
        </div>

        {/* 7-day Token Usage Card */}
        <div className="card animate-in" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.35rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Token 用量（7天）
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
                {totalTokens != null
                  ? totalTokens >= 1_000_000
                    ? `${(totalTokens / 1_000_000).toFixed(1)}M`
                    : totalTokens.toLocaleString()
                  : "—"}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(16,185,129,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
          </div>
        </div>

        {/* 7-day Cost Card */}
        <div className="card animate-in" style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.35rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                消费统计（7天）
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
                {usage != null ? `¥${usage.total_cost.toFixed(2)}` : "—"}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "rgba(245,158,11,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Quick Actions ========== */}
      <div
        className="card animate-in"
        style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginRight: "0.25rem", fontWeight: 600 }}>
          快捷操作
        </span>
        <a href="/api-keys" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 1.25rem" }}>
          创建 API Key
        </a>
        <a
          href="/recharge"
          className="btn-ghost"
          style={{ textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          充值
        </a>
        <a
          href="/docs"
          className="btn-ghost"
          style={{ textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          查看文档
        </a>
      </div>

      {/* ========== Recent Recharge Orders ========== */}
      <div className="card animate-in" style={{ animationDelay: "0.25s", opacity: 0, animationFillMode: "forwards" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1rem", color: "var(--text-primary)" }}>
          近期充值订单
        </h2>

        {/* Empty state */}
        {orders != null && orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)" }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: "0.75rem", opacity: 0.5 }}
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <p style={{ fontSize: "0.9rem", margin: 0 }}>暂无充值记录</p>
            <p style={{ fontSize: "0.8rem", margin: "0.25rem 0 1rem" }}>完成首次充值后，订单将显示在这里</p>
            <a href="/recharge" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.85rem", display: "inline-block" }}>
              去充值
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {orders?.map((order, i) => {
              const statusInfo = ORDER_STATUS_MAP[order.status] ?? {
                label: order.status,
                color: "var(--text-muted)",
                bg: "rgba(100,100,100,0.12)",
              };
              return (
                <div
                  key={order.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 0",
                    borderBottom: i < orders.length - 1 ? "1px solid var(--border)" : "none",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                    {/* Icon */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        background: statusInfo.bg,
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={statusInfo.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <polyline points="19 12 12 19 5 12" />
                      </svg>
                    </div>
                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        充值 · ¥{order.amount.toFixed(2)}
                        {order.pay_method && ` · ${PAY_METHOD_MAP[order.pay_method] || order.pay_method}`}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                        {order.order_no}
                      </div>
                    </div>
                  </div>
                  {/* Status + Time */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0, marginLeft: "auto" }}>
                    <span
                      className="badge"
                      style={{
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        fontSize: "0.7rem",
                        padding: "0.15rem 0.55rem",
                      }}
                    >
                      {statusInfo.label}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {timeAgo(order.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
