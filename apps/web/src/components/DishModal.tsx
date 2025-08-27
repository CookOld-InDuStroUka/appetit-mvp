// components/DishModal.tsx
import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useCart } from "./CartContext";

type Dish = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
};

type Props = { dish: Dish | null; onClose: () => void };

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
  "донер с говядиной": "doner-s-govyadinoj",
  "куриная большая шаурма": "kurinaya-bolshaya-shaurma",
  "мраморная большая шаурма": "mramornaya-bolshaya-shaurma",
  "наггетсы": "naggetsy",
  "фри": "fri",
  "чебурек": "cheburek",
  "шекер": "sheker",
  "дольки": "dolki",
  "перчик острый 15г": "perchik-ostryj-15g",
  "соус барбекю 30г": "sous-barbekyu-30g",
  "соус горчичный 30г": "sous-gorchichnyj-30g",
  "соус острый 30г": "sous-ostryj-30g",
  "соус сырный 30г": "sous-syrnyj-30g",
  "соус томатный 30г": "sous-tomatnyj-30g",
  "соус чесночный 30г": "sous-chesnochnyj-30g",
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
  s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
    .replace(/\s+/g, " ").trim();

const slugify = (s: string) =>
  s.toLowerCase().replace(/ё/g, "e").replace(/[^a-z0-9\s-]+/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-");

const FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'>
     <rect width='100%' height='100%' fill='#fff'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
           fill='#9ca3af' font-size='20' font-family='system-ui'>Нет фото</text>
   </svg>`
)}`;

export default function DishModal({ dish, onClose }: Props) {
  const { addItem } = useCart();

  // модалка не монтируется без блюда — никакого падения на dish.name
  if (!dish) return null;

  const safeName = dish.name ?? "Без названия";
  const norm = useMemo(() => normalize(safeName), [safeName]);
  const mapOrSlug = useMemo(() => NAME_TO_ID[norm] ?? slugify(safeName), [norm, safeName]);

  // порядок поиска картинки: imageUrl → map/slug → id → fallback
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (dish.imageUrl) list.push(dish.imageUrl);
    list.push(`/dishes/${mapOrSlug}.webp`, `/dishes/${mapOrSlug}.jpg`);
    list.push(`/dishes/${dish.id}.webp`, `/dishes/${dish.id}.jpg`);
    list.push(FALLBACK);
    return list;
  }, [dish.imageUrl, dish.id, mapOrSlug]);

  const [imgIdx, setImgIdx] = useState(0);
  const src = candidates[Math.min(imgIdx, candidates.length - 1)];

  // Рендерим в body, чтобы гарантированно быть поверх всего
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Закрыть">×</button>

        <div className="media">
          <Image
            src={src}
            alt={safeName}
            width={1000}
            height={750}
            sizes="(max-width: 768px) 90vw, 720px"
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
            onError={() => setImgIdx(i => Math.min(i + 1, candidates.length - 1))}
          />
        </div>

        <h2 className="title">{safeName}</h2>
        {dish.description && <p className="desc">{dish.description}</p>}

        <div className="actions">
          <button
            className="add"
            onClick={() => addItem({ id: dish.id, name: safeName, price: dish.basePrice, imageUrl: src, qty: 1 })}
          >
            В корзину
          </button>
        </div>
      </div>

      <style jsx>{`
        .backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.35);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px; z-index: 9999;
        }
        .modal {
          width: min(980px, 100%);
          background: #fff; border-radius: 16px; padding: 16px 16px 20px; position: relative;
          box-shadow: 0 18px 60px rgba(0,0,0,.2);
        }
        .close {
          position: absolute; top: 8px; right: 8px;
          border: 0; background: #f1f5f9; width: 32px; height: 32px; border-radius: 999px; cursor: pointer;
          font-size: 20px; line-height: 1;
        }
        .media { margin: 8px 0 16px; }
        .title { margin: 0 0 6px; font-size: 24px; font-weight: 800; }
        .desc { color:#475569; margin:0 0 12px; }
        .actions { display:flex; justify-content:flex-end; }
        .add { background:#0f172a; color:#fff; border:0; padding:10px 16px; border-radius:10px; cursor:pointer; }
      `}</style>
    </div>,
    document.body
  );
}
