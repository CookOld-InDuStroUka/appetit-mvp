import AdminLayout from "../../../components/AdminLayout";
import { useLang } from "../../../components/LangContext";

export default function ShiftsPage() {
  const { t } = useLang();
  return (
    <AdminLayout>
      <main style={{ padding: 20 }}>
        <h1>{t("shifts")}</h1>
      </main>
    </AdminLayout>
  );
}
