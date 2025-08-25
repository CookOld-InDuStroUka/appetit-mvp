import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "./CartContext";

type Dish = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;           // может прийти с бэка
  minPrice?: number;           // для "от 1690 ₸"
  basePrice: number;           // базовая цена
  label?: "новинка" | "хит";   // опционально
  stickerUrl?: string;         // маленькая круглая наклейка
};

type Props = { dish: Dish; onClick: () => void };

/* ======== МАПА ИМЁН ФАЙЛОВ ПО ID (правь только правую часть) ======== */
const dishImageMap: Record<string, string> = {
  // КОМБО
  "combo-dlya-odnogo": "/dishes/combo-dlya-odnogo.jpg",
  "combo-dlya-dvoih": "/dishes/combo-dlya-dvoih.jpg",
  "combo-dlya-kompanii": "/dishes/combo-dlya-kompanii.jpg",

  // ШАУРМА
  "firmennaya-srednyaya-shaurma": "/dishes/firmennaya-srednyaya-shaurma.jpg",
  "firmennaya-bolshaya-shaurma": "/dishes/firmennaya-bolshaya-shaurma.jpg",
  "klassicheskaya-srednyaya-shaurma": "/dishes/klassicheskaya-srednyaya-shaurma.jpg",
  "klassicheskaya-bolshaya-shaurma": "/dishes/klassicheskaya-bolshaya-shaurma.jpg",

  // ПРОЧЕЕ
  "doner-s-kuricej": "/dishes/doner-s-kuricej.jpg",
  "hot-dog": "/dishes/hot-dog.jpg",

  // добавляй ниже по образцу:
  // "my-dish-id": "/dishes/my-file.jpg",
};
/* ===================================================================== */

/** Заглушка, если ничего не нашлось/битое */
const FALLBACK = `data:image/svg+xml;utf8,${
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'>
       <rect width='100%' height='100%' fill='#f1f5f9'/>
       <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
             fill='#94a3b8' font-size='24' font-family='system-ui'>Нет фото</text>
     </svg>`
  )
}`;

const isPlaceholder = (u?: string) => !!u && /^https?:\/\/placehold\.co/i.test(u);
const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9а-я\- ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const nfmt = new Intl.NumberFormat("ru-RU");

export default function DishCard({ dish, onClick }: Props) {
  const { addItem } = useCart();

  // Порядок источников:
  // 1) imageUrl из API (если это не placehold.co)
  // 2) dishImageMap[id]
  // 3) /dishes/<id>.jpg
  // 4) /dishes/<slug(name)>.jpg
  // 5) FALLBACK
  const candidates = useMemo(() => {
    const arr: string[] = [];
    if (dish.imageUrl && !isPlaceholder(dish.imageUrl)) arr.push(dish.imageUrl);
    if (dishImageMap[dish.id]) arr.push(dishImageMap[dish.id]);
    arr.push(`/dishes/${dish.id}.jpg`);
    arr.push(`/dishes/${slugify(dish.name)}.jpg`);
    arr.push(FALLBACK);
    return arr;
  }, [dish.id, dish.name, dish.imageUrl]);

  const [idx, setIdx] = useState(0);
  const src = candidates[Math.min(idx, candidates.length - 1)];

  const priceText =
    dish.minPrice != null ? `от ${nfmt.format(dish.minPrice)} ₸` : `${nfmt.format(dish.basePrice)} ₸`;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id: dish.id, name: dish.name, price: dish.basePrice, imageUrl: src, qty: 1 });
  };

  return (
    <article className="card" onClick={onClick} role="button" tabIndex={0}>
      <div className="imgWrap">
        {dish.label && <span className={`chip chip--${dish.label}`}>{dish.label}</span>}

        <Image
          src={src}
          alt={dish.name}
          fill
          sizes="(max-width: 900px) 48vw, 280px"
          style={{ objectFit: "contain" }}
          onError={() => setIdx((i) => Math.min(i + 1, candidates.length - 1))}
        />

        {dish.stickerUrl && (
          <Image
            src={dish.stickerUrl}
            alt=""
            width={40}
            height={40}
            style={{ position: "absolute", right: 8, bottom: 8 }}
          />
        )}
      </div>

      <h4 className="title">{dish.name}</h4>
      {dish.description && <p className="desc">{dish.description}</p>}

      <div className="row">
        <div className="price">{priceText}</div>
        <button className="add" onClick={handleAdd} aria-label="Добавить">
          +
        </button>
      </div>

      <style jsx>{`
        .card {
          background: #fff;
          border: 1px solid #eef2f7;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          transition: box-shadow 0.2s, transform 0.15s, border-color 0.2s;
          cursor: pointer;
        }
        .card:hover {
          border-color: #e2e8f0;
          box-shadow: 0 8px 24px rgba(2, 6, 23, 0.08);
          transform: translateY(-1px);
        }

        .imgWrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(180deg, #f8fafc, #f1f5f9);
        }

        .chip {
          position: absolute;
          left: 8px;
          top: 8px;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: #111827;
          background: #fde68a;
        }
        .chip--новинка {
          background: #a5f3fc;
        }
        .chip--хит {
          background: #fca5a5;
        }

        .title {
          margin: 10px 0 4px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .desc {
          color: #64748b;
          font-size: 14px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 36px;
        }

        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
        }
        .price {
          font-weight: 700;
          color: #0f172a;
        }
        .add {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 0;
          background: #22c55e;
          color: #fff;
          font-size: 22px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: transform 0.15s, filter 0.15s;
        }
        .add:hover {
          filter: brightness(1.05);
          transform: scale(1.05);
        }
      `}</style>
    </article>
  );
}
