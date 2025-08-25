import { useState } from "react";
import AdminLayout from "../../../components/AdminLayout";

interface Slide {
  image: string;
  link: string;
}

export default function SliderAdmin() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");

  const addSlide = () => {
    if (!image) return;
    setSlides([...slides, { image, link }]);
    setImage("");
    setLink("");
  };

  const removeSlide = (idx: number) => {
    setSlides(slides.filter((_, i) => i !== idx));
  };

  return (
    <AdminLayout>
      <h1>Слайдер</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="URL изображения"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <input
          type="text"
          placeholder="Ссылка"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button onClick={addSlide}>Добавить</button>
      </div>
      <ul>
        {slides.map((s, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <img src={s.image} alt="" style={{ maxWidth: 200, display: "block" }} />
            <div>{s.link}</div>
            <button onClick={() => removeSlide(i)}>Удалить</button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
