import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ReportError() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

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
        <h1>Сообщить об ошибке</h1>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            placeholder="Ваш email (необязательно)"
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
            placeholder="Опишите проблему"
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
            Отправить
          </button>
        </form>
        <p style={{ marginTop: 16 }}>
          После нажатия кнопки откроется окно отправки письма в вашем почтовом
          клиенте.
        </p>
      </main>
      <Footer />
    </>
  );
}

