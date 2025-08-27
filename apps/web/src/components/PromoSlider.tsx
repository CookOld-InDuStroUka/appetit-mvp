import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { PromoSlide, PromoModal } from "../types/promo";
import { useCart } from "./CartContext";

type PromoSliderProps = {
  slides?: PromoSlide[];
  intervalMs?: number;
  width?: number;
  height?: number;
};

const DEFAULT_MODAL: PromoModal = {
  title: "Скидка 1000₸ на первый заказ через сайт и приложение",
  text: "минимальная сумма заказа 3500 тенге",
  promoCode: "NEW1",
  shareText: "Промокод NEW1 на 1000₸ в APPETIT",
};

const DEFAULT_SLIDES: PromoSlide[] = [
  { image: "/promo1.jpg", modal: { ...DEFAULT_MODAL } },
  { image: "/promo2.jpg", modal: { ...DEFAULT_MODAL } },
];

export default function PromoSlider({
  slides = DEFAULT_SLIDES,
  intervalMs = 3000,
  width = 1668,
  height = 634,
}: PromoSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [imgs, setImgs] = useState<PromoSlide[]>(slides);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAnim, setModalAnim] = useState(false);
  const { setPromo } = useCart();

  useEffect(() => setImgs(slides), [slides]);

  const next = () => setIndex(i => (i + 1) % Math.max(imgs.length, 1));
  const prev = () => setIndex(i => (i - 1 + Math.max(imgs.length, 1)) % Math.max(imgs.length, 1));

  useEffect(() => {
    if (paused || imgs.length <= 1 || modalOpen) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [paused, imgs.length, intervalMs, modalOpen]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const onError = (idx: number) => setImgs(arr => arr.filter((_, i) => i !== idx));

  useEffect(() => {
    setIndex(i => (imgs.length ? Math.min(i, imgs.length - 1) : 0));
  }, [imgs.length]);

  const aspect = `${width} / ${height}`;
  const sizesAttr = `(max-width: ${width}px) 100vw, ${width}px`;

  const openModalAt = (i: number) => {
    setIndex(i);
    setModalOpen(true);
    setPaused(true);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => setModalAnim(true));
  };
  const closeModal = () => {
    setModalAnim(false);
    setModalOpen(false);
    setPaused(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const slide = imgs[index];
  const mergedModal: PromoModal = { ...DEFAULT_MODAL, ...(slide?.modal || {}) };
  const modal: (PromoModal & { image: string }) | null = slide ? { ...mergedModal, image: slide.image } : null;

  // спец-логика
  const isFirstSlide = index === 0;
  const footerTitle = isFirstSlide
    ? (mergedModal as any).footerTitle ?? "Скидка вам и другу!"
    : (mergedModal as any).footerTitle ?? "Скидка 1000₸ на первый заказ через сайт и приложение";
  const footerText = isFirstSlide
    ? (mergedModal as any).footerText ??
      "Подарите другу 2000₸ по промо-коду и получите 1000₸ для себя! Можно пригласить до 3-х друзей."
    : mergedModal.text ?? DEFAULT_MODAL.text;

  // плашка на БАННЕРЕ: по умолчанию скрыта для 1-го слайда, видна для остальных
  const showBannerPromo = (mergedModal as any).showBannerPromo ?? !isFirstSlide;

  // промо-блок внизу
  const showFooterPromo = isFirstSlide
    ? (mergedModal as any).showFooterPromo === true
    : (mergedModal as any).showFooterPromo !== false;

  const share = async () => {
    if (!modal) return;
    const text = modal.shareText || modal.promoCode || modal.title || "";
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        alert("Скопировано");
      }
    } catch {}
  };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => !modalOpen && setPaused(false)}
      onTouchStart={e => setTouchStart(e.touches[0].clientX)}
      onTouchMove={e => {
        if (touchStart === null) return;
        const diff = touchStart - e.touches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); setTouchStart(null); }
      }}
      onTouchEnd={() => setTouchStart(null)}
      style={{ position: "relative", overflow: "hidden", width: "100%", maxWidth: width, aspectRatio: aspect, margin: "0 auto", borderRadius: 8, touchAction: "pan-y", background: "#e0e0e0" }}
    >
      {imgs.length === 0 ? (
        <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#666" }}>Нет доступных промо</div>
      ) : (
        imgs.map((slide, i) => (
          <div
            key={`${slide.image}-${i}`}
            onClick={() => slide.link ? (window.location.href = slide.link) : openModalAt(i)}
            style={{ position: "absolute", top: 0, left: `${(i - index) * 100}%`, width: "100%", height: "100%", transition: prefersReducedMotion ? undefined : "left 0.5s ease-in-out", cursor: "pointer" }}
          >
            <Image src={slide.image} alt={`Promo ${i + 1}`} fill sizes={sizesAttr} priority={i === index} onError={() => onError(i)} style={{ objectFit: "cover" }} />
          </div>
        ))
      )}

      {imgs.length > 1 && !modalOpen && (
        <>
          <button aria-label="Назад" onClick={prev} style={navBtn("left")}>‹</button>
          <button aria-label="Вперёд" onClick={next} style={navBtn("right")}>›</button>
        </>
      )}

      {imgs.length > 1 && !modalOpen && (
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          {imgs.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Слайд ${i + 1}`}
              style={{ width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer", opacity: i === index ? 1 : 0.4, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
          ))}
        </div>
      )}

      {modalOpen && modal && (
        <div onClick={closeModal}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16, touchAction: "none" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ opacity: modalAnim ? 1 : 0, transform: modalAnim ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)", transition: "opacity .22s ease, transform .24s ease",
                     background: "#fff", borderRadius: 16, width: "min(980px, 100%)", overflow: "hidden",
                     boxShadow: "0 24px 48px rgba(0,0,0,.2), 0 8px 16px rgba(0,0,0,.15)" }}>
            <div style={{ position: "relative" }}>
              <button onClick={closeModal} aria-label="Закрыть" style={{ ...roundIconBtn({ right: 12, top: 12 }), zIndex: 3 }}>×</button>
              {(modal.shareText || modal.promoCode) && (
                <button onClick={share} aria-label="Поделиться" style={{ ...roundIconBtn({ right: 56, top: 12 }), zIndex: 3 }}>↗</button>
              )}

              <div style={{ position: "relative", width: "100%", aspectRatio: "1668 / 634" }}>
                <Image src={modal.image} alt={modal.title || "Акция"} fill sizes="(max-width: 980px) 100vw, 980px" style={{ objectFit: "cover" }} />
              </div>

              {/* Плашка на баннере — по флагу */}
              {modal.promoCode && showBannerPromo && (
                <div style={{ position: "absolute", right: 24, bottom: 24, zIndex: 3, background: "#fff", color: "#e11d48",
                               borderRadius: 999, padding: "10px 16px", fontWeight: 900, boxShadow: "0 6px 16px rgba(0,0,0,.15)",
                               display: "inline-flex", alignItems: "center", gap: 8, letterSpacing: 0.3, textTransform: "uppercase" }}>
                  <span>Промокод</span><span style={{ color: "#111827" }}>{modal.promoCode}</span>
                </div>
              )}
            </div>

            <div style={{ padding: "22px 24px 26px" }}>
              {footerTitle && <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1.25 }}>{footerTitle}</h3>}
              {footerText && <p style={{ margin: "10px 0 0", color: "#3f3f46", fontSize: 14 }}>{footerText}</p>}

              {modal.promoCode && showFooterPromo && (
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
                  <button onClick={() => { setPromo(modal.promoCode!); closeModal(); }} style={primaryBtn}>Применить промокод</button>
                  <span style={codePill}>{modal.promoCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* styles */
function navBtn(side: "left" | "right"): React.CSSProperties {
  return { position: "absolute", top: "50%", [side]: 10, transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none",
           borderRadius: "50%", width: 30, height: 30, cursor: "pointer", lineHeight: "30px", textAlign: "center", fontSize: 18 } as React.CSSProperties;
}
function roundIconBtn(pos: { right: number; top: number | string }): React.CSSProperties {
  return { position: "absolute", right: pos.right, top: pos.top, transform: typeof pos.top === "string" ? "translateY(-50%)" : undefined,
           width: 36, height: 36, borderRadius: 999, border: "none", background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 22, cursor: "pointer" };
}
const primaryBtn: React.CSSProperties = {
  border: "none", background: "linear-gradient(90deg,#ff7a00 0%,#ff9a1a 50%,#ff7a00 100%)", color: "#fff", fontWeight: 800,
  padding: "12px 16px", borderRadius: 12, cursor: "pointer", boxShadow: "0 6px 14px rgba(255,122,0,.25)",
};
const codePill: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10,
  background: "#f8fbff", border: "1px dashed #60a5fa", color: "#1f2a44", fontWeight: 800, letterSpacing: 1,
};
