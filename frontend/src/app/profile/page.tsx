"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.6rem 0.8rem", background: "var(--bg-primary)",
  border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)",
  fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout, switchAccount, accounts, removeAccount } = useAuth();

  // 编辑状态
  const [editingUsername, setEditingUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  // 密码修改
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // 微信绑定（模拟）
  const [wechatBound, setWechatBound] = useState(false);

  // Toast
  const [toast, setToast] = useState("");

  // 切换账户
  const [switchOpen, setSwitchOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      setUsername(user.username || "");
    }
  }, [authLoading, token, user, router]);

  async function saveUsername() {
    if (!username.trim() || username === user?.username) { setEditingUsername(false); return; }
    setSavingUsername(true);
    // TODO: PUT /api/v1/auth/profile
    await new Promise(r => setTimeout(r, 500));
    setEditingUsername(false);
    setSavingUsername(false);
    showToast("昵称已更新");
  }

  async function changePassword() {
    setPasswordError(""); setPasswordSuccess("");
    if (!oldPassword) { setPasswordError("请输入当前密码"); return; }
    if (newPassword.length < 6) { setPasswordError("新密码至少 6 位"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("两次密码不一致"); return; }

    setChangingPassword(true);
    // TODO: PUT /api/v1/auth/password
    await new Promise(r => setTimeout(r, 800));
    setChangingPassword(false);
    setPasswordSuccess("密码修改成功");
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    setShowPasswordForm(false);
    showToast("密码已修改");
  }

  function handleLogout() {
    logout();
    router.push("/");
    showToast("已退出登录");
  }

  async function doSwitch(accountId: number) {
    setSwitchingId(accountId);
    try {
      await switchAccount(accountId);
      showToast("账户已切换");
    } catch (err: any) {
      alert(err.message || "切换失败");
    } finally {
      setSwitchingId(null);
    }
  }

  function doRemove(accountId: number) {
    if (!confirm("确定移除此账户？")) return;
    removeAccount(accountId);
    showToast("账户已移除");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  if (authLoading) {
    return <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>加载中…</div>;
  }

  if (!user) {
    return <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", maxWidth: 480, margin: "3rem auto" }}>
      <div style={{ fontSize: "3rem" }}>🔒</div>
      <h2>请先登录</h2>
      <a href="/auth/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>前往登录</a>
    </div>;
  }

  return (
    <div className="animate-in" style={{ display: "flex", gap: "2rem", maxWidth: 960, margin: "0 auto" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 200,
          padding: "0.7rem 1.5rem", background: "var(--success)", color: "#fff", borderRadius: "10px",
          fontSize: "0.9rem", fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>{toast}</div>
      )}

      {/* ── 左侧卡片：头像 + 基础信息 ── */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <div className="card" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
          {/* 头像 */}
          <div style={{
            width: 88, height: 88, borderRadius: "50%", margin: "0 auto 1rem",
            background: "linear-gradient(135deg, var(--accent), #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", color: "#fff", fontWeight: 800,
          }}>
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>

          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 0.25rem" }}>{user.username}</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 1rem" }}>
            ID: {String(user.id).padStart(6, "0")}
          </p>

          <div style={{
            padding: "0.75rem", borderRadius: "10px",
            background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(99,102,241,0.06))",
            marginBottom: "1rem",
          }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>账户余额</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)" }}>
              ¥{user.balance.toFixed(2)}
            </div>
          </div>

          {user.is_admin && (
            <div style={{ marginBottom: "0.75rem" }}>
              <Link href="/admin" style={{
                padding: "0.5rem 1.25rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600,
                background: "rgba(6,182,212,0.12)", color: "var(--accent)", textDecoration: "none",
                border: "1px solid rgba(6,182,212,0.25)", display: "inline-block",
              }}>⚙ 管理后台</Link>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {/* 切换账户 */}
            {accounts.length > 1 && (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setSwitchOpen(!switchOpen)}
                  className="btn-ghost"
                  style={{ width: "100%", fontSize: "0.8rem", padding: "0.5rem 1rem", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  🔄 切换账户 ({accounts.length})
                </button>
                {switchOpen && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                    background: "var(--bg-secondary)", borderRadius: "10px",
                    border: "1px solid var(--border)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                    padding: "0.4rem", marginTop: "4px",
                  }}>
                    {accounts.map((acc) => (
                      <div key={acc.id}
                        onClick={() => { if (acc.id !== user.id) doSwitch(acc.id); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "0.45rem 0.6rem", borderRadius: "6px", cursor: acc.id !== user.id ? "pointer" : "default",
                          fontSize: "0.8rem", background: acc.id === user.id ? "rgba(6,182,212,0.08)" : "transparent",
                          color: acc.id === user.id ? "var(--accent)" : "var(--text-primary)",
                        }}
                      >
                        <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.username}</div>
                          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{acc.email}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginLeft: "0.5rem" }}>
                          {switchingId === acc.id ? (
                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>切换中…</span>
                          ) : acc.id === user.id ? (
                            <span style={{ fontSize: "0.6rem", color: "var(--success)", fontWeight: 700, whiteSpace: "nowrap" }}>当前</span>
                          ) : null}
                          {acc.id !== user.id && (
                            <button onClick={(e) => { e.stopPropagation(); doRemove(acc.id); }}
                              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.65rem", padding: "2px" }}
                              title="移除">✕</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 退出登录 */}
            <button onClick={handleLogout}
              style={{
                width: "100%", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 600,
                background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)",
                cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            >
              🚪 退出登录
            </button>
          </div>
        </div>
      </div>

      {/* ── 右侧：详细设置 ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* 基本资料 */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
            📝 基本资料
          </h3>

          {/* 昵称 */}
          <div style={{ padding: "0.6rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 100, flexShrink: 0 }}>
              <label style={labelStyle}>昵称</label>
            </div>
            <div style={{ flex: 1 }}>
              {editingUsername ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} autoFocus
                    onKeyDown={e => { if (e.key === "Enter") saveUsername(); if (e.key === "Escape") setEditingUsername(false); }} />
                  <button onClick={saveUsername} className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", whiteSpace: "nowrap" }} disabled={savingUsername}>
                    {savingUsername ? "保存…" : "保存"}
                  </button>
                  <button onClick={() => { setEditingUsername(false); setUsername(user.username); }} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "0.5rem 0.8rem" }}>取消</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{user.username}</span>
                  <button onClick={() => setEditingUsername(true)} style={{
                    background: "none", border: "none", color: "var(--accent)", fontSize: "0.75rem", cursor: "pointer", padding: 0,
                  }}>编辑</button>
                </div>
              )}
            </div>
          </div>

          {/* 邮箱 */}
          <div style={{ padding: "0.6rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 100, flexShrink: 0 }}>
              <label style={labelStyle}>邮箱</label>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{user.email}</span>
              <span style={{
                padding: "0.1rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem",
                background: "rgba(16,185,129,0.12)", color: "var(--success)", fontWeight: 600,
              }}>已绑定</span>
            </div>
          </div>

          {/* 手机号 */}
          <div style={{ padding: "0.6rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 100, flexShrink: 0 }}>
              <label style={labelStyle}>手机号</label>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>未绑定</span>
              <button style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer" }}>绑定</button>
            </div>
          </div>

          {/* 微信 */}
          <div style={{ padding: "0.6rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 100, flexShrink: 0 }}>
              <label style={labelStyle}>微信</label>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {wechatBound ? (
                <>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>已绑定</span>
                  <span style={{ padding: "0.1rem 0.5rem", borderRadius: "4px", fontSize: "0.65rem", background: "rgba(16,185,129,0.12)", color: "var(--success)", fontWeight: 600 }}>已绑定</span>
                  <button onClick={() => setWechatBound(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.75rem", cursor: "pointer", marginLeft: "auto" }}>解绑</button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>未绑定</span>
                  <button onClick={() => setWechatBound(true)} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer" }}>绑定</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 安全设置 */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
            🔐 安全设置
          </h3>

          {/* 修改密码 */}
          <div style={{ padding: "0.6rem 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>登录密码</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>定期更换密码保护账户安全</div>
              </div>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="btn-ghost" style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}>
                {showPasswordForm ? "取消" : "修改"}
              </button>
            </div>

            {showPasswordForm && (
              <div style={{ marginTop: "1rem", padding: "1.25rem", background: "var(--bg-primary)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {passwordError && (
                  <div style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: "0.8rem" }}>{passwordError}</div>
                )}
                {passwordSuccess && (
                  <div style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: "rgba(16,185,129,0.1)", color: "var(--success)", fontSize: "0.8rem" }}>{passwordSuccess}</div>
                )}

                <div>
                  <label style={labelStyle}>当前密码</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={inputStyle} placeholder="输入当前密码" />
                </div>
                <div>
                  <label style={labelStyle}>新密码</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="至少 6 位字符" />
                </div>
                <div>
                  <label style={labelStyle}>确认新密码</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="再次输入新密码" />
                </div>
                <button onClick={changePassword} className="btn-primary" style={{ alignSelf: "flex-start", fontSize: "0.85rem", padding: "0.55rem 1.5rem" }} disabled={changingPassword}>
                  {changingPassword ? "修改中…" : "确认修改"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 账号信息 */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
            📋 账号信息
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Row label="用户 ID" value={`#${String(user.id).padStart(6, "0")}`} />
            <Row label="注册时间" value="2026-05-20" />
            <Row label="账户类型" value={user.is_admin ? "管理员" : "普通用户"} />
            <Row label="账户状态" value="正常" color="var(--success)" />
          </div>
        </div>

      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: color || "var(--text-primary)" }}>{value}</span>
    </div>
  );
}
