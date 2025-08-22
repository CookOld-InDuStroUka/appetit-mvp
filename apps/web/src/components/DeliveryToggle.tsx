import React from "react";

type Props = {
  value: "delivery" | "pickup";
  onChange: (val: "delivery" | "pickup") => void;
};

export default function DeliveryToggle({ value, onChange }: Props) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        border: "1px solid var(--border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "50%",
          left: value === "delivery" ? 0 : "50%",
          background: "var(--accent)",
          transition: "left 0.2s",
        }}
      />
      <button
        onClick={() => onChange("delivery")}
        style={{
          flex: 1,
          padding: "8px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: value === "delivery" ? "#fff" : "var(--text)",
          zIndex: 1,
        }}
      >
        Доставка
      </button>
      <button
        onClick={() => onChange("pickup")}
        style={{
          flex: 1,
          padding: "8px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: value === "pickup" ? "#fff" : "var(--text)",
          zIndex: 1,
        }}
      >
        Самовывоз
      </button>
    </div>
  );
}
