import React, { useMemo, useState } from "react";
import { useCart } from "./CartContext";

type Dish = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
  status?: { name: string; color: string };
  category?: string;
};

type Props = { dish: Dish; onClick: () => void; size?: "sm" | "md" | "lg" };

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
  "донер с говядиной": "doner-s-govyadinoj",
  "куриная большая шаурма": "kurinaya-bolshaya-shaurma",
  "мраморная большая шаурма": "mramornaya-bolshaya-shaurma",
  "наггетсы": "naggetsy",
  "фри": "fri",
  "чебурек": "cheburek",
  "шекер": "sheker",
  "дольки": "dolki",
  "хот-дог": "hot-dog",
  "морс смородина 03л": "mors-smorodina-0-3l",
  "морс смородина 05л": "mors-smorodina-0-5l",
  "пепси 05л": "pepsi-0-5l",
  "пепси 1л": "pepsi-1l",
  "перчик острый 15г": "perchik-ostryj-15",
  "соус барбекю 30г": "sous-barbekyu-30g",
  "соус горчичный 30г": "sous-gorchichnyj-30g",
  "соус острый 30г": "sous-ostryj-30g",
  "соус сырный 30г": "sous-syrnyj-30g",
  "соус томатный 30г": "sous-tomatnyj-30g",
  "соус чесночный 30г": "sous-chesnochnyj-30g",

  // ==== добавлено: напитки/кофе ====
  "айран tet": "airan-tet",
  "айран тет": "airan-tet",
  "airan tet": "airan-tet",

  "асу 05л": "asu-0-5l",
  "асу 1л": "asu-1l",

  "горилла 05л": "gorilla-0-5l",

  "дада 1л": "dada-1l",
  "лавина 05л": "lavina-0-5l",

  "липтон чай 05л": "lipton-chaj-0-5l",
  "липтон 05л": "lipton-chaj-0-5l",
  "липтон чай 1л": "lipton-chaj-1l",
  "липтон 1л": "lipton-chaj-1l",

  // синонимы под «Пиала», ID не меняем
  "пиала 05л": "lipton-chaj-0-5l",
  "пиала 1л": "lipton-chaj-1l",

  "пепси 15л": "pepsi-1-5l",

  "сок дадо 02л": "sok-dado-0-2l",
  "сок лимонный 03л": "sok-limonnyj-0-3l",
  "сок лимонный 1л": "sok-limonnyj-1-0l",
  "сок лимонный 10л": "sok-limonnyj-1-0l",

  "американо": "americano",
  "латте": "latte",
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

export default function DishCard({ dish, onClick, size = "md" }: Props) {
  const { addItem } = useCart();

  // показываем Пиала вместо Липтон чай (ID не трогаем)
  const displayName = useMemo(() => {
    const n = normalize(dish.name);
    if (n.startsWith("липтон чай")) {
      return dish.name.replace(/^\s*липтон\s*чай/iu, "Пиала");
    }
    return dish.name;
  }, [dish.name]);

  const fileId = useMemo(() => {
    const norm = normalize(dish.name);              // важно: используем ОРИГИНАЛ для ID
    return NAME_TO_ID[norm] ?? slugify(dish.name);
  }, [dish.name]);

  const fromApi = useMemo(() => {
    const u = dish.imageUrl || "";
    if (!u) return undefined;
    if (u.startsWith("http") || u.startsWith("/")) return u;
    return `/${u}`;
  }, [dish.imageUrl]);

  const candidates = useMemo(
    () =>
      [
        `/dishes/${fileId}.jpg`,
        `/dishes/${fileId}.jpeg`,
        `/dishes/${fileId}.png`,
        fromApi,
        FALLBACK,
      ].filter(Boolean) as string[],
    [fileId, fromApi]
  );

  const [imgIdx, setImgIdx] = useState(0);
  const src = candidates[Math.min(imgIdx, candidates.length - 1)];
  const price = `${nfmt.format(dish.minPrice ?? dish.basePrice)} ₸`;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id: dish.id, dishId: dish.id, name: displayName, price: dish.basePrice, imageUrl: src, qty: 1, category: dish.category });
  };

  return (
    <article className={`card card--${size}`} onClick={onClick} role="button" tabIndex={0}>
      {dish.status && (
        <span className="status" style={{ background: dish.status.color }}>
          {dish.status.name}
        </span>
      )}
      <div className="media">
        <img
          src={src}
          alt={displayName}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={() => setImgIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
        />
      </div>

      <h4 className="title">{displayName}</h4>
      {dish.description && <p className="desc">{dish.description}</p>}

      <div className="row">
        <div className="price">{price}</div>
        <button className="btnAdd" onClick={handleAdd} aria-label="Добавить">+</button>
      </div>

      <style jsx>{`
        .card{
          --pad: 14px;
          --rad: 14px;
          --media-h: 200px;
          --fs-title: 15px;
          --fs-desc: 12px;
          --fs-price: 15px;
          --btn-w: 34px;
          --btn-h: 28px;

          width: 100%;
          background:#fff;
          border-radius: var(--rad);
          padding: var(--pad);
          border:1px solid #e9eef5;
          box-shadow: 0 6px 14px rgba(18,24,40,.06);
          transition: box-shadow .15s ease, transform .08s ease;
          cursor:pointer;
          display:flex;
          flex-direction:column;
          position:relative;
        }
        .card:hover{ box-shadow:0 10px 20px rgba(18,24,40,.10); transform:translateY(-1px); }

        .card--sm{
          --pad: 12px; --rad: 12px; --media-h: 180px;
          --fs-title: 14px; --fs-desc: 11.5px; --fs-price: 14px;
          --btn-w: 32px; --btn-h: 26px;
        }
        .card--md{
          --pad: 14px; --rad: 14px; --media-h: 200px;
          --fs-title: 15px; --fs-desc: 12px; --fs-price: 15px;
          --btn-w: 34px; --btn-h: 28px;
        }
        .card--lg{
          --pad: 16px; --rad: 16px; --media-h: 230px;
          --fs-title: 16.5px; --fs-desc: 13px; --fs-price: 16px;
          --btn-w: 40px; --btn-h: 32px;
        }

        .media{
          position:relative;
          width:100%;
          height: var(--media-h);
          display:flex; align-items:center; justify-content:center;
          background:#fff;
          border-bottom:1px solid rgba(17,24,39,.07);
          overflow:hidden;
        }

        .status{
          position:absolute;
          top:8px;
          left:8px;
          z-index:1;
          padding:2px 6px;
          border-radius:4px;
          font-size:12px;
          font-weight:700;
          color:#fff;
        }

        .title{
          margin:12px 2px 6px;
          color:#0f172a;
          font-weight:700;
          font-size: var(--fs-title);
          line-height:1.25;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
          min-height: 38px;
        }
        .desc{
          color:#6b7280;
          font-size: var(--fs-desc);
          line-height:1.25;
          margin:0 2px 10px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
          min-height:28px;
        }

        .row{
          margin-top:auto;
          display:flex; align-items:center; justify-content:space-between; gap:10px;
        }
        .price{ font-weight:700; font-size: var(--fs-price); color:#0f172a; }

        .btnAdd{
          background:#2b6cf8; color:#fff; border:0; border-radius:10px;
          width: var(--btn-w); height: var(--btn-h);
          display:grid; place-items:center;
          font-size: 16px;
          line-height:1; cursor:pointer;
          transition:filter .12s, transform .08s;
        }
        .btnAdd:hover{ filter:brightness(1.06); transform:translateY(-1px); }
        .btnAdd:active{ transform:translateY(0); }
      `}</style>
    </article>
  );
}
