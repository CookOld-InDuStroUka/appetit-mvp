import AdminLayout from "../../components/AdminLayout";
import { useLang } from "../../components/LangContext";

export default function AdminProfilePage() {
  const { t } = useLang();
  return (
    <AdminLayout>
      <main style={{ padding: 20 }}>
        <h1>{t("adminProfile")}</h1>
        <p>{t("adminProfileHint")}</p>
      </main>
    </AdminLayout>
  );
}
