import React from "react";

const items = [
  { title: "Комбо", href: "#Комбо" },
  { title: "Блюда", href: "#Блюда" },
  { title: "Закуски", href: "#Закуски" },
  { title: "Соусы", href: "#Соусы" },
  { title: "Напитки", href: "#Напитки" },
];

export default function MainMenu() {
  return (
    <aside
      style={{
        width: 220,
        padding: 20,
        borderRight: "1px solid #eee",
        position: "sticky",
        top: 70,
        alignSelf: "flex-start",
      }}
    >
      <nav>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
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
