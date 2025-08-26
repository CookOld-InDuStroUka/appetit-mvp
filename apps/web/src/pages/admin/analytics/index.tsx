import React, { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { useLang } from "../../../components/LangContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Analytics = {
  ordersTotal: number;
  ordersCount: number;
  averageCheck: number;
  repeatRate: number;
  conversion?: number;
  sources: Record<string, number>;
  expensesTotal: number;
  profit: number;
  daily: { days: string[]; orders: number[]; expenses: number[] };
};

export default function AnalyticsPage() {
  const { t } = useLang();
  const [branchId, setBranchId] = useState("all");
  const [branches, setBranches] = useState<any[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [utm, setUtm] = useState("");
  const [data, setData] = useState<Analytics | null>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/branches`).then((r) => r.json()).then(setBranches);
    setSaved(JSON.parse(localStorage.getItem("reports") || "[]"));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (branchId !== "all") params.append("branchId", branchId);
    if (start) params.append("from", start);
    if (end) params.append("to", end);
    if (utm) params.append("utmSource", utm);
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
  }, [branchId, start, end, utm]);

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
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
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
            <KPI label={t("orders")} value={String(data.ordersCount)} spark={data.daily.orders} />
            <KPI label={t("revenue")} value={`${data.ordersTotal} ₸`} spark={data.daily.orders} />
            <KPI
              label={t("averageCheck")}
              value={`${Math.round(data.averageCheck)} ₸`}
              spark={data.daily.orders}
            />
            <KPI
              label={t("repeatRate")}
              value={`${(data.repeatRate * 100).toFixed(1)}%`}
              spark={data.daily.orders}
            />
            {data.conversion !== undefined && (
              <KPI
                label={t("conversion")}
                value={`${(data.conversion * 100).toFixed(1)}%`}
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
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.sources).map(([src, count]) => (
                <tr key={src}>
                  <td>{t(src)}</td>
                  <td>{count}</td>
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
  spark,
}: {
  label: string;
  value: string;
  spark: number[];
}) {
  const max = Math.max(...spark, 1);
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24 }}>{value}</div>
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

