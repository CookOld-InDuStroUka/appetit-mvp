import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { PromoSlide } from "../../types/promo";

export default function PromosPage() {
  const [slides, setSlides] = useState<PromoSlide[]>([]);
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
  return (
    <>
      <Header />
      <main style={{ maxWidth: 1280, margin: "20px auto", padding: "0 16px" }}>
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>Акции</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 16,
          }}
        >
          {slides
            .filter((s) => s.active !== false)
            .map((s, i) => (
              <a
                key={i}
                href={s.link || "#"}
                style={{ display: "block" }}
                target={s.link ? "_blank" : undefined}
                rel={s.link ? "noreferrer" : undefined}
              >
                <img
                  src={s.image}
                  alt="promo"
                  style={{ width: "100%", borderRadius: 8 }}
                />
              </a>
            ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
