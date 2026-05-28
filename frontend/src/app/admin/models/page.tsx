"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminModel {
  id: number;
  name: string;
  display_name: string;
  provider: string;
  model_type: string;
  price_per_input: number;
  price_per_output: number;
  is_active: boolean;
  sort_order: number;
  scene_tags: string;
  context_length: number;
  parameter_size: string;
}

const MODEL_TYPE_LABELS: Record<string, string> = { chat: "对话", image: "生图", embedding: "嵌入", rerank: "重排序", audio: "语音", video: "视频" };

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("aiburj_token") : null; }

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  const token = getToken(); if (!token) return null;
  try { const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}${path}`, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } }); if (!r.ok) return null; return r.json(); } catch { return null; }
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<AdminModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingModel, setEditingModel] = useState<AdminModel | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    let c = false;
    api<AdminModel[]>("/api/v1/admin/models").then(d => { if (c) return; if (!d) setAuthError(true); else setModels(d); setLoading(false); });
    return () => { c = true; };
  }, []);

  const filtered = models.filter(m => {
    const q = search.toLowerCase();
    return (!q || m.name.toLowerCase().includes(q) || m.display_name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)) &&
      (typeFilter === "all" || m.model_type === typeFilter) &&
      (statusFilter === "all" || (statusFilter === "active" ? m.is_active : !m.is_active));
  });

  async function toggleActive(model: AdminModel) {
    await api(`/api/v1/admin/models/${model.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !model.is_active }) });
    setModels(prev => prev.map(m => m.id === model.id ? { ...m, is_active: !m.is_active } : m));
  }

  async function deleteModel(id: number) {
    if (!confirm("确认删除此模型？")) return;
    await api(`/api/v1/admin/models/${id}`, { method: "DELETE" });
    setModels(prev => prev.filter(m => m.id !== id));
  }

  const typeColors: Record<string, string> = { chat: "var(--accent)", embedding: "#a78bfa", rerank: "#f59e0b", image: "#ec4899", audio: "#10b981", video: "#6366f1" };

  if (loading) return <div className="animate-in" style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>加载中…</div>;
  if (authError) return (
    <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", maxWidth: 480, margin: "3rem auto" }}>
      <div style={{ fontSize: "3rem" }}>🔒</div>
      <h2>需要管理员权限</h2>
      <a href="/auth/login" className="btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>前往登录</a>
    </div>
  );

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>模型配置</h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            {models.length} 个模型 · {models.filter(m => m.is_active).length} 活跃
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.85rem", padding: "0.4rem 0" }}>← 看板</Link>
          <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>+ 添加模型</button>
        </div>
      </div>

      {/* 筛选 */}
      <div className="card" style={{ padding: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <input placeholder="搜索模型名称/厂商…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "0.55rem 0.75rem", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" }}
        />
        {(["all", "chat", "embedding", "image", "audio", "video"] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            style={{ padding: "0.45rem 0.8rem", borderRadius: "8px", border: "1px solid", borderColor: typeFilter === t ? "var(--accent)" : "var(--border)", background: typeFilter === t ? "rgba(6,182,212,0.12)" : "transparent", color: typeFilter === t ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
          >{t === "all" ? "全部类型" : MODEL_TYPE_LABELS[t] || t}</button>
        ))}
        {(["all", "active", "inactive"] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "0.45rem 0.8rem", borderRadius: "8px", border: "1px solid", borderColor: statusFilter === s ? (s === "inactive" ? "var(--danger)" : "var(--accent)") : "var(--border)", background: statusFilter === s ? (s === "inactive" ? "rgba(239,68,68,0.1)" : "rgba(6,182,212,0.08)") : "transparent", color: statusFilter === s ? (s === "inactive" ? "var(--danger)" : "var(--accent)") : "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
          >{s === "all" ? "全部状态" : s === "active" ? "活跃" : "已下线"}</button>
        ))}
      </div>

      {/* 模型卡片网格 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {filtered.map(m => (
          <div key={m.id} className="card animate-in" style={{ padding: "1.25rem", position: "relative", overflow: "hidden" }}>
            {/* 状态指示条 */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: m.is_active ? "var(--success)" : "var(--danger)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{m.display_name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{m.provider} · {m.name}</div>
              </div>
              <span style={{
                padding: "0.15rem 0.5rem", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 600,
                background: (typeColors[m.model_type] || "var(--accent)") + "20",
                color: typeColors[m.model_type] || "var(--accent)",
              }}>{MODEL_TYPE_LABELS[m.model_type] || m.model_type}</span>
            </div>

            {/* 价格 */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem", fontSize: "0.8rem" }}>
              <div><span style={{ color: "var(--text-muted)" }}>入：</span><span style={{ color: "var(--accent)", fontWeight: 700 }}>¥{m.price_per_input}</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>出：</span><span style={{ color: "var(--accent)", fontWeight: 700 }}>¥{m.price_per_output}</span></div>
              <div><span style={{ color: "var(--text-muted)" }}>上下文：</span><span style={{ color: "var(--text-secondary)" }}>{(m.context_length / 1024).toFixed(0)}K</span></div>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
              {m.scene_tags.split(",").filter(Boolean).map(t => (
                <span key={t} style={{ padding: "0.1rem 0.45rem", borderRadius: "4px", fontSize: "0.65rem", background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>{t}</span>
              ))}
            </div>

            {/* 操作 */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => toggleActive(m)} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.8rem" }}>
                {m.is_active ? "下线" : "上线"}
              </button>
              <button onClick={() => setEditingModel(m)} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.8rem" }}>编辑</button>
              <button onClick={() => deleteModel(m.id)} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.8rem", color: "var(--danger)" }}>删除</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>没有匹配的模型</div>
        )}
      </div>

      {/* 添加/编辑模型的提示（简易版，完整表单后续实现） */}
      {(showAdd || editingModel) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => { setShowAdd(false); setEditingModel(null); }}>
          <div className="card" style={{ padding: "2rem", minWidth: 420, maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 1rem" }}>{editingModel ? "编辑模型" : "添加模型"}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              完整表单将在 Phase 6 实现。当前可通过 API 直接操作或导入种子数据。
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowAdd(false); setEditingModel(null); }} className="btn-ghost">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
