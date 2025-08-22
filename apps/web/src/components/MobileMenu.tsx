import React from "react";
import { MENU_ITEMS } from "./MainMenu";

export default function MobileMenu() {
  return (
    <nav className="mobile-menu">
      <ul>
        {MENU_ITEMS.map((item) => (
          <li key={item.title}>
            <a href={item.href}>{item.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
