import type { AppProps } from "next/app";
import "../styles/globals.css";
import { CartProvider } from "../components/CartContext";
import { AuthProvider } from "../components/AuthContext";
import { ThemeProvider } from "../components/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
