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
