import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CartModal from "./CartModal";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

const fmtKZT = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

export default function Header() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

  const [q, setQ] = useState("");
  const [isCartOpen, setCartOpen] = useState(false);
  const { items: cartItems, updateQty, clear, removeItem } = useCart();
  const { user, open: openAuth } = useAuth();

  const cartAmount = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartLabel = fmtKZT.format(cartAmount);

  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [suggestPos, setSuggestPos] = useState({ left: 0, top: 0, width: 0 });

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    const ac = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `${API_BASE}/dishes/search?term=${encodeURIComponent(q.trim())}`,
          { signal: ac.signal }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setSuggestions(await r.json());
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => {
      ac.abort();
      clearTimeout(t);
    };
  }, [q, API_BASE]);

  useEffect(() => {
    if (!suggestions.length || !searchRef.current) return;
    const update = () => {
      const r = searchRef.current!.getBoundingClientRect();
      setSuggestPos({ left: r.left, top: r.bottom, width: r.width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [suggestions.length]);

  const searchSubmit = () => {
    if (!q.trim()) return;
    setSuggestions([]);
    location.href = `/?q=${encodeURIComponent(q.trim())}`;
  };

  const suggestionPortal =
    typeof document !== "undefined" && suggestions.length > 0
      ? createPortal(
          <ul
            style={{
              position: "fixed",
              top: suggestPos.top,
              left: suggestPos.left,
              width: suggestPos.width,
              background: "#0F1B2A",
              border: "1px solid rgba(255,255,255,.08)",
              borderTop: "none",
              maxHeight: 220,
              overflowY: "auto",
              zIndex: 1000,
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {suggestions.map((s) => (
              <li key={s.id}>
                <a
                  href={`/dish/${s.id}`}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    textDecoration: "none",
                    color: "#E2E8F0",
                  }}
                  onClick={() => setSuggestions([])}
                >
                  {s.name}
                </a>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null;

  return (
    <>
      <header className="hdr">
        <div className="row">
          {/* Бренд оставляем как есть */}
          <Brand />

          {/* Поиск — серый прямоугольник c иконкой справа */}
          <div ref={searchRef} className="search">
            <input
              className="search__input"
              placeholder="Поиск"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchSubmit()}
            />
            <button className="search__btn" onClick={searchSubmit} aria-label="Искать">
              <SearchIcon />
            </button>
          </div>

          {/* Правый блок */}
          <nav className="right">
            <button className="link link--hide-sm" type="button" aria-label="Выбор языка">
              <span>RU</span>
              <ChevronDown />
            </button>

            <Link href="/contacts" className="link link--hide-sm">
              Контакты
            </Link>

            {user ? (
              <span className="link muted link--auth">{user.phone || user.email}</span>
            ) : (
              <button onClick={openAuth} className="link link--auth">
                <UserIcon />
                <span>Войти</span>
              </button>
            )}

            <button onClick={() => setCartOpen(true)} className="link link--cart" aria-label="Корзина">
              <CartIcon />
              <span className="price">{cartLabel}</span>
            </button>
          </nav>
        </div>

        <style jsx>{`
          .hdr {
            position: sticky;
            top: 0;
            z-index: 50;
            background: #0f1b2a; /* как на референсе */
            color: #cbd5e1;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .row {
            max-width: 1280px;
            margin: 0 auto;
            height: 56px;              /* компактная высота как на макете */
            padding: 0 16px;
            display: grid;
            grid-template-columns: 1fr minmax(420px, 560px) 1fr;
            align-items: center;
            gap: 16px;
          }

          /* === Поиск: «холодный серый» прямоугольник === */
          .search {
            display: flex;
            align-items: center;
            height: 34px;
            padding: 0 2px 0 10px;
            border-radius: 8px;
            background: #5a6773;            /* глухой серый как на скрине */
            border: 1px solid #6a7783;      /* лёгкий кант */
          }
          .search__input {
            flex: 1;
            border: 0;
            outline: none;
            background: transparent;
            color: #e2e8f0;
            font-weight: 500;
          }
          .search__input::placeholder {
            color: rgba(255, 255, 255, 0.8);
          }
          .search__btn {
            width: 36px;
            height: 30px;
            display: grid;
            place-items: center;
            border: 0;
            background: transparent;
            color: #e2e8f0;
            border-radius: 6px;
            cursor: pointer;
          }
          .search__btn:hover {
            background: rgba(0, 0, 0, 0.1);
          }

          /* === Правый блок === */
          .right {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 18px; /* как на референсе — не слишком широко */
          }
          .link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #cbd5e1;
            background: transparent;
            border: 0;
            padding: 6px 6px;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            font-weight: 500; /* убрали жирность, чтобы выглядело тоньше */
            line-height: 1;
          }
          .link:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.06);
          }
          .link--auth :global(svg) {
            margin-right: 2px;
          }
          .link--cart .price {
            font-variant-numeric: tabular-nums;
            letter-spacing: 0.2px;
          }
          .muted {
            color: #9fb3c8;
            font-weight: 500;
          }

          :global(svg) {
            width: 20px;
            height: 20px;
            stroke-width: 1.6;
            color: currentColor;
          }

          /* Мобилка */
          @media (max-width: 820px) {
            .row {
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              height: auto;
              padding: 8px 12px;
            }
            .search {
              grid-column: 1 / -1;
              height: 36px;
            }
            .link--hide-sm {
              display: none;
            }
            .right {
              gap: 10px;
            }
          }
        `}</style>
      </header>

      {suggestionPortal}

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

/* ===== Бренд: (не меняем) ===== */
function Brand() {
  return (
    <Link
      href="/"
      data-app-brand
      aria-label="APPETIT — вкусная шаурма"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        whiteSpace: "nowrap",
        textDecoration: "none",
        color: "inherit",
        minWidth: 200,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 36,
          padding: "0 16px",
          borderRadius: 14,
          background: "#fff",
          border: "1px solid rgba(0,0,0,.06)",
          boxShadow: "0 1px 2px rgba(0,0,0,.06)",
          lineHeight: 1,
        }}
      >
        <strong
          style={{
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: 0.6,
            color: "#EF4444",
            lineHeight: 1,
          }}
        >
          APPETIT
        </strong>
      </span>

      <span
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          lineHeight: 1.15,
          fontSize: 13,
          fontWeight: 700,
          color: "rgba(255,255,255,.92)",
        }}
      >
        <span>вкусная</span>
        <span>шаурма</span>
      </span>
    </Link>
  );
}

/* ===== Иконки ===== */
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" />
    </svg>
  );
}
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" />
      <path d="M4 20c0-3.3137 3.5817-6 8-6s8 2.6863 8 6" stroke="currentColor" />
    </svg>
  );
}
function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 8H7" stroke="currentColor" />
      <circle cx="10" cy="20" r="1.5" stroke="currentColor" />
      <circle cx="18" cy="20" r="1.5" stroke="currentColor" />
    </svg>
  );
}
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 9l6 6 6-6" stroke="currentColor" />
    </svg>
  );
}