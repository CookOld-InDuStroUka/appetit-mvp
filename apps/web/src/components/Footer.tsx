import Link from "next/link";
import { useState } from "react";
import AdminModal from "./AdminModal";

export default function Footer() {
  const [adminOpen, setAdminOpen] = useState(false);
  return (
    <footer style={{ background: "var(--footer-bg)", color: "var(--footer-text)", marginTop: 40, width: "100%" }}>
      <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px,5vw,48px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, flex: "1 1 200px" }}>
            <li><Link href="/addresses" style={{ color: "var(--nav-link)", textDecoration: "none" }}>Адреса и зоны доставки</Link></li>
            <li><Link href="/reviews" style={{ color: "var(--nav-link)", textDecoration: "none" }}>Отзывы</Link></li>
            <li><Link href="/promotions" style={{ color: "var(--nav-link)", textDecoration: "none" }}>Акции</Link></li>
            <li><Link href="/delivery" style={{ color: "var(--nav-link)", textDecoration: "none" }}>Доставка и оплата</Link></li>
            <li><Link href="/bonus" style={{ color: "var(--nav-link)", textDecoration: "none" }}>Бонусная программа</Link></li>
            <li><Link href="/vacancies" style={{ color: "var(--nav-link)", textDecoration: "none" }}>Вакансии</Link></li>
            <li><Link href="/contacts" style={{ color: "var(--nav-link)", textDecoration: "none" }}>Контакты</Link></li>
          </ul>
          <div style={{ textAlign: "right", flex: "1 1 200px" }}>
            <p style={{ margin: 0, marginBottom: 8 }}>Акции, скидки, кэшбэк − в нашем приложении!</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <a href="#" style={{ background: "#fff", color: "#000", padding: "6px 12px", borderRadius: 8, textDecoration: "none", fontSize: 12 }}>App Store</a>
              <a href="#" style={{ background: "#fff", color: "#000", padding: "6px 12px", borderRadius: 8, textDecoration: "none", fontSize: 12 }}>Google Play</a>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 12, color: "var(--nav-link)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          <span>ИП Таубекова Б.К.</span>
          <Link href="/privacy-policy" style={{ color: "var(--nav-link)", textDecoration: "none" }}>
            Политика конфиденциальности
          </Link>
          <Link href="/public-offer" style={{ color: "var(--nav-link)", textDecoration: "none" }}>
            Публичная оферта
          </Link>
          <button onClick={() => setAdminOpen(true)} style={{ background: "transparent", border: "1px solid var(--nav-link)", color: "var(--nav-link)", padding: "4px 8px", borderRadius: 6, cursor: "pointer" }}>Админ</button>
        </div>
      </div>
      {adminOpen && <AdminModal onClose={() => setAdminOpen(false)} />}
    </footer>
  );
}
