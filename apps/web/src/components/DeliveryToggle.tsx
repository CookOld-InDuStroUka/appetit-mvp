import React from "react";

type Props = {
  value: "delivery" | "pickup";
  onChange: (val: "delivery" | "pickup") => void;
  style?: React.CSSProperties;
};

export default function DeliveryToggle({ value, onChange, style }: Props) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        border: "1px solid var(--header-bg)",
        borderRadius: 8,
        overflow: "hidden",
        width: "100%",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "50%",
          left: value === "delivery" ? 0 : "50%",
          background: "var(--header-bg)",
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
          color:
            value === "delivery" ? "var(--header-text)" : "var(--text)",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span className="toggle-icon">🛵</span>
        <span className="toggle-label">Доставка</span>
      </button>
      <button
        onClick={() => onChange("pickup")}
        style={{
          flex: 1,
          padding: "8px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color:
            value === "pickup" ? "var(--header-text)" : "var(--text)",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span className="toggle-icon">🚶‍♂️</span>
        <span className="toggle-label">Самовывоз</span>
      </button>
    </div>
  );
}
