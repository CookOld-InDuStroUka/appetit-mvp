import React from "react";

export const MENU_ITEMS = [
  { title: "Комбо", href: "#Комбо" },
  { title: "Блюда", href: "#Блюда" },
  { title: "Закуски", href: "#Закуски" },
  { title: "Соусы", href: "#Соусы" },
  { title: "Напитки", href: "#Напитки" },
];

export default function MainMenu() {
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
              <a href={item.href} className="sidebar-link">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
