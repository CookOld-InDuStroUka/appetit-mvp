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
      <div
        className="modal"
        style={{ maxWidth: 520, width: "100%", height: "100%", maxHeight: "100%", display: "flex", flexDirection: "column", borderRadius: 0 }}
        onClick={stopProp}
      >
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

        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {mode === "delivery" ? (
            <>
              <div style={{ flex: 1, minHeight: 0 }}>
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
                  comment={comment}
                  setComment={setComment}
                  history={history}
                  onHistorySelect={setAddress}
                  removeHistory={removeHistory}
                  height="100%"
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
            </>
          ) : (
            <>
              <div style={{ flex: 1, minHeight: 0 }}>
                <PickupMap branches={branches} selected={branch} onSelect={setBranch} height="100%" />
              </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
