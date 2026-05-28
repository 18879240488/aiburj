"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, token } = useAuth();

  // 已登录则直接跳转
  useEffect(() => {
    if (token) router.push("/dashboard");
  }, [token, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errs.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "邮箱格式不正确";
    }

    if (!password) {
      errs.password = "请输入密码";
    } else if (password.length < 6) {
      errs.password = "密码至少 6 位字符";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    background: "var(--bg-primary)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };

  const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: "var(--danger)",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.12)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "0.4rem",
  };

  if (token) return null; // 等待 redirect

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 80px)",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="glass animate-in"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2.5rem 2rem",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              textDecoration: "none",
              color: "var(--text-primary)",
              fontWeight: 800,
              fontSize: "1.4rem",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: "var(--accent)", fontSize: "1.5rem" }}>◆</span> aiburj
          </a>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            textAlign: "center",
            margin: "0 0 0.4rem",
            color: "var(--text-primary)",
          }}
        >
          欢迎回来
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            textAlign: "center",
            margin: "0 0 2rem",
          }}
        >
          登录您的 aiburj 账户
        </p>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              padding: "0.65rem 0.9rem",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
              color: "var(--danger)",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Email */}
          <div>
            <label htmlFor="login-email" style={labelStyle}>
              邮箱
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              style={fieldErrors.email ? inputErrorStyle : inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.email ? "var(--danger)" : "var(--accent)";
                e.currentTarget.style.boxShadow = fieldErrors.email
                  ? "0 0 0 3px rgba(239,68,68,0.12)"
                  : "0 0 0 3px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.email ? "var(--danger)" : "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {fieldErrors.email && (
              <div style={{ fontSize: "0.78rem", color: "var(--danger)", marginTop: "0.35rem" }}>
                {fieldErrors.email}
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" style={labelStyle}>
              密码
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="至少 6 位字符"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              style={fieldErrors.password ? inputErrorStyle : inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.password ? "var(--danger)" : "var(--accent)";
                e.currentTarget.style.boxShadow = fieldErrors.password
                  ? "0 0 0 3px rgba(239,68,68,0.12)"
                  : "0 0 0 3px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = fieldErrors.password ? "var(--danger)" : "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {fieldErrors.password && (
              <div style={{ fontSize: "0.78rem", color: "var(--danger)", marginTop: "0.35rem" }}>
                {fieldErrors.password}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              marginTop: "0.25rem",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                登录中…
              </span>
            ) : (
              "登录"
            )}
          </button>
        </form>

        {/* Register link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          还没有账户？{" "}
          <a
            href="/auth/register"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            立即注册
          </a>
        </p>
      </div>

      {/* Keyframes for spinner */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
