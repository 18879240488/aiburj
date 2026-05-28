"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminUser {
  id: number;
  email: string;
  username: string;
  balance: number;
  is_active: boolean;
  is_admin: boolean;
}

// 模拟用户详情扩展字段
interface UserDetail extends AdminUser {
  created_at?: string;
  last_login?: string;
  api_key_count?: number;
  total_calls?: number;
  total_spent?: number;
}

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("aiburj_token") : null; }

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  const token = getToken(); if (!token) return null;
  try { const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${path}`, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } }); if (!r.ok) return null; return r.json(); } catch { return null; }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "active" | "inactive">("all");
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editingBalance, setEditingBalance] = useState<number | null>(null);
  const [balanceInput, setBalanceInput] = useState("");

  useEffect(() => {
    let c = false;
    api<AdminUser[]>("/api/v1/admin/users").then(d => { if (c) return; if (!d) setAuthError(true); else setUsers(d); setLoading(false); });
    return () => { c = true; };
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || String(u.id).includes(q);
    const matchFilter =
      filter === "all" ? true :
      filter === "admin" ? u.is_admin :
      filter === "active" ? !u.is_admin && u.is_active :
      !u.is_admin && !u.is_active;
    return matchSearch && matchFilter;
  });

  async function toggleStatus(user: AdminUser) {
    await api(`/api/v1/admin/users/${user.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !user.is_active }) });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
  }

  async function adjustBalance(userId: number) {
    const amount = parseFloat(balanceInput);
    if (isNaN(amount)) return;
    await api(`/api/v1/admin/users/${userId}/balance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount }) });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: u.balance + amount } : u));
    setEditingBalance(null); setBalanceInput("");
  }

  function openDetail(user: AdminUser) {
    // 模拟增强详情数据
    setSelectedUser({
      ...user,
      created_at: "2026-05-20",
      last_login: "2026-05-28 08:30",
      api_key_count: Math.floor(Math.random() * 5),
      total_calls: Math.floor(Math.random() * 2000),
      total_spent: parseFloat((Math.random() * 50).toFixed(2)),
    });
    setShowDetail(true);
  }

  const badge = (label: string, color: string) => (
    <span className="badge" style={{ background: color, color: "#fff", fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "10px" }}>{label}</span>
  );

  if (loading) return <div className="animate-in" style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>加载中…</div>;
  if (authError) return (
    <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", maxWidth: 480, margin: "3rem auto" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
      <h2>需要管理员权限</h2>
      <a href="/auth/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>前往登录</a>
    </div>
  );

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>用户管理</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            共 {users.length} 个用户 · {users.filter(u => u.is_active).length} 活跃
          </p>
        </div>
        <Link href="/admin" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>← 返回看板</Link>
      </div>

      {/* 搜索 & 筛选 */}
      <div className="card" style={{ padding: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="搜索邮箱/用户名/ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: "0.55rem 0.75rem",
            background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "8px",
            color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
          }}
        />
        {(["all", "admin", "active", "inactive"] as const).map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.45rem 0.9rem", borderRadius: "8px", border: "1px solid",
              borderColor: filter === f ? "var(--accent)" : "var(--border)",
              background: filter === f ? "rgba(6,182,212,0.12)" : "transparent",
              color: filter === f ? "var(--accent)" : "var(--text-secondary)",
              fontSize: "0.8rem", cursor: "pointer", fontWeight: 600,
            }}
          >{f === "all" ? "全部" : f === "admin" ? "管理员" : f === "active" ? "活跃" : "已禁用"}</button>
        ))}
      </div>

      {/* 用户表格 */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              {["ID", "用户", "邮箱", "余额", "角色", "状态", "操作"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>#{u.id}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <button onClick={() => openDetail(u)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", padding: 0 }}>
                    {u.username}
                  </button>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{u.email}</td>
                <td style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--accent)" }}>
                  ¥{u.balance.toFixed(2)}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  {u.is_admin ? badge("管理员", "var(--accent)") : badge("用户", "var(--bg-tertiary)")}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: u.is_active ? "var(--success)" : "var(--danger)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.is_active ? "var(--success)" : "var(--danger)", display: "inline-block" }} />
                    {u.is_active ? "正常" : "已禁用"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                  {!u.is_admin && (
                    <button onClick={() => toggleStatus(u)} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>
                      {u.is_active ? "禁用" : "启用"}
                    </button>
                  )}
                  <button onClick={() => { setEditingBalance(u.id); setBalanceInput(""); }} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>
                    调余额
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>没有匹配的用户</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 余额调节弹窗 */}
      {editingBalance !== null && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }} onClick={() => setEditingBalance(null)}>
          <div className="card" style={{ padding: "2rem", minWidth: 320, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem" }}>调整余额</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              用户 #{editingBalance} · 当前余额 ¥{users.find(u => u.id === editingBalance)?.balance.toFixed(2)}
            </p>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input type="number" step="0.01" value={balanceInput} onChange={e => setBalanceInput(e.target.value)}
                placeholder="输入金额（正数增加/负数减少）"
                style={{
                  flex: 1, padding: "0.6rem 0.75rem", background: "var(--bg-primary)",
                  border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
                }} autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => setEditingBalance(null)} className="btn-ghost">取消</button>
              <button onClick={() => adjustBalance(editingBalance)} className="btn-primary">确认调整</button>
            </div>
          </div>
        </div>
      )}

      {/* 用户详情弹窗 */}
      {showDetail && selectedUser && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }} onClick={() => setShowDetail(false)}>
          <div className="card" style={{ padding: "2rem", minWidth: 400, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{selectedUser.username}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{selectedUser.email}</p>
              </div>
              <button onClick={() => setShowDetail(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                ["用户 ID", `#${selectedUser.id}`],
                ["余额", `¥${selectedUser.balance.toFixed(2)}`],
                ["角色", selectedUser.is_admin ? "管理员" : "普通用户"],
                ["状态", selectedUser.is_active ? "正常" : "已禁用"],
                ["注册时间", selectedUser.created_at || "—"],
                ["最后登录", selectedUser.last_login || "—"],
                ["API Keys", String(selectedUser.api_key_count || 0)],
                ["总调用次数", (selectedUser.total_calls || 0).toLocaleString()],
                ["总消费", `¥${(selectedUser.total_spent || 0).toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: "0.6rem", background: "var(--bg-primary)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>{k}</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
