import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import Footer from "./Footer";
import AdminHeader from "./AdminHeader";
import { useAdminAuth } from "./AdminAuthContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { admin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!admin) router.push("/admin/login");
  }, [admin, router]);

  if (!admin) return null;

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

