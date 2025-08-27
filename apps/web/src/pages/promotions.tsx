import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../components/CartContext";
import { PromoSlide, PromoModal } from "../types/promo";

export default function PromotionsPage() {
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const [modal, setModal] = useState<(PromoModal & { image: string }) | null>(null);
  const { setPromo } = useCart();

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("promoSlides") : null;
    if (saved) {
      try {
        setSlides(JSON.parse(saved));
      } catch {
        setSlides([]);
      }
    }
  }, []);

  const activeSlides = slides.filter((s) => s.active !== false);

  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>Акции</h1>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 24,
            alignItems: "flex-start",
          }}
        >
          {activeSlides.map((slide, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 360px",
                maxWidth: 360,
                background: "#fff",
                borderRadius: 12,
                padding: 12,
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                cursor: slide.modal || slide.link ? "pointer" : "default",
              }}
              onClick={() => {
                if (slide.modal) setModal({ ...slide.modal, image: slide.image });
                else if (slide.link) window.location.href = slide.link;
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 140,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={slide.image}
                  alt={slide.modal?.title || `Promo ${i + 1}`}
                  fill
                  sizes="(max-width: 800px) 100vw, 360px"
                />
              </div>
              {slide.modal?.text && <p style={{ marginTop: 8 }}>{slide.modal.text}</p>}
            </div>
          ))}
        </div>
      </main>
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
              <Image
                src={modal.image}
                alt={modal.title}
                fill
                sizes="(max-width: 400px) 100vw, 400px"
                style={{ objectFit: "cover" }}
              />
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
      <Footer />
    </>
  );
}
