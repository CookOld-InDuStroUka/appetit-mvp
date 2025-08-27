import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLang } from "../components/LangContext";

export default function ReportError() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { t } = useLang();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `${message}${email ? `\n\nОт: ${email}` : ""}`;
    window.location.href = `mailto:bekavan7@gmail.com?subject=${encodeURIComponent(
      "Сообщение об ошибке"
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 600, margin: "20px auto", padding: "0 16px" }}>
        <h1>{t("reportErrorTitle")}</h1>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            placeholder={t("emailOptional")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}
          />
          <textarea
            required
            placeholder={t("problemPlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              minHeight: 120,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {t("send")}
          </button>
        </form>
        <p style={{ marginTop: 16 }}>{t("afterSend")}</p>
      </main>
      <Footer />
    </>
  );
}

