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
  "комбо для одного": "combo-dlya-odnogo",
  "комбо для двоих": "combo-dlya-dvoih",
  "комбо для компании": "combo-dlya-kompanii",
  "фирменная средняя шаурма": "firmennaya-srednyaya-shaurma",
  "фирменная большая шаурма": "firmennaya-bolshaya-shaurma",
  "классическая средняя шаурма": "klassicheskaya-srednyaya-shaurma",
  "классическая большая шаурма": "klassicheskaya-bolshaya-shaurma",
  "донер с курицей": "doner-s-kuricej",
  "хот-дог": "hot-dog",
};

const normalize = (s: string) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{Letter}\p{Number}\s-]+/gu, "").replace(/\s+/g, " ").trim();

const slugify = (s: string) =>
  s.toLowerCase().replace(/ё/g, "e").replace(/[^a-z0-9\s-]+/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");

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
  const candidates = [dish.imageUrl, `/dishes/${fileId}.webp`, `/dishes/${fileId}.jpg`, FALLBACK].filter(Boolean) as string[];

  const [imgIdx, setImgIdx] = useState(0);
  const src = candidates[Math.min(imgIdx, candidates.length - 1)];

  const base = nfmt.format(dish.basePrice) + " ₸";
  const min = dish.minPrice && dish.minPrice < dish.basePrice ? nfmt.format(dish.minPrice) + " ₸" : null;
  const priceLabel = min ? `от ${min}` : base;

  // ⬇ NEW LAYOUT
  return (
    <article className="card" onClick={onClick} role="button" tabIndex={0}>
      {/* Верх: крупное фото на белом фоне, без серой плитки */}
      <div className="media">
        <Image
          src={src}
          alt={dish.name}
          fill
          sizes="280px"
          style={{ objectFit: "contain" }}
          onError={() => setImgIdx((i) => Math.min(i + 1, candidates.length - 1))}
        />
      </div>

      {/* Низ: текстовый блок компактный */}
      <div className="body">
        <h4 className="title">{dish.name}</h4>
        {dish.description && <p className="desc">{dish.description}</p>}
        <div className="price">{priceLabel}</div>
      </div>

      <style jsx>{`
        .card{
          background:#fff;
          border:1px solid rgba(17,24,39,.12);
          border-radius:12px;
          overflow:hidden;
          transition:box-shadow .15s ease, transform .12s ease;
        }
        .card:hover{ box-shadow:0 6px 20px rgba(2,6,23,.06); transform:translateY(-1px); }

        /* Фото-блок как на примере: воздух, паддинги, тень у предмета */
        .media{
          position:relative;
          width:100%;
          height:190px;              /* подгони 180–200 по вкусу */
          background:#fff;           /* БЕЗ серого фона */
          padding:16px;              /* рамка-воздух вокруг изображения */
          box-sizing:border-box;
          border-bottom:1px solid rgba(17,24,39,.06);
        }
        :global(.card .media img){
          object-fit:contain;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,.10)); /* аккуратная тень как на рефе */
        }

        .body{ padding:12px 14px 14px; }

        .title{
          margin:0 0 6px;
          color:#111827;
          font-weight:800;
          font-size:16px;
          line-height:1.2;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .desc{
          color:#6b7280;
          font-size:14px;
          line-height:1.25;
          margin:0 0 10px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
          min-height:36px; /* чтобы ряд карточек ровно выравнивался */
        }
        .price{
          color:#111827;
          font-size:15px;
          font-weight:800;
        }

        /* Если нужно ещё компактнее — уменьши высоту media и padding у body */
      `}</style>
    </article>
  );
}
