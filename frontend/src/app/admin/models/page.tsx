"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ModelConfig {
  id: number;
  name: string;
  display_name: string;
  provider: string;
  price_per_input: number;
  price_per_output: number;
  is_active: boolean;
  sort_order: number;
  model_type: string;
  scene_tags: string;
  context_length: number;
  parameter_size: string;
  model_icon: string;
  description: string;
}

interface ModelFormData {
  name: string;
  display_name: string;
  provider: string;
  upstream_base_url: string;
  upstream_api_key: string;
  model_name: string;
  price_per_input: string;
  price_per_output: string;
  sort_order: string;
  model_type: string;
  scene_tags: string;
  context_length: string;
  parameter_size: string;
  model_icon: string;
  description: string;
}

const MODEL_TYPES = [
  { value: "chat", label: "对话" },
  { value: "image", label: "生图" },
  { value: "embedding", label: "嵌入" },
  { value: "rerank", label: "重排序" },
  { value: "audio", label: "语音" },
  { value: "video", label: "视频" },
];

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aiburj_token");
}

async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`http://localhost:8001/api/v1/admin${path}`, {
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

const emptyForm: ModelFormData = {
  name: "",
  display_name: "",
  provider: "",
  upstream_base_url: "",
  upstream_api_key: "",
  model_name: "",
  price_per_input: "",
  price_per_output: "",
  sort_order: "0",
  model_type: "chat",
  scene_tags: "",
  context_length: "",
  parameter_size: "",
  model_icon: "",
  description: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "0.5rem 0.75rem",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [formData, setFormData] = useState<ModelFormData>(emptyForm);
  const [modalLoading, setModalLoading] = useState(false);

  // Confirm
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const loadModels = async () => {
    const data = await fetchAdmin<ModelConfig[]>("/models");
    if (!data) {
      setAuthError(true);
    } else {
      setModels(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadModels();
  }, []);

  const openAddModal = () => {
    setEditingModel(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (model: ModelConfig) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      display_name: model.display_name,
      provider: model.provider,
      upstream_base_url: "",
      upstream_api_key: "",
      model_name: model.name,
      price_per_input: String(model.price_per_input),
      price_per_output: String(model.price_per_output),
      sort_order: String(model.sort_order),
      model_type: model.model_type || "chat",
      scene_tags: model.scene_tags || "",
      context_length: String(model.context_length || ""),
      parameter_size: model.parameter_size || "",
      model_icon: model.model_icon || "",
      description: model.description || "",
    });
    setModalOpen(true);
  };

  const submitForm = async () => {
    if (!formData.name.trim() || !formData.display_name.trim() || !formData.provider.trim()) {
      alert("请填写名称、显示名和提供商");
      return;
    }

    const body = {
      name: formData.name.trim(),
      display_name: formData.display_name.trim(),
      provider: formData.provider.trim(),
      upstream_base_url: formData.upstream_base_url.trim() || "",
      upstream_api_key: formData.upstream_api_key.trim() || "",
      model_name: formData.model_name.trim() || formData.name.trim(),
      price_per_input: parseFloat(formData.price_per_input) || 0,
      price_per_output: parseFloat(formData.price_per_output) || 0,
      sort_order: parseInt(formData.sort_order) || 0,
      model_type: formData.model_type || "chat",
      scene_tags: formData.scene_tags.trim() || "",
      context_length: parseInt(formData.context_length) || 0,
      parameter_size: formData.parameter_size.trim() || "",
      model_icon: formData.model_icon.trim() || "",
      description: formData.description.trim() || "",
    };

    setModalLoading(true);
    const res = editingModel
      ? await fetchAdmin(`/models/${editingModel.id}`, { method: "PUT", body: JSON.stringify(body) })
      : await fetchAdmin("/models", { method: "POST", body: JSON.stringify(body) });
    setModalLoading(false);

    if (res) {
      alert(editingModel ? "模型更新成功" : "模型创建成功");
      setModalOpen(false);
      loadModels();
    } else {
      alert("操作失败，请重试");
    }
  };

  const toggleActive = async (model: ModelConfig) => {
    const action = model.is_active ? "禁用" : "启用";
    setConfirmDialog({
      title: "确认操作",
      message: `确定要${action}模型 "${model.display_name}"？`,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (model.is_active) {
          await fetchAdmin(`/models/${model.id}`, { method: "DELETE" });
        } else {
          await fetchAdmin(`/models/${model.id}`, {
            method: "PUT",
            body: JSON.stringify({ is_active: true }),
          });
        }
        loadModels();
      },
    });
  };

  // Shared modal form
  const renderFormFields = () => (
    <>
      {[
        { key: "name", label: "模型名称 (name)", placeholder: "如 deepseek-chat", tip: "唯一标识，创建后不可修改" },
        { key: "display_name", label: "显示名称", placeholder: "如 DeepSeek V3" },
        { key: "provider", label: "提供商", placeholder: "如 deepseek / qwen" },
        { key: "upstream_base_url", label: "上游地址 (Base URL)", placeholder: "如 https://api.deepseek.com/v1" },
        { key: "upstream_api_key", label: "上游 API Key", placeholder: "sk-..." },
        { key: "model_name", label: "上游模型名 (model)", placeholder: "如 deepseek-chat" },
      ].map(({ key, label, placeholder, tip }) => (
        <div key={key}>
          <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {label}
          </label>
          <input
            type="text"
            placeholder={placeholder}
            value={(formData as any)[key]}
            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
            disabled={!!editingModel && key === "name"}
            style={{
              ...inputStyle,
              ...(editingModel && key === "name" ? { opacity: 0.5, cursor: "not-allowed" } : {}),
            }}
          />
          {tip && (
            <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>{tip}</div>
          )}
        </div>
      ))}

      {/* Model Type Selector */}
      <div>
        <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          模型类型
        </label>
        <select
          value={formData.model_type}
          onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
          style={inputStyle}
        >
          {MODEL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Scene Tags */}
      <div>
        <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          场景标签（逗号分隔）
        </label>
        <input
          type="text"
          placeholder="如 RAG,代码生成,数学推理"
          value={formData.scene_tags}
          onChange={(e) => setFormData({ ...formData, scene_tags: e.target.value })}
          style={inputStyle}
        />
      </div>

      {/* Context Length & Parameter Size */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            上下文长度
          </label>
          <input
            type="number"
            min="0"
            placeholder="如 131072"
            value={formData.context_length}
            onChange={(e) => setFormData({ ...formData, context_length: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            参数量
          </label>
          <input
            type="text"
            placeholder="如 671B"
            value={formData.parameter_size}
            onChange={(e) => setFormData({ ...formData, parameter_size: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Icon URL & Description */}
      <div>
        <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          模型图标 URL
        </label>
        <input
          type="text"
          placeholder="图标地址"
          value={formData.model_icon}
          onChange={(e) => setFormData({ ...formData, model_icon: e.target.value })}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          模型描述
        </label>
        <textarea
          rows={2}
          placeholder="模型介绍文案"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {/* Pricing */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
        {[
          { key: "price_per_input", label: "输入价格 (¥/M)" },
          { key: "price_per_output", label: "输出价格 (¥/M)" },
          { key: "sort_order", label: "排序" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label style={{ display: "block", marginBottom: "0.35rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {label}
            </label>
            <input
              type="number"
              min="0"
              step={key === "sort_order" ? "1" : "0.0001"}
              value={(formData as any)[key]}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              style={inputStyle}
            />
          </div>
        ))}
      </div>
    </>
  );

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
            <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>模型配置</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            模型配置
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            添加模型 · 设置价格 · 配置上游地址
          </p>
        </div>
        <button className="btn-primary" onClick={openAddModal} style={{ fontSize: "0.875rem" }}>
          ＋ 添加模型
        </button>
      </header>

      {/* Model Table */}
      {models.length === 0 ? (
        <div className="card animate-in" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          暂无模型，点击「添加模型」开始配置
        </div>
      ) : (
        <div className="card animate-in" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                  {["ID", "名称", "显示名", "类型", "提供商", "价格 (入/出)", "状态", "操作"].map((h) => (
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
                {models.map((model) => (
                  <tr
                    key={model.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                      #{model.id}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <code style={{
                        background: "var(--bg-secondary)",
                        padding: "0.15rem 0.4rem",
                        borderRadius: 4,
                        fontSize: "0.8rem",
                        color: "var(--accent)",
                      }}>
                        {model.name}
                      </code>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-primary)" }}>{model.display_name}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span className="badge" style={{ background: "rgba(6,182,212,0.12)", color: "var(--accent)" }}>
                        {MODEL_TYPES.find(t => t.value === model.model_type)?.label || model.model_type || "对话"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span className="badge" style={{ background: "rgba(6,182,212,0.12)", color: "var(--accent)" }}>
                        {model.provider}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                      ¥{model.price_per_input} / ¥{model.price_per_output}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {model.is_active ? (
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
                          onClick={() => openEditModal(model)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn-ghost"
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.75rem",
                            color: model.is_active ? "var(--danger)" : "var(--success)",
                          }}
                          onClick={() => toggleActive(model)}
                        >
                          {model.is_active ? "禁用" : "启用"}
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

      {/* Add/Edit Modal */}
      {modalOpen && (
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
            style={{ maxWidth: 600, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                {editingModel ? "编辑模型" : "添加模型"}
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

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {renderFormFields()}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button className="btn-ghost" onClick={() => setModalOpen(false)} disabled={modalLoading}>
                取消
              </button>
              <button
                className="btn-primary"
                onClick={submitForm}
                disabled={modalLoading || !formData.name.trim()}
                style={{ opacity: modalLoading || !formData.name.trim() ? 0.5 : 1 }}
              >
                {modalLoading ? "处理中…" : editingModel ? "保存修改" : "创建模型"}
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