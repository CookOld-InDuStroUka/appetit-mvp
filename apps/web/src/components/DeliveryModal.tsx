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
    entrance,
    setEntrance,
    doorCode,
    setDoorCode,
    floor,
    setFloor,
    comment,
    setComment,
    branch,
    setBranch,
    branches,
    history,
    addHistory,
    removeHistory,
    close,
  } = useDelivery();

  const handleBackdrop = () => close();
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={stopProp}>
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
            <DeliveryMap
              address={address}
              setAddress={setAddress}
              apt={apt}
              setApt={setApt}
              entrance={entrance}
              setEntrance={setEntrance}
              doorCode={doorCode}
              setDoorCode={setDoorCode}
              floor={floor}
              setFloor={setFloor}
              height={400}
            />
            {history.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {history.map((h) => (
                  <div key={h} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                    <button
                      onClick={() => setAddress(h)}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        color: "var(--text)",
                      }}
                    >
                      {h}
                    </button>
                    <button
                      onClick={() => removeHistory(h)}
                      aria-label="Удалить"
                      style={{
                        marginLeft: 8,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted-text)",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <input
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                }}
              />
            </div>
            <button
              onClick={() => {
                addHistory(address);
                close();
              }}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Подтвердить
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 8 }}>
              {branches.map((b) => (
                <label
                  key={b.id}
                  style={{ display: "block", marginBottom: 8, cursor: "pointer" }}
                >
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
              <p style={{ fontSize: 14, color: "var(--muted-text)" }}>
                Ассортимент филиалов может отличаться.
              </p>
            </div>
            <PickupMap
              branches={branches}
              selected={branch}
              onSelect={setBranch}
              height={360}
            />
            <button
              onClick={close}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Подтвердить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

