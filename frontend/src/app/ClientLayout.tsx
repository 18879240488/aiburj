"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";

/* ── 导航栏（客户端组件，可访问 AuthContext）── */

function Navbar() {
  const { user, token, loading, accounts, logout, switchAccount, removeAccount } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) setSwitchOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push("/");
  }

  async function doSwitch(accountId: number) {
    try {
      await switchAccount(accountId);
      setSwitchOpen(false);
      setMenuOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message || "切换失败");
    }
  }

  function doRemove(accountId: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("确定移除此账户？")) return;
    removeAccount(accountId);
  }

  if (loading) {
    return (
      <nav className="glass" style={{ margin: "1rem", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "var(--text-primary)", fontWeight: 700, fontSize: "1.25rem" }}>
          <img src="/logo.jpg" alt="aiburj" style={{ width: 28, height: 28, borderRadius: 4 }} /> aiburj
        </a>
      </nav>
    );
  }

  const isLoggedIn = !!token && !!user;

  return (
    <nav className="glass" style={{ margin: "1rem", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "var(--text-primary)", fontWeight: 700, fontSize: "1.25rem" }}>
        <img src="/logo.jpg" alt="aiburj" style={{ width: 28, height: 28, borderRadius: 4 }} /> aiburj
      </a>

      {/* 中间导航 */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <a href="/models" className="nav-link" style={{ color: pathname === "/models" ? "var(--accent)" : undefined }}>模型</a>
        {isLoggedIn && (
          <>
            <a href="/api-keys" className="nav-link" style={{ color: pathname === "/api-keys" ? "var(--accent)" : undefined }}>API Keys</a>
            <a href="/usage" className="nav-link" style={{ color: pathname === "/usage" ? "var(--accent)" : undefined }}>用量</a>
            <a href="/recharge" className="nav-link" style={{ color: pathname === "/recharge" ? "var(--accent)" : undefined }}>充值</a>
          </>
        )}
      </div>

      {/* 右侧：登录状态 / 用户菜单 */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {isLoggedIn ? (
          <>
            <a href="/dashboard" className="btn-primary" style={{ fontSize: "0.875rem", textDecoration: "none" }}>控制台</a>

            {/* 用户头像下拉 */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setMenuOpen(!menuOpen); setSwitchOpen(false); }}
                style={{
                  width: 34, height: 34, borderRadius: "50%", border: "2px solid var(--accent)",
                  background: "linear-gradient(135deg, var(--accent), #6366f1)",
                  color: "#fff", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "box-shadow 0.2s",
                  boxShadow: menuOpen ? "0 0 0 3px var(--accent-glow)" : "none",
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </button>

              {menuOpen && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 100,
                  background: "var(--bg-secondary)", borderRadius: "12px",
                  border: "1px solid var(--border)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                  minWidth: 200, padding: "0.5rem", animation: "fadeIn 0.15s ease",
                }}>
                  {/* 用户信息 */}
                  <div style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid var(--border)", marginBottom: "0.25rem" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>{user.username}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>{user.email}</div>
                    {user.is_admin && (
                      <span style={{
                        display: "inline-block", marginTop: "0.3rem", padding: "0.1rem 0.45rem",
                        borderRadius: "4px", fontSize: "0.65rem", fontWeight: 600,
                        background: "rgba(6,182,212,0.15)", color: "var(--accent)",
                      }}>管理员</span>
                    )}
                  </div>

                  {/* 菜单项 */}
                  <MenuItem onClick={() => { setMenuOpen(false); router.push("/profile"); }}>👤 个人中心</MenuItem>
                  {user.is_admin && (
                    <MenuItem onClick={() => { setMenuOpen(false); router.push("/admin"); }}>⚙ 管理后台</MenuItem>
                  )}

                  {/* 切换账户 */}
                  <div style={{ position: "relative" }} ref={switchRef}>
                    <MenuItem onClick={() => setSwitchOpen(!switchOpen)}>
                      🔄 切换账户 {accounts.length > 1 && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: "auto" }}>{accounts.length}</span>}
                    </MenuItem>

                    {switchOpen && (
                      <div style={{
                        position: "absolute", right: "100%", top: 0,
                        background: "var(--bg-secondary)", borderRadius: "10px",
                        border: "1px solid var(--border)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                        minWidth: 200, padding: "0.5rem",
                      }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", padding: "0.3rem 0.6rem", marginBottom: "0.25rem" }}>
                          已保存的账户
                        </div>
                        {accounts.map((acc) => (
                          <div
                            key={acc.id}
                            onClick={() => doSwitch(acc.id)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "0.45rem 0.6rem", borderRadius: "6px", cursor: "pointer",
                              fontSize: "0.8rem", color: acc.id === user.id ? "var(--accent)" : "var(--text-primary)",
                              background: acc.id === user.id ? "rgba(6,182,212,0.08)" : "transparent",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => { if (acc.id !== user.id) e.currentTarget.style.background = "var(--bg-primary)"; }}
                            onMouseLeave={(e) => { if (acc.id !== user.id) e.currentTarget.style.background = "transparent"; }}
                          >
                            <div>
                              <div style={{ fontWeight: 600 }}>{acc.username}</div>
                              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{acc.email}</div>
                            </div>
                            <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                              {acc.id === user.id && (
                                <span style={{ fontSize: "0.65rem", color: "var(--success)", fontWeight: 600 }}>当前</span>
                              )}
                              <button
                                onClick={(e) => doRemove(acc.id, e)}
                                title="移除此账户"
                                style={{
                                  background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                                  fontSize: "0.7rem", padding: "2px 4px", borderRadius: "4px",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                        {accounts.length === 0 && (
                          <div style={{ padding: "0.5rem 0.6rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>暂无已保存账户</div>
                        )}
                        <div style={{ borderTop: "1px solid var(--border)", marginTop: "0.25rem", paddingTop: "0.25rem" }}>
                          <div
                            onClick={() => { setSwitchOpen(false); setMenuOpen(false); router.push("/auth/login"); }}
                            style={{
                              padding: "0.45rem 0.6rem", borderRadius: "6px", cursor: "pointer",
                              fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(6,182,212,0.08)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          >
                            ＋ 添加账户
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", margin: "0.25rem 0" }} />
                  <MenuItem onClick={handleLogout} danger>🚪 退出登录</MenuItem>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <a href="/auth/login" className="nav-link">登录</a>
            <a href="/auth/register" className="btn-primary" style={{ fontSize: "0.875rem", textDecoration: "none" }}>注册</a>
          </>
        )}
      </div>
    </nav>
  );
}

function MenuItem({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.5rem", width: "100%",
        padding: "0.45rem 0.75rem", borderRadius: "6px", border: "none",
        background: hover ? (danger ? "rgba(239,68,68,0.1)" : "var(--bg-primary)") : "transparent",
        color: danger ? (hover ? "var(--danger)" : "var(--text-secondary)") : "var(--text-primary)",
        fontSize: "0.83rem", cursor: "pointer", textAlign: "left",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </button>
  );
}

/* ── 客户端布局包装器 ── */

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main style={{ padding: "1rem", maxWidth: 1200, margin: "0 auto" }}>
        {children}
      </main>
    </AuthProvider>
  );
}
