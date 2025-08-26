import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CartModal from "./CartModal";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useDelivery } from "./DeliveryContext";
import { useLang } from "./LangContext";

const fmtKZT = new Intl.NumberFormat("ru-KZ", {
  style: "currency",
  currency: "KZT",
  maximumFractionDigits: 0,
});

export default function Header() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

  const [q, setQ] = useState("");
  const [isCartOpen, setCartOpen] = useState(false);
  const { items: cartItems, updateQty, clear, removeItem, setPromo } = useCart();
  const { user, open: openAuth } = useAuth();
  const { setBranch } = useDelivery();
  const { lang, setLang, t } = useLang();

  const cartAmount = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartLabel = fmtKZT.format(cartAmount);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { promo?: string; branchId?: string } | undefined;
      if (detail?.promo) setPromo(detail.promo.toUpperCase());
      if (detail?.branchId) setBranch(detail.branchId);
      setCartOpen(true);
    };
    document.addEventListener("open-cart", handler);
    return () => document.removeEventListener("open-cart", handler);
  }, [setBranch, setPromo]);

  // подсказки поиска
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>(
    []
  );
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
        const data = await r.json();
        setSuggestions(data);
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
              background: "#122234",
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
                  href={`/#dish-${s.id}`}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    textDecoration: "none",
                    color: "#e2e8f0",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSuggestions([]);
                    const el = document.getElementById(`dish-${s.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    } else {
                      location.href = `/#dish-${s.id}`;
                    }
                  }}
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
          {/* ЛОГО + слоган (положи файл в public/logo-appetit.svg) */}
          <Link href="/" className="logo">
            <img src="/logo-appetit.svg" alt="APPETIT" />
            <span className="tagline">{t("tagline")}</span>
          </Link>

          {/* ПОИСК по центру */}
          <div ref={searchRef} className="search">
            <input
              className="search__input"
              placeholder={t("search")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchSubmit()}
            />
            <button className="search__btn" onClick={searchSubmit} aria-label={t("searchBtn")}>
              <SearchIcon />
            </button>
          </div>

          {/* ПРАВАЯ ПАНЕЛЬ */}
          <nav className="right">
            <button
              className="link"
              type="button"
              onClick={() => setLang(lang === "ru" ? "kz" : "ru")}
            >
              <span>{lang.toUpperCase()}</span>
              <ChevronDown />
            </button>
            <Link href="/contacts" className="link">
              {t("contacts")}
            </Link>
            {user && (
              <Link href="/orders" className="link">
                {t("orders")}
              </Link>
            )}

            {user ? (
              <Link href="/profile" className="link">
                {user.name || user.email || user.phone}
              </Link>
            ) : (
              <button onClick={openAuth} className="link">
                <UserIcon />
                <span>{t("login")}</span>
              </button>
            )}

            <button onClick={() => setCartOpen(true)} className="link">
              <CartIcon />
              <span>{cartLabel}</span>
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
            border-bottom: 1px solid rgba(255,255,255,.1);
          }
          .row {
            max-width: 1280px;
            margin: 0 auto;
            height: 60px;
            padding: 0 16px;
            display: grid;
            grid-template-columns: 1fr minmax(280px, 520px) 1fr;
            align-items: center;
            gap: 16px;
          }
          .logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: inherit;
          }
          .logo img {
            height: 28px;
            width: auto;
            display: block;
            background: #fff;
            border-radius: 8px;
            padding: 2px 6px;
          }
          .tagline {
            font-size: 12px;
            color: #9fb3c8;
            line-height: 1;
            margin-top: 2px;
          }

          .search {
            display: flex;
            align-items: center;
            background: rgba(255,255,255,.08);
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 10px;
            padding: 2px;
            height: 36px;
          }
          .search__input {
            flex: 1;
            border: 0;
            outline: none;
            background: transparent;
            color: #e2e8f0;
            padding: 0 12px;
          }
          .search__input::placeholder { color: rgba(255,255,255,.6); }
          .search__btn {
            width: 36px;
            height: 32px;
            display: grid;
            place-items: center;
            border: 0;
            background: transparent;
            color: #cbd5e1;
            border-radius: 8px;
            cursor: pointer;
          }
          .search__btn:hover { background: rgba(255,255,255,.08); color: #fff; }

          .right {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 16px;
          }
          .link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #cbd5e1;
            background: transparent;
            border: 0;
            padding: 6px 8px;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            font-weight: 600;
          }
          .link:hover { color: #fff; background: rgba(255,255,255,.08); }
          .muted { color: #9fb3c8; font-weight: 500; }
          :global(svg) { width: 20px; height: 20px; stroke-width: 1.6; color: currentColor; }

          @media (max-width: 820px) {
            .row { grid-template-columns: 1fr 1fr; gap: 10px; height: 56px; }
            .search { grid-column: 1 / -1; }
            .tagline { display: none; }
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

/* Иконки — тонкие, как в референсе */
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
      <path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 8H7" stroke="currentColor"/>
      <circle cx="10" cy="20" r="1.5" stroke="currentColor"/>
      <circle cx="18" cy="20" r="1.5" stroke="currentColor"/>
    </svg>
  );
}
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 9l6 6 6-6" stroke="currentColor"/>
    </svg>
  );
}
