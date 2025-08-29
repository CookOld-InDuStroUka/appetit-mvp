import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLang } from "../components/LangContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  pinned: boolean;
};

export default function ReviewsPage() {
  const { t } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch(() => setReviews([]));
  }, []);

  const submit = async () => {
    if (!name || !comment) return;
    const res = await fetch(`${API_BASE}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, rating, comment }),
    });
    if (res.ok) {
      const r: Review = await res.json();
      setReviews([r, ...reviews]);
      setName("");
      setRating(5);
      setComment("");
    }
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>{t("reviews")}</h1>
        <div style={{ marginTop: 24 }}>
          {reviews.length === 0 && <div>{t("noReviews")}</div>}
          {reviews.map((r) => (
            <div key={r.id} style={{ marginBottom: 16 }}>
              <strong>{r.name}</strong>
              <div>{"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}</div>
              <p style={{ margin: "4px 0" }}>{r.comment}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
          <h2>{t("leaveReview")}</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("yourName")}
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
          />
          <div style={{ marginBottom: 8 }}>
            <label>
              {t("rating")}: 
              <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("yourComment")}
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
          />
          <button onClick={submit}>{t("submitReview")}</button>
        </div>
      </main>
      <Footer />
    </>
  );
}

