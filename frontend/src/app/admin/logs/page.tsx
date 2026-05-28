"use client";

import { useState } from "react";
import Link from "next/link";

// 模拟日志数据（后续接真实 API）
interface LogEntry {
  id: number;
  time: string;
  level: "info" | "warn" | "error";
  user: string;
  agent?: string;
  action: string;
  detail: string;
  ip: string;
}

const MOCK_LOGS: LogEntry[] = [
  { id: 1, time: "2026-05-28 08:32:15", level: "info", user: "admin@aiburj.com", action: "用户登录", detail: "管理员登录成功", ip: "192.168.1.100" },
  { id: 2, time: "2026-05-28 08:28:42", level: "warn", user: "test@aiburj.com", action: "余额不足", detail: "调用 deepseek-v3 时余额不足，请求被拒绝", ip: "10.0.0.55" },
  { id: 3, time: "2026-05-28 08:15:09", level: "error", user: "—", agent: "系统", action: "上游超时", detail: "DeepSeek API 响应超时 (30s)，已自动重试", ip: "—" },
  { id: 4, time: "2026-05-28 07:55:33", level: "info", user: "sam@test.com", action: "API 调用", detail: "POST /v1/chat/completions model=qwen-2.5 tokens=1523", ip: "203.0.113.42" },
  { id: 5, time: "2026-05-28 07:42:18", level: "info", user: "admin@aiburj.com", action: "管理操作", detail: "修改模型 #1 deepseek-v3 价格为 ¥1.5/¥6.0", ip: "192.168.1.100" },
  { id: 6, time: "2026-05-28 07:30:01", level: "info", user: "系统", action: "定时任务", detail: "每日用量统计完成，共处理 1,247 条记录", ip: "127.0.0.1" },
  { id: 7, time: "2026-05-28 06:55:22", level: "error", user: "test@aiburj.com", action: "API 错误", detail: "上游返回 429 Too Many Requests (DeepSeek)", ip: "10.0.0.55" },
  { id: 8, time: "2026-05-28 06:40:07", level: "warn", user: "—", action: "限流触发", detail: "IP 203.0.113.42 触发限流 (65 req/min), 已临时封禁60秒", ip: "203.0.113.42" },
];

const levelStyles: Record<string, { bg: string; color: string }> = {
  info: { bg: "rgba(6,182,212,0.1)", color: "var(--accent)" },
  warn: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  error: { bg: "rgba(239,68,68,0.1)", color: "var(--danger)" },
};

export default function AdminLogsPage() {
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_LOGS.filter(l =>
    (filter === "all" || l.level === filter) &&
    (!search || l.detail.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()) || l.action.includes(search))
  );

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>系统日志</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            实时监控 API 调用、管理操作、系统事件
          </p>
        </div>
        <Link href="/admin" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem" }}>← 看板</Link>
      </div>

      {/* 筛选 + 搜索 */}
      <div className="card" style={{ padding: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="搜索日志…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "0.55rem 0.75rem", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" }}
        />
        {(["all", "info", "warn", "error"] as const).map(l => (
          <button key={l} onClick={() => setFilter(l)}
            style={{
              padding: "0.45rem 0.9rem", borderRadius: "8px", border: "1px solid",
              borderColor: filter === l ? (levelStyles[l]?.color || "var(--border)") : "var(--border)",
              background: filter === l ? (levelStyles[l]?.bg || "transparent") : "transparent",
              color: filter === l ? (levelStyles[l]?.color || "var(--text-primary)") : "var(--text-secondary)",
              fontSize: "0.8rem", cursor: "pointer", fontWeight: 600,
            }}
          >{l === "all" ? "全部级别" : l.toUpperCase()}</button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          共 {filtered.length} 条
        </div>
      </div>

      {/* 日志表格 */}
      <div className="card" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
              {["时间", "级别", "用户", "操作", "详情", "IP"].map(h => (
                <th key={h} style={{ padding: "0.7rem 0.9rem", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} style={{ borderBottom: "1px solid var(--border)", fontSize: "0.8rem" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "0.65rem 0.9rem", color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.75rem" }}>{l.time}</td>
                <td style={{ padding: "0.65rem 0.9rem" }}>
                  <span style={{
                    padding: "0.15rem 0.5rem", borderRadius: "10px", fontSize: "0.65rem", fontWeight: 700,
                    background: levelStyles[l.level].bg, color: levelStyles[l.level].color,
                  }}>{l.level.toUpperCase()}</span>
                </td>
                <td style={{ padding: "0.65rem 0.9rem", color: "var(--text-primary)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.user}</td>
                <td style={{ padding: "0.65rem 0.9rem", color: "var(--accent)", fontWeight: 600 }}>{l.action}</td>
                <td style={{ padding: "0.65rem 0.9rem", color: "var(--text-secondary)" }}>{l.detail}</td>
                <td style={{ padding: "0.65rem 0.9rem", color: "var(--text-muted)", fontFamily: "monospace", fontSize: "0.75rem" }}>{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
