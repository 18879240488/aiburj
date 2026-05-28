"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RechargeOrder {
  id: number;
  user_id: number;
  user_email?: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  method?: string;
}

interface RechargePlan {
  id: number;
  name: string;
  amount: number;
  bonus: number;
  price: number;
  is_active: boolean;
}

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("aiburj_token") : null; }

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  const token = getToken(); if (!token) return null;
  try { const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${path}`, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } }); if (!r.ok) return null; return r.json(); } catch { return null; }
}

export default function AdminRechargePage() {
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [plans, setPlans] = useState<RechargePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"orders" | "plans">("orders");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [editingPlan, setEditingPlan] = useState<RechargePlan | null>(null);

  useEffect(() => {
    let c = false;
    api<RechargeOrder[]>("/api/v1/recharge/orders").then(d => {
      if (c) return;
      if (!d) { setError("加载充值订单失败，请稍后重试"); }
      else { setOrders(d); }
      setLoading(false);
    }).catch(() => {
      if (!c) { setError("网络错误，无法加载订单"); setLoading(false); }
    });
    return () => { c = true; };
  }, []);

  async function handleStatus(orderId: number, status: "approved" | "rejected") {
    // TODO: 接真实 API
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }

  const filtered = orders.filter(o => statusFilter === "all" || o.status === statusFilter);

  const statusBadge = (s: string) => {
    const map = { pending: { bg: "rgba(245,158,11,0.12)", c: "#f59e0b", t: "待审核" }, approved: { bg: "rgba(16,185,129,0.12)", c: "var(--success)", t: "已通过" }, rejected: { bg: "rgba(239,68,68,0.12)", c: "var(--danger)", t: "已拒绝" } };
    const m = map[s as keyof typeof map] || map.pending;
    return <span style={{ padding: "0.2rem 0.6rem", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 600, background: m.bg, color: m.c }}>{m.t}</span>;
  };

  if (loading) return <div className="animate-in" style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>加载中…</div>;
  if (error && orders.length === 0) return <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", maxWidth: 480, margin: "3rem auto" }}><h2 style={{ color: "var(--danger)" }}>加载失败</h2><p style={{ color: "var(--text-secondary)" }}>{error}</p></div>;

  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>充值管理</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            订单审核 · 套餐配置{pendingCount > 0 && <span style={{ color: "#f59e0b", fontWeight: 600 }}> · {pendingCount} 笔待处理</span>}
          </p>
        </div>
        <Link href="/admin" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>← 看板</Link>
      </div>

      {/* Tab 切换 */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {(["orders", "plans"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "0.5rem 1.25rem", borderRadius: "8px", border: "none",
              background: tab === t ? "var(--accent)" : "var(--bg-tertiary)",
              color: tab === t ? "#fff" : "var(--text-secondary)",
              fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            }}
          >{t === "orders" ? "充值订单" : "套餐管理"}</button>
        ))}
      </div>

      {tab === "orders" ? (
        <>
          {/* 筛选 */}
          <div className="card" style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {(["all", "pending", "approved", "rejected"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{
                  padding: "0.4rem 0.85rem", borderRadius: "8px", border: "1px solid",
                  borderColor: statusFilter === s ? "var(--accent)" : "var(--border)",
                  background: statusFilter === s ? "rgba(6,182,212,0.08)" : "transparent",
                  color: statusFilter === s ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: "0.8rem", cursor: "pointer", fontWeight: 600,
                }}
              >{s === "all" ? `全部 (${orders.length})` : s === "pending" ? `待审核 (${pendingCount})` : s === "approved" ? "已通过" : "已拒绝"}</button>
            ))}
          </div>

          {/* 订单表格 */}
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                  {["ID", "用户", "金额", "方式", "时间", "状态", "操作"].map(h => (
                    <th key={h} style={{ padding: "0.7rem 1rem", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.7rem 1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>#{o.id}</td>
                    <td style={{ padding: "0.7rem 1rem", fontSize: "0.85rem", color: "var(--text-primary)" }}>{o.user_email || `用户#${o.user_id}`}</td>
                    <td style={{ padding: "0.7rem 1rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--accent)" }}>¥{o.amount}</td>
                    <td style={{ padding: "0.7rem 1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{o.method || "—"}</td>
                    <td style={{ padding: "0.7rem 1rem", fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{o.created_at}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>{statusBadge(o.status)}</td>
                    <td style={{ padding: "0.7rem 1rem" }}>
                      {o.status === "pending" && (
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button onClick={() => handleStatus(o.id, "approved")} className="btn-primary" style={{ fontSize: "0.7rem", padding: "0.3rem 0.7rem" }}>通过</button>
                          <button onClick={() => handleStatus(o.id, "rejected")} className="btn-ghost" style={{ fontSize: "0.7rem", padding: "0.3rem 0.7rem", color: "var(--danger)" }}>拒绝</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>暂无订单</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* 套餐管理 */
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>充值套餐</h3>
            <button onClick={() => setEditingPlan({ id: 0, name: "", amount: 0, bonus: 0, price: 0, is_active: true })} className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}>+ 新增套餐</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                {["名称", "充值金额", "赠送", "售价", "状态", "操作"].map(h => (
                  <th key={h} style={{ padding: "0.7rem 1rem", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.7rem 1rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</td>
                  <td style={{ padding: "0.7rem 1rem", fontSize: "0.9rem", color: "var(--accent)", fontWeight: 700 }}>¥{p.amount}</td>
                  <td style={{ padding: "0.7rem 1rem", fontSize: "0.85rem", color: "var(--success)" }}>+¥{p.bonus}</td>
                  <td style={{ padding: "0.7rem 1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>¥{p.price}</td>
                  <td style={{ padding: "0.7rem 1rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: p.is_active ? "var(--success)" : "var(--text-muted)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.is_active ? "var(--success)" : "var(--text-muted)" }} />{p.is_active ? "启用" : "禁用"}
                    </span>
                  </td>
                  <td style={{ padding: "0.7rem 1rem", display: "flex", gap: "0.4rem" }}>
                    <button onClick={() => setEditingPlan(p)} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>编辑</button>
                    <button onClick={() => setPlans(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>{p.is_active ? "禁用" : "启用"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 套餐编辑弹窗 */}
      {editingPlan && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setEditingPlan(null)}>
          <div className="card" style={{ padding: "2rem", minWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1.25rem" }}>{editingPlan.id === 0 ? "新增套餐" : "编辑套餐"}</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>完整表单将在 Phase 6 实现，当前为原型预览。</p>
            <button onClick={() => setEditingPlan(null)} className="btn-ghost" style={{ float: "right" }}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
}
