import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Branch = { id: string; name: string };

export default function OrdersByBranch() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/branches`)
      .then((r) => r.json())
      .then((data) => setBranches(data))
      .catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <h1>Заказы по филиалам</h1>
      <ul>
        {branches.map((b) => (
          <li key={b.id}>
            <Link href={`/admin/orders/${b.id}`}>{b.name}</Link>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
