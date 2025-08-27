import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";
import { PromoSlide, PromoModal } from "../types/promo";

export default function PromotionsPage() {
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { setPromo } = useCart();

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("promoSlides") : null;
    if (saved) {
      try { setSlides(JSON.parse(saved)); } catch { setSlides([]); }
    }
  }, []);

  const activeSlides = slides.filter((s) => s.active !== false);
  const modal = activeIndex !== null && activeSlides[activeIndex]
    ? ({ ...(activeSlides[activeIndex].modal || ({} as PromoModal)), image: activeSlides[activeIndex].image })
    : null;

  const openModal = (i: number) => { setActiveIndex(i); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setActiveIndex(null); document.body.style.overflow = ""; };

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") setActiveIndex((v) => (v === null ? v : (v + 1) % activeSlides.length));
      if (e.key === "ArrowLeft")  setActiveIndex((v) => (v === null ? v : (v - 1 + activeSlides.length) % activeSlides.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeIndex, activeSlides.length]);

  const share = async () => {
    if (!modal) return;
    const text = modal.shareText || modal.promoCode || modal.title || "";
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); alert("Скопировано"); }
    } catch {}
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <h1>Акции</h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 24, alignItems: "flex-start" }}>
          {activeSlides.map((slide, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 360px", maxWidth: 360, background: "#fff", borderRadius: 12, padding: 12,
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)", cursor: "pointer",
              }}
              onClick={() => slide.link ? window.location.href = slide.link : openModal(i)}
            >
              <div style={{ position: "relative", width: "100%", height: 160, borderRadius: 8, overflow: "hidden" }}>
                <Image
                  src={slide.image}
                  alt={slide.modal?.title || `Promo ${i + 1}`}
                  fill sizes="(max-width: 980px) 100vw, 360px" style={{ objectFit: "cover" }}
                />
              </div>
              {slide.modal?.text && <p style={{ marginTop: 8 }}>{slide.modal.text}</p>}
            </div>
          ))}
        </div>
      </main>

      {modal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 16, width: "min(980px, 100%)", overflow: "hidden",
              boxShadow: "0 24px 48px rgba(0,0,0,.2), 0 8px 16px rgba(0,0,0,.15)",
            }}
          >
            {/* Верхний баннер */}
            <div style={{ position: "relative" }}>
              <button
                onClick={closeModal}
                aria-label="Закрыть"
                style={{ position: "absolute", right: 12, top: 12, width: 36, height: 36, borderRadius: 999, border: "none",
                         background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 3 }}
              >×</button>

              {(modal.shareText || modal.promoCode) && (
                <button
                  onClick={share}
                  aria-label="Поделиться"
                  style={{ position: "absolute", right: 56, top: 12, width: 36, height: 36, borderRadius: 999, border: "none",
                           background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 3 }}
                >↗</button>
              )}

              <div style={{ position: "relative", width: "100%", aspectRatio: "1668 / 634" }}>
                <Image
                  src={modal.image}
                  alt={modal.title || "Акция"}
                  fill sizes="(max-width: 980px) 100vw, 980px" style={{ objectFit: "cover" }}
                />
              </div>

              {/* плашка ПРОМОКОД у смайлика */}
              {modal.promoCode && (
                <div
                  style={{
                    position: "absolute", right: 24, bottom: 24, zIndex: 3,
                    background: "#fff", color: "#e11d48", borderRadius: 999,
                    padding: "10px 16px", fontWeight: 900, boxShadow: "0 6px 16px rgba(0,0,0,.15)",
                    display: "inline-flex", alignItems: "center", gap: 8, letterSpacing: 0.3, textTransform: "uppercase",
                  }}
                >
                  <span>Промокод</span>
                  <span style={{ color: "#111827" }}>{modal.promoCode}</span>
                </div>
              )}
            </div>

            {/* Нижний блок */}
            <div style={{ padding: "22px 24px 26px" }}>
              {modal.title && (
                <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, lineHeight: 1.25 }}>{modal.title}</h3>
              )}
              {modal.text && (
                <p style={{ margin: "10px 0 0", color: "#3f3f46", fontSize: 14 }}>{modal.text}</p>
              )}
              {modal.promoCode && (
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
                  <button
                    onClick={() => { setPromo(modal.promoCode!); closeModal(); }}
                    style={{
                      border: "none", background: "linear-gradient(90deg,#ff7a00 0%,#ff9a1a 50%,#ff7a00 100%)",
                      color: "#fff", fontWeight: 800, padding: "12px 16px", borderRadius: 12,
                      cursor: "pointer", boxShadow: "0 6px 14px rgba(255,122,0,.25)",
                    }}
                  >
                    Применить промокод
                  </button>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px",
                      borderRadius: 10, background: "#f8fbff", border: "1px dashed #60a5fa",
                      color: "#1f2a44", fontWeight: 800, letterSpacing: 1,
                    }}
                  >
                    {modal.promoCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
