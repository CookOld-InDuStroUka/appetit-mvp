import Link from "next/link";
import AdminLayout from "../../components/AdminLayout";

export default function AdminHome() {
  const links = [
    { href: "/admin", label: "Главная" },
    { href: "/admin/branches", label: "Филиалы" },
    { href: "/admin/menu", label: "Меню" },
    { href: "/admin/orders", label: "Заказы" },
    { href: "/admin/promos", label: "Маркетинг" },
    { href: "/admin/analytics", label: "Аналитика" },
  ];

  return (
    <AdminLayout>
      <h1>Админпанель APPETIT</h1>
      <div className="admin-home-links">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="admin-home-btn">
            {l.label}
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
