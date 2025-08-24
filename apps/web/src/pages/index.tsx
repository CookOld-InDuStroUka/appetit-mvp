import React, { useEffect, useState } from "react";
import DishCard from "../components/DishCard";
import DishModal from "../components/DishModal";
import Header from "../components/Header";
import MainMenu from "../components/MainMenu";
import Footer from "../components/Footer";
import PromoSlider from "../components/PromoSlider";
import MobileMenu from "../components/MobileMenu";
import { useDelivery } from "../components/DeliveryContext";

// use local API if the env variable is missing so the menu still loads
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type DishDTO = {
  id: string;
  categoryId?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
};

export default function Home() {
  const [sections, setSections] = useState<{ name: string; dishes: DishDTO[] }[]>([]);
  const [selectedDish, setSelectedDish] = useState<DishDTO | null>(null);
  const { branch } = useDelivery();

  useEffect(() => {
    const load = async () => {
      try {
        const categories = await fetch(`${API_BASE}/categories`).then((r) => r.json());
        const items = await Promise.all(
          categories.map((c: any) =>
            fetch(`${API_BASE}/dishes?categoryId=${c.id}&branchId=${branch}`)
              .then((r) => r.json())
              .then((dishes: DishDTO[]) => ({ name: c.name, dishes }))
          )
        );
        setSections(items.filter((sec) => sec.dishes.length > 0));
      } catch {
        setSections([]);
      }
    };
    load();
  }, [branch]);

  return (
    <>
      <Header />
      <div className="page-layout">
        <MainMenu />
        <main style={{ flex: 1, padding: "20px", boxSizing: "border-box" }}>
          <PromoSlider />
          <MobileMenu />
          {sections.map((sec) => (
            <section key={sec.name} id={sec.name} style={{ marginBottom: "40px" }}>
              <h2 style={{ marginBottom: "20px" }}>{sec.name}</h2>
              {sec.dishes.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {sec.dishes.map((item) => (
                    <DishCard
                      key={item.id}
                      dish={item}
                      onClick={() => setSelectedDish(item)}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ))}
          <p style={{ marginTop: "40px" }}>
            Добро пожаловать в APPETIT – сеть стрит-фуд кафе в Усть-Каменогорске.
            Мы готовим сочную шаурму, донеры, хот-доги, картофель фри и другие
            закуски с доставкой на дом или в офис. Выбирай любимое блюдо, добавляй
            соусы и напитки, оформляй заказ онлайн – и уже через 30 минут
            наслаждайся вкусом! Работаем ежедневно с 10:00 до 01:30. Быстро.
            Вкусно. С любовью. APPETIT – это твоя шаурма №1 в городе.
          </p>
          <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
        </main>
      </div>
      <Footer />
    </>
  );
}
