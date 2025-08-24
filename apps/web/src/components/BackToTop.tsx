import { useEffect, useRef, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY.current && y > 200) {
        setVisible(true);
      } else if (y <= 200 || y > lastY.current) {
        setVisible(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Наверх"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "10px 12px",
        borderRadius: "50%",
        border: "none",
        background: "var(--accent)",
        color: "#fff",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      ↑
    </button>
  );
}
