import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PromotionsPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>Акции</h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 24 }}>
          <div style={{ maxWidth: 360 }}>
            <img src="https://placehold.co/340x140" alt="Скидка 1000т на первый заказ" style={{ width: "100%", borderRadius: 8 }} />
            <p style={{ marginTop: 8 }}>Скидка 1000 тенге на первый заказ через сайт и приложение</p>
          </div>
          <div style={{ maxWidth: 360 }}>
            <img src="https://placehold.co/340x140" alt="Подарите другу 2000т" style={{ width: "100%", borderRadius: 8 }} />
            <p style={{ marginTop: 8 }}>Подарите другу 2000т по промо-коду и получите 1000т себе</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
