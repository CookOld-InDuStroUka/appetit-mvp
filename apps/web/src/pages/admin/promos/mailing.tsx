import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

type Mailing = {
  id: string;
  message: string;
  sendAt?: string | null;
  createdAt: string;
};

export default function MailingAdmin() {
  const [message, setMessage] = useState("");
  const [sendAt, setSendAt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [list, setList] = useState<Mailing[]>([]);

  const load = () => {
    fetch(`${API_BASE}/admin/mailings`)
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const res = await fetch(`${API_BASE}/admin/mailings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sendAt: sendAt || null }),
    });
    if (res.ok) {
      setMessage("");
      setSendAt("");
      setStatus("Сохранено");
      load();
    } else {
      setStatus("Ошибка");
    }
  };

  return (
    <AdminLayout>
      <h1>Рассылки</h1>
      <div style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Сообщение"
          style={{ minHeight: 80 }}
        />
        <input
          type="datetime-local"
          value={sendAt}
          onChange={(e) => setSendAt(e.target.value)}
        />
        <button onClick={submit}>Создать</button>
        {status && <p>{status}</p>}
      </div>
      <h2 style={{ marginTop: 24 }}>Запланированные</h2>
      <ul>
        {list.map((m) => (
          <li key={m.id}>
            {m.message} – {m.sendAt
              ? new Date(m.sendAt).toLocaleString("ru-RU", { hour12: false })
              : "немедленно"}
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}

