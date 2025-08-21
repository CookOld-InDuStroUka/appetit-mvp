import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>Контакты</h1>
        <p>По всем вопросам звоните: <a href="tel:+77713755711">+7 771 375 57 11</a></p>
      </main>
      <Footer />
    </>
  );
}
