import { ReactNode } from "react";
import Footer from "./Footer";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminHeader />
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: 24 }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

