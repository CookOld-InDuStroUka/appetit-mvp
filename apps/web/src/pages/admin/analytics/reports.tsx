import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";
import { useLang } from "../../../components/LangContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function SavedReportsPage() {
  const { t } = useLang();
  const [reports, setReports] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/branches`).then((r) => r.json()).then(setBranches);
    setReports(JSON.parse(localStorage.getItem("reports") || "[]"));
  }, []);

  const filtered = reports.filter((r) => {
    const b = branches.find((br) => String(br.id) === String(r.branchId));
    const text = `${new Date(r.timestamp).toLocaleString()} ${b ? b.name : t("allBranches")} ${r.start} ${r.end} ${r.utm}`.toLowerCase();
    return text.includes(filter.toLowerCase());
  });

  const download = (r: any) => {
    const blob = new Blob([JSON.stringify(r, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${new Date(r.timestamp).toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <h1>{t("savedReports")}</h1>
      <p style={{ maxWidth: 600 }}>{t("analyticsIntro")}</p>
      <div style={{ margin: "12px 0" }}>
        <input
          type="text"
          placeholder={t("filter")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Link href="/admin/analytics" style={{ marginLeft: 12 }}>
          {t("analytics")}
        </Link>
      </div>
      <ul>
        {filtered.map((r, i) => {
          const b = branches.find((br) => String(br.id) === String(r.branchId));
          return (
            <li key={i}>
              {new Date(r.timestamp).toLocaleString()} – {b ? b.name : t("allBranches")}
              {r.start && r.end ? ` (${r.start} → ${r.end})` : ""}
              <button style={{ marginLeft: 8 }} onClick={() => download(r)}>
                {t("download")}
              </button>
            </li>
          );
        })}
      </ul>
    </AdminLayout>
  );
}
