import Link from "next/link";
import { useEffect, useState } from "react";
import CartModal from "./CartModal";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

export default function Header() {
    const [q, setQ] = useState("");
    const [isCartOpen, setCartOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const { items: cartItems, updateQty, clear, removeItem } = useCart();
    const { user, open: openAuth } = useAuth();

    const cartAmount = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    useEffect(() => {
        document.body.classList.toggle("theme-dark", theme === "dark");
    }, [theme]);

    return (
        <>
        <header style={{
            position: "sticky", top: 0, zIndex: 50,
            background: "var(--header-bg)",
            color: "var(--header-text)", borderBottom: "1px solid var(--header-border)",
            width: "100%"
        }}>
            <div style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: "clamp(8px,2vw,16px)", padding: "10px clamp(8px,4vw,24px)",
                flexWrap: "wrap"
            }}>
                {/* Лого */}
                <Link href="/" style={{
                    display: "inline-flex", alignItems: "center",
                    fontWeight: 800, letterSpacing: .3, textDecoration: "none", color: "var(--header-text)"
                }}>
                    <span style={{
                        background: "var(--accent)", color: "#fff", padding: "6px 10px",
                        borderRadius: 8, marginRight: 8
                    }}>APPETIT</span>
                    <span style={{ opacity: .8 }}>вкусная шаурма</span>
                </Link>

                {/* Поиск */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, marginLeft: 12, minWidth: 200 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Найти блюдо…"
                        style={{
                            width: "100%", padding: "8px 12px", borderRadius: 8,
                            border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--header-text)"
                        }}
                    />
                    <button
                        onClick={() => { if (q.trim()) location.href = `/?q=${encodeURIComponent(q.trim())}`; }}
                        style={{
                            padding: "8px 12px", borderRadius: 8, border: "1px solid var(--input-border)",
                            background: "var(--input-bg)", color: "var(--header-text)", cursor: "pointer"
                        }}
                    >Искать</button>
                </div>

                {/* Правый блок */}
                <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--nav-link)" }}
                        aria-label="Переключить тему"
                    >
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>
                    <a href="#" style={{ color: "var(--nav-link)", textDecoration: "none" }}>RU ▾</a>
                    {user ? (
                        <span style={{ color: "var(--nav-link)", display: "flex", alignItems: "center", gap: 6 }}>
                            {user.phone} · {user.bonus}₸
                        </span>
                    ) : (
                        <button onClick={openAuth} style={{ background: "transparent", border: "none", color: "var(--nav-link)", cursor: "pointer" }}>Войти</button>
                    )}
                    <button onClick={() => setCartOpen(true)} style={{
                        background: "var(--accent)", color: "#fff", textDecoration: "none",
                        padding: "8px 12px", borderRadius: 10, fontWeight: 700,
                        display: "inline-flex", alignItems: "center", gap: 8,
                        border: "none", cursor: "pointer"
                    }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {cartAmount > 0 && <span>{cartAmount} ₸</span>}
                    </button>
                </nav>
            </div>
        </header>
        {isCartOpen && (
            <CartModal
                items={cartItems}
                onClose={() => setCartOpen(false)}
                onClear={clear}
                updateQty={updateQty}
                removeItem={removeItem}
            />
        )}
        </>
    );
}
