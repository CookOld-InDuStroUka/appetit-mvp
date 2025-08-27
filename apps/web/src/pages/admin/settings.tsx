import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useLang } from "../../components/LangContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function TrackingSettings() {
  const { t } = useLang();
  const [ga, setGa] = useState("");
  const [ya, setYa] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/admin/settings/tracking`)
      .then((r) => r.json())
      .then((d) => {
        setGa(d.gaTrackingId || "");
        setYa(d.yaMetricaId || "");
      })
      .catch(() => {});
  }, []);

  const save = () => {
    fetch(`${API_BASE}/admin/settings/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gaTrackingId: ga || null, yaMetricaId: ya || null }),
    }).then(() => setSaved(true));
  };

  return (
    <AdminLayout>
      <h1>{t("trackingSettings")}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
        <label>
          {t("gaId")} <input value={ga} onChange={(e) => setGa(e.target.value)} />
        </label>
        <label>
          {t("yaId")} <input value={ya} onChange={(e) => setYa(e.target.value)} />
        </label>
        <button onClick={save}>{t("save")}</button>
        {saved && <span>OK</span>}
      </div>
    </AdminLayout>
  );
}
