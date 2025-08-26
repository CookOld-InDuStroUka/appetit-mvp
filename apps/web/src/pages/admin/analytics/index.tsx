import React, { useEffect, useState } from "react";
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

type Analytics = KPIData & {
  sources: Record<string, { orders: number; revenue: number }>;
  expensesTotal: number;
  profit: number;
  daily: { days: string[]; orders: number[]; expenses: number[] };
  previous?: KPIData;
};

export default function AnalyticsPage() {
  const { t } = useLang();
  const [branchId, setBranchId] = useState("all");
  const [branches, setBranches] = useState<any[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [utm, setUtm] = useState("");
  const [period, setPeriod] = useState("7");
  const [compare, setCompare] = useState(false);
  const [data, setData] = useState<Analytics | null>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/branches`).then((r) => r.json()).then(setBranches);
    setSaved(JSON.parse(localStorage.getItem("reports") || "[]"));
  }, []);

  useEffect(() => {
    const now = new Date();
    const endDate = now.toISOString().slice(0, 10);
    let startDate = new Date(now);
    if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setDate(startDate.getDate() - parseInt(period) + 1);
    }
    setEnd(endDate);
    setStart(startDate.toISOString().slice(0, 10));
  }, [period]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (branchId !== "all") params.append("branchId", branchId);
    if (start) params.append("from", start);
    if (end) params.append("to", end);
    if (utm) params.append("utmSource", utm);
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
  }, [branchId, start, end, utm, compare]);

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
          <option value="7">{t("days7")}</option>
          <option value="30">{t("days30")}</option>
          <option value="90">{t("days90")}</option>
          <option value="month">{t("month")}</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
          />
          {t("comparePrev")}
        </label>
        <input
          type="text"
          placeholder="utm_source"
          value={utm}
          onChange={(e) => setUtm(e.target.value)}
        />
        <button onClick={save}>{t("saveReport")}</button>
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
                <th>{t("source")}</th>
                <th>{t("orders")}</th>
                <th>{t("revenue")}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.sources).map(([src, info]) => (
                <tr key={src}>
                  <td>{t(src)}</td>
                  <td>{info.orders}</td>
                  <td>{info.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>{t("dailyChart")}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ width: 12, height: 12, background: "#36a2eb", display: "inline-block" }} />
            {t("orders")}
            <span style={{ width: 12, height: 12, background: "#ff6384", display: "inline-block", marginLeft: 12 }} />
            {t("expenses")}
          </div>
          <svg
            viewBox={`0 0 ${data.daily.days.length * 40} 200`}
            style={{ width: "100%", maxWidth: 600 }}
          >
            {data.daily.days.map((d, i) => {
              const orderH =
                (data.daily.orders[i] / Math.max(...data.daily.orders, 1)) * 180;
              const expH =
                (data.daily.expenses[i] / Math.max(...data.daily.expenses, 1)) * 180;
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
            })}
          </svg>

          <h3 style={{ marginTop: 16 }}>{t("savedReports")}</h3>
          <ul>
            {saved.map((r, i) => {
              const b = branches.find((br) => String(br.id) === String(r.branchId));
              return (
                <li key={i}>
                  {new Date(r.timestamp).toLocaleString()} – {b ? b.name : t("allBranches")}
                  {r.start && r.end ? ` (${r.start} → ${r.end})` : ""}
                </li>
              );
            })}
          </ul>
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
          points={spark
            .map((sv, si) => `${(si / (spark.length - 1)) * 100},${20 - (sv / max) * 20}`)
            .join(" ")}
        />
      </svg>
    </div>
  );
}

