import Link from "next/link";
import { useState } from "react";
import type { BranchDTO } from "@appetit/shared/src/dto/branch";

export default function Header() {
    const [q, setQ] = useState("");
    const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
    const [showModal, setShowModal] = useState(false);
    const [address, setAddress] = useState("");
    const [branch, setBranch] = useState<BranchDTO | null>(null);

    const branches: BranchDTO[] = [
        { id: "1", name: "Центральный", address: "ул. Центральная, 1" },
        { id: "2", name: "Северный", address: "ул. Северная, 2" }
    ];

    return (
        <>
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Найти блюдо…"
                        style={{
                            width: 300, padding: "8px 12px", borderRadius: 8,
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

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={() => { setMode("delivery"); setShowModal(true); }}
                        style={{
                            padding: "8px 12px", borderRadius: 8, border: "1px solid #334155",
                            background: mode === "delivery" ? "#1e293b" : "#0b1226",
                            color: "#fff", cursor: "pointer"
                        }}
                    >{address ? `Доставка: ${address}` : "Доставка"}</button>
                    <button
                        onClick={() => { setMode("pickup"); setShowModal(true); }}
                        style={{
                            padding: "8px 12px", borderRadius: 8, border: "1px solid #334155",
                            background: mode === "pickup" ? "#1e293b" : "#0b1226",
                            color: "#fff", cursor: "pointer"
                        }}
                    >{branch ? `Самовывоз: ${branch.name}` : "Самовывоз"}</button>
                </div>

                {/* Правый блок */}
                <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <a href="#" style={{ color: "#cbd5e1", textDecoration: "none" }}>RU ▾</a>
                    <Link href="/contacts" style={{ color: "#cbd5e1", textDecoration: "none" }}>Контакты</Link>
                    <Link
                        href="/login"
                        style={{ color: "#cbd5e1", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
                    >
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

        {showModal && (
            <div style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.5)", display: "flex",
                alignItems: "center", justifyContent: "center", zIndex: 100
            }}>
                <div style={{ background: "#fff", color: "#000", padding: 20, borderRadius: 8, width: 320 }}>
                    <div style={{ textAlign: "right" }}>
                        <button onClick={() => setShowModal(false)}>✕</button>
                    </div>
                    {mode === "delivery" ? (
                        <div>
                            <h3 style={{ marginTop: 0 }}>Доставка</h3>
                            <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Введите адрес"
                                style={{
                                    width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1",
                                    borderRadius: 8
                                }}
                            />
                            <div style={{
                                marginTop: 12, width: "100%", height: 200, borderRadius: 8,
                                background: "#e2e8f0", display: "flex", alignItems: "center",
                                justifyContent: "center", color: "#475569"
                            }}>
                                Карта зон доставки
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ marginTop: 12 }}
                            >Сохранить</button>
                        </div>
                    ) : (
                        <div>
                            <h3 style={{ marginTop: 0 }}>Самовывоз</h3>
                            <div style={{ marginTop: 12 }}>
                                {branches.map(b => (
                                    <label key={b.id} style={{ display: "block", marginBottom: 8 }}>
                                        <input
                                            type="radio"
                                            name="branch"
                                            value={b.id}
                                            checked={branch?.id === b.id}
                                            onChange={() => setBranch(b)}
                                        />
                                        <span style={{ marginLeft: 8 }}>{b.name}</span>
                                    </label>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ marginTop: 12 }}
                            >Сохранить</button>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
}
