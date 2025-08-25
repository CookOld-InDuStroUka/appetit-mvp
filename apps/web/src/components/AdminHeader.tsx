import Link from "next/link";
import { useState } from "react";
import { useTheme } from "./ThemeContext";

export default function AdminHeader() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const links = [
    { href: "/admin", label: "Главная" },
    { href: "/admin/branches", label: "Филиалы" },
    { href: "/admin/menu", label: "Меню" },
    { href: "/admin/orders", label: "Заказы" },
    { href: "/admin/promos", label: "Маркетинг" },
    { href: "/admin/analytics", label: "Аналитика" },
  ];

  const linkEls = links.map((l) => (
    <Link key={l.href} href={l.href} className="admin-nav-btn" onClick={() => setOpen(false)}>
      {l.label}
    </Link>
  ));

  return (
    <header className="admin-header">
      <div className="inner">
        <Link href="/admin" className="logo">
          APPETIT
        </Link>
        <nav className="nav">{linkEls}</nav>
        <div className="actions">
          <button
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="btn"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Меню"
            className="btn menu-btn"
          >
            ☰
          </button>
        </div>
      </div>
      {open && <nav className="mobile-nav">{linkEls}</nav>}
      <style jsx>{`
        .admin-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--header-bg);
          color: var(--header-text);
          border-bottom: 1px solid var(--header-border);
          width: 100%;
        }
        .inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px clamp(8px, 4vw, 24px);
        }
        .logo {
          font-family: Roboto, sans-serif;
          font-weight: 700;
          font-size: 24px;
          text-decoration: none;
          color: var(--header-text);
        }
        .nav {
          display: flex;
          gap: 12px;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn {
          background: transparent;
          border: 1px solid var(--header-text);
          color: var(--header-text);
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .menu-btn {
          display: none;
        }
        @media (max-width: 600px) {
          .nav {
            display: none;
          }
          .menu-btn {
            display: inline-block;
          }
          .mobile-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px clamp(8px, 4vw, 24px);
          }
        }
      `}</style>
    </header>
  );
}

