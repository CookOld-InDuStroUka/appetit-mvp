import Link from "next/link";
import { useLang } from "./LangContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <ul className="footer-links">
            <li><Link className="footer-link" href="/addresses">{t("deliveryAddresses")}</Link></li>
            <li><Link className="footer-link" href="/reviews">{t("reviews")}</Link></li>
            <li><Link className="footer-link" href="/promotions">{t("promotions")}</Link></li>
            <li><Link className="footer-link" href="/delivery">{t("deliveryPayment")}</Link></li>
            <li><Link className="footer-link" href="/bonus">{t("bonusProgram")}</Link></li>
            <li><Link className="footer-link" href="/vacancies">{t("vacancies")}</Link></li>
            <li><Link className="footer-link" href="/contacts">{t("contacts")}</Link></li>
            <li><Link className="footer-link" href="/report-error">{t("reportBug")}</Link></li>
          </ul>

          <div className="footer-apps">
            <p className="footer-promo">{t("promoAppLine")}</p>
            <div className="footer-badges">
              <span
                className="footer-badge footer-badge--disabled"
                aria-disabled
                title={t("comingSoon")}
              >
                <span aria-hidden></span>
                <span className="footer-badge-text">
                  {t("appStore")}
                  <small>{t("comingSoon")}</small>
                </span>
              </span>
              <span
                className="footer-badge footer-badge--disabled"
                aria-disabled
                title={t("comingSoon")}
              >
                <span aria-hidden>▶</span>
                <span className="footer-badge-text">
                  {t("googlePlay")}
                  <small>{t("comingSoon")}</small>
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-muted">{t("company")}</span>
          <Link className="footer-link" href="/privacy-policy">{t("privacyPolicy")}</Link>
          <Link className="footer-link" href="/public-offer">{t("publicOffer")}</Link>
          <Link className="footer-admin" href="/admin">{t("admin")}</Link>
        </div>
      </div>
    </footer>
  );
}
