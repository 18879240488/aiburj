"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  username: string;
  balance: number;
  is_active: boolean;
  is_admin: boolean;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aiburj_token");
}

async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/admin${path}`, {
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceAction, setBalanceAction] = useState<"add" | "subtract">("add");
  const [modalLoading, setModalLoading] = useState(false);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const loadUsers = async () => {
    const data = await fetchAdmin<User[]>("/users");
    if (!data) {
      setAuthError(true);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdjustBalance = (user: User) => {
    setModalUser(user);
    setBalanceAmount("");
    setBalanceAction("add");
    setModalOpen(true);
  };

  const submitBalance = async () => {
    if (!modalUser || !balanceAmount) return;
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("请输入有效的金额");
      return;
    }

    setConfirmDialog({
      title: "确认操作",
      message: `确定要为 ${modalUser.username || modalUser.email} ${balanceAction === "add" ? "充值" : "扣除"} ¥${amount.toFixed(2)}？`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setModalLoading(true);
        const res = await fetchAdmin(`/users/${modalUser.id}/balance`, {
          method: "POST",
          body: JSON.stringify({ amount, action: balanceAction }),
        });
        setModalLoading(false);
        if (res) {
          alert("操作成功");
          setModalOpen(false);
          loadUsers();
        } else {
          alert("操作失败，请重试");
        }
      },
    });
  };

  const toggleAdmin = async (user: User) => {
    setConfirmDialog({
      title: "确认操作",
      message: `确定要${user.is_admin ? "取消" : "设置"} ${user.username || user.email} 为管理员？`,
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetchAdmin(`/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify({ is_admin: !user.is_admin }),
        });
        if (res) {
          loadUsers();
        } else {
          alert("操作失败");
        }
      },
    });
  };

  const toggleActive = async (user: User) => {
    setConfirmDialog({
      title: "确认操作",
      message: `确定要${user.is_active ? "禁用" : "启用"} ${user.username || user.email}？`,
      onConfirm: async () => {
        setConfirmDialog(null);
        const res = await fetchAdmin(`/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify({ is_active: !user.is_active }),
        });
        if (res) {
          loadUsers();
        } else {
          alert("操作失败");
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="animate-in" style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
        加载中…
      </div>
    );
  }

  if (authError) {
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
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>用户管理</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            用户管理
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            查看用户列表 · 调整余额 · 设置管理员
          </p>
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          共 {users.length} 位用户
        </div>
      </header>

      {/* User Table */}
      {users.length === 0 ? (
        <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          暂无用户数据
        </div>
      ) : (
        <div className="card animate-in" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                  {["ID", "邮箱", "用户名", "余额", "角色", "状态", "操作"].map((h) => (
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
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      #{user.id}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-primary)" }}>{user.email}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-primary)" }}>{user.username || "-"}</td>
                    <td style={{ padding: "0.75rem 1rem", fontVariantNumeric: "tabular-nums" }}>
                      <span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>
                        ¥{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {user.is_admin ? (
                        <span className="badge" style={{ background: "rgba(6,182,212,0.15)", color: "var(--accent)" }}>
                          管理员
                        </span>
                      ) : (
                        <span className="badge" style={{ background: "rgba(136,153,180,0.12)", color: "var(--text-secondary)" }}>
                          普通用户
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {user.is_active ? (
                        <span className="badge badge-success">活跃</span>
                      ) : (
                        <span className="badge badge-danger">禁用</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <button
                          className="btn-ghost"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          onClick={() => handleAdjustBalance(user)}
                        >
                          余额
                        </button>
                        <button
                          className="btn-ghost"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          onClick={() => toggleAdmin(user)}
                        >
                          {user.is_admin ? "取消管理" : "设管理"}
                        </button>
                        <button
                          className="btn-ghost"
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.75rem",
                            color: user.is_active ? "var(--danger)" : "var(--success)",
                          }}
                          onClick={() => toggleActive(user)}
                        >
                          {user.is_active ? "禁用" : "启用"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Balance Adjust Modal */}
      {modalOpen && modalUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="card animate-in"
            style={{ maxWidth: 420, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                调整余额
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  padding: "0.25rem",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              用户：<span style={{ color: "var(--text-primary)" }}>{modalUser.username || modalUser.email}</span>
              <br />
              当前余额：<span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>
                ¥{modalUser.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Action selector */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
              {(["add", "subtract"] as const).map((action) => (
                <label
                  key={action}
                  className={balanceAction === action ? "btn-primary" : "btn-ghost"}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    padding: "0.5rem 1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.35rem",
                    ...(balanceAction === action
                      ? { background: action === "add" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)" }
                      : {}),
                  }}
                >
                  <input
                    type="radio"
                    checked={balanceAction === action}
                    onChange={() => setBalanceAction(action)}
                    style={{ display: "none" }}
                  />
                  {action === "add" ? "＋ 充值" : "－ 扣除"}
                </label>
              ))}
            </div>

            {/* Amount input */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.4rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                金额 (¥)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="输入金额"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "0.5rem 0.75rem",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onKeyDown={(e) => { if (e.key === "Enter") submitBalance(); }}
              />
              {balanceAmount && !isNaN(parseFloat(balanceAmount)) && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  操作后余额：¥
                  <span style={{ color: "var(--accent-amber)", fontWeight: 600 }}>
                    {balanceAction === "add"
                      ? (modalUser.balance + parseFloat(balanceAmount)).toFixed(2)
                      : Math.max(0, modalUser.balance - parseFloat(balanceAmount)).toFixed(2)
                    }
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                className="btn-ghost"
                onClick={() => setModalOpen(false)}
                disabled={modalLoading}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={submitBalance}
                disabled={modalLoading || !balanceAmount}
                style={{ opacity: modalLoading || !balanceAmount ? 0.5 : 1 }}
              >
                {modalLoading ? "处理中…" : "确认"}
              </button>
            </div>
          </div>
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
            <p style={{ color: "var(--text-secondary)", margin: "0 0 1.5rem", fontSize: "0.9rem" }}>
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