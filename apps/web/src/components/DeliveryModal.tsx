import React from "react";
import DeliveryToggle from "./DeliveryToggle";
import DeliveryMap from "./DeliveryMap";
import PickupMap from "./PickupMap";
import { useDelivery } from "./DeliveryContext";

export default function DeliveryModal() {
  const {
    mode,
    setMode,
    address,
    setAddress,
    apt,
    setApt,
    comment,
    setComment,
    branch,
    setBranch,
    branches,
    close,
  } = useDelivery();

  const handleBackdrop = () => close();
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" style={{ maxWidth: 460 }} onClick={stopProp}>
        <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Способ получения</h2>
          <button
            onClick={close}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-text)", position: "absolute", right: 0, top: 0 }}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <DeliveryToggle value={mode} onChange={setMode} />
        </div>

        {mode === "delivery" ? (
          <div>
            <DeliveryMap address={address} setAddress={setAddress} height={300} />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                value={apt}
                onChange={(e) => setApt(e.target.value)}
                placeholder="Квартира/офис"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                }}
              />
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              {branches.map((b) => (
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
            <PickupMap branches={branches} selected={branch} onSelect={setBranch} height={300} />
          </div>
        )}
      </div>
    </div>
  );
}

