import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  pinned: boolean;
};

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const load = async () => {
    const data = await fetch(`${API_BASE}/admin/reviews`).then((r) => r.json());
    setReviews(data);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePinned = async (id: string, pinned: boolean) => {
    await fetch(`${API_BASE}/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить отзыв?")) return;
    await fetch(`${API_BASE}/admin/reviews/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminLayout>
      <h1>Отзывы</h1>
      <table border={1} cellPadding={4} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Оценка</th>
            <th>Комментарий</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}</td>
              <td>{r.comment}</td>
              <td>{new Date(r.createdAt).toLocaleString("ru-RU", { hour12: false, timeZone: "Asia/Almaty" })}</td>
              <td>
                <button onClick={() => togglePinned(r.id, !r.pinned)}>
                  {r.pinned ? "Открепить" : "Закрепить"}
                </button>{" "}
                <button onClick={() => remove(r.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
