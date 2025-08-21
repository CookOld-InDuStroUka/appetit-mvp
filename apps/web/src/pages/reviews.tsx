import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ReviewsPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>Что говорят о нас гости — отзывы о доставке и шаурме APPETIT</h1>
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <strong>Omahan Akilhan</strong>
            <p style={{ margin: "4px 0" }}>24.07.2025 Заказывал Шаурму, Курьер Магди, автомобиль газ: 667</p>
            <p style={{ margin: "4px 0" }}>Доставили очень быстро, общение на высшем уровне, всё горячее, не было ни одного минуса, спасибо большое за такую курьеру, буду заказывать ещё</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Ермек Жарылкаманов</strong>
            <p style={{ margin: "4px 0" }}>рахмет кассир айга за саппевать в аппендися впервые покупался в один раз</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>id08390</strong>
            <p style={{ margin: "4px 0" }}>очень вкусно шаурма. Брал из Новаторов акция 1+1 относительно вкусно! Девочка кассир всё объяснила рассказала это!</p>
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>id05835</strong>
            <p style={{ margin: "4px 0" }}>Приготовили и доставили оперативно.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
