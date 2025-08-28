import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CartModal from "./CartModal";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useLang } from "./LangContext";
import { useDelivery } from "./DeliveryContext";

const fmtKZT = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

export default function Header() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

  const [q, setQ] = useState("");
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const { items: cartItems, updateQty, clear, removeItem } = useCart();
  const { user, open: openAuth } = useAuth();
  const { lang, setLang, t } = useLang();
  const { mode, branch, branches, open: openDelivery } = useDelivery();

  const cartAmount = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartLabel = fmtKZT.format(cartAmount);
  const currentBranch = branches.find((b) => b.id === branch)?.name;
  const deliveryLabel = mode === "delivery" ? "Доставка" : currentBranch || "Самовывоз";

  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [suggestPos, setSuggestPos] = useState({ left: 0, top: 0, width: 0 });

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    const ac = new AbortController();
    const tmr = setTimeout(async () => {
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
      clearTimeout(tmr);
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

  const menuPortal =
    typeof document !== "undefined" && isMenuOpen
      ? createPortal(
          <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}>
            <div className="drawer" onClick={(e) => e.stopPropagation()}>
              <button
                className="drawer-lang"
                type="button"
                onClick={() => setLang(lang === "ru" ? "kz" : "ru")}
              >
                {lang === "ru" ? "Русский" : "Қазақша"}
              </button>
              <Link href="/" legacyBehavior>
                <a onClick={() => setMenuOpen(false)}>Меню</a>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCartOpen(true);
                  setMenuOpen(false);
                }}
              >
                Корзина
              </button>
              <Link href="/reviews" legacyBehavior>
                <a onClick={() => setMenuOpen(false)}>Отзывы</a>
              </Link>
              <Link href="/delivery" legacyBehavior>
                <a onClick={() => setMenuOpen(false)}>Доставка и оплата</a>
              </Link>
              <Link href="/bonus" legacyBehavior>
                <a onClick={() => setMenuOpen(false)}>Бонусная программа</a>
              </Link>
              <Link href="/vacancies" legacyBehavior>
                <a onClick={() => setMenuOpen(false)}>Вакансии</a>
              </Link>
              {user ? (
                <Link href="/profile" legacyBehavior>
                  <a onClick={() => setMenuOpen(false)}>
                    {user.name || user.phone || user.email}
                  </a>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    openAuth();
                    setMenuOpen(false);
                  }}
                >
                  Войти
                </button>
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <header className="hdr">
        <div className="row">
          <button
            className="menu-btn"
            type="button"
            aria-label="Меню"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>

          <div className={`center${isSearchOpen ? " search-open" : ""}`}>
            <div className="brand-wrap">
              <Brand />
            </div>

            <div ref={searchRef} className="search">
              <input
                ref={inputRef}
                className="search__input"
                placeholder={t("search")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchSubmit()}
                onBlur={() => {
                  if (!q) setSearchOpen(false);
                }}
              />
              <button
                className="search__btn"
                onClick={() => {
                  if (!isSearchOpen) {
                    setSearchOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  } else {
                    searchSubmit();
                  }
                }}
                aria-label={t("searchBtn")}
              >
                <SearchIcon />
              </button>
            </div>
          </div>

          <nav className="right">
            <button className="link" type="button" onClick={openDelivery}>
              {deliveryLabel}
            </button>
            <button
              className="link link--hide-sm"
              type="button"
              aria-label="Выбор языка"
              onClick={() => setLang(lang === "ru" ? "kz" : "ru")}
            >
              <span>{lang.toUpperCase()}</span>
              <ChevronDown />
            </button>

            {/* Используем legacyBehavior, чтобы класс гарантированно попал на <a> в Next <13 */}
            <Link href="/contacts" legacyBehavior>
              <a className="link link--hide-sm">{t("contacts")}</a>
            </Link>
            <Link href="/orders" legacyBehavior>
              <a className="link link--hide-sm">{t("orders")}</a>
            </Link>

            {user ? (
              <Link href="/profile" legacyBehavior>
                <a className="link link--auth">
                  <UserIcon />
                  <span>{user.name || user.phone || user.email}</span>
                </a>
              </Link>
            ) : (
              <button onClick={openAuth} className="link link--auth">
                <UserIcon />
                <span>{t("login")}</span>
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
            background: #0f1b2a;
            color: #cbd5e1;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .row {
            max-width: 1280px;
            margin: 0 auto;
            height: 56px;
            padding: 0 16px;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: 16px;
          }

          .center {
            display: flex;
            align-items: center;
            gap: 16px;
            justify-self: center;
            width: 100%;
          }

          .menu-btn {
            display: none;
            background: transparent;
            border: 0;
            color: inherit;
            padding: 6px;
            border-radius: 6px;
            cursor: pointer;
          }
          .menu-btn:hover {
            background: rgba(255, 255, 255, 0.06);
            color: #ffffff;
          }

          .brand-wrap {
            display: flex;
            align-items: center;
          }

          /* Поиск */
          .search {
            display: flex;
            align-items: center;
            height: 34px;
            padding: 0 2px 0 10px;
            border-radius: 8px;
            background: #5a6773;
            border: 1px solid #6a7783;
            transition: width 0.2s ease;
            overflow: hidden;
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

          /* Правый блок */
          .right {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 18px;
          }

          /* Базовый вид ссылок-кнопок */
          .link,
          .link:visited {
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
            font-weight: 500;
            line-height: 1;
          }
          .link:hover,
          .link:focus-visible {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.06);
            text-decoration: none;
            outline: none;
          }
          .link:active {
            transform: translateY(0.5px);
            opacity: 0.95;
          }

          .link--auth :global(svg) { margin-right: 2px; }
          .link--cart .price { font-variant-numeric: tabular-nums; letter-spacing: 0.2px; }

          :global(svg) {
            width: 20px;
            height: 20px;
            stroke-width: 1.6;
            color: currentColor;
          }

          /* --- ГЛАВНАЯ «ПРОСЕЧКА» против фиолетовых visited и подчёркиваний --- */
          :global(header.hdr a),
          :global(header.hdr a:visited) {
            color: #cbd5e1 !important;
            text-decoration: none !important;
          }
          :global(header.hdr a:hover) {
            color: #ffffff !important;
            background: rgba(255,255,255,0.06) !important;
            text-decoration: none !important;
          }

          /* Мобилка */
          @media (max-width: 820px) {
            .row {
              grid-template-columns: auto 1fr;
              gap: 10px;
              height: 56px;
              padding: 8px 12px;
            }
            .menu-btn { display: inline-flex; }
            .center { gap: 8px; }
            .search {
              width: 36px;
              padding: 0;
            }
            .search__input { display: none; }
            .center.search-open .brand-wrap { display: none; }
            .center.search-open .search {
              width: 100%;
              padding: 0 2px 0 10px;
            }
            .center.search-open .search__input {
              display: block;
              flex: 1;
            }
            .link--hide-sm { display: none; }
            .right { display: none; }
          }
        `}</style>
        <style jsx global>{`
          .drawer-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
          }
          .drawer {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            width: 260px;
            background: #0f1b2a;
            color: #fff;
            padding: 20px 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .drawer a,
          .drawer button {
            background: none;
            border: 0;
            color: inherit;
            text-align: left;
            padding: 10px 0;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
          }
          .drawer a:hover,
          .drawer button:hover {
            color: #ffffff;
          }
        `}</style>
      </header>

      {suggestionPortal}

      {menuPortal}

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

/* ===== Бренд ===== */
function Brand() {
  return (
    <Link href="/" legacyBehavior>
      <a
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
      </a>
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

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 12" fill="none" {...props}>
      <rect width="16" height="2" rx="1" fill="currentColor" />
      <rect y="5" width="16" height="2" rx="1" fill="currentColor" />
      <rect y="10" width="16" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}
