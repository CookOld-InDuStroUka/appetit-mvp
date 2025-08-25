import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AdminNav from "./AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: 24 }}>
        <AdminNav />
        {children}
      </main>
      <Footer />
    </>
  );
}

