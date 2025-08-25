import React, { useEffect, useState } from "react";
import DishCard from "../components/DishCard";
import DishModal from "../components/DishModal";
import Header from "../components/Header";
import MainMenu from "../components/MainMenu";
import Footer from "../components/Footer";
import PromoSlider from "../components/PromoSlider";
import MobileMenu from "../components/MobileMenu";
import { useDelivery } from "../components/DeliveryContext";

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
        <main
          style={{
            flex: 1,
            padding: "20px",
            boxSizing: "border-box",
            minWidth: 0,
            overflowX: "hidden",
          }}
        >
          <PromoSlider />
          <MobileMenu />

          {sections.map((sec) => (
            <section key={sec.name} id={sec.name} className="section">
              <h2 className="section-title">{sec.name}</h2>

              {sec.dishes.length > 0 && (
                <div className="cards-grid">
                  {sec.dishes.map((item) => (
                    <DishCard
                      key={item.id}
                      dish={item}
                      onClick={() => setSelectedDish(item)}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}

          <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
        </main>
      </div>
      <Footer />

      <style jsx>{`
        /* -------- настраиваемые переменные -------- */
        :global(:root) {
          --card-min: 280px;  /* минимальная ширина карточки (уменьшишь — поместится больше) */
          --gap-x: 22px;      /* горизонтальный зазор между карточками */
          --gap-y: 20px;      /* вертикальный зазор между рядами */
        }
        /* ----------------------------------------- */

        .section { margin-bottom: 28px; }
        .section-title {
          margin: 0 0 12px;
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
        }

        /* Карточки равномерно занимают строку: 3 колонки минимум, без «пропасти» справа.
           minmax(...) не позволяет ужимать менее --card-min, зато растягивает до 1fr. */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(var(--card-min), 1fr));
          column-gap: var(--gap-x);
          row-gap: var(--gap-y);
          align-items: start;
        }

        /* На средних экранах — 2 колонки */
        @media (max-width: 1200px) {
          .cards-grid { grid-template-columns: repeat(2, minmax(var(--card-min), 1fr)); }
        }

        /* На мобиле — одна колонка */
        @media (max-width: 700px) {
          .cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
