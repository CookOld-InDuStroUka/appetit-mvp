import Link from "next/link";
import { useState, useEffect } from "react";
import { useLang } from "./LangContext";

export default function Footer() {
  const [isSmall, setIsSmall] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <footer style={{ background: "var(--footer-bg)", color: "var(--footer-text)", marginTop: 40, width: "100%" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px clamp(16px,5vw,48px)", width: "100%", boxSizing: "border-box" }}>
        <div
          style={{
            display: "flex",
            justifyContent: isSmall ? "flex-start" : "space-between",
            flexWrap: "wrap",
            gap: isSmall ? 16 : 24,
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flex: isSmall ? "1 1 100%" : "1 1 200px",
            }}
          >
            <li><Link href="/addresses" style={{ color: "var(--nav-link)", textDecoration: "none" }}>{t("deliveryAddresses")}</Link></li>
            <li><Link href="/reviews" style={{ color: "var(--nav-link)", textDecoration: "none" }}>{t("reviews")}</Link></li>
            <li><Link href="/promotions" style={{ color: "var(--nav-link)", textDecoration: "none" }}>{t("promotions")}</Link></li>
            <li><Link href="/delivery" style={{ color: "var(--nav-link)", textDecoration: "none" }}>{t("deliveryPayment")}</Link></li>
            <li><Link href="/bonus" style={{ color: "var(--nav-link)", textDecoration: "none" }}>{t("bonusProgram")}</Link></li>
            <li><Link href="/vacancies" style={{ color: "var(--nav-link)", textDecoration: "none" }}>{t("vacancies")}</Link></li>
            <li><Link href="/contacts" style={{ color: "var(--nav-link)", textDecoration: "none" }}>{t("contacts")}</Link></li>
            <li><Link href="/report-error" style={{ color: "var(--nav-link)", textDecoration: "none" }}>{t("reportBug")}</Link></li>
          </ul>
          <div
            style={{
              textAlign: isSmall ? "left" : "right",
              flex: isSmall ? "1 1 100%" : "1 1 200px",
            }}
          >
            <p style={{ margin: 0, marginBottom: 8 }}>{t("promoAppLine")}</p>
            <div
              style={{
                display: "flex",
                justifyContent: isSmall ? "flex-start" : "flex-end",
                gap: 8,
              }}
            >
              <a href="#" style={{ background: "#fff", color: "#000", padding: "6px 12px", borderRadius: 8, textDecoration: "none", fontSize: 12 }}>{t("appStore")}</a>
              <a href="#" style={{ background: "#fff", color: "#000", padding: "6px 12px", borderRadius: 8, textDecoration: "none", fontSize: 12 }}>{t("googlePlay")}</a>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 32, fontSize: 12, color: "var(--nav-link)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          <span>{t("company")}</span>
          <Link href="/privacy-policy" style={{ color: "var(--nav-link)", textDecoration: "none" }}>
            {t("privacyPolicy")}
          </Link>
          <Link href="/public-offer" style={{ color: "var(--nav-link)", textDecoration: "none" }}>
            {t("publicOffer")}
          </Link>
          <Link href="/admin" style={{ color: "var(--nav-link)", textDecoration: "none", border: "1px solid var(--nav-link)", padding: "4px 8px", borderRadius: 6 }}>{t("admin")}</Link>
        </div>
      </div>
    </footer>
  );
}
