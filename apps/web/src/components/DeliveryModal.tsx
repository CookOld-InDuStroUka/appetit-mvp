import React, { useState } from "react";
import DeliveryMap from "./DeliveryMap";
import PickupMap, { Branch } from "./PickupMap";

export type DeliveryInfo = {
  type: "delivery" | "pickup";
  address: string;
  branch: string;
};

const BRANCHES: Branch[] = [
  { id: "kazakhstan", name: "КАЗАХСТАН, 70А", coords: [49.963, 82.605] },
  { id: "satpaeva", name: "САТПАЕВА, 8А", coords: [49.967, 82.640] },
  { id: "novatorov", name: "НОВАТОРОВ, 18/2", coords: [49.955, 82.620] },
  { id: "zhybek", name: "ЖИБЕК ЖОЛЫ, 1к8", coords: [49.943, 82.630] },
  { id: "samarskoe", name: "САМАРСКОЕ ШОССЕ, 5/1", coords: [49.935, 82.605] },
  { id: "kabanbay", name: "КАБАНБАЙ БАТЫРА,148", coords: [49.955, 82.650] },
  { id: "nazarbaeva", name: "НАЗАРБАЕВА, 28А", coords: [49.978, 82.650] },
];

type Props = {
  info: DeliveryInfo;
  onClose: () => void;
  onSave: (info: DeliveryInfo) => void;
};

export default function DeliveryModal({ info, onClose, onSave }: Props) {
  const [type, setType] = useState<"delivery" | "pickup">(info.type);
  const [address, setAddress] = useState(info.address);
  const [branch, setBranch] = useState(() => {
    const found = BRANCHES.find((b) => b.name === info.branch);
    return found ? found.id : BRANCHES[0].id;
  });

  const handleBackdrop = () => onClose();
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  const handleSave = () => {
    const sel = BRANCHES.find((b) => b.id === branch)?.name || "";
    onSave({ type, address, branch: sel });
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
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              {BRANCHES.map((b) => (
                <label key={b.id} style={{ display: "block", marginBottom: 8, cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="branch"
                    value={b.id}
                    checked={branch === b.id}
                    onChange={() => setBranch(b.id)}
                    style={{ marginRight: 8 }}
                  />
                  {b.name}
                </label>
              ))}
              <p style={{ fontSize: 14, color: "var(--muted-text)" }}>Ассортимент филиалов может отличаться.</p>
            </div>
            <PickupMap branches={BRANCHES} selected={branch} onSelect={setBranch} height={400} />
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
