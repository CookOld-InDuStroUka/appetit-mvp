// components/DishModal.tsx
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "./CartContext";

type DishLight = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
};

type DishDetails = DishLight & {
  addons?: { id: string; name: string; price: number }[];
  exclusions?: { id: string; name: string }[];
};

type Props = { dish: DishLight | null; onClose: () => void };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

// Слуги ТОЛЬКО под реально лежащие файлы в /public/dishes
const NAME_TO_ID: Record<string, string> = {
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

  // файл без "g"
  "перчик острый 15г": "perchik-ostryj-15",
  "соус барбекю 30г": "sous-barbekyu-30g",
  "соус горчичный 30г": "sous-gorchichnyj-30g",
  "соус острый 30г": "sous-ostryj-30g",
  "соус сырный 30г": "sous-syrnyj-30g",
  "соус томатный 30г": "sous-tomatnyj-30g",
  "соус чесночный 30г": "sous-chesnochnyj-30g",
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
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'>
     <rect width='100%' height='100%' fill='#ffffff'/>
     <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
           fill='#94a3b8' font-size='48' font-family='system-ui'>Нет фото</text>
   </svg>`
)}`;

const fmt = new Intl.NumberFormat("ru-RU");

export default function DishModal({ dish, onClose }: Props) {
  const [details, setDetails] = useState<DishDetails | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const { addItem } = useCart();

  // грузим детали
  useEffect(() => {
    if (!dish) return;
    setSelectedAddons([]);
    setExcluded([]);
    setQty(1);
    setImgIdx(0);

    fetch(`${API_BASE}/dishes/${dish.id}`)
      .then((r) => r.json())
      .then((d: DishDetails) => setDetails(d))
      .catch(() => setDetails(null));
  }, [dish]);

  // ESC для закрытия
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [onClose]);

  if (!dish) return null;

  const norm = normalize(dish.name);
  const forcedId = NAME_TO_ID[norm] ?? slugify(dish.name);

  // imageUrl из API может прийти как "dishes/xxx.jpg"
  const primaryUrl =
    dish.imageUrl && (dish.imageUrl.startsWith("http") || dish.imageUrl.startsWith("/"))
      ? dish.imageUrl
      : dish.imageUrl
      ? `/${dish.imageUrl}`
      : undefined;

  // ЛОКАЛЬНЫЕ изображения — впереди!
  const candidates = [
    `/dishes/${forcedId}.webp`,
    `/dishes/${forcedId}.jpg`,
    `/dishes/${forcedId}.jpeg`,
    `/dishes/${forcedId}.png`,
    primaryUrl,
    FALLBACK,
  ].filter(Boolean) as string[];

  const imgSrc = candidates[Math.min(imgIdx, candidates.length - 1)];

  const toggleAddon = (id: string) =>
    setSelectedAddons((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleExcluded = (id: string) =>
    setExcluded((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = details?.addons?.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const base = details?.basePrice ?? dish.basePrice;
  const unitTotal = base + addonsTotal;
  const totalForQty = unitTotal * qty;

  const selectedAddonObjs: { id: string; name: string; price: number }[] =
    details?.addons?.filter((a) => selectedAddons.includes(a.id)) ?? [];
  const selectedExcludedNames =
    details?.exclusions?.filter((e) => excluded.includes(e.id)).map((e) => e.name) ?? [];

  return (
    <div className="dm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dm" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="dm-close" aria-label="Закрыть">×</button>

        <div className="dm-head">
          <div className="dm-figure">
            <Image
              src={imgSrc}
              alt={dish.name}
              fill
              sizes="(max-width: 860px) 100vw, 480px"
              style={{ objectFit: "contain" }}
              onError={() => setImgIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
              priority
              unoptimized
            />
          </div>

          <div className="dm-info">
            <h2 className="dm-title">{dish.name}</h2>
            <div className="dm-price-top">{fmt.format(base)} ₸</div>
            {(details?.description ?? dish.description) && (
              <p className="dm-desc">{details?.description ?? dish.description}</p>
            )}
          </div>
        </div>

        {details?.addons?.length ? (
          <>
            <h4 className="dm-sub">Добавь вкуса</h4>
            <p className="dm-hint">Максимум: 12</p>
            <div className="dm-grid dm-grid--addons">
              {details.addons.map((o) => {
                const active = selectedAddons.includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleAddon(o.id)}
                    className={`dm-opt-card ${active ? "is-active" : ""}`}
                  >
                    <div className="dm-opt-name">{o.name}</div>
                    <div className="dm-opt-cta">+{fmt.format(o.price)} ₸</div>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {details?.exclusions?.length ? (
          <>
            <h4 className="dm-sub">Убери лишнее</h4>
            <div className="dm-grid">
              {details.exclusions.map((ing) => {
                const active = excluded.includes(ing.id);
                return (
                  <button
                    key={ing.id}
                    onClick={() => toggleExcluded(ing.id)}
                    className={`dm-opt ${active ? "is-active" : ""}`}
                  >
                    {ing.name}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        <div className="dm-footer">
          <div className="dm-qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Уменьшить">−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="Увеличить">+</button>
          </div>

          <div className="dm-total">{fmt.format(totalForQty)} ₸</div>

          <button
            onClick={() =>
              addItem({
                id: dish.id + JSON.stringify(selectedAddons) + JSON.stringify(selectedExcludedNames),
                name: dish.name,
                price: unitTotal,
                imageUrl: imgSrc,
                qty,
                // если CartItem не знает про эти поля — игнорим TS
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                addons: selectedAddonObjs.map((a) => ({ name: a.name, price: a.price })),
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                excluded: selectedExcludedNames,
              })
            }
            className="dm-add"
          >
            В корзину
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes dmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dmZoomIn {
          from { opacity: 0; transform: translateY(8px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dm-backdrop{
          position: fixed; inset: 0;
          background: rgba(15,23,42,.55);
          display: grid; place-items: center;
          padding: 16px; z-index: 1000;
          animation: dmFadeIn .18s ease-out both;
        }
        .dm{
          width: min(920px, 100%);
          max-height: 92vh; overflow-y: auto; scrollbar-gutter: stable both-edges;
          background: #fff; color: #0f172a; border-radius: 16px;
          padding: 16px 16px 80px; box-shadow: 0 20px 60px rgba(2,6,23,.3);
          position: relative; animation: dmZoomIn .22s cubic-bezier(.2,.7,.2,1) both;
        }
        @supports not (scrollbar-gutter: stable both-edges){ .dm{ overflow-y: scroll; } }
        @media (prefers-reduced-motion: reduce){ .dm-backdrop, .dm{ animation: none !important; } }

        .dm-close{
          position: sticky; top: 0; margin-left: auto;
          display: inline-grid; place-items: center;
          width: 36px; height: 36px; border-radius: 9999px;
          background: #f1f5f9; border: 0; color: #0f172a; font-size: 20px; cursor: pointer;
          float: right;
        }

        .dm-head{ display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; align-items: start; }
        .dm-figure{ position: relative; width: 100%; aspect-ratio: 3/2; border-radius: 12px; overflow: hidden; }
        .dm-info{ padding-top: 6px; }
        .dm-title{ margin: 0 0 6px; font-size: 28px; font-weight: 800; line-height: 1.15; }
        .dm-price-top{ font-weight: 800; margin-bottom: 8px; }
        .dm-desc{ margin: 0; color: #475569; }

        .dm-sub{ margin: 18px 2px 6px; font-weight: 800; }
        .dm-hint{ margin: -2px 2px 10px; color:#7c8aa0; font-size:12px; }

        .dm-grid{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .dm-grid--addons{ grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; }

        .dm-opt-card{
          box-sizing: border-box; min-height: 88px; display:flex; flex-direction:column; gap:8px;
          padding:10px; border-radius:12px; border:1px solid #e2e8f0; background:#fff; text-align:left;
          cursor:pointer; transition:border-color .15s, box-shadow .15s, background .15s;
        }
        .dm-opt-card:hover{ border-color:#cbd5e1; background:#f8fafc; }
        .dm-opt-card.is-active{ border-color:#22c55e; box-shadow:0 0 0 2px rgba(34,197,94,.15) inset; }
        .dm-opt-name{ color:#0f172a; font-size:14px; line-height:1.15; min-height:34px;
                      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .dm-opt-cta{ margin-top:auto; display:block; width:100%; text-align:center; padding:8px 10px;
                     border-radius:10px; background:#0f172a; color:#fff; font-weight:700; line-height:1; }

        .dm-opt{ display:flex; align-items:center; justify-content:center; padding:10px 12px;
                 border-radius:12px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; transition:.15s; }
        .dm-opt:hover{ border-color:#cbd5e1; background:#f8fafc; }
        .dm-opt.is-active{ border-color:#22c55e; box-shadow:0 0 0 2px rgba(34,197,94,.15) inset; }

        .dm-footer{
          position: sticky; bottom: -1px; background:#fff; padding-top:12px; margin-top:16px;
          display:flex; align-items:center; gap:12px; border-top:1px solid #e2e8f0;
        }
        .dm-qty{ display:inline-flex; align-items:center; gap:8px; border:1px solid #e2e8f0;
                 border-radius:12px; padding:4px 8px; background:#fafafa; }
        .dm-qty>button{ width:32px; height:32px; border:0; border-radius:10px; background:#f1f5f9;
                        color:#0f172a; cursor:pointer; font-size:18px; }
        .dm-total{ margin-left:auto; font-weight:800; font-size:18px; }
        .dm-add{ background:#0f172a; color:#fff; border:0; border-radius:12px; padding:12px 16px;
                 font-weight:800; min-width:140px; cursor:pointer; }

        @media (max-width: 920px){ .dm-grid--addons{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (max-width: 560px){ .dm-grid--addons{ grid-template-columns: 1fr; } }
        @media (max-width: 860px){
          .dm{ padding:12px 12px 80px; }
          .dm-head{ grid-template-columns: 1fr; gap:12px; }
          .dm-title{ font-size:22px; }
          .dm-grid{ grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
