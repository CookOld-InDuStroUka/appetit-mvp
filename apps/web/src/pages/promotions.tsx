import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PromotionsPage() {
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
          {/* Карточка 1 */}
          <div
            style={{
              flex: "1 1 360px",
              maxWidth: 360,
              background: "#fff",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
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
                src="/promo1.jpg"
                alt="Скидка 1000₸ на первый заказ"
                fill
                sizes="(max-width: 800px) 100vw, 360px"
                priority
              />
            </div>
            <p style={{ marginTop: 8 }}>
              Скидка 1000 тенге на первый заказ через сайт и приложение
            </p>
          </div>

          {/* Карточка 2 */}
          <div
            style={{
              flex: "1 1 360px",
              maxWidth: 360,
              background: "#fff",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
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
                src="/promo2.jpg"
                alt="Подарите другу 2000₸"
                fill
                sizes="(max-width: 800px) 100vw, 360px"
              />
            </div>
            <p style={{ marginTop: 8 }}>
              Подарите другу 2000т по промо-коду и получите 1000т себе
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
