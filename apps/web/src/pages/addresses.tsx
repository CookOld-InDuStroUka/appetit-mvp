import Header from "../components/Header";
import Footer from "../components/Footer";
import ZoneMap from "../components/ZoneMap";
import { useEffect, useState } from "react";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
}

export default function AddressesPage() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";
  const [branches, setBranches] = useState<Branch[]>([]);
  const PHONE = "+7 777 223 65 29";

  useEffect(() => {
    fetch(`${API_BASE}/branches`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBranches(d));
  }, [API_BASE]);

  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>Адреса и зоны доставки</h1>
        <ZoneMap />
        <h2 style={{ marginTop: 24 }}>Филиалы</h2>
        <ul style={{ padding: 0, listStyle: "none" }}>
          {branches.map((b) => (
            <li key={b.id} style={{ marginBottom: 8 }}>
              <strong>{b.name}</strong>: {b.address}, {" "}
              <a href={`tel:${b.phone ?? PHONE}`}>{b.phone ?? PHONE}</a>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
