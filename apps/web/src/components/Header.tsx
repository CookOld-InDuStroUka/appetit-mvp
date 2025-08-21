import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [q, setQ] = useState("");

    return (
        <header style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "#0f172a",
            color: "#fff", borderBottom: "1px solid #0b1226"
        }}>
            <div style={{
                maxWidth: 1200, margin: "0 auto",
                display: "flex", alignItems: "center", gap: 16, padding: "10px 16px"
            }}>
                {/* Лого */}
                <Link href="/" style={{
                    display: "inline-flex", alignItems: "center",
                    fontWeight: 800, letterSpacing: .3, textDecoration: "none", color: "#fff"
                }}>
                    <span style={{
                        background: "#ef4444", color: "#fff", padding: "6px 10px",
                        borderRadius: 8, marginRight: 8
                    }}>APPETIT</span>
                    <span style={{ opacity: .8 }}>вкусная шаурма</span>
                </Link>

                {/* Поиск */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Найти блюдо…"
                        style={{
                            width: "100%", padding: "8px 12px", borderRadius: 8,
                            border: "1px solid #334155", background: "#0b1226", color: "#fff"
                        }}
                    />
                    <button
                        onClick={() => { if (q.trim()) location.href = `/?q=${encodeURIComponent(q.trim())}`; }}
                        style={{
                            padding: "8px 12px", borderRadius: 8, border: "1px solid #334155",
                            background: "#1e293b", color: "#fff", cursor: "pointer"
                        }}
                    >Искать</button>
                </div>

                {/* Правый блок */}
                <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <a href="#" style={{ color: "#cbd5e1", textDecoration: "none" }}>RU ▾</a>
                    <Link href="/contacts" style={{ color: "#cbd5e1", textDecoration: "none" }}>Контакты</Link>
                    <Link href="/login" style={{ color: "#cbd5e1", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>Войти</span>
                    </Link>
                    <Link href="/checkout" style={{
                        background: "#ef4444", color: "#fff", textDecoration: "none",
                        padding: "8px 12px", borderRadius: 10, fontWeight: 700
                    }}>
                        0 ₸
                    </Link>
                </nav>
            </div>
        </header>
    );
}
