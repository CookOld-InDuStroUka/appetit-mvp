import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PromoSlider from "../../components/PromoSlider";
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
        <PromoSlider slides={slides.length ? slides : undefined} />
      </main>
      <Footer />
    </>
  );
}
