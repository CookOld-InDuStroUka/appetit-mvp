import Link from "next/link";
import AdminLayout from "../../components/AdminLayout";
import { useState, memo } from "react";
import { useAdminAuth } from "../../components/AdminAuthContext";
import s from "./AdminHome.module.css";

/* ===== SVG-иконки ===== */
type IconName =
  | "menu" | "orders" | "promos" | "settings" | "branches"
  | "analytics" | "profile" | "home" | "site" | "admins";

const Icon = memo(function Icon({ name, size = 28 }: { name: IconName; size?: number }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.9,
    strokeLinecap: "round", strokeLinejoin: "round",
  } as const;

  switch (name) {
    case "menu":      return (<svg {...p}><path d="M3 14h18"/><path d="M6 14a6 6 0 0 1 12 0"/><path d="M12 5v2"/></svg>);
    case "orders":    return (<svg {...p}><path d="M6 6h15l-1.5 9H7.5L6 6Z"/><path d="M6 6 5 3H3"/><circle cx="9" cy="19" r="1.7"/><circle cx="17" cy="19" r="1.7"/></svg>);
    case "promos":    return (<svg {...p}><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/><path d="M19 5 22 2M16.5 7.5 22 2"/></svg>);
    case "settings":  return (<svg {...p}><path d="M9.6 3h4.8l.6 2.4 2.2 1.3 2.2-1.3 2.4 4.2-2.2 1.3v2.6l2.2 1.3-2.4 4.2-2.2-1.3-2.2 1.3-.6 2.4H9.6l-.6-2.4-2.2-1.3-2.2 1.3L2.2 15l2.2-1.3v-2.6L2.2 9l2.4-4.2 2.2 1.3 2.2-1.3.6-2.4Z"/><circle cx="12" cy="12" r="3.2"/></svg>);
    case "branches":  return (<svg {...p}><path d="M3 10h18l-1.4-4.2A2 2 0 0 0 17.7 4H6.3a2 2 0 0 0-1.9 1.8L3 10Z"/><path d="M5 10v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/><path d="M9 20v-6h6v6"/></svg>);
    case "analytics": return (<svg {...p}><path d="M4 19V10"/><path d="M10 19V4"/><path d="M16 19v-7"/><path d="M20 19V8"/></svg>);
    case "profile":   return (<svg {...p}><circle cx="12" cy="8.5" r="3.4"/><path d="M5 19.5c1.8-3 12.2-3 14 0"/></svg>);
    case "home":      return (<svg {...p}><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></svg>);
    case "site":      return (<svg {...p}><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M3 7v14h14"/></svg>);
    case "admins":    return (<svg {...p}><path d="M12 2l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V5l7-3z"/><path d="M9.5 12.5l2 2 3.5-3.5"/></svg>);
  }
  return null;
});

/* ===== Страница ===== */
type Tile = { href: string; label: string; sub: string; icon: IconName };

export default function AdminHome() {
  const { admin } = useAdminAuth();

  // Кнопки = всё из хедера + профиль; "Админы" — только для super
  const base: Tile[] = [
    { href: "/",                label: "На сайт",     sub: "Открыть витрину",     icon: "site" },
    { href: "/admin",           label: "Главная",     sub: "Центр управления",    icon: "home" },
    { href: "/admin/branches",  label: "Филиалы",     sub: "Адреса и зоны",       icon: "branches" },
    { href: "/admin/menu",      label: "Меню",        sub: "Блюда и цены",        icon: "menu" },
    { href: "/admin/orders",    label: "Заказы",      sub: "Онлайн-заказы",       icon: "orders" },
    { href: "/admin/promos",    label: "Маркетинг",   sub: "Акции и промокоды",   icon: "promos" },
    { href: "/admin/analytics", label: "Аналитика",   sub: "Отчёты и графики",    icon: "analytics" },
    { href: "/admin/settings",  label: "Настройки",   sub: "Оплата и доставка",   icon: "settings" },
    { href: "/admin/profile",   label: "Профиль",     sub: "Ваши данные",         icon: "profile" },
  ];
  if (admin?.role === "super") {
    base.push({ href: "/admin/admins", label: "Админы", sub: "Права и доступы", icon: "admins" });
  }

  const slides = [
    { title: "Добро пожаловать", sub: "в админ-панель" },
    { title: "Управляйте быстрее", sub: "меню, заказами и акциями" },
  ];
  const [i, setI] = useState(0);

  return (
    <AdminLayout>
      <section className={s.dash}>
        <div className={s.grid}>
          {/* Hero */}
          <div className={`${s.hero} ${s.glass}`}>
            <button className={`${s.navBtn} ${s.left}`} onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)} aria-label="Назад">❮</button>
            <div className={s.heroInner}>
              <h1 className={s.heroTitle}>{slides[i].title}</h1>
              <p className={s.heroSub}>{slides[i].sub}</p>
            </div>
            <button className={`${s.navBtn} ${s.right}`} onClick={() => setI((v) => (v + 1) % slides.length)} aria-label="Вперёд">❯</button>
            <div className={s.dots} role="tablist" aria-label="Слайды">
              {slides.map((_, idx) => (
                <button key={idx} className={`${s.dot} ${idx === i ? s.active : ""}`} onClick={() => setI(idx)} aria-label={`Слайд ${idx + 1}`} />
              ))}
            </div>
          </div>

          {/* Все кнопки-тайлы */}
          <nav className={s.tiles} aria-label="Разделы">
            {base.map((t) => (
              <Link key={t.href} href={t.href} className={`${s.tile} ${s.glass}`}>
                <span className={s.badge}><Icon name={t.icon} size={30} /></span>
                <span className={s.text}>
                  <span className={s.title}>{t.label}</span>
                  <span className={s.sub}>{t.sub}</span>
                </span>
                <span className={s.arrow}>→</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </AdminLayout>
  );
}
