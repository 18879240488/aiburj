"use client";

import { useEffect, useState } from "react";

interface Plan {
  id: string;
  amount: number;       // 充值金额（元）
  bonus?: number;       // 赠送金额（元）
  total?: number;       // 到账金额
  label?: string;       // 标签（如"推荐"）
}

interface Order {
  id: string;
  amount: number;
  bonus?: number;
  total_amount?: number;
  status: string;       // "paid" | "pending" | "failed"
  created_at: string;
  plan_name?: string;
}

const FALLBACK_PLANS: Plan[] = [
  { id: "p10", amount: 10, bonus: 0, total: 10, label: "" },
  { id: "p50", amount: 50, bonus: 5, total: 55, label: "热门" },
  { id: "p100", amount: 100, bonus: 15, total: 115, label: "推荐" },
  { id: "p200", amount: 200, bonus: 40, total: 240, label: "超值" },
  { id: "p500", amount: 500, bonus: 120, total: 620, label: "最划算" },
];

const FALLBACK_ORDERS: Order[] = [
  { id: "ord_001", amount: 50, bonus: 5, total_amount: 55, status: "paid", created_at: "2026-05-27T08:00:00", plan_name: "¥50 套餐" },
  { id: "ord_002", amount: 100, bonus: 15, total_amount: 115, status: "paid", created_at: "2026-05-25T14:30:00", plan_name: "¥100 套餐" },
  { id: "ord_003", amount: 10, bonus: 0, total_amount: 10, status: "paid", created_at: "2026-05-20T09:15:00", plan_name: "¥10 套餐" },
];

function statusConfig(status: string) {
  switch (status) {
    case "paid":
      return { label: "已完成", className: "badge badge-success" };
    case "pending":
      return { label: "待支付", className: "badge badge-warning" };
    case "failed":
      return { label: "失败", className: "badge badge-danger" };
    default:
      return { label: status, className: "badge", style: { background: "rgba(136,153,180,0.12)", color: "var(--text-secondary)" } };
  }
}

