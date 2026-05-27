import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aiburj — 国产大模型 API 聚合平台",
  description: "统一接入 DeepSeek、Qwen、GLM 等国产大模型",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body>
        <nav className="glass" style={{ margin: "1rem", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", color: "var(--text-primary)", fontWeight: 700, fontSize: "1.25rem" }}>
            <img src="/logo.jpg" alt="aiburj" style={{ width: 28, height: 28, borderRadius: 4 }} /> aiburj
          </a>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <a href="/models" className="nav-link">模型</a>
            <a href="/api-keys" className="nav-link">API Keys</a>
            <a href="/usage" className="nav-link">用量</a>
            <a href="/recharge" className="nav-link">充值</a>
            <a href="/dashboard" className="btn-primary" style={{ fontSize: "0.875rem" }}>控制台</a>
          </div>
        </nav>
        <main style={{ padding: "1rem", maxWidth: 1200, margin: "0 auto" }}>
          {children}
        </main>

      </body>
    </html>
  );
}
