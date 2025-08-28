import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";

interface Message { from: string; text: string; ts: number }
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

  useEffect(() => {
    setChats(loadChats());
  }, []);

  const entries = Object.values(chats);

  return (
    <AdminLayout>
      <h1>Поддержка</h1>
      {entries.length === 0 ? (
        <p>Нет обращений</p>
      ) : (
        <ul>
          {entries.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/support/${c.id}`}>{c.id}</Link>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  );
}
