import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useLang } from "../../components/LangContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Analytics = {
  ordersTotal: number;
  ordersCount: number;
  expensesTotal: number;
  profit: number;
  daily: { days: string[]; orders: number[]; expenses: number[] };
};

export default function AnalyticsPage() {
  const { t } = useLang();
  const [branchId, setBranchId] = useState("all");
  const [branches, setBranches] = useState<any[]>([]);
  const [data, setData] = useState<Analytics | null>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/branches`).then((r) => r.json()).then(setBranches);
    setSaved(JSON.parse(localStorage.getItem("reports") || "[]"));
  }, []);

  useEffect(() => {
    const q = branchId === "all" ? "" : `?branchId=${branchId}`;
    fetch(`${API_BASE}/admin/analytics${q}`)
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
  }, [branchId]);

  const save = () => {
    if (!data) return;
    const report = { timestamp: Date.now(), branchId, data };
    const next = [...saved, report];
    setSaved(next);
    localStorage.setItem("reports", JSON.stringify(next));
  };

  return (
    <AdminLayout>
      <h1>{t("analytics")}</h1>
      <select
        value={branchId}
        onChange={(e) => setBranchId(e.target.value)}
        style={{ marginBottom: 12 }}
      >
        <option value="all">{t("allBranches")}</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && (
        <>
          <div>
            {t("orders")}: {data.ordersCount} / {data.ordersTotal} ₸
          </div>
          <div>
            {t("expenses")}: {data.expensesTotal} ₸
          </div>
          <div>
            {t("profit")}: {data.profit} ₸
          </div>
          <svg viewBox={`0 0 ${data.daily.days.length * 40} 200`} style={{ width: "100%", maxWidth: 600 }}>
            {data.daily.days.map((d, i) => {
              const orderH = (data.daily.orders[i] / Math.max(...data.daily.orders, 1)) * 180;
              const expH = (data.daily.expenses[i] / Math.max(...data.daily.expenses, 1)) * 180;
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
          <button onClick={save} style={{ marginTop: 12 }}>
            {t("saveReport")}
          </button>
          <h3 style={{ marginTop: 16 }}>{t("savedReports")}</h3>
          <ul>
            {saved.map((r, i) => (
              <li key={i}>
                {new Date(r.timestamp).toLocaleString()} –
                {" "}
                {r.branchId === "all"
                  ? t("allBranches")
                  : branches.find((b) => b.id === r.branchId)?.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminLayout>
  );
}

