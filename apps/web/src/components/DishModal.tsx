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

type Props = {
  dish: DishLight | null;
  onClose: () => void;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

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

  // ==== напитки (нормализация запятой!) ====
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
  s.toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[^a-z0-9\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'>
     <rect width='100%' height='100%' fill='#f1f5f9'/>
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

  useEffect(() => {
    if (!dish) return;
    setSelectedAddons([]);
    setExcluded([]);
    setQty(1);
    setImgIdx(0);

    fetch(`${API_BASE}/dishes/${dish.id}`)
      .then((r) => r.json())
      .then(setDetails)
      .catch(() => setDetails(null));
  }, [dish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!dish) return null;

  // Полный “айди” файла по названию
  const norm = normalize(dish.name);
  const forcedId = NAME_TO_ID[norm] ?? slugify(dish.name);
  const candidates = [
    `/dishes/${forcedId}.jpg`,
    `/dishes/${forcedId}.webp`,
    FALLBACK,
  ];
  const imgSrc = candidates[Math.min(imgIdx, candidates.length - 1)];

  const toggleAddon = (id: string) =>
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  const toggleExcluded = (id: string) =>
    setExcluded((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = details?.addons?.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const base = details?.basePrice ?? dish.basePrice;
  const unitTotal = base + addonsTotal;
  const totalForQty = unitTotal * qty;

  const selectedAddonObjs = details?.addons?.filter((a) => selectedAddons.includes(a.id)) || [];
  const selectedExcludedNames =
    details?.exclusions?.filter((e) => excluded.includes(e.id)).map((e) => e.name) || [];

  return (
    <div className="dm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dm" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="dm-close" aria-label="Закрыть">×</button>

        <div className="dm-img">
          <Image
            src={imgSrc}
            alt={dish.name}
            fill
            sizes="(max-width: 720px) 100vw, 720px"
            style={{ objectFit: "contain" }}
            onError={() => setImgIdx((i) => Math.min(i + 1, candidates.length - 1))}
            priority
          />
        </div>

        <h2 className="dm-title">{dish.name}</h2>
        {details?.description && <p className="dm-desc">{details.description}</p>}

        {details?.addons?.length ? (
          <>
            <h4 className="dm-sub">Добавь вкуса</h4>
            <div className="dm-grid">
              {details.addons.map((o) => {
                const active = selectedAddons.includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleAddon(o.id)}
                    className={`dm-opt ${active ? "is-active" : ""}`}
                  >
                    <span>{o.name}</span>
                    <span className="dm-price">+{fmt.format(o.price)} ₸</span>
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
                addons: selectedAddonObjs.map((a) => ({ name: a.name, price: a.price })),
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
        .dm-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,.55); display: grid; place-items: center; padding: 16px; z-index: 1000; }
        .dm { width: min(720px, 100%); max-height: 90vh; overflow: auto; background: #fff; color: #0f172a; border-radius: 16px; padding: 16px; box-shadow: 0 20px 60px rgba(2,6,23,.3); position: relative; }
        .dm-close { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 8px; background: transparent; border: 1px solid #e2e8f0; color: #334155; font-size: 20px; cursor: pointer; }
        .dm-img { position: relative; width: 100%; aspect-ratio: 3/2; background: #f1f5f9; border-radius: 12px; overflow: hidden; }
        .dm-title { margin: 12px 4px 4px; font-size: 20px; font-weight: 800; }
        .dm-desc  { margin: 0 4px 8px; color: #475569; }
        .dm-sub   { margin: 16px 4px 8px; font-weight: 800; }
        .dm-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 8px; }
        .dm-opt { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: .15s; }
        .dm-opt:hover { border-color: #cbd5e1; background: #f8fafc; }
        .dm-opt.is-active { border-color: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,.15) inset; }
        .dm-price { font-weight: 700; }
        .dm-footer { margin-top: 16px; display: flex; align-items: center; gap: 12px; }
        .dm-qty { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 4px 6px; }
        .dm-qty > button { width: 28px; height: 28px; border: 0; border-radius: 8px; background: #f1f5f9; color: #0f172a; cursor: pointer; font-size: 18px; }
        .dm-total { margin-left: auto; font-weight: 800; font-size: 18px; }
        .dm-add { background: #22c55e; color: #fff; border: 0; border-radius: 10px; padding: 10px 14px; font-weight: 800; cursor: pointer; }
        @media (max-width: 520px) { .dm-grid { grid-template-columns: 1fr; } .dm { padding: 12px; } }
      `}</style>
    </div>
  );
}
