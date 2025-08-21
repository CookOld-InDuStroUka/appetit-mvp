import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#0f172a", color: "#fff", marginTop: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <li><Link href="/addresses" style={{ color: "#cbd5e1", textDecoration: "none" }}>Адреса и зоны доставки</Link></li>
            <li><Link href="/reviews" style={{ color: "#cbd5e1", textDecoration: "none" }}>Отзывы</Link></li>
            <li><Link href="/promotions" style={{ color: "#cbd5e1", textDecoration: "none" }}>Акции</Link></li>
            <li><Link href="/delivery" style={{ color: "#cbd5e1", textDecoration: "none" }}>Доставка и оплата</Link></li>
            <li><Link href="/bonus" style={{ color: "#cbd5e1", textDecoration: "none" }}>Бонусная программа</Link></li>
            <li><Link href="/vacancies" style={{ color: "#cbd5e1", textDecoration: "none" }}>Вакансии</Link></li>
            <li><Link href="/contacts" style={{ color: "#cbd5e1", textDecoration: "none" }}>Контакты</Link></li>
          </ul>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, marginBottom: 8 }}>Акции, которые нельзя есть, — в наших приложениях!</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <a href="#" style={{ background: "#fff", color: "#000", padding: "6px 12px", borderRadius: 8, textDecoration: "none", fontSize: 12 }}>App Store</a>
              <a href="#" style={{ background: "#fff", color: "#000", padding: "6px 12px", borderRadius: 8, textDecoration: "none", fontSize: 12 }}>Google Play</a>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 12, color: "#94a3b8", display: "flex", flexWrap: "wrap", gap: 16 }}>
          <span>ИП Таубекова Б.К.</span>
          <Link href="#" style={{ color: "#94a3b8", textDecoration: "none" }}>Политика конфиденциальности</Link>
          <Link href="#" style={{ color: "#94a3b8", textDecoration: "none" }}>Публичная оферта</Link>
        </div>
      </div>
    </footer>
  );
}
