"use client";

import { useState } from "react";
import Link from "next/link";

interface SettingItem {
  key: string;
  label: string;
  value: string | number;
  type: "text" | "number" | "select";
  options?: string[];
  unit?: string;
  description: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([
    { key: "new_user_bonus", label: "新用户赠送余额", value: 1.0, type: "number", unit: "¥", description: "新注册用户自动获得的初始余额" },
    { key: "rate_limit_per_minute", label: "API 限流 (次/分钟)", value: 60, type: "number", description: "每个 API Key 每分钟最大请求数" },
    { key: "rate_limit_per_ip", label: "IP 限流 (次/分钟)", value: 60, type: "number", description: "每个 IP 每分钟最大请求数" },
    { key: "default_model_price_input", label: "默认输入价格 (¥)", value: 1.0, type: "number", unit: "¥/百万token", description: "添加新模型时的默认输入价格" },
    { key: "default_model_price_output", label: "默认输出价格 (¥)", value: 4.0, type: "number", unit: "¥/百万token", description: "添加新模型时的默认输出价格" },
    { key: "proxy_timeout_seconds", label: "代理超时 (秒)", value: 30, type: "number", unit: "秒", description: "上游 API 请求超时时间" },
    { key: "max_retries", label: "最大重试次数", value: 2, type: "number", description: "上游失败后自动重试次数" },
    { key: "support_email", label: "支持邮箱", value: "support@aiburj.com", type: "text", description: "显示在页脚的客服邮箱" },
    { key: "site_name", label: "站点名称", value: "aiburj", type: "text", description: "网站标题和品牌名称" },
    { key: "enable_registration", label: "开放注册", value: "开启", type: "select", options: ["开启", "关闭", "仅邀请码"], description: "控制新用户注册方式" },
    { key: "maintenance_mode", label: "维护模式", value: "关闭", type: "select", options: ["关闭", "开启"], description: "开启后仅管理员可访问" },
  ]);

  const [saving, setSaving] = useState(false);

  function updateValue(key: string, value: string | number) {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  }

  async function saveSettings() {
    setSaving(true);
    // TODO: 接真实 API
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    alert("设置已保存（当前为原型，未写数据库）");
  }

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: 800 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>系统设置</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            全局参数配置 · 修改后立即生效
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", padding: "0.4rem 0" }}>← 看板</Link>
          <button onClick={saveSettings} className="btn-primary" style={{ fontSize: "0.85rem" }}>
            {saving ? "保存中…" : "保存设置"}
          </button>
        </div>
      </div>

      {/* 分组：通用 */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>通用设置</h3>
        {settings.filter(s => ["site_name", "support_email", "enable_registration", "maintenance_mode"].includes(s.key)).map(s => (
          <SettingRow key={s.key} setting={s} onChange={v => updateValue(s.key, v)} />
        ))}
      </div>

      {/* 分组：计费 */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>计费与限流</h3>
        {settings.filter(s => ["new_user_bonus", "rate_limit_per_minute", "rate_limit_per_ip", "default_model_price_input", "default_model_price_output"].includes(s.key)).map(s => (
          <SettingRow key={s.key} setting={s} onChange={v => updateValue(s.key, v)} />
        ))}
      </div>

      {/* 分组：代理 */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>代理配置</h3>
        {settings.filter(s => ["proxy_timeout_seconds", "max_retries"].includes(s.key)).map(s => (
          <SettingRow key={s.key} setting={s} onChange={v => updateValue(s.key, v)} />
        ))}
      </div>
    </div>
  );
}

function SettingRow({ setting, onChange }: { setting: SettingItem; onChange: (v: string | number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>{setting.label}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{setting.description}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {setting.type === "select" ? (
          <select value={String(setting.value)} onChange={e => onChange(e.target.value)}
            style={{ padding: "0.45rem 0.7rem", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none", minWidth: 120 }}
          >{setting.options?.map(o => <option key={o} value={o}>{o}</option>)}</select>
        ) : (
          <>
            {setting.unit === "¥" && <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", position: "absolute", marginLeft: "0.5rem", zIndex: 1 }}>¥</span>}
            <input type={setting.type} value={setting.value}
              onChange={e => onChange(setting.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
              style={{
                width: setting.type === "number" ? 80 : 200,
                padding: setting.unit === "¥" ? "0.45rem 0.7rem 0.45rem 1.2rem" : "0.45rem 0.7rem",
                background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "8px",
                color: "var(--text-primary)", fontSize: "0.85rem", outline: "none",
                textAlign: setting.type === "number" ? "right" : "left",
              }}
            />
            {setting.unit && setting.unit !== "¥" && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: 30 }}>{setting.unit}</span>}
          </>
        )}
      </div>
    </div>
  );
}
