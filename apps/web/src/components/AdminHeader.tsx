import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminHeader() {
  const [isSmall, setIsSmall] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--header-bg)",
        color: "var(--header-text)",
        borderBottom: "1px solid var(--header-border)",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px clamp(8px,4vw,24px)",
        }}
      >
        <span style={{ fontWeight: 700 }}>Панель администратора</span>
        {isSmall ? (
          <button
            onClick={() => setOpen(!open)}
            aria-label="Меню"
            style={{
              background: "transparent",
              border: "1px solid var(--header-text)",
              color: "var(--header-text)",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        ) : (
          <nav style={{ display: "flex", gap: 12 }}>{linkEls}</nav>
        )}
      </div>
      {isSmall && open && (
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "8px clamp(8px,4vw,24px)",
          }}
        >
          {linkEls}
        </nav>
      )}
    </header>
  );
}

