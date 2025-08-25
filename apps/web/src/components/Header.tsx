import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CartModal from "./CartModal";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
import { useDelivery } from "./DeliveryContext";

const fmtKZT = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

export default function Header() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

  const [q, setQ] = useState("");
  const [isSmall, setIsSmall] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>(
    []
  );
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [suggestPos, setSuggestPos] = useState({ left: 0, top: 0, width: 0 });

  useEffect(() => {
    const check = () => {
      const small = window.innerWidth < 600;
      setIsSmall(small);
      if (!small) setSearchOpen(false);
    };
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
  const cartLabel = fmtKZT.format(cartAmount);

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`${API_BASE}/dishes/search?term=${encodeURIComponent(q.trim())}`)
        .then((r) => r.json())
        .then((d) => setSuggestions(d))
        .catch(() => setSuggestions([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q, API_BASE]);

  useEffect(() => {
    if (suggestions.length === 0 || !searchRef.current) return;
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
  }, [suggestions.length, searchOpen, isSmall]);

  const searchSubmit = () => {
    if (q.trim()) {
      setSuggestions([]);
      location.href = `/?q=${encodeURIComponent(q.trim())}`;
    }
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
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderTop: "none",
              maxHeight: 200,
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
                    color: "var(--text)",
                  }}
                  onClick={() => setSearchOpen(false)}
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
      <header
        className="hdr"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          overflowX: "hidden",
          overflowY: "visible",
          // Цвета «как на первом скрине»
          background: "#0f1b2a",
          color: "#cbd5e1",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="hdr__in">
          {isSmall ? (
            searchOpen ? (
              <>
                <button
                  onClick={() => setSearchOpen(false)}
                  aria-label="Назад"
                  className="hdr__iconbtn"
                >
                  ←
                </button>

                <div ref={searchRef} className="hdr__search">
                  <input
                    name="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Найти блюдо…"
                    className="hdr__input"
                  />
                  <button onClick={searchSubmit} className="hdr__btn">
                    <SearchIcon />
                  </button>
                </div>

                <button onClick={() => setCartOpen(true)} className="cart-btn">
                  <CartIcon />
                  <span>{cartLabel}</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/" className="hdr__logo">
                  APPETIT
                </Link>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button
                    onClick={openDelivery}
                    aria-label="Способ доставки"
                    className="hdr__iconbtn"
                    title={mode === "delivery" ? "Доставка" : "Самовывоз"}
                  >
                    🚚
                  </button>

                  <button
                    onClick={toggleTheme}
                    aria-label="Переключить тему"
                    className="hdr__iconbtn"
                  >
                    {theme === "light" ? "🌙" : "☀️"}
                  </button>

                  {user ? (
                    <span className="hdr__text">
                      {(user.phone || user.email)} · {user.bonus}₸
                    </span>
                  ) : (
                    <button onClick={openAuth} className="nav-link">
                      <UserIcon />
                      <span>Войти</span>
                    </button>
                  )}

                  <button onClick={() => setSearchOpen(true)} className="hdr__iconbtn" aria-label="Поиск">
                    <SearchIcon />
                  </button>

                  <button onClick={() => setCartOpen(true)} className="cart-btn">
                    <CartIcon />
                    <span>{cartLabel}</span>
                  </button>
                </div>
              </>
            )
          ) : (
            <>
              <Link href="/" className="hdr__logo">
                APPETIT
              </Link>

              <div ref={searchRef} className="hdr__search hdr__search--desktop">
                <input
                  name="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Найти блюдо…"
                  className="hdr__input"
                />
                <button onClick={searchSubmit} className="hdr__btn">
                  Искать
                </button>
              </div>

              <nav className="hdr__nav">
                <button onClick={openDelivery} className="nav-link">
                  <TruckIcon />
                  <span>{mode === "delivery" ? "Доставка" : "Самовывоз"}</span>
                </button>

                <button onClick={toggleTheme} className="hdr__iconbtn" aria-label="Переключить тему">
                  {theme === "light" ? "🌙" : "☀️"}
                </button>

                <a href="#" className="nav-link" aria-label="Язык">
                  <span>RU ▾</span>
                </a>

                {user ? (
                  <span className="hdr__text">
                    {(user.phone || user.email)} · {user.bonus}₸
                  </span>
                ) : (
                  <button onClick={openAuth} className="nav-link">
                    <UserIcon />
                    <span>Войти</span>
                  </button>
                )}

                <button onClick={() => setCartOpen(true)} className="cart-btn">
                  <CartIcon />
                  <span>{cartLabel}</span>
                </button>
              </nav>
            </>
          )}
        </div>

        {/* локальные стили под хедер */}
        <style jsx>{`
          .hdr__in {
            max-width: 1200px;
            margin: 0 auto;
            height: 56px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .hdr__logo {
            color: #e2e8f0;
            font-weight: 700;
            font-size: 20px;
            letter-spacing: 0.4px;
            text-decoration: none;
          }
          .hdr__search {
            flex: 0 1 280px;
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
            min-width: 160px;
          }
          .hdr__search--desktop { margin-left: 12px; }
          .hdr__input {
            width: 100%;
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.06);
            color: #e2e8f0;
            outline: none;
          }
          .hdr__input::placeholder { color: rgba(255,255,255,0.6); }
          .hdr__btn {
            padding: 8px 12px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.08);
            color: #e2e8f0;
            cursor: pointer;
          }
          .hdr__nav { display: flex; align-items: center; gap: 8px; margin-left: auto; }
          .hdr__iconbtn {
            background: transparent; border: 0; color: #cbd5e1;
            width: 32px; height: 32px; display: grid; place-items: center;
            border-radius: 8px; cursor: pointer;
          }
          .hdr__iconbtn:hover { background: rgba(255,255,255,0.08); color: #fff; }
          .nav-link {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 6px 10px; color: #cbd5e1; background: transparent;
            border: 0; border-radius: 8px; cursor: pointer; text-decoration: none;
          }
          .nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
          .hdr__text { color: #cbd5e1; }
          .cart-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 6px 12px; background: rgba(255,255,255,0.08);
            border: 0; border-radius: 10px; color: #e2e8f0; cursor: pointer;
            font-weight: 700;
          }
          .cart-btn:hover { background: rgba(255,255,255,0.16); color: #fff; }
          .hdr :global(svg) { width: 20px; height: 20px; stroke-width: 1.6; color: currentColor; }
          @media (max-width: 480px) {
            .hdr__in { height: 52px; }
            .hdr__logo { font-size: 18px; }
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

/* Иконки — тонкие, как на первом скрине */
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
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="11" cy="11" r="8" stroke="currentColor" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" />
    </svg>
  );
}
function TruckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3 6h11v9H3zM14 10h4l3 3v2h-7z" stroke="currentColor" />
      <circle cx="6.5" cy="18" r="1.5" stroke="currentColor" />
      <circle cx="17.5" cy="18" r="1.5" stroke="currentColor" />
    </svg>
  );
}
