import { useEffect } from "react";

declare global {
  interface Window {
    onTelegramAuth?: (user: any) => void;
  }
}

export default function TelegramLoginButton() {
  useEffect(() => {
    window.onTelegramAuth = async (user) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(user),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        location.reload();
      }
    };
  }, []);

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
