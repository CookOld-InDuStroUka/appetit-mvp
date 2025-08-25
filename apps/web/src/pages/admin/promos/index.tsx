import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";

export default function PromosAdmin() {
  return (
    <AdminLayout>
      <h1>Маркетинг</h1>
      <ul>
        <li>
          <Link href="/admin/promos/promo-codes">Промокоды</Link>
        </li>
      </ul>
    </AdminLayout>
  );
}
