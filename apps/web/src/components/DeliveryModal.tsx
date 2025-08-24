import React, { useEffect, useState } from "react";
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

  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleBackdrop = () => close();
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  if (mobile) {
    return (
      <div className="modal-backdrop" onClick={handleBackdrop}>
        <div
          className="modal"
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            borderRadius: 0,
            position: "relative",
          }}
          onClick={stopProp}
        >
          {mode === "delivery" ? (
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
          ) : (
            <PickupMap
              mobile
              branches={branches}
              selected={branch}
              onSelect={setBranch}
              height="100%"
            />
          )}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <DeliveryToggle value={mode} onChange={setMode} />
          </div>
          <button
            onClick={close}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-text)",
              position: "absolute",
              top: 16,
              right: 16,
            }}
            aria-label="Закрыть"
          >
            ×
          </button>
          <button
            onClick={() => {
              if (mode === "delivery") addHistory(address);
              close();
            }}
            style={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              width: "calc(100% - 32px)",
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
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div
        className="modal"
        style={{ maxWidth: 520 }}
        onClick={stopProp}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Способ получения</h2>
          <button
            onClick={close}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-text)",
              position: "absolute",
              right: 0,
              top: 0,
            }}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <DeliveryToggle value={mode} onChange={setMode} />
        </div>

        {mode === "delivery" ? (
          <>
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
              height={300}
            />
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
              height={300}
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
          </>
        )}
      </div>
    </div>
  );
}

