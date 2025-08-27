import AdminLayout from "../../../components/AdminLayout";
import { useLang } from "../../../components/LangContext";

export default function PayrollPage() {
  const { t } = useLang();
  return (
    <AdminLayout>
      <main style={{ padding: 20 }}>
        <h1>{t("payroll")}</h1>
      </main>
    </AdminLayout>
  );
}
