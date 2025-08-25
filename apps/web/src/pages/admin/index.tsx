import Link from "next/link";
import AdminLayout from "../../components/AdminLayout";

export default function AdminHome() {
  const links = [
    { href: "/", label: "На сайт" },
    { href: "/admin", label: "Главная" },
    { href: "/admin/branches", label: "Филиалы" },
    { href: "/admin/menu", label: "Меню" },
    { href: "/admin/orders", label: "Заказы" },
    { href: "/admin/promos", label: "Маркетинг" },
    { href: "/admin/analytics", label: "Аналитика" },
  ];

  return (
    <AdminLayout>
      <div className="admin-home">
        <h1>Админпанель APPETIT</h1>
        <div className="admin-home-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="admin-home-btn">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        .admin-home {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          text-align: center;
        }
        .admin-home-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }
        .admin-home-btn {
          display: block;
          text-align: center;
          width: 100%;
        }
        @media (max-width: 600px) {
          .admin-home {
            max-width: none;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
