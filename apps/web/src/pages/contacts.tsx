import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLang } from "../components/LangContext";
import SupportChat from "../components/SupportChat";

export default function ContactsPage() {
  const { t } = useLang();
  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>{t("contactsTitle")}</h1>
        <p>
          {t("contactPhone")} <a href="tel:+77713755711">{t("contactsPagePhone")}</a>
        </p>
        <h2>{t("supportChat")}</h2>
        <SupportChat />
      </main>
      <Footer />
    </>
  );
}
