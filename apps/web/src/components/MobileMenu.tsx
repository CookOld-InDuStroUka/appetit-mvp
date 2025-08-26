import React from "react";
import { useLang } from "./LangContext";

export default function MobileMenu() {
  const { t } = useLang();
  const items = [
    t("combo"),
    t("dishes"),
    t("snacks"),
    t("sauces"),
    t("drinks"),
  ];
  return (
    <nav className="mobile-menu">
      <ul>
        {items.map((title) => (
          <li key={title}>
            <a href={`#${title}`}>{title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
