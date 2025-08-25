import Link from "next/link";
import { CSSProperties } from "react";

export default function AdminNav() {
  const linkStyle: CSSProperties = {
    textDecoration: "none",
    color: "var(--nav-link)",
  };

  return (
    <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
      <Link href="/admin" style={linkStyle}>
        Главная
      </Link>
      <Link href="/admin/branches" style={linkStyle}>
        Филиалы
      </Link>
      <Link href="/admin/menu" style={linkStyle}>
        Меню
      </Link>
      <Link href="/admin/orders" style={linkStyle}>
        Заказы
      </Link>
      <Link href="/admin/promos" style={linkStyle}>
        Маркетинг
      </Link>
      <Link href="/admin/analytics" style={linkStyle}>
        Аналитика
      </Link>
    </nav>
  );
}

