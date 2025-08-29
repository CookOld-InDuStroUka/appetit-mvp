import React, { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

type Props = {
  user: {
    id: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    birthDate?: string | null;
    notificationsEnabled?: boolean;
  };
  onClose: () => void;
  onSaved: (u: any) => void;
};

export default function UserInfoModal({ user, onClose, onSaved }: Props) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [birthDate, setBirthDate] = useState(user.birthDate ? user.birthDate.slice(0, 10) : "");
  const [notify, setNotify] = useState(user.notificationsEnabled ?? true);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          birthDate: birthDate || null,
          notificationsEnabled: notify,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onSaved(data);
      } else {
        alert("Не удалось сохранить");
      }
    } catch {
      alert("Не удалось сохранить");
    } finally {
      setLoading(false);
    }
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 320 }} onClick={stop}>
        <h3 style={{ textAlign: "center", marginTop: 0 }}>Контакты</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
            }}
          />
          <input
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
            }}
          />
          <input
            placeholder="Почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
            }}
          />
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
            }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Получать уведомления и акции
          </label>
        </div>
        <button
          onClick={save}
          disabled={loading || !name || (!phone && !email)}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "8px 0",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

