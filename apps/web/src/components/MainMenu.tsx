import React from "react";
import { useLang } from "./LangContext";

export default function MainMenu() {
  const { t } = useLang();
  const items = [
    t("combo"),
    t("dishes"),
    t("snacks"),
    t("sauces"),
    t("drinks"),
  ];

  const scrollTo = (id: string) => {
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
          {items.map((title) => (
            <li key={title}>
              <button className="sidebar-btn" onClick={() => scrollTo(title)}>
                {title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
