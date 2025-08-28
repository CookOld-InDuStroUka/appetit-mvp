import { useRouter } from "next/router";
import AdminLayout from "../../../components/AdminLayout";
import SupportChat from "../../../components/SupportChat";

export default function SupportChatPage() {
  const router = useRouter();
  const { id } = router.query;
  if (typeof id !== "string") return null;
  return (
    <AdminLayout>
      <h1>Чат {id}</h1>
      <SupportChat userId={id} isAdmin />
    </AdminLayout>
  );
}
