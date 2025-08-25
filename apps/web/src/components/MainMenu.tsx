import React from "react";

export const MENU_ITEMS = [
  { title: "Комбо", href: "#Комбо" },
  { title: "Блюда", href: "#Блюда" },
  { title: "Закуски", href: "#Закуски" },
  { title: "Соусы", href: "#Соусы" },
  { title: "Напитки", href: "#Напитки" },
];

export default function MainMenu() {
  const scrollTo = (hash: string) => {
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="main-sidebar">
      <nav>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {MENU_ITEMS.map((item) => (
            <li key={item.title}>
              <button
                className="sidebar-btn"
                onClick={() => scrollTo(item.href)}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
