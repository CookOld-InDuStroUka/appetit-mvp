import Link from "next/link";
import AdminLayout from "../../components/AdminLayout";

export default function AdminHome() {
  return (
    <AdminLayout>
      <h1>Админпанель APPETIT</h1>
      <p>
        <Link href="/">На главную</Link>
      </p>
    </AdminLayout>
  );
}
