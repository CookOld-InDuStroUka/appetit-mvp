import Link from "next/link";

export default function AdminHome() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Админпанель APPETIT</h1>
      <ul>
        <li><Link href="/admin/branches">Филиалы</Link></li>
        <li><Link href="/admin/menu">Меню</Link></li>
        <li><Link href="/admin/orders">Заказы</Link></li>
        <li><Link href="/admin/promos">Маркетинг</Link></li>
        <li><Link href="/admin/analytics">Аналитика</Link></li>
      </ul>
    </div>
  );
}
