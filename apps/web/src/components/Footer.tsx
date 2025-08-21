import Link from "next/link";

export default function Footer() {
    return (
        <footer style={{
            background: "#0f172a",
            color: "#fff",
            borderTop: "1px solid #0b1226",
            padding: "20px 0",
            marginTop: 40
        }}>
            <div style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "0 16px",
                display: "flex",
                flexWrap: "wrap",
                gap: 16
            }}>
                <Link href="/addresses" style={{ color: "#cbd5e1", textDecoration: "none" }}>Адреса</Link>
                <Link href="/reviews" style={{ color: "#cbd5e1", textDecoration: "none" }}>Отзывы</Link>
                <Link href="/promotions" style={{ color: "#cbd5e1", textDecoration: "none" }}>Акции</Link>
                <Link href="/delivery-payment" style={{ color: "#cbd5e1", textDecoration: "none" }}>Доставка и оплата</Link>
                <Link href="/bonus-program" style={{ color: "#cbd5e1", textDecoration: "none" }}>Бонусная программа</Link>
                <Link href="/careers" style={{ color: "#cbd5e1", textDecoration: "none" }}>Карьера</Link>
            </div>
        </footer>
    );
}
