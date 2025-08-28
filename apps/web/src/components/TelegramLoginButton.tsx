import { useEffect } from "react";
import { useAuth } from "./AuthContext";

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export default function TelegramLoginButton() {
  const { setUser, close } = useAuth();
  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(user),
      });
      if (r.ok) {
        const data = await r.json();
        setUser(data.user);
        close();
      }
    };
  }, [setUser, close]);

  if (!process.env.NEXT_PUBLIC_TG_BOT_NAME) return null;

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
<script async src="https://telegram.org/js/telegram-widget.js?22"
  data-telegram-login="${process.env.NEXT_PUBLIC_TG_BOT_NAME}"
  data-size="large"
  data-userpic="false"
  data-onauth="onTelegramAuth(user)"
  data-request-access="write"
  data-lang="${process.env.NEXT_PUBLIC_TG_LANG || "ru"}"></script>`
      }}
    />
  );
}
