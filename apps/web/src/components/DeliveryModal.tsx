import React, { useEffect, useState } from "react";
import DeliveryToggle from "./DeliveryToggle";
import DeliveryMap from "./DeliveryMap";
import PickupMap from "./PickupMap";
import { useDelivery } from "./DeliveryContext";

function parseHours(hours?: string) {
  if (!hours) return { open: "00:00", close: "23:59", overnight: false };
  const lower = hours.toLowerCase();
  if (lower.includes("круглосуточ")) {
    return { open: "00:00", close: "23:59", overnight: false };
  }
  const m = hours.match(/(\d{2}:\d{2})\s*[–—-]\s*(\d{2}:\d{2})/);
  if (m) {
    const open = m[1];
    const close = m[2];
    return { open, close, overnight: close < open };
  }
  return { open: "00:00", close: "23:59", overnight: false };
}

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
    floor,
    setFloor,
    comment,
    setComment,
    branch,
    setBranch,
    pickupTime,
    setPickupTime,
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

  const currentBranch = branches.find((b) => b.id === branch);
  const { open: openTime, close: closeTime, overnight } = parseHours(currentBranch?.hours);
  const handleTimeChange = (val: string) => {
    const toMin = (t: string) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3, 5));
    const sel = toMin(val);
    const start = toMin(openTime);
    const end = toMin(closeTime);
    const valid = overnight ? sel >= start || sel <= end : sel >= start && sel <= end;
    if (valid) setPickupTime(val);
  };

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
          {mode === "pickup" && (
            <div
              style={{
                position: "absolute",
                bottom: 72,
                left: "50%",
                transform: "translateX(-50%)",
                width: "calc(100% - 32px)",
              }}
            >
              <div style={{ marginBottom: 4, fontSize: 12 }}>Желаемое время самовывоза (Астана)</div>
              <input
                type="time"
                lang="ru"
                value={pickupTime}
                min={openTime}
                max={!overnight ? closeTime : undefined}
                onChange={(e) => handleTimeChange(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <DeliveryToggle
              value={mode}
              onChange={setMode}
              style={{ width: 240 }}
            />
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
              fontSize: 24,
              width: 32,
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
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
        style={{ maxWidth: 640 }}
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
              fontSize: 24,
              width: 32,
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
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
              floor={floor}
              setFloor={setFloor}
              comment={comment}
              setComment={setComment}
              history={history}
              onHistorySelect={setAddress}
              removeHistory={removeHistory}
              height={420}
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
              <h3 style={{ margin: "0 0 8px" }}>Откуда хотите забрать</h3>
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
                  {b.hours && (
                    <span style={{ fontSize: 12, color: "var(--muted-text)", display: "block", marginLeft: 24 }}>
                      {b.hours}
                    </span>
                  )}
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
            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: "0 0 8px" }}>Желаемое время самовывоза (Астана)</h3>
              <input
                type="time"
                lang="ru"
                value={pickupTime}
                min={openTime}
                max={!overnight ? closeTime : undefined}
                onChange={(e) => handleTimeChange(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
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
  );
}

