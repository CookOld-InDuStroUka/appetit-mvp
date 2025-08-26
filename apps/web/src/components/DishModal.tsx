// components/DishCard.tsx
import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "./CartContext";

type Dish = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
  label?: "новинка" | "хит";
  stickerUrl?: string;
};

type Props = { dish: Dish; onClick: () => void };

const NAME_TO_ID: Record<string, string> = {
  // ==== уже были ====
  "комбо для одного": "combo-dlya-odnogo",
  "комбо для двоих": "combo-dlya-dvoih",
  "комбо для компании": "combo-dlya-kompanii",
  "фирменная средняя шаурма": "firmennaya-srednyaya-shaurma",
  "фирменная большая шаурма": "firmennaya-bolshaya-shaurma",
  "классическая средняя шаурма": "klassicheskaya-srednyaya-shaurma",
  "классическая большая шаурма": "klassicheskaya-bolshaya-shaurma",
  "донер с курицей": "doner-s-kuricej",
  "хот-дог": "hot-dog",

  // ==== новые (горячие блюда) ====
  "донер с говядиной": "doner-s-govyadinoj",
  "куриная большая шаурма": "kurinaya-bolshaya-shaurma",
  "мраморная большая шаурма": "mramornaya-bolshaya-shaurma",

  // ==== снеки ====
  "наггетсы": "naggetsy",
  "фри": "fri",
  "чебурек": "cheburek",
  "шекер": "sheker",
  "дольки": "dolki",

  // ==== соусы ====
  "перчик острый 15г": "perchik-ostryj-15g",
  "соус барбекю 30г": "sous-barbekyu-30g",
  "соус горчичный 30г": "sous-gorchichnyj-30g",
  "соус острый 30г": "sous-ostryj-30g",
  "соус сырный 30г": "sous-syrnyj-30g",
  "соус томатный 30г": "sous-tomatnyj-30g",
  "соус чесночный 30г": "sous-chesnochnyj-30g",

  // ==== напитки ====
  "айран тет": "ajran-tet",
  "асу 05л": "asu-0-5l",
  "асу 1л": "asu-1l",
  "горилла 05л": "gorilla-0-5l",
  "дада 1л": "dada-1l",
  "лавина 05л": "lavina-0-5l",
  "липтон чай 05л": "lipton-chaj-0-5l",
  "липтон чай 1л": "lipton-chaj-1l",
  "морс смородина 03л": "mors-smorodina-0-3l",
  "морс смородина 05л": "mors-smorodina-0-5l",
  "пепси 05л": "pepsi-0-5l",
  "пепси 15л": "pepsi-1-5l",
  "пепси 1л": "pepsi-1l",
  "сок дадо 02л": "sok-dado-0-2l",
  "сок лимонный 03л": "sok-limonnyj-0-3l",
  "сок лимонный 10л": "sok-limonnyj-1-0l",
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'>
     <rect width='100%' height='100%' fill='#ffffff'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
           fill='#9ca3af' font-size='20' font-family='system-ui'>Нет фото</text>
   </svg>`
)}`;

const nfmt = new Intl.NumberFormat("ru-RU");

export default function DishCard({ dish, onClick }: Props) {
  const { addItem } = useCart();

  const norm = normalize(dish.name);
  const fileId = NAME_TO_ID[norm] ?? slugify(dish.name);
  const candidates = [dish.imageUrl, `/dishes/${fileId}.webp`, `/dishes/${fileId}.jpg`, FALLBACK].filter(
    Boolean
  ) as string[];

  const [imgIdx, setImgIdx] = useState(0);
  const src: string = candidates[Math.min(imgIdx, candidates.length - 1)];
  const price = `${nfmt.format(dish.minPrice ?? dish.basePrice)} ₸`;

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.basePrice,
      imageUrl: src,
      qty: 1,
    });
  };

  return (
    <article className="card" onClick={onClick} role="button" tabIndex={0}>
      <div className="media">
        <Image
          src={src}
          alt={dish.name}
          width={800}
          height={600}
          sizes="(max-width: 768px) 50vw, 280px"
          style={{ height: "100%", width: "auto", objectFit: "contain" }}
          onError={() => setImgIdx(i => Math.min(i + 1, candidates.length - 1))}
        />
      </div>

      <h4 className="title">{dish.name}</h4>
      {dish.description && <p className="desc">{dish.description}</p>}

      <div className="row">
        <div className="price">{price}</div>
        <button type="button" className="btnAdd" onClick={handleAdd} aria-label="Добавить">
          +
        </button>
      </div>

      <style jsx>{`
        .card {
          width: 100%;
          background: #fff;
          border-radius: 12px;
          padding: 12px;
          border: 1px solid #eef2f7;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
          transition: box-shadow 0.15s ease, transform 0.1s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .card:hover {
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
          transform: translateY(-1px);
        }

        .media {
          position: relative;
          width: 100%;
          height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-bottom: 1px solid rgba(17, 24, 39, 0.08);
          overflow: hidden;
        }

        .title {
          margin: 10px 2px 4px;
          color: #0f172a;
          font-weight: 700;
          font-size: 15px;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .desc {
          color: #6b7280;
          font-size: 12px;
          line-height: 1.25;
          margin: 0 2px 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 28px;
        }

        .row {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .price {
          font-weight: 800;
          font-size: 15px;
          color: #0f172a;
        }

        .btnAdd {
          background: #2b6cf8;
          color: #fff;
          border: 0;
          border-radius: 8px;
          width: 36px;
          height: 28px;
          display: grid;
          place-items: center;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          transition: filter 0.12s, transform 0.1s;
        }
        .btnAdd:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        .btnAdd:active {
          transform: translateY(0);
        }
      `}</style>
    </article>
  );
}
