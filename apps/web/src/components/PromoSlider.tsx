import React, { useState, useEffect } from "react";

const slides = [
  "https://via.placeholder.com/600x200?text=Promo+1",
  "https://via.placeholder.com/600x200?text=Promo+2",
  "https://via.placeholder.com/600x200?text=Promo+3",
];

export default function PromoSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3000);
    return () => clearInterval(id);
  }, []);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "200px",
        marginBottom: "20px",
        borderRadius: "8px",
      }}
    >
      {slides.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Promo ${i + 1}`}
          style={{
            position: "absolute",
            top: 0,
            left: `${(i - index) * 100}%`,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "left 0.5s ease-in-out",
          }}
        />
      ))}
      <button
        onClick={prev}
        style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          cursor: "pointer",
        }}
      >
        ‹
      </button>
      <button
        onClick={next}
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          cursor: "pointer",
        }}
      >
        ›
      </button>
    </div>
  );
}

