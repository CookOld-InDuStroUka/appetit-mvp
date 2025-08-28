import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";

interface Message { from: string; text: string; ts: number; read?: boolean }
interface Chat { id: string; messages: Message[] }

function loadChats(): Record<string, Chat> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("supportChats") || "{}");
  } catch {
    return {};
  }
}

export default function SupportList() {
  const [chats, setChats] = useState<Record<string, Chat>>({});
  const [search, setSearch] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);

  useEffect(() => {
    setChats(loadChats());
  }, []);

  const entries = Object.values(chats).filter((c) => {
    const unread = c.messages.some((m) => m.from !== "admin" && !m.read);
    return (
      c.id.toLowerCase().includes(search.toLowerCase()) &&
      (!onlyUnread || unread)
    );
  });

  return (
    <AdminLayout>
      <h1>Поддержка</h1>
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Поиск"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 4, border: "1px solid var(--border)", borderRadius: 4 }}
        />
        <label style={{ marginLeft: 8 }}>
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={(e) => setOnlyUnread(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          Только новые
        </label>
      </div>
      {entries.length === 0 ? (
        <p>Нет обращений</p>
      ) : (
        <ul>
          {entries.map((c) => {
            const unread = c.messages.filter(
              (m) => m.from !== "admin" && !m.read
            ).length;
            return (
              <li key={c.id}>
                <Link href={`/admin/support/${c.id}`}>{c.id}</Link>
                {unread > 0 && (
                  <span style={{ marginLeft: 8 }}>+{unread}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminLayout>
  );
}
