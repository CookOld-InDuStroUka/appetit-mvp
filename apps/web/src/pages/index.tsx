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

// ...твоя страница как есть сверху...

<style jsx>{`
  /* -------- настраиваемые переменные -------- */
  :global(:root) {
    --card-min: 220px;  /* ширина одной карточки (сделай 240/280 по вкусу) */
    --gap-x: 10px;      /* горизонтальный зазор */
    --gap-y: 18px;      /* вертикальный зазор */
  }
  /* ----------------------------------------- */

  .section { margin-bottom: 28px; }
  .section-title {
    margin: 0 0 12px;
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
  }

  /* ВАЖНО: вместо grid используем flex-wrap с фиксированной шириной ячеек.
     Карточки НЕ растягиваются, остаётся свободное место справа. */
  .cards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-y) var(--gap-x);
    align-items: stretch;
    justify-content: flex-start;   /* ничего не растягиваем */
  }

  /* фиксируем ширину карточки внутри контейнера, не трогая сам компонент */
  .cards-grid :global(.card) {
    flex: 0 0 var(--card-min);     /* ширина дорожки = --card-min */
    width: var(--card-min);
  }

  /* На мобилке — одна колонка (карточка всё равно фикс. ширины, так что делаем 100%) */
  @media (max-width: 700px) {
    .cards-grid { gap: 14px; }
    .cards-grid :global(.card) {
      flex: 1 1 100%;
      width: 100%;
    }
  }
`}</style>


    </>
  );
}
