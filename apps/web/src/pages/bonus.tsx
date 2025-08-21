import Header from "../components/Header";
import Footer from "../components/Footer";

export default function BonusPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>Бонусная программа</h1>
        <p>Копите и тратьте с удовольствием:</p>
        <ul>
          <li>🧾 С каждого заказа на ваш бонусный счёт начисляется 10% кэшбэка</li>
          <li>📅 Бонусы действуют в течение 14 дней с момента начисления</li>
          <li>💳 Можно оплатить до 30% суммы заказа бонусами</li>
          <li>🎁 Бонусы действуют на все блюда, включая Комбо, но не на напитки</li>
          <li>🔁 Чтобы применить бонусы — нажмите значок рядом с опцией оплаты бонусами в корзине</li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
