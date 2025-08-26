import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLang } from "../components/LangContext";

export default function PromotionsPage() {
  const { t } = useLang();
  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>{t("promotionsTitle")}</h1>

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
                alt={t("promo1")}
                fill
                sizes="(max-width: 800px) 100vw, 360px"
                priority
              />
            </div>
            <p style={{ marginTop: 8 }}>{t("promo1")}</p>
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
                alt={t("promo2")}
                fill
                sizes="(max-width: 800px) 100vw, 360px"
              />
            </div>
            <p style={{ marginTop: 8 }}>{t("promo2")}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
