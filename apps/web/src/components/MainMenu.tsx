import React from "react";

export type CategoryLink = {
  id: string;
  name: string;
  slug: string | null;
};

interface Props {
  categories: CategoryLink[];
}

export default function MainMenu({ categories }: Props) {
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
          {categories.map((c) => (
            <li key={c.id}>
              <a href={`#${c.slug ?? c.id}`} className="sidebar-link">
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
