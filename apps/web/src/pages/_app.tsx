import type { AppProps } from "next/app";
import "../styles/globals.css";
import { CartProvider } from "../components/CartContext";
import { AuthProvider } from "../components/AuthContext";
import { ThemeProvider } from "../components/ThemeContext";
import { DeliveryProvider } from "../components/DeliveryContext";
import BackToTop from "../components/BackToTop";
import { LangProvider } from "../components/LangContext";
import { AdminAuthProvider } from "../components/AdminAuthContext";

export default function App({ Component, pageProps }: AppProps) {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";
  React.useEffect(() => {
    const url = new URL(window.location.href);
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ].forEach((p) => {
      const v = url.searchParams.get(p);
      if (v) localStorage.setItem(p, v);
    });
    if (document.referrer) {
      localStorage.setItem("referrer", document.referrer);
    }
    if (!localStorage.getItem("visitor_id")) {
      localStorage.setItem("visitor_id", crypto.randomUUID());
    }
    fetch(`${API_BASE}/admin/settings/tracking`)
      .then((r) => r.json())
      .then((s) => {
        if (s.gaTrackingId) {
          const g = document.createElement("script");
          g.src = `https://www.googletagmanager.com/gtag/js?id=${s.gaTrackingId}`;
          g.async = true;
          document.head.appendChild(g);
          const g2 = document.createElement("script");
          g2.innerHTML =
            "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','" +
            s.gaTrackingId +
            "');";
          document.head.appendChild(g2);
        }
        if (s.yaMetricaId) {
          const y = document.createElement("script");
          y.innerHTML =
            "(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');ym(" +
            s.yaMetricaId +
            ", 'init', {clickmap:true, trackLinks:true, accurateTrackBounce:true});";
          document.head.appendChild(y);
          const ns = document.createElement("noscript");
          const img = document.createElement("img");
          img.src = `https://mc.yandex.ru/watch/${s.yaMetricaId}`;
          img.style.display = "none";
          img.alt = "";
          ns.appendChild(img);
          document.body.appendChild(ns);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <ThemeProvider>
      <LangProvider>
        <AdminAuthProvider>
          <AuthProvider>
            <DeliveryProvider>
              <CartProvider>
                <Component {...pageProps} />
                <BackToTop />
              </CartProvider>
            </DeliveryProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}
