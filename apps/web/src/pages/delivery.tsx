import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLang } from "../components/LangContext";

export default function DeliveryPage() {
  const { t } = useLang();
  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>{t("deliveryTitle")}</h1>
        <h2 style={{ marginTop: 24 }}>{t("deliverySection")}</h2>
        <p>{t("deliveryText1")}</p>
        <p>{t("deliveryText2")}</p>
        <h2 style={{ marginTop: 24 }}>{t("paymentSection")}</h2>
        <p>{t("paymentIntro")}</p>
        <ul>
          <li>{t("paymentKaspi")}</li>
          <li>{t("paymentKaspiNote")}</li>
          <li>{t("paymentCash")}</li>
          <li>{t("paymentCard")}</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
