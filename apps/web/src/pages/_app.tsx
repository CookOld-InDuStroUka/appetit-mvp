import type { AppProps } from "next/app";
import "../styles/globals.css";
import { CartProvider } from "../components/CartContext";
import { AuthProvider } from "../components/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </AuthProvider>
  );
}
