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
     <rect width='100%' height='100%' fill='#f3f4f6'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
           fill='#9ca3af' font-size='20' font-family='system-ui'>Нет фото</text>
   </svg>`
)}`;

const nfmt = new Intl.NumberFormat("ru-RU");

export default function DishCard({ dish, onClick }: Props) {
  const { addItem } = useCart();

  const norm = normalize(dish.name);
  const fileId = NAME_TO_ID[norm] ?? slugify(dish.name);
  const candidates = [`/dishes/${fileId}.jpg`, `/dishes/${fileId}.webp`, FALLBACK];

  const [imgIdx, setImgIdx] = useState(0);
  const src = candidates[Math.min(imgIdx, candidates.length - 1)];
  const price = `${nfmt.format(dish.minPrice ?? dish.basePrice)} ₸`;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id: dish.id, name: dish.name, price: dish.basePrice, imageUrl: src, qty: 1 });
  };

  return (
    <article className="card" onClick={onClick} role="button" tabIndex={0}>
      <div className="media">
        <Image
          src={src}
          alt={dish.name}
          fill
          sizes="300px"
          style={{ objectFit: "contain" }}
          onError={() => setImgIdx((i) => Math.min(i + 1, candidates.length - 1))}
        />
      </div>

      <h4 className="title">{dish.name}</h4>
      {dish.description && <p className="desc">{dish.description}</p>}

      <div className="row">
        <div className="price">{price}</div>
        <button className="btnAdd" onClick={handleAdd} aria-label="Добавить">+</button>
      </div>

      <style jsx>{`
        .card{
          width: 100%;              /* <- важно! карточка заполняет свой столбец полностью */
          background:#fff;
          border-radius:12px;
          padding:12px;
          border:1px solid #eef2f7;
          box-shadow:0 6px 16px rgba(15,23,42,.06);
          transition:box-shadow .15s ease, transform .1s ease;
          cursor:pointer;
        }
        .card:hover{ box-shadow:0 10px 22px rgba(15,23,42,.08); transform:translateY(-1px); }

        .media{
          position:relative;
          width:100%;
          height:150px;      /* при желании можно поджать до 140/130 */
          border-radius:10px;
          overflow:hidden;
          background:#fff;
        }
        .media::before, .media::after{ content:none !important; display:none !important; }

        .title{
          margin:10px 2px 4px;
          color:#0f172a;
          font-weight:700;
          font-size:15px;
          line-height:1.25;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .desc{
          color:#6b7280;
          font-size:12px;
          line-height:1.25;
          margin:0 2px 8px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
          min-height:28px;
        }

        .row{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .price{ font-weight:800; font-size:15px; color:#0f172a; }

        .btnAdd{
          background:#2b6cf8; color:#fff; border:0; border-radius:8px;
          width:36px; height:28px; display:grid; place-items:center;
          font-size:16px; line-height:1; cursor:pointer;
          transition:filter .12s, transform .1s;
        }
        .btnAdd:hover{ filter:brightness(1.05); transform:translateY(-1px); }
        .btnAdd:active{ transform:translateY(0); }
      `}</style>
    </article>
  );
}
