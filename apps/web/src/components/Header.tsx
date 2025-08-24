import Link from "next/link";
import { useState, useEffect } from "react";
import CartModal from "./CartModal";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useDelivery } from "./DeliveryContext";

export default function Header() {
    const [q, setQ] = useState("");
    const [isSmall, setIsSmall] = useState(false);

    useEffect(() => {
        const check = () => setIsSmall(window.innerWidth < 600);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);
    const [isCartOpen, setCartOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { items: cartItems, updateQty, clear, removeItem } = useCart();
    const { user, open: openAuth } = useAuth();
    const { mode, open: openDelivery } = useDelivery();

    const cartAmount = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

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
                maxWidth: "1280px",
                margin: "0 auto",
                display: "flex", alignItems: "center", gap: "clamp(8px,2vw,16px)", padding: "10px clamp(8px,4vw,24px)",
                flexWrap: "wrap"
            }}>
                {/* Лого */}
                <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                    <span
                        style={{
                            fontFamily: 'TTHoves, sans-serif',
                            fontWeight: 700,
                            fontSize: 24,
                            color: "var(--header-text)"
                        }}
                    >APPETIT</span>
                </Link>

                {/* Поиск */}
                <div style={{ flex: "0 1 280px", display: "flex", alignItems: "center", gap: 8, marginLeft: 12, minWidth: 160 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Найти блюдо…"
                        style={{
                            width: "100%", padding: "8px 12px", borderRadius: 8,
                            border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text)"
                        }}
                    />
                    <button
                        onClick={() => { if (q.trim()) location.href = `/?q=${encodeURIComponent(q.trim())}`; }}
                        style={{
                            padding: "8px 12px", borderRadius: 8, border: "1px solid var(--search-btn-border)",
                            background: "var(--search-btn-bg)", color: "var(--search-btn-color)", cursor: "pointer"
                        }}
                    >
                        {isSmall ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        ) : (
                            "Искать"
                        )}
                    </button>
                </div>

                {/* Правый блок */}
                <nav style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
                    <button
                        onClick={openDelivery}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--nav-link)" }}
                    >
                        {mode === "delivery" ? "Доставка" : "Самовывоз"}
                    </button>
                    <button
                        onClick={toggleTheme}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--nav-link)" }}
                        aria-label="Переключить тему"
                    >
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>
                    <a href="#" style={{ color: "var(--nav-link)", textDecoration: "none" }}>RU ▾</a>
                    {user ? (
                        <span style={{ color: "var(--nav-link)", display: "flex", alignItems: "center", gap: 6 }}>
                            {(user.phone || user.email)} · {user.bonus}₸
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
