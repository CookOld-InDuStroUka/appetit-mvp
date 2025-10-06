import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { useLang } from "../../../components/LangContext";
import { useAdminAuth } from "../../../components/AdminAuthContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type ShiftSummary = {
  adminId: string;
  login: string;
  role: string;
  totalHours: number;
  shiftCount: number;
  averageHours: number;
  lastShift: string | null;
};

type ShiftRecord = {
  id: string;
  adminId: string;
  adminLogin: string;
  role: string;
  date: string;
  hours: number;
  createdAt: string;
};

type RoleStats = {
  role: string;
  staffCount: number;
  totalHours: number;
  shiftCount: number;
};

type ShiftResponse = {
  range: { from: string; to: string };
  totals: { totalHours: number; totalShifts: number };
  summary: ShiftSummary[];
  roleStats: RoleStats[];
  shifts: ShiftRecord[];
  admins: { id: string; login: string; role: string }[];
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("ru-RU");
  } catch {
    return value;
  }
}

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString("ru-RU");
  } catch {
    return value;
  }
}

const hoursOptions = Array.from({ length: 12 }, (_, i) => (i + 4).toString());

export default function ShiftsPage() {
  const { t } = useLang();
  const { admin } = useAdminAuth();
  const [start, setStart] = useState(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return monthStart.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedAdmin, setSelectedAdmin] = useState<string>("all");
  const [data, setData] = useState<ShiftResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    adminId: "",
    date: new Date().toISOString().slice(0, 10),
    hours: "8",
  });

  const allowedAdmins = useMemo(() => {
    if (!data) return [];
    if (admin?.role === "super") return data.admins;
    return data.admins.filter((item) => item.id === admin?.id);
  }, [admin, data]);

  const effectiveSelectedAdmin = useMemo(() => {
    if (admin?.role === "super") return selectedAdmin;
    return admin?.id ?? "all";
  }, [admin, selectedAdmin]);

  const loadShifts = async () => {
    if (!admin) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (start) params.set("from", start);
      if (end) params.set("to", end);
      if (effectiveSelectedAdmin && effectiveSelectedAdmin !== "all") {
        params.set("adminId", effectiveSelectedAdmin);
      }
      const res = await fetch(
        `${API_BASE}/admin/shifts${params.toString() ? `?${params.toString()}` : ""}`,
        {
          headers: { "X-Admin-Id": admin.id },
        }
      );
      const payload: ShiftResponse | { error?: string; message?: string } =
        await res.json().catch(() => ({ error: "parse_error" }));
      if (!res.ok || !payload || Array.isArray(payload)) {
        throw new Error(
          (payload as any)?.message || (payload as any)?.error || "Не удалось загрузить смены"
        );
      }
      const data = payload as ShiftResponse;
      setData(data);
      if (!allowedAdmins.length && data.admins.length > 0) {
        setForm((prev) => ({
          ...prev,
          adminId:
            admin?.role === "super"
              ? data.admins[0].id
              : data.admins.find((item) => item.id === admin?.id)?.id || data.admins[0].id,
        }));
      }
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Не удалось загрузить смены");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      loadShifts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, start, end, effectiveSelectedAdmin]);

  useEffect(() => {
    if (admin && !form.adminId) {
      setForm((prev) => ({
        ...prev,
        adminId:
          admin.role === "super"
            ? data?.admins[0]?.id || ""
            : admin.id,
      }));
    }
  }, [admin, data, form.adminId]);

  const handleCreate = async () => {
    if (!admin) return;
    if (!form.adminId) {
      setCreateStatus({ type: "error", text: "Выберите сотрудника" });
      return;
    }
    if (!form.date) {
      setCreateStatus({ type: "error", text: "Укажите дату смены" });
      return;
    }
    if (!form.hours) {
      setCreateStatus({ type: "error", text: "Укажите длительность смены" });
      return;
    }
    setCreating(true);
    setCreateStatus(null);
    try {
      const res = await fetch(`${API_BASE}/admin/shifts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Id": admin.id,
        },
        body: JSON.stringify({
          adminId: form.adminId,
          date: form.date,
          hours: Number(form.hours),
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          payload?.message || payload?.error || "Не удалось сохранить смену"
        );
      }
      await loadShifts();
      setCreateStatus({ type: "success", text: "Смена добавлена" });
    } catch (err) {
      setCreateStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Не удалось сохранить смену",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!admin) return;
    if (!window.confirm("Удалить смену?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/shifts/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Id": admin.id },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || payload?.error || "Не удалось удалить смену");
      }
      await loadShifts();
    } catch (err) {
      setCreateStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Не удалось удалить смену",
      });
    }
  };

  const totals = data?.totals;

  return (
    <AdminLayout>
      <main style={{ padding: 20 }}>
        <h1>{t("shifts")}</h1>
        <p style={{ maxWidth: 640 }}>{t("shiftsIntro")}</p>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <label style={{ display: "grid", gap: 4 }}>
            <span>{t("from")}</span>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span>{t("to")}</span>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          {admin?.role === "super" && (
            <label style={{ display: "grid", gap: 4 }}>
              <span>{t("employee")}</span>
              <select
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
              >
                <option value="all">{t("allEmployees")}</option>
                {data?.admins.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.login} ({item.role})
                  </option>
                ))}
              </select>
            </label>
          )}
          <button onClick={loadShifts} disabled={loading} style={{ height: 36 }}>
            {loading ? t("loading") : t("refresh")}
          </button>
        </div>

        {error && <p style={{ color: "#d33" }}>{error}</p>}

        {totals && (
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 16,
                minWidth: 160,
              }}
            >
              <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                {t("totalShifts")}
              </p>
              <strong style={{ fontSize: 24 }}>{totals.totalShifts}</strong>
            </div>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 16,
                minWidth: 160,
              }}
            >
              <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                {t("totalHours")}
              </p>
              <strong style={{ fontSize: 24 }}>{totals.totalHours}</strong>
            </div>
          </div>
        )}

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ marginTop: 0 }}>{t("shiftSummary")}</h2>
          {data?.summary.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("employee")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("role")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("shiftCount")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("totalHours")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("avgHours")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("lastShift")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.summary.map((item) => (
                    <tr key={item.adminId}>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{item.login}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{item.role}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{item.shiftCount}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{item.totalHours}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>
                        {item.averageHours.toFixed(1)}
                      </td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>
                        {item.lastShift ? formatDate(item.lastShift) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#94a3b8" }}>{t("noShiftStats")}</p>
          )}
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ marginTop: 0 }}>{t("roleStatsTitle")}</h2>
          {data?.roleStats.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("role")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("employeeCount")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("shiftCount")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("totalHours")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.roleStats.map((item) => (
                    <tr key={item.role}>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{item.role}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{item.staffCount}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{item.shiftCount}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{item.totalHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#94a3b8" }}>{t("noRoleStats")}</p>
          )}
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ marginTop: 0 }}>{t("addShift")}</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "flex-end",
            }}
          >
            <label style={{ display: "grid", gap: 4, minWidth: 160 }}>
              <span>{t("employee")}</span>
              <select
                value={form.adminId}
                onChange={(e) => setForm((prev) => ({ ...prev, adminId: e.target.value }))}
                disabled={admin?.role !== "super"}
              >
                <option value="">{t("chooseEmployee")}</option>
                {allowedAdmins.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.login} ({item.role})
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>{t("shiftDate")}</span>
              <input
                type="date"
                value={form.date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span>{t("shiftHours")}</span>
              <select
                value={form.hours}
                onChange={(e) => setForm((prev) => ({ ...prev, hours: e.target.value }))}
              >
                {hoursOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={handleCreate} disabled={creating} style={{ height: 38 }}>
              {creating ? t("saving") : t("save")}
            </button>
          </div>
          {admin?.role !== "super" && (
            <p style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
              {t("selfShiftHint")}
            </p>
          )}
          {createStatus && (
            <p
              style={{
                marginTop: 12,
                color: createStatus.type === "success" ? "#0a8a0a" : "#d33",
              }}
            >
              {createStatus.text}
            </p>
          )}
        </section>

        <section>
          <h2 style={{ marginTop: 0 }}>{t("shiftsList")}</h2>
          {data?.shifts.length ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("shiftDate")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("employee")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("role")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("shiftHours")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}>{t("createdAt")}</th>
                    <th style={{ border: "1px solid #cbd5f5", padding: 8 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.shifts.map((shift) => (
                    <tr key={shift.id}>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{formatDate(shift.date)}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{shift.adminLogin}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{shift.role}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{shift.hours}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>{formatDateTime(shift.createdAt)}</td>
                      <td style={{ border: "1px solid #e2e8f0", padding: 8 }}>
                        {(admin?.role === "super" || admin?.id === shift.adminId) && (
                          <button onClick={() => handleDelete(shift.id)}>{t("delete")}</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "#94a3b8" }}>{t("noShifts")}</p>
          )}
        </section>
      </main>
    </AdminLayout>
  );
}