export default function RechargePage() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [orders, setOrders] = useState<Order[]>(FALLBACK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rechargingId, setRechargingId] = useState<string | null>(null);

  const fetchData = () => {
    let plansDone = false;
    let ordersDone = false;

    const maybeDone = () => {
      if (plansDone && ordersDone) setLoading(false);
    };

    // Fetch plans
    fetch("http://localhost:8001/api/v1/plans", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then((data: Plan[]) => {
        if (Array.isArray(data) && data.length > 0) setPlans(data);
      })
      .catch((err) => {
        console.warn("Plans fetch failed, using fallback:", err);
        setError("使用本地数据");
      })
      .finally(() => { plansDone = true; maybeDone(); });

    // Fetch orders
    fetch("http://localhost:8001/api/v1/orders", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("unavailable");
        return res.json();
      })
      .then((data: Order[]) => {
        if (Array.isArray(data) && data.length > 0) setOrders(data);
      })
      .catch((err) => {
        console.warn("Orders fetch failed, using fallback:", err);
      })
      .finally(() => { ordersDone = true; maybeDone(); });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecharge = async (plan: Plan) => {
    setRechargingId(plan.id);
    try {
      const res = await fetch("http://localhost:8001/api/v1/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.id, amount: plan.amount }),
      });
      if (!res.ok) throw new Error("order creation failed");
      const data = await res.json();
      // If the backend returns a payment URL, redirect
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else if (data.qr_code) {
        alert("请扫码支付：\n" + data.qr_code);
      } else {
        alert(`订单已创建！金额: ¥${plan.amount}，到账: ¥${plan.total || (plan.amount + (plan.bonus || 0))}`);
      }
      // Refresh orders
      fetch("http://localhost:8001/api/v1/orders", { credentials: "include" })
        .then((res) => res.json())
        .then((data: Order[]) => { if (Array.isArray(data) && data.length > 0) setOrders(data); })
        .catch(() => {});
    } catch (err: any) {
      alert("充值请求失败: " + (err.message ?? "未知错误"));
    } finally {
      setRechargingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="animate-in" style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingTop: "0.5rem" }}>
      {/* ========== Header ========== */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
            充值中心
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            选择充值套餐，获取丰厚赠送
          </p>
        </div>
        {(loading || error) && (
          <div className={loading ? "badge badge-success" : "badge badge-warning"} style={{ padding: "0.3rem 0.9rem", fontSize: "0.8rem" }}>
            {loading ? "加载中…" : error}
          </div>
        )}
      </header>

      {/* ========== Plan Cards ========== */}
      <section>
        <h2 style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          margin: "0 0 1rem",
          color: "var(--text-primary)",
        }}>
          充值套餐
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}>
          {plans.map((plan, i) => {
            const isHighlighted = plan.label && ["推荐", "超值", "最划算"].includes(plan.label);
            const displayTotal = plan.total ?? (plan.amount + (plan.bonus || 0));
            const bonusPercent = plan.amount > 0 ? Math.round(((plan.bonus || 0) / plan.amount) * 100) : 0;

            return (
              <div
                key={plan.id}
                className="card animate-in"
                style={{
                  animationDelay: `${i * 0.06}s`,
                  opacity: 0,
                  animationFillMode: "forwards",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "0.6rem",
                  padding: "1.75rem 1.25rem",
                  position: "relative",
                  borderColor: isHighlighted ? "var(--accent)" : undefined,
                  borderWidth: isHighlighted ? "1.5px" : undefined,
                }}
              >
                {/* Label badge */}
                {plan.label && (
                  <div
                    className="badge"
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: isHighlighted
                        ? "linear-gradient(135deg, var(--accent), #0ea5e9)"
                        : "var(--bg-card-hover)",
                      color: "#fff",
                      fontSize: "0.72rem",
                      padding: "0.2rem 0.9rem",
                      fontWeight: 700,
                    }}
                  >
                    {plan.label}
                  </div>
                )}

                {/* Amount */}
                <div style={{
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1,
                  marginTop: plan.label ? "0.5rem" : 0,
                }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 600, verticalAlign: "super" }}>¥</span>
                  {plan.amount}
                </div>

                {/* Total */}
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  到账{" "}
                  <span className="accent-text" style={{ fontWeight: 700 }}>
                    ¥{displayTotal}
                  </span>
                </div>

                {/* Bonus */}
                {bonusPercent > 0 && (
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--success)",
                      background: "rgba(16,185,129,0.1)",
                      padding: "0.2rem 0.7rem",
                      borderRadius: 999,
                      fontWeight: 600,
                    }}
                  >
                    赠送 {bonusPercent}%
                  </div>
                )}

                {/* Separator */}
                <div style={{ width: 40, height: 1, background: "var(--border)", margin: "0.25rem 0" }} />

                {/* Perks */}
                <ul style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}>
                  <li>✓ OpenAI 兼容 API</li>
                  <li>✓ 全部模型可用</li>
                  <li>✓ 余额永不过期</li>
                </ul>

                {/* CTA */}
                <button
                  className={isHighlighted ? "btn-primary" : "btn-ghost"}
                  onClick={() => handleRecharge(plan)}
                  disabled={rechargingId === plan.id}
                  style={{
                    width: "100%",
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    padding: "0.6rem 0",
                    opacity: rechargingId === plan.id ? 0.6 : 1,
                    cursor: rechargingId === plan.id ? "not-allowed" : "pointer",
                    ...(isHighlighted ? {} : { borderColor: "var(--border-light)" }),
                  }}
                >
                  {rechargingId === plan.id ? "处理中…" : `立即充值 ¥${plan.amount}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========== Order History ========== */}
      <section className="animate-in" style={{ animationDelay: "0.35s", opacity: 0, animationFillMode: "forwards" }}>
        <h2 style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          margin: "0 0 1rem",
          color: "var(--text-primary)",
        }}>
          订单记录
        </h2>

        {orders.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2.5rem 1.5rem", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "0.95rem", margin: 0 }}>暂无充值记录</p>
            <p style={{ fontSize: "0.82rem", margin: "0.25rem 0 0" }}>选择上方套餐完成首次充值</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr 100px",
              gap: "0.75rem",
              padding: "0.85rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}>
              <span>套餐</span>
              <span>金额</span>
              <span>到账</span>
              <span>时间</span>
              <span style={{ textAlign: "center" as const }}>状态</span>
            </div>

            {/* Table rows */}
            {orders.map((order, i) => {
              const sc = statusConfig(order.status);
              return (
                <div
                  key={order.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 1fr 1fr 100px",
                    gap: "0.75rem",
                    padding: "0.8rem 1.5rem",
                    borderBottom: i < orders.length - 1 ? "1px solid var(--border)" : "none",
                    alignItems: "center",
                    fontSize: "0.84rem",
                  }}
                >
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {order.plan_name || `¥${order.amount} 套餐`}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    ¥{order.amount.toFixed(2)}
                  </span>
                  <span className="accent-text" style={{ fontWeight: 700 }}>
                    ¥{(order.total_amount ?? (order.amount + (order.bonus || 0))).toFixed(2)}
                  </span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                    {formatDate(order.created_at)}
                  </span>
                  <span
                    className={sc.className}
                    style={{ justifyContent: "center", ...((sc as any).style || {}) }}
                  >
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
