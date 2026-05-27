"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RechargeOrder {
  id: number;
  user_id: number;
  order_no: string;
  amount: number;
  pay_method: string;
  status: string;
  created_at: string;
  paid_at: string | null;
}

type StatusFilter = "all" | "pending" | "success" | "failed";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aiburj_token");
}

async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`http://localhost:8001/api/v1/admin${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待审核" },
  { key: "success", label: "已通过" },
  { key: "failed", label: "已拒绝" },
];

function statusBadge(status: string) {
  if (status === "success") return <span className="badge badge-success">已通过</span>;
  if (status === "failed") return <span className="badge badge-danger">已拒绝</span>;
  return <span className="badge badge-warning">待审核</span>;
}

function formatTime(iso: string | null): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

export default function AdminRechargePage() {
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const loadOrders = async (filter: StatusFilter, p: number) => {
    setLoading(true);
    const data = await fetchAdmin<RechargeOrder[]>(
      `/recharge/orders?status=${filter}&page=${p}&size=50`
    );
    if (!data) {
      setAuthError(true);
      setLoading(false);
      return;
    }
    setOrders(data);
    setHasMore(data.length === 50);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders(statusFilter, page);
  }, [statusFilter, page]);

  const handleFilterChange = (f: StatusFilter) => {
    setStatusFilter(f);
    setPage(1);
  };

  const handleConfirm = async (order: RechargeOrder) => {
    setConfirmDialog({
      title: "确认充值到账",
      message: `确认收到订单 ${order.order_no} 的充值 ¥${order.amount.toFixed(2)}？\n用户 #{order.user_id}`,
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetchAdmin("/recharge/confirm", {
          method: "POST",
          body: JSON.stringify({ order_id: order.id }),
        });
        if (res) {
          alert("充值确认成功，余额已到账");
          loadOrders(statusFilter, page);
        } else {
          alert("操作失败，请重试");
        }
      },
    });
  };

  const handleReject = async (order: RechargeOrder) => {
    setConfirmDialog({
      title: "拒绝充值",
      message: `确定拒绝订单 ${order.order_no} 的充值 ¥${order.amount.toFixed(2)}？\n此操作不可撤销。`,
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetchAdmin("/recharge/reject", {
          method: "POST",
          body: JSON.stringify({ order_id: order.id }),
        });
        if (res) {
          alert("已拒绝该充值");
          loadOrders(statusFilter, page);
        } else {
          alert("操作失败，请重试");
        }
      },
    });
  };

  if (authError && !loading) {
    return (
      <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", maxWidth: 480, margin: "3rem auto" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>需要管理员权限</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          请使用管理员账号登录后访问管理后台
        </p>
        <a href="/auth/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
          前往登录
        </a>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Link href="/admin" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
              管理后台
            </Link>
            <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>/</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>充值审核</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            充值审核
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            审核用户充值订单 · 确认到账 · 拒绝申请
          </p>
        </div>
      </header>

      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: statusFilter === f.key ? "rgba(6,182,212,0.15)" : "transparent",
              color: statusFilter === f.key ? "var(--accent)" : "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: statusFilter === f.key ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)" }}>加载中…</div>
      ) : orders.length === 0 ? (
        <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          暂无{statusFilters.find((f) => f.key === statusFilter)?.label}订单
        </div>
      ) : (
        <div className="card animate-in" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                  {["ID", "订单号", "用户ID", "金额", "支付方式", "状态", "时间", "操作"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      #{order.id}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <code style={{
                        background: "var(--bg-secondary)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: 4,
                        fontSize: "0.78rem",
                        color: "var(--accent)",
                      }}>
                        {order.order_no}
                      </code>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                      #{order.user_id}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontVariantNumeric: "tabular-nums" }}>
                      <span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>
                        ¥{order.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)" }}>
                      {order.pay_method === "alipay" ? "支付宝" : order.pay_method === "wechat" ? "微信" : "手动"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{statusBadge(order.status)}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      <div>{formatTime(order.created_at)}</div>
                      {order.paid_at && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                          处理: {formatTime(order.paid_at)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {order.status === "pending" ? (
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <button
                            className="btn-primary"
                            style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                            onClick={() => handleConfirm(order)}
                          >
                            通过
                          </button>
                          <button
                            className="btn-ghost"
                            style={{
                              padding: "0.3rem 0.75rem",
                              fontSize: "0.75rem",
                              color: "var(--danger)",
                              borderColor: "rgba(239,68,68,0.3)",
                            }}
                            onClick={() => handleReject(order)}
                          >
                            拒绝
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          {order.paid_at ? formatTime(order.paid_at) : "已处理"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && orders.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", alignItems: "center" }}>
          <button
            className="btn-ghost"
            style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← 上一页
          </button>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            第 {page} 页
          </span>
          <button
            className="btn-ghost"
            style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
            onClick={() => {
              if (hasMore) setPage((p) => p + 1);
            }}
            disabled={!hasMore}
          >
            下一页 →
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 110,
            padding: "1rem",
          }}
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="card animate-in"
            style={{ maxWidth: 380, width: "100%", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.75rem", color: "var(--text-primary)" }}>
              {confirmDialog.title}
            </h3>
            <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", fontSize: "0.9rem", whiteSpace: "pre-line" }}>
              {confirmDialog.message}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button className="btn-ghost" onClick={() => setConfirmDialog(null)}>
                取消
              </button>
              <button className="btn-primary" onClick={confirmDialog.onConfirm}>
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}