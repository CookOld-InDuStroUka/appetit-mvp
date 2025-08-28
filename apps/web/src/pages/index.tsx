import React, { useEffect, useState } from "react";
import DishCard from "../components/DishCard";
import DishModal from "../components/DishModal";
import Header from "../components/Header";
import MainMenu, { MenuItem } from "../components/MainMenu";
import Footer from "../components/Footer";
import PromoSlider from "../components/PromoSlider";
import { PromoSlide } from "../types/promo";
import MobileMenu from "../components/MobileMenu";
import { useDelivery } from "../components/DeliveryContext";
import { useLang } from "../components/LangContext";

// use local API if the env variable is missing so the menu still loads
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type DishDTO = {
  id: string;
  categoryId?: string;
  category?: string;
  name: string;
  nameKz?: string;
  description?: string;
  descriptionKz?: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
  status?: { name: string; color: string };
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();

// скрыть «Пепси 1,5л» в любом написании
const isPepsi15 = (name: string) => {
  const n = normalize(name);
  return n === "пепси 15л" || n === "pepsi 15l";
};

// «Липтон чай …» → «Пиала …» (только текстовое отображение)
const toPiala = (name: string) =>
  /^\s*липтон\s*чай/iu.test(name) ? name.replace(/^\s*липтон\s*чай/iu, "Пиала") : name;

export default function Home() {
  const [sections, setSections] = useState<
    { name: string; slug: string; dishes: DishDTO[] }[]
  >([]);
  const [selectedDish, setSelectedDish] = useState<DishDTO | null>(null);
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const { branch } = useDelivery();
  const { lang } = useLang();

  // грузим категории и блюда
  useEffect(() => {
    const load = async () => {
      try {
        const categories = await fetch(`${API_BASE}/categories`).then((r) =>
          r.json()
        );

        const items = await Promise.all(
          categories.map((c: any) =>
            fetch(`${API_BASE}/dishes?categoryId=${c.id}&branchId=${branch}`)
              .then((r) => r.json())
              .then((dishes: DishDTO[]) => ({
                name: lang === "kz" && c.nameKz ? c.nameKz : c.name,
                slug: c.slug, // стабильный якорь
                dishes: dishes
                  .filter((d) => !isPepsi15(d.name)) // убрать Пепси 1,5л
                  .map((d) => ({
                    ...d,
                    category: c.slug,
                    name: toPiala(d.name), // Липтон → Пиала (ID не меняем)
                  })),
              }))
          )
        );

        setSections(items.filter((sec) => sec.dishes.length > 0));
      } catch {
        setSections([]);
      }
    };
    load();
  }, [branch, lang]);

  // промо-слайды из localStorage (если есть)
  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("promoSlides")
        : null;
    if (!saved) return;
    try {
      setSlides(JSON.parse(saved));
    } catch {
      setSlides([]);
    }
  }, []);

  return (
    <>
      <Header />
      <div className="page-layout">
        <MainMenu
          items={sections.map<MenuItem>((sec) => ({
            title: sec.name,
            href: `#${sec.slug}`,
          }))}
        />

        <main className="main">
          <MobileMenu items={sections.map((sec) => sec.name)} />

          <PromoSlider slides={slides.length ? slides : undefined} />

          {sections.map((sec) => (
            <section key={sec.slug} id={sec.slug} className="sec">
              <h2 className="sec-title">{sec.name}</h2>

              {!!sec.dishes.length && (
                <div className="grid-cards">
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

          <p className="about">
            Добро пожаловать в APPETIT – сеть стрит-фуд кафе в
            Усть-Каменогорске. Мы готовим сочную шаурму, донеры, хот-доги,
            картофель фри и другие закуски с доставкой на дом или в офис.
            Выбирай любимое блюдо, добавляй соусы и напитки, оформляй заказ
            онлайн – и уже через 30 минут наслаждайся вкусом! Работаем ежедневно
            с 10:00 до 01:30. Быстро. Вкусно. С любовью. APPETIT – это твоя
            шаурма №1 в городе.
          </p>

          <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
        </main>
      </div>

      <Footer />

      {/* ЛОКАЛЬНЫЕ СТИЛИ страницы */}
      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        } /* плавная прокрутка к якорям */

        .page-layout {
          display: flex;
          gap: 16px;
          max-width: 1240px;
          margin: 0 auto;
          padding: 10px 16px 32px;
          box-sizing: border-box;
        }

        .main {
          flex: 1;
          padding: 12px 4px 32px;
          min-width: 0;
          overflow-x: hidden;
        }

        .sec {
          margin: 28px 0 36px;
          scroll-margin-top: 90px; /* отступ при фикс. шапке/меню */
        }
        .sec-title {
          margin: 0 0 14px;
          font-size: 24px;
          font-weight: 800;
        }

        /* Плотная сетка карточек */
        .grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 14px;
        }

        .about {
          margin-top: 40px;
          color: #475569;
        }

        @media (max-width: 900px) {
          .page-layout {
            gap: 8px;
            padding: 8px 10px 24px;
          }
          .grid-cards {
            grid-template-columns: repeat(
              auto-fill,
              minmax(200px, 1fr)
            );
            gap: 12px;
          }
          .sec-title {
            font-size: 22px;
          }
        }
        @media (max-width: 560px) {
          .grid-cards {
            grid-template-columns: repeat(
              auto-fill,
              minmax(170px, 1fr)
            );
          }
        }
      `}</style>
    </>
  );
}
