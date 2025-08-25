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
};

type Props = {
  dish: Dish;
  onClick: () => void;
};

// встроенная «Нет фото» (без файлов в public)
const FALLBACK = `data:image/svg+xml;utf8,${
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'>
       <rect width='100%' height='100%' fill='#e5e5e5'/>
       <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
             fill='#777' font-size='18' font-family='system-ui'>Нет фото</text>
     </svg>`
  )
}`;

// если src с placehold.co — подменяем, чтобы next/image не падал
const sanitize = (src?: string, id?: string) => {
  if (!src) return `/dishes/${id}.jpg`;
  if (/^https?:\/\/placehold\.co/i.test(src)) return FALLBACK;
  return src;
};

const nfmt = new Intl.NumberFormat("ru-RU");

export default function DishCard({ dish, onClick }: Props) {
  const { addItem } = useCart();
  const [src, setSrc] = useState<string>(sanitize(dish.imageUrl, dish.id));

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: dish.id,
      name: dish.name,
      price: dish.basePrice,
      imageUrl: src,
      qty: 1,
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="dish-card"
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      style={{ padding: 12, borderRadius: 12, background: "#fff" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: 8,
          overflow: "hidden",
          background: "#eee",
        }}
      >
        <Image
          src={src}
          alt={dish.name}
          fill
          sizes="(max-width: 900px) 45vw, 320px"
          style={{ objectFit: "cover" }}
          onError={() => setSrc(FALLBACK)}
        />
      </div>

      <h4 style={{ margin: "10px 0 4px" }}>{dish.name}</h4>
      {dish.description && <p className="dish-card-desc">{dish.description}</p>}
      <p className="dish-card-price" style={{ fontWeight: 600 }}>
        {dish.minPrice
          ? `от ${nfmt.format(dish.minPrice)} ₸`
          : `${nfmt.format(dish.basePrice)} ₸`}
      </p>
      <button
        onClick={handleAdd}
        className="add-btn"
        style={{ marginTop: 8 }}
        aria-label="Добавить"
      >
        +
      </button>
    </div>
  );
}
