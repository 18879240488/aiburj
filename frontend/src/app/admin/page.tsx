"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminStats {
  total_users: number;
  active_models: number;
  api_calls_today: number;
  total_revenue: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aiburj_token");
}

async function fetchAdmin<T>(path: string): Promise<T | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`http://localhost:8001/api/v1/admin${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    active_models: 0,
    api_calls_today: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAdmin<AdminStats>("/stats").then((data) => {
      if (cancelled) return;
      if (!data) {
        setAuthError(true);
      } else {
        setStats(data);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

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
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            管理后台
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            平台概览 · 用户管理 · 模型配置
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
      }}>
        <div className="card animate-in" style={{ animationDelay: "0.05s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            总用户数
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>
            {stats.total_users.toLocaleString()}
          </div>
        </div>

        <div className="card animate-in" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            活跃模型
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--success)" }}>
            {stats.active_models}
          </div>
        </div>

        <div className="card animate-in" style={{ animationDelay: "0.15s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            今日 API 调用
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a78bfa" }}>
            {stats.api_calls_today.toLocaleString()}
          </div>
        </div>

        <div className="card animate-in" style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            充值总额
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-amber)" }}>
            ¥{stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1rem",
        marginTop: "0.5rem",
      }}>
        <Link href="/admin/users" style={{ textDecoration: "none" }}>
          <div className="card" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(6,182,212,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>用户管理</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                查看用户列表 · 调整余额 · 设置管理员
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/models" style={{ textDecoration: "none" }}>
          <div className="card" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(16,185,129,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>模型配置</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                添加模型 · 设置价格 · 配置上游地址
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}