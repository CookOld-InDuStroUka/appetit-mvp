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
    fetch(`${API_BASE}/menu?branchId=${branch}`)
      .then((r) => r.json())
      .then((data) => {
        // some deployments return categories and dishes separately instead of ready-made "menu"
        const menu: any[] = Array.isArray(data.menu)
          ? data.menu
          : (data.categories || []).map((c: any) => ({
              ...c,
              dishes: (data.dishes || []).filter((d: any) => d.categoryId === c.id),
            }));

        const map: Record<string, DishDTO[]> = {};
        menu.forEach((c: any) => {
          map[c.name] = c.dishes || [];
        });

        setSections([
          { name: "Комбо", dishes: map["Комбо"] || [] },
          { name: "Блюда", dishes: map["Блюда"] || [] },
          { name: "Закуски", dishes: map["Закуски"] || [] },
          { name: "Соусы", dishes: map["Соусы"] || [] },
          { name: "Напитки", dishes: map["Напитки"] || [] },
        ]);
      })
      .catch(() => {
        setSections([]);
      });
  }, [branch]);

  return (
    <>
      <Header />
      <div style={{ display: "flex", width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
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
          <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
        </main>
      </div>
      <Footer />
    </>
  );
}
