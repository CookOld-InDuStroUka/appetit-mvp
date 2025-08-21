import React from "react";
import Header from "../components/Header";
import MainMenu from "../components/MainMenu";
import Footer from "../components/Footer";
import PromoSlider from "../components/PromoSlider";

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
  {
    name: "Закуски",
    items: [
      { title: "Шекер", price: "400 ₸", img: "https://placehold.co/200x200" },
      { title: "Чебуреки", price: "240 ₸", img: "https://placehold.co/200x200" },
      { title: "Наггетсы", price: "от 1490 ₸", img: "https://placehold.co/200x200" },
      { title: "Фри", price: "от 790 ₸", img: "https://placehold.co/200x200" },
      { title: "Долма", price: "от 1190 ₸", img: "https://placehold.co/200x200" },
    ],
  },
  {
    name: "Соусы",
    items: [
      { title: "Перечный острый 15г", price: "240 ₸", img: "https://placehold.co/200x200" },
      { title: "Соус Сырный 30г", price: "240 ₸", img: "https://placehold.co/200x200" },
      { title: "Соус Томатный 30г", price: "240 ₸", img: "https://placehold.co/200x200" },
      { title: "Соус Горчичный 30г", price: "240 ₸", img: "https://placehold.co/200x200" },
      { title: "Соус Барбекю 30г", price: "240 ₸", img: "https://placehold.co/200x200" },
      { title: "Соус Чесночный 30г", price: "240 ₸", img: "https://placehold.co/200x200" },
      { title: "Соус Острый 30г", price: "240 ₸", img: "https://placehold.co/200x200" },
    ],
  },
  {
    name: "Напитки",
    items: [
      { title: "Сок Лимонный 1л", price: "990 ₸", img: "https://placehold.co/200x200" },
      { title: "Сок Виноградный 1л", price: "990 ₸", img: "https://placehold.co/200x200" },
      { title: "Морс Смородина 1л", price: "990 ₸", img: "https://placehold.co/200x200" },
      { title: "Айран 1ст", price: "990 ₸", img: "https://placehold.co/200x200" },
      { title: "Пепси 1л", price: "640 ₸", img: "https://placehold.co/200x200" },
      { title: "Пепси 0.5л", price: "490 ₸", img: "https://placehold.co/200x200" },
      { title: "Чай 0.5л", price: "390 ₸", img: "https://placehold.co/200x200" },
      { title: "Дюшес 0.5л", price: "390 ₸", img: "https://placehold.co/200x200" },
      { title: "Бонаква 0.5л", price: "260 ₸", img: "https://placehold.co/200x200" },
      { title: "Аква 1л", price: "370 ₸", img: "https://placehold.co/200x200" },
    ],
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
        <MainMenu />
        <main style={{ flex: 1, padding: "20px" }}>
          <PromoSlider />
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
      <Footer />
    </>
  );
}
