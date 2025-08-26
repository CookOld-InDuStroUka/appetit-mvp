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
        <li>
          <Link href="/admin/promos/statuses">Статусы блюд</Link>
        </li>
        <li>
          <Link href="/admin/promos/actions">Акции</Link>
        </li>
        <li>
          <Link href="/admin/promos/mailing">Рассылки</Link>
        </li>
      </ul>
    </AdminLayout>
  );
}
