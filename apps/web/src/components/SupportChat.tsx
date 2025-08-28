import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useLang } from "./LangContext";

type Message = { from: "user" | "admin"; text: string; ts: number; read?: boolean };
type Chat = { id: string; messages: Message[] };

function loadChats(): Record<string, Chat> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("supportChats") || "{}");
  } catch {
    return {};
  }
}
function saveChats(chats: Record<string, Chat>) {
  if (typeof window !== "undefined") {
    localStorage.setItem("supportChats", JSON.stringify(chats));
  }
}

export default function SupportChat({ userId, isAdmin }: { userId?: string; isAdmin?: boolean }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [id, setId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    let uid = userId || user?.id;
    if (!uid && typeof window !== "undefined") {
      uid = localStorage.getItem("supportUserId") || `guest-${Date.now()}`;
      localStorage.setItem("supportUserId", uid);
    }
    if (!uid) return;
    setId(uid);
    const chats = loadChats();
    if (!chats[uid]) chats[uid] = { id: uid, messages: [] };
    setMessages(chats[uid].messages);
    if (isAdmin) {
      chats[uid].messages = chats[uid].messages.map((m) =>
        m.from === "user" ? { ...m, read: true } : m
      );
    }
    saveChats(chats);
  }, [userId, user]);

  const send = () => {
    if (!id || !text.trim()) return;
    const chats = loadChats();
    const msg: Message = {
      from: isAdmin ? "admin" : "user",
      text: text.trim(),
      ts: Date.now(),
      read: isAdmin,
    };
    if (!chats[id]) chats[id] = { id, messages: [] };
    chats[id].messages.push(msg);
    saveChats(chats);
    setMessages([...chats[id].messages]);
    setText("");
  };

  useEffect(() => {
    if (isAdmin && id) {
      const chats = loadChats();
      const chat = chats[id];
      if (chat) {
        let changed = false;
        chat.messages = chat.messages.map((m) => {
          if (m.from === "user" && !m.read) {
            changed = true;
            return { ...m, read: true };
          }
          return m;
        });
        if (changed) {
          saveChats(chats);
          setMessages([...chat.messages]);
        }
      }
    }
  }, [id, isAdmin, messages.length]);

  if (!id) return null;

  return (
    <div className="support-chat">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>{m.text}</div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("messagePlaceholder")}
        />
        <button type="submit">{t("send")}</button>
      </form>
      <style jsx>{`
        .support-chat {
          border: 1px solid #6a7783;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 400px;
        }
        .messages {
          max-height: 300px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .msg {
          padding: 6px 8px;
          border-radius: 6px;
          max-width: 80%;
        }
        .msg.user {
          align-self: flex-end;
          background: #5a6773;
          color: #fff;
        }
        .msg.admin {
          align-self: flex-start;
          background: #0f1b2a;
          border: 1px solid #6a7783;
          color: #e2e8f0;
        }
        form {
          display: flex;
          gap: 8px;
        }
        input {
          flex: 1;
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid #6a7783;
          background: #0f1b2a;
          color: #e2e8f0;
        }
        button {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          background: #5a6773;
          color: #fff;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
