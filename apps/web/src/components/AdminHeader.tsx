import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { useAdminAuth } from "./AdminAuthContext";

interface Message { from: string; read?: boolean }
interface Chat { id: string; messages: Message[] }

function loadChats(): Record<string, Chat> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("supportChats") || "{}");
  } catch {
    return {};
  }
}

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { admin, logout } = useAdminAuth();
  const [links, setLinks] = useState<{ href: string; label: string }[]>([]);

  useEffect(() => {
    const chats = loadChats();
    const unread = Object.values(chats).reduce(
      (n, c) => n + c.messages.filter((m) => m.from !== "admin" && !m.read).length,
      0
    );
    const base = [
      { href: "/", label: "На сайт" },
      { href: "/admin", label: "Главная" },
      { href: "/admin/branches", label: "Филиалы" },
      { href: "/admin/menu", label: "Меню" },
      { href: "/admin/orders", label: "Заказы" },
      { href: "/admin/promos", label: "Маркетинг" },
      { href: "/admin/analytics", label: "Аналитика" },
      {
        href: "/admin/support",
        label: unread > 0 ? `Поддержка (+${unread})` : "Поддержка",
      },
      { href: "/admin/settings", label: "Настройки" },
      { href: "/admin/profile", label: "Профиль" },
    ];
    if (admin?.role === "super") base.push({ href: "/admin/admins", label: "Админы" });
    setLinks(base);
  }, [admin]);

  const linkEls = links.map((l) => (
    <Link key={l.href} href={l.href} className="admin-nav-btn" onClick={() => setOpen(false)}>
      {l.label}
    </Link>
  ));

  return (
    <header className="admin-header">
      <div className="inner">
        <Link href="/admin" className="logo">APPETIT</Link>

        <nav className="nav">{linkEls}</nav>

        <div className="actions">
          <button
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="btn icon-btn"
            title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button onClick={logout} className="btn">Выйти</button>
          <button onClick={() => setOpen(!open)} aria-label="Меню" className="btn menu-btn">☰</button>
        </div>
      </div>

      {open && <nav className="mobile-nav">{linkEls}</nav>}

      <style jsx>{`
        /* фон как в футере */
        .admin-header {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: var(--nav-bg); /* <— тот же градиент, что и снизу */
          color: var(--footer-text);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }

        .inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px clamp(12px, 3vw, 24px);
          gap: 12px;
        }

        .logo {
          font-family: Roboto, sans-serif;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: .3px;
          text-decoration: none;
          color: var(--footer-text);
          padding: 6px 10px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
        }

        /* фикс фиолетового visited в шапке */
        .admin-header a,
        .admin-header a:visited {
          color: var(--footer-text);
          text-decoration: none;
        }

        .nav {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* тёмные «пилюли» для ссылок */
        .admin-nav-btn {
          display: inline-flex;
          align-items: center;
          height: 36px;
          padding: 0 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--footer-text);
          transition: background .15s ease, border-color .15s ease, transform .15s ease, opacity .15s ease;
        }
        .admin-nav-btn:hover {
          background: rgba(255,255,255,0.10);   /* никакого жёлтого/зелёного */
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
          opacity: 1;
        }

        /* кнопки справа */
        .btn {
          height: 36px;
          padding: 0 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: var(--footer-text);
          cursor: pointer;
          transition: background .15s ease, border-color .15s ease, transform .15s ease, opacity .15s ease;
        }
        .btn:hover {
          background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }
        .icon-btn { width: 40px; padding: 0; text-align: center; }

        .menu-btn { display: none; }

        @media (max-width: 920px) {
          .nav { display: none; }
          .menu-btn { display: inline-flex; }
          .mobile-nav {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            padding: 10px clamp(12px, 4vw, 24px) 14px;
            background: var(--nav-bg); /* такой же фон в мобильном меню */
            border-top: 1px solid rgba(255,255,255,0.08);
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .mobile-nav :global(.admin-nav-btn) {
            justify-content: center;
          }
        }
      `}</style>
    </header>
  );
}
