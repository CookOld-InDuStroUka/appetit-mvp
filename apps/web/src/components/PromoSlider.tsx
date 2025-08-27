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

const DEFAULT_SLIDES: PromoSlide[] = [
  { image: "/promo1.jpg" },
  { image: "/promo2.jpg" },
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
  const [modal, setModal] = useState<(PromoModal & { image: string }) | null>(null);
  const { setPromo } = useCart();

  useEffect(() => setImgs(slides), [slides]);

  const next = () => setIndex((i) => (i + 1) % Math.max(imgs.length, 1));
  const prev = () => setIndex((i) => (i - 1 + Math.max(imgs.length, 1)) % Math.max(imgs.length, 1));

  useEffect(() => {
    if (paused || imgs.length <= 1) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [paused, imgs.length, intervalMs]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // главное изменение: удаляем сломанный слайд, а не заменяем заглушкой
  const onError = (idx: number) =>
    setImgs((arr) => arr.filter((_, i) => i !== idx));

  // поджимаем текущий индекс, если массив укоротился
  useEffect(() => {
    setIndex((i) => (imgs.length ? Math.min(i, imgs.length - 1) : 0));
  }, [imgs.length]);

  const aspect = `${width} / ${height}`;
  const sizesAttr = `(max-width: ${width}px) 100vw, ${width}px`;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchMove={(e) => {
        if (touchStart === null) return;
        const diff = touchStart - e.touches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? next() : prev();
          setTouchStart(null);
        }
      }}
      onTouchEnd={() => setTouchStart(null)}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        maxWidth: width,
        aspectRatio: aspect,
        margin: "0 auto",
        borderRadius: 8,
        touchAction: "pan-y",
        background: "#e0e0e0",
      }}
    >
      {imgs.length === 0 ? (
        <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#666" }}>
          Нет доступных промо
        </div>
      ) : (
        imgs.map((slide, i) => (
          <div
            key={`${slide.image}-${i}`}
            onClick={() => {
              if (slide.modal) setModal({ ...slide.modal, image: slide.image });
              else if (slide.link) window.location.href = slide.link;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: `${(i - index) * 100}%`,
              width: "100%",
              height: "100%",
              transition: prefersReducedMotion ? undefined : "left 0.5s ease-in-out",
              cursor: slide.modal || slide.link ? "pointer" : "default",
            }}
          >
            <Image
              src={slide.image}
              alt={`Promo ${i + 1}`}
              fill
              sizes={sizesAttr}
              priority={i === index}
              onError={() => onError(i)}
              style={{ objectFit: "cover" }}
            />
          </div>
        ))
      )}

      {imgs.length > 1 && (
        <>
          <button aria-label="Назад" onClick={prev} style={btn("left")}>‹</button>
          <button aria-label="Вперёд" onClick={next} style={btn("right")}>›</button>
        </>
      )}

      {imgs.length > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
          }}
        >
          {imgs.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Слайд ${i + 1}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                opacity: i === index ? 1 : 0.4,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>
      )}

      {modal && (
        <div
          className="modal-backdrop"
          onClick={() => setModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              maxWidth: 400,
              width: "90%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 200,
                marginBottom: 16,
              }}
            >
              <Image src={modal.image} alt={modal.title} fill sizes="(max-width: 400px) 100vw, 400px" style={{ objectFit: "cover" }} />
            </div>
            <h3 style={{ marginTop: 0 }}>{modal.title}</h3>
            <p>{modal.text}</p>
            {modal.promoCode && (
              <>
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => {
                      setPromo(modal.promoCode!);
                      setModal(null);
                    }}
                  >
                    Применить промокод
                  </button>
                  <div style={{ marginTop: 8, fontWeight: 700 }}>{modal.promoCode}</div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={async () => {
                      const text = modal.shareText || modal.promoCode || "";
                      if (navigator.share) {
                        try {
                          await navigator.share({ text });
                        } catch {}
                      } else {
                        try {
                          await navigator.clipboard.writeText(text);
                          alert("Ссылка скопирована");
                        } catch {}
                      }
                    }}
                  >
                    Поделиться промокодом
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function btn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: 10,
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 30,
    height: 30,
    cursor: "pointer",
    lineHeight: "30px",
    textAlign: "center",
    fontSize: 18,
  } as React.CSSProperties;
}
