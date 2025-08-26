import React, { useState } from "react";

export const MENU_ITEMS = [
  { title: "Комбо", href: "#Комбо" },
  { title: "Блюда", href: "#Блюда" },
  { title: "Закуски", href: "#Закуски" },
  { title: "Соусы", href: "#Соусы" },
  { title: "Напитки", href: "#Напитки" },
  { title: "Кофе с собой", href: "#Кофе с собой" },
];

export default function MainMenu() {
  const [active, setActive] = useState<string>("Комбо");

  const scrollTo = (hash: string, title: string) => {
    setActive(title);
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="main-sidebar">
      <nav>
        <ul className="menu">
          {MENU_ITEMS.map((item) => (
            <li key={item.title}>
              <button
                className={`sidebar-btn ${active === item.title ? "active" : ""}`}
                onClick={() => scrollTo(item.href, item.title)}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

<style jsx>{`
  .menu {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px; /* маленькая дистанция */
  }

  .sidebar-btn {
    width: 100%;
    padding: 8px 12px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #111827;
    font-size: 15px;
    font-weight: 500;  /* <-- обычный вес */
    cursor: pointer;
    text-align: left;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .sidebar-btn:hover {
    background: #000;
    color: #fff;
  }

  .sidebar-btn.active {
    background: #000;
    color: #fff;
    font-weight: 500; /* <-- фикс: не жирнее обычного */
  }
`}</style>

    </aside>
  );
}
