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
              mobile
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
            <input
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Адрес доставки"
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "#fff",
                marginBottom: 8,
              }}
            />
            {history.length > 0 && (
              <div className="history-list" style={{ marginBottom: 8 }}>
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 4,
                marginBottom: 8,
              }}
            >
              <input
                name="entrance"
                value={entrance}
                onChange={(e) => setEntrance(e.target.value)}
                placeholder="Подъезд"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "#fff",
                }}
              />
              <input
                name="doorCode"
                value={doorCode}
                onChange={(e) => setDoorCode(e.target.value)}
                placeholder="Код двери"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "#fff",
                }}
              />
              <input
                name="floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Этаж"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "#fff",
                }}
              />
              <input
                name="apartment"
                value={apt}
                onChange={(e) => setApt(e.target.value)}
                placeholder="Квартира"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "#fff",
                }}
              />
              <input
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий"
                style={{
                  gridColumn: "1 / -1",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "#fff",
                }}
              />
            </div>
            <DeliveryMap
              mobile={false}
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

