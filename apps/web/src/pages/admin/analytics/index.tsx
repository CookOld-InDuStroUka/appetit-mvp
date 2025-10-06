import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";
import { useLang } from "../../../components/LangContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type KPIData = {
  revenue: number;
  ordersPaid: number;
  ordersAll: number;
  averageCheck: number;
  repeatRate: number;
  repeatCount: number;
  repeatRevenueShare: number;
  conversion?: number;
};

type DishStat = {
  id: string;
  name: string;
  orders: number;
  quantity: number;
  revenue: number;
};

type HourlyOrders = {
  hours: string[];
  counts: number[];
};

type Heatmap = {
  days: string[];
  hours: string[];
  values: number[][];
};

type UserStats = {
  totalUsers: number;
  newUsers: number;
  activeCustomers: number;
  returningCustomers: number;
  registeredOrders: number;
  guestOrders: number;
};

type Analytics = KPIData & {
  sources: Record<string, { orders: number; revenue: number }>;
  expensesTotal: number;
  profit: number;
  daily: { days: string[]; orders: number[]; expenses: number[] };
  dishStats: DishStat[];
  hourlyOrders: HourlyOrders;
  heatmap: Heatmap;
  userStats: UserStats;
  previous?: KPIData;
};

export default function AnalyticsPage() {
  const { t } = useLang();
  const [branchId, setBranchId] = useState("all");
  const [branches, setBranches] = useState<any[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [utm, setUtm] = useState("");
  const [dimension, setDimension] = useState("source");
  const [period, setPeriod] = useState("day");
  const [compare, setCompare] = useState(false);
  const [data, setData] = useState<Analytics | null>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/branches`).then((r) => r.json()).then(setBranches);
    setSaved(JSON.parse(localStorage.getItem("reports") || "[]"));
  }, []);

  useEffect(() => {
    if (period === "custom") return;
    const now = new Date();
    const endDate = now.toISOString().slice(0, 10);
    let startDate = new Date(now);
    if (period === "week") {
      startDate.setDate(startDate.getDate() - 6);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    setEnd(endDate);
    setStart(startDate.toISOString().slice(0, 10));
  }, [period]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (branchId !== "all") params.append("branchId", branchId);
    if (start) params.append("from", start);
    if (end) params.append("to", end);
    params.append("dimension", dimension);
    if (utm) params.append("utm", utm);
    if (compare) params.append("compare", "true");
    const q = params.toString();
    fetch(`${API_BASE}/admin/analytics${q ? `?${q}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch(() => {
        setData(null);
        setError("Не удалось загрузить данные");
      });
  }, [branchId, start, end, utm, dimension, compare]);

  const save = () => {
    if (!data) return;
    const report = { timestamp: Date.now(), branchId, start, end, utm, data };
    const next = [...saved, report];
    setSaved(next);
    localStorage.setItem("reports", JSON.stringify(next));
  };

  return (
    <AdminLayout>
      <h1>{t("analytics")}</h1>
      <p style={{ maxWidth: 600 }}>{t("analyticsIntro")}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          <option value="all">{t("allBranches")}</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="day">{t("day")}</option>
          <option value="week">{t("week")}</option>
          <option value="month">{t("month")}</option>
          <option value="custom">{t("custom")}</option>
        </select>
        {period === "custom" && (
          <>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
          />
          {t("comparePrev")}
        </label>
        <select value={dimension} onChange={(e) => setDimension(e.target.value)}>
          <option value="source">{t("utmSource")}</option>
          <option value="medium">{t("utmMedium")}</option>
          <option value="campaign">{t("utmCampaign")}</option>
        </select>
        <input
          type="text"
          placeholder={t("filter")}
          value={utm}
          onChange={(e) => setUtm(e.target.value)}
        />
        <button onClick={save}>{t("saveReport")}</button>
        <Link href="/admin/analytics/reports">{t("savedReports")}</Link>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && (
        <>
          <h3>{t("keyMetrics")}</h3>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <KPI
              label={t("orders")}
              value={`${data.ordersPaid}/${data.ordersAll}`}
              numeric={data.ordersPaid}
              previous={data.previous?.ordersPaid}
              spark={data.daily.orders}
              info={t("ordersInfo")}
            />
            <KPI
              label={t("revenue")}
              value={`${data.revenue} ₸`}
              numeric={data.revenue}
              previous={data.previous?.revenue}
              spark={data.daily.orders}
            />
            <KPI
              label={t("averageCheck")}
              value={`${Math.round(data.averageCheck)} ₸`}
              numeric={data.averageCheck}
              previous={data.previous?.averageCheck}
              spark={data.daily.orders}
              info={t("averageCheckInfo")}
            />
            <KPI
              label={t("repeatRate")}
              value={`${(data.repeatRate * 100).toFixed(1)}% / ${data.repeatCount} / ${(data.repeatRevenueShare * 100).toFixed(1)}%`}
              numeric={data.repeatRate}
              previous={data.previous?.repeatRate}
              spark={data.daily.orders}
              info={t("repeatInfo")}
            />
            {data.conversion !== undefined && (
              <KPI
                label={t("conversion")}
                value={`${(data.conversion * 100).toFixed(1)}%`}
                numeric={data.conversion}
                previous={data.previous?.conversion}
                spark={data.daily.orders}
              />
            )}
          </div>

          <h3>{t("sources")}</h3>
          <table style={{ width: "100%", maxWidth: 600, marginBottom: 20 }}>
            <thead>
              <tr>
                <th>
                  {dimension === "medium"
                    ? t("utmMedium")
                    : dimension === "campaign"
                    ? t("utmCampaign")
                    : t("utmSource")}
                </th>
                <th>{t("orders")}</th>
                <th>{t("revenue")}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.sources).map(([src, info]) => (
                <tr key={src}>
                  <td>{src}</td>
                  <td>{info.orders}</td>
                  <td>{info.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>{t("dailyChart")}</h3>
          {data.daily.days.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>—</p>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ width: 12, height: 12, background: "#36a2eb", display: "inline-block" }} />
                {t("orders")}
                <span style={{ width: 12, height: 12, background: "#ff6384", display: "inline-block", marginLeft: 12 }} />
                {t("expenses")}
              </div>
              <div style={{ overflowX: "auto", width: "100%", maxWidth: 600 }}>
                <svg width={data.daily.days.length * 40} height={200}>
                  {(() => {
                    const maxVal = Math.max(
                      ...data.daily.orders,
                      ...data.daily.expenses,
                      1
                    );
                    return data.daily.days.map((d, i) => {
                      const orderH = (data.daily.orders[i] / maxVal) * 180;
                      const expH = (data.daily.expenses[i] / maxVal) * 180;
                      const x = i * 40;
                      return (
                        <g key={d}>
                          <rect
                            x={x + 5}
                            y={190 - orderH}
                            width={12}
                            height={orderH}
                            fill="#36a2eb"
                          />
                          <rect
                            x={x + 23}
                            y={190 - expH}
                            width={12}
                            height={expH}
                            fill="#ff6384"
                          />
                          <text x={x + 20} y={195} fontSize={8} textAnchor="middle">
                            {d.slice(5)}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </svg>
              </div>
            </>
          )}

      <h3>{t("userStatsTitle")}</h3>
      {(() => {
        const fallback: UserStats = {
          totalUsers: 0,
          newUsers: 0,
          activeCustomers: 0,
          returningCustomers: 0,
          registeredOrders: 0,
          guestOrders: 0,
        };
        const userStats = data.userStats ?? fallback;
        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <StatCard
              label={t("totalUsersStat")}
              value={userStats.totalUsers.toLocaleString("ru-RU")}
            />
            <StatCard
              label={t("newUsersStat")}
              value={userStats.newUsers.toLocaleString("ru-RU")}
            />
            <StatCard
              label={t("activeCustomersStat")}
              value={userStats.activeCustomers.toLocaleString("ru-RU")}
            />
            <StatCard
              label={t("returningCustomersStat")}
              value={userStats.returningCustomers.toLocaleString("ru-RU")}
            />
            <StatCard
              label={t("registeredOrdersStat")}
              value={userStats.registeredOrders.toLocaleString("ru-RU")}
            />
            <StatCard
              label={t("guestOrdersStat")}
              value={userStats.guestOrders.toLocaleString("ru-RU")}
            />
          </div>
        );
      })()}

          <h3>{t("topDishesTitle")}</h3>
          {data.dishStats.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>{t("noAnalyticsData")}</p>
          ) : (
            <table style={{ width: "100%", maxWidth: 720, marginBottom: 20 }}>
              <thead>
                <tr>
                  <th>{t("dishName")}</th>
                  <th>{t("orders")}</th>
                  <th>{t("dishQuantity")}</th>
                  <th>{t("dishRevenue")}</th>
                </tr>
              </thead>
              <tbody>
                {data.dishStats.map((dish) => (
                  <tr key={dish.id}>
                    <td>{dish.name}</td>
                    <td>{dish.orders}</td>
                    <td>{dish.quantity}</td>
                    <td>{Math.round(dish.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h3>{t("ordersByHour")}</h3>
          <HourlyChart data={data.hourlyOrders} emptyLabel={t("noAnalyticsData")} />

          <h3>{t("orderHeatmapTitle")}</h3>
          <HeatmapGrid heatmap={data.heatmap} emptyLabel={t("noAnalyticsData")} />

        </>
      )}
    </AdminLayout>
  );
}

function KPI({
  label,
  value,
  numeric,
  previous,
  spark,
  info,
}: {
  label: string;
  value: string;
  numeric: number;
  previous?: number;
  spark: number[];
  info?: string;
}) {
  const max = Math.max(...spark, 1);
  const delta =
    previous !== undefined && previous !== 0
      ? ((numeric - previous) / previous) * 100
      : previous === 0 && numeric > 0
      ? 100
      : undefined;
  const y = (v: number) => 20 - (v / max) * 20;
  const points =
    spark.length > 1
      ? spark
          .map((sv, si) => `${(si / (spark.length - 1)) * 100},${y(sv)}`)
          .join(" ")
      : `0,${y(spark[0] ?? 0)} 100,${y(spark[0] ?? 0)}`;
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {info && (
          <span title={info} style={{ cursor: "help", borderBottom: "1px dotted" }}>
            i
          </span>
        )}
      </div>
      <div style={{ fontSize: 24 }}>{value}</div>
      {delta !== undefined && (
        <div style={{ color: delta >= 0 ? "green" : "red", fontSize: 12 }}>
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(1)}%
        </div>
      )}
      <svg viewBox="0 0 100 20" style={{ width: "100%", height: 20 }}>
        <polyline
          fill="none"
          stroke="#36a2eb"
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: 12,
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function HourlyChart({
  data,
  emptyLabel,
}: {
  data: HourlyOrders;
  emptyLabel: string;
}) {
  const hasData = data.counts.some((v) => v > 0);
  if (!hasData) return <p style={{ color: "#94a3b8" }}>{emptyLabel}</p>;
  const max = Math.max(...data.counts, 1);
  return (
    <div style={{ overflowX: "auto", width: "100%", maxWidth: 720, marginBottom: 20 }}>
      <svg width={data.hours.length * 28} height={200}>
        {data.counts.map((count, i) => {
          const height = (count / max) * 180;
          const x = i * 28;
          return (
            <g key={data.hours[i]}>
              <rect
                x={x + 6}
                y={190 - height}
                width={16}
                height={height}
                fill="#36a2eb"
              />
              <text x={x + 14} y={195} fontSize={8} textAnchor="middle">
                {data.hours[i]}
              </text>
              <text
                x={x + 14}
                y={190 - height - 4}
                fontSize={8}
                textAnchor="middle"
                fill="#0f172a"
              >
                {count}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HeatmapGrid({
  heatmap,
  emptyLabel,
}: {
  heatmap: Heatmap;
  emptyLabel: string;
}) {
  const hasData = heatmap.values.some((row) => row.some((v) => v > 0));
  if (!hasData) return <p style={{ color: "#94a3b8" }}>{emptyLabel}</p>;
  const flat = heatmap.values.flat();
  const max = Math.max(...flat, 1);
  return (
    <div style={{ overflowX: "auto", width: "100%", maxWidth: 720, marginBottom: 20 }}>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "4px 8px" }}>#</th>
            {heatmap.hours.map((hour) => (
              <th key={hour} style={{ padding: "4px 6px", fontSize: 10 }}>
                {hour}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heatmap.days.map((day, di) => (
            <tr key={day}>
              <th style={{ textAlign: "left", padding: "4px 8px", fontSize: 12 }}>{day}</th>
              {heatmap.hours.map((hour, hi) => {
                const value = heatmap.values[di]?.[hi] ?? 0;
                const intensity = value / max;
                const background = `rgba(34, 197, 94, ${0.15 + intensity * 0.7})`;
                return (
                  <td
                    key={`${day}-${hour}`}
                    style={{
                      width: 28,
                      height: 24,
                      textAlign: "center",
                      fontSize: 10,
                      background,
                      color: intensity > 0.5 ? "#fff" : "#0f172a",
                    }}
                    title={`${day} ${hour}: ${value}`}
                  >
                    {value || ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

