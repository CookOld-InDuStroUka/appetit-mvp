import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLang } from "../components/LangContext";

export default function BonusPage() {
  const { t } = useLang();
  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>{t("bonusTitle")}</h1>
        <p>{t("bonusIntro")}</p>
        <ul>
          <li>{t("bonusRule1")}</li>
          <li>{t("bonusRule2")}</li>
          <li>{t("bonusRule3")}</li>
          <li>{t("bonusRule4")}</li>
          <li>{t("bonusRule5")}</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
