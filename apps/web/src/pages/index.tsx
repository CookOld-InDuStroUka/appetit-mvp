import React from "react";
import Header from "../components/Header";
import MainMenu from "../components/MainMenu";

const categories = [
  {
    name: "Комбо",
    items: [
      { title: "Комбо для ОДНОГО", price: "2490 ₸", img: "/images/combo1.png" },
      { title: "Комбо для ДВОИХ", price: "4490 ₸", img: "/images/combo2.png" },
      { title: "Комбо для КОМПАНИИ", price: "от 8900 ₸", img: "/images/combo3.png" },
    ],
  },
  {
    name: "Блюда",
    items: [
      { title: "Фирменная Средняя шаурма", price: "1990 ₸", img: "/images/sh1.png" },
      { title: "Фирменная Большая шаурма", price: "2990 ₸", img: "/images/sh2.png" },
      { title: "Классическая Средняя шаурма", price: "1690 ₸", img: "/images/sh3.png" },
      { title: "Классическая Большая шаурма", price: "2490 ₸", img: "/images/sh4.png" },
    ],
  },
];

export default function Home() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <Header />
      <div style={{ display: "flex" }}>
        <MainMenu />
        <main style={{ flex: 1, padding: "20px" }}>
          {categories.map((cat) => (
            <section key={cat.name} id={cat.name} style={{ marginBottom: "40px" }}>
              <h2 style={{ marginBottom: "20px" }}>{cat.name}</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "20px",
                }}
              >
                {cat.items.map((item) => (
                  <div
                    key={item.title}
                    style={{ border: "1px solid #eee", borderRadius: "8px", padding: "15px" }}
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                    <h4 style={{ margin: "10px 0" }}>{item.title}</h4>
                    <p style={{ color: "#666", fontSize: "14px" }}>{item.price}</p>
                    <button
                      style={{
                        background: "#e31b23",
                        color: "#fff",
                        border: "none",
                        padding: "10px",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Добавить
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
