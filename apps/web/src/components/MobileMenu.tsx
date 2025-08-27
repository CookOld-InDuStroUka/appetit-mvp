import React from "react";

interface Props {
  items: string[];
}

export default function MobileMenu({ items }: Props) {
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
