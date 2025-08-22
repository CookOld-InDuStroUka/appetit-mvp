import React, { useState } from "react";
import DeliveryMap from "./DeliveryMap";

export type DeliveryInfo = {
  type: "delivery" | "pickup";
  address: string;
  branch: string;
};

type Props = {
  info: DeliveryInfo;
  onClose: () => void;
  onSave: (info: DeliveryInfo) => void;
};

export default function DeliveryModal({ info, onClose, onSave }: Props) {
  const [type, setType] = useState<"delivery" | "pickup">(info.type);
  const [address, setAddress] = useState(info.address);
  const [branch, setBranch] = useState(info.branch);

  const handleBackdrop = () => onClose();
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  const handleSave = () => {
    onSave({ type, address, branch });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div
        className="modal"
        style={{ width: "80vw", maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}
        onClick={stopProp}
      >
        <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Способ получения</h2>
          <button
            onClick={onClose}
            style={{ position: "absolute", right: 0, top: 0, background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => setType("delivery")}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: type === "delivery" ? "var(--accent)" : "var(--card-bg)",
              color: type === "delivery" ? "#fff" : "var(--text)",
              cursor: "pointer",
            }}
          >
            Доставка
          </button>
          <button
            onClick={() => setType("pickup")}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: type === "pickup" ? "var(--accent)" : "var(--card-bg)",
              color: type === "pickup" ? "#fff" : "var(--text)",
              cursor: "pointer",
            }}
          >
            Самовывоз
          </button>
        </div>

        {type === "delivery" && (
          <div style={{ marginBottom: 16 }}>
            <DeliveryMap address={address} setAddress={setAddress} height={400} />
          </div>
        )}

        {type === "pickup" && (
          <div style={{ marginBottom: 16 }}>
            {["КАЗАХСТАН, 70А", "САТПАЕВА, 8А", "НОВАТОРОВ, 18/2", "ЖИБЕК ЖОЛЫ, 1к8", "САМАРСКОЕ ШОССЕ, 5/1", "КАБАНБАЙ БАТЫРА, 148", "НАЗАРБАЕВА, 28А"].map((b) => (
              <label key={b} style={{ display: "block", marginBottom: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="branch"
                  value={b}
                  checked={branch === b}
                  onChange={() => setBranch(b)}
                  style={{ marginRight: 8 }}
                />
                {b}
              </label>
            ))}
            <p style={{ fontSize: 14, color: "var(--muted-text)" }}>Ассортимент филиалов может отличаться.</p>
          </div>
        )}

        <button
          onClick={handleSave}
          style={{
            display: "block",
            width: "100%",
            padding: "12px 0",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
