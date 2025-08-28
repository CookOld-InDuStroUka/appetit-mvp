import React from "react";

export interface MobileMenuItem {
  title: string;
  href: string;
}

interface Props {
  items: MobileMenuItem[];
}

export default function MobileMenu({ items }: Props) {
  return (
    <nav className="mobile-menu">
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
