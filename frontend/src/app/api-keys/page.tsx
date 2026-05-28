"use client";

import { useEffect, useState, useCallback } from "react";

interface ApiKey {
  id: string;
  name?: string;
  key_prefix?: string;
  full_key?: string;        // only returned on creation
  created_at?: string;
  last_used_at?: string;
  is_active?: boolean;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreatedKey, setShowCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchKeys = useCallback(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/billing/api-keys`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`请求失败 (${res.status})`);
        return res.json();
      })
      .then((data: ApiKey[]) => {
        if (Array.isArray(data)) {
          setKeys(data);
        }
        setError("");
      })
      .catch((err) => {
        console.error("API Keys fetch failed:", err);
        setError("加载 API Keys 失败，请稍后重试");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/billing/api-keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (!res.ok) throw new Error("create failed");
      const data: ApiKey & { key?: string; full_key?: string } = await res.json();
      // Show the full key if returned
      const fullKey = data.full_key || data.key;
      if (fullKey) {
        setShowCreatedKey(fullKey);
      }
      setNewKeyName("");
      fetchKeys();
    } catch (err: any) {
      alert("创建失败: " + (err.message ?? "未知错误"));
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback: select text manually
      alert("请手动复制: " + text);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个 API Key 吗？此操作不可撤销。")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/v1/billing/api-keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("delete failed");
      fetchKeys();
    } catch (err: any) {
      alert("删除失败: " + (err.message ?? "未知错误"));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string | undefined) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingTop: "0.5rem" }}>
      {/* ========== Header ========== */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            API Keys
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            管理你的 API 密钥
          </p>
        </div>
        {(loading || error) && (
          <div className={loading ? "badge badge-success" : "badge badge-warning"} style={{ padding: "0.3rem 0.9rem", fontSize: "0.8rem" }}>
            {loading ? "加载中…" : error}
          </div>
        )}
      </header>

      {/* ========== New Key Banner (after creation) ========== */}
      {showCreatedKey && (
        <div
          className="card animate-in"
          style={{
            borderColor: "var(--success)",
            background: "rgba(16,185,129,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--success)", marginBottom: "0.25rem" }}>
                ✓ Key 创建成功
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                请立即复制保存，关闭后将无法再次查看完整 Key
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <code style={{
                background: "rgba(0,0,0,0.4)",
                padding: "0.4rem 0.75rem",
                borderRadius: 6,
                fontSize: "0.82rem",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                fontFamily: "monospace",
              }}>
                {showCreatedKey}
              </code>
              <button
                className={copiedId === "new" ? "btn-primary" : "btn-ghost"}
                style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
                onClick={() => handleCopy(showCreatedKey, "new")}
              >
                {copiedId === "new" ? "已复制" : "复制"}
              </button>
            </div>
          </div>
          <button
            className="btn-ghost"
            style={{ fontSize: "0.78rem", marginTop: "0.75rem", padding: "0.3rem 0.8rem" }}
            onClick={() => setShowCreatedKey(null)}
          >
            我已保存，关闭提示
          </button>
        </div>
      )}

      {/* ========== Create Key Form ========== */}
      <div className="card animate-in" style={{ animationDelay: "0.05s", opacity: 0, animationFillMode: "forwards" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}>
          <input
            type="text"
            placeholder="Key 名称（如：生产环境）"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "0.6rem 0.9rem",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={creating || !newKeyName.trim()}
            style={{
              fontSize: "0.9rem",
              opacity: creating || !newKeyName.trim() ? 0.5 : 1,
              cursor: creating || !newKeyName.trim() ? "not-allowed" : "pointer",
            }}
          >
            {creating ? "创建中…" : "创建新 Key"}
          </button>
        </div>
      </div>

      {/* ========== Keys Table ========== */}
      {!loading && keys.length === 0 && !showCreatedKey ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "1rem", margin: "0 0 0.5rem" }}>暂无 API Key</p>
          <p style={{ fontSize: "0.85rem", margin: 0 }}>使用上方表单创建你的第一个 Key</p>
        </div>
      ) : (
        <div className="card animate-in" style={{ animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards", padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 80px auto",
            gap: "0.75rem",
            padding: "0.85rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}>
            <span>名称 / 前缀</span>
            <span>创建时间</span>
            <span>最后使用</span>
            <span>状态</span>
            <span style={{ textAlign: "right" as const }}>操作</span>
          </div>

          {/* Table rows */}
          {keys.map((key, i) => (
            <div
              key={key.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 80px auto",
                gap: "0.75rem",
                padding: "0.85rem 1.5rem",
                borderBottom: i < keys.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                fontSize: "0.84rem",
              }}
            >
              {/* Name / Prefix */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", minWidth: 0 }}>
                <span style={{ color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {key.name || "未命名"}
                </span>
                <code style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  fontFamily: "monospace",
                }}>
                  {key.key_prefix || "sk-****"}
                </code>
              </div>

              {/* Created */}
              <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                {formatDate(key.created_at)}
              </span>

              {/* Last used */}
              <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                {formatDate(key.last_used_at)}
              </span>

              {/* Status */}
              <span
                className="badge"
                style={{
                  background: key.is_active !== false
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(239,68,68,0.12)",
                  color: key.is_active !== false ? "var(--success)" : "var(--danger)",
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.55rem",
                  justifyContent: "center",
                }}
              >
                {key.is_active !== false ? "活跃" : "停用"}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                {key.key_prefix && (
                  <button
                    className="btn-ghost"
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}
                    onClick={() => handleCopy(key.key_prefix!, key.id)}
                    title="复制前缀"
                  >
                    {copiedId === key.id ? "已复制" : "复制"}
                  </button>
                )}
                <button
                  className="btn-ghost"
                  onClick={() => handleDelete(key.id)}
                  disabled={deletingId === key.id}
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.3rem 0.7rem",
                    color: "var(--danger)",
                    borderColor: "rgba(239,68,68,0.3)",
                    opacity: deletingId === key.id ? 0.5 : 1,
                  }}
                >
                  {deletingId === key.id ? "删除中…" : "删除"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
