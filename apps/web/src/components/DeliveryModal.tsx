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
  const m = hours.match(/(\d{2}:\d{2})\s*[–—−-]\s*(\d{2}:\d{2})/);
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
  const [timeError, setTimeError] = useState("");
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

  const formatTime = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    let res = digits;
    if (digits.length >= 3) {
      res = `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    if (digits.length >= 1 && digits.length <= 2) {
      res = digits;
    }
    if (res.length === 5) {
      const h = parseInt(res.slice(0, 2), 10);
      const m = parseInt(res.slice(3, 5), 10);
      if (h > 23) res = `23:${res.slice(3, 5)}`;
      if (m > 59) res = `${res.slice(0, 3)}59`;
    }
    return res;
  };

  const toMin = (t: string) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3, 5));
  const isTimeAllowed = (time: string, hours?: string) => {
    const { open, close, overnight } = parseHours(hours);
    const sel = toMin(time);
    const start = toMin(open);
    const end = toMin(close);
    return overnight ? sel >= start || sel <= end : sel >= start && sel <= end;
  };

  const handleTimeInput = (val: string) => {
    setPickupTime(formatTime(val));
    setTimeError("");
  };

  const handleTimeBlur = (val: string) => {
    const formatted = formatTime(val);
    if (!/^\d{2}:\d{2}$/.test(formatted)) {
      setPickupTime("");
      setTimeError("Введите время в формате ЧЧ:ММ");
      return;
    }
    if (!isTimeAllowed(formatted, currentBranch?.hours)) {
      setPickupTime("");
      setTimeError(`Филиал закрыт в это время (${openTime}–${closeTime})`);
      return;
    }
    setPickupTime(formatted);
    setTimeError("");
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
              pickupTime={pickupTime}
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
              <div style={{ marginBottom: 4, fontSize: 12 }}>Желаемое время самовывоза</div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="00:00"
                maxLength={5}
                value={pickupTime}
                onChange={(e) => handleTimeInput(e.target.value)}
                onBlur={(e) => handleTimeBlur(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
              {timeError && (
                <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>{timeError}</div>
              )}
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
              if (mode === "delivery") {
                addHistory(address);
                close();
                return;
              }
              if (!pickupTime || !isTimeAllowed(pickupTime, currentBranch?.hours)) {
                setTimeError(`Филиал закрыт в это время (${openTime}–${closeTime})`);
                return;
              }
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
              {branches.map((b) => {
                const status =
                  pickupTime && isTimeAllowed(pickupTime, b.hours)
                    ? "открыт"
                    : pickupTime
                    ? "закрыт"
                    : null;
                return (
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
                      <span
                        style={{
                          fontSize: 12,
                          color:
                            status === "закрыт" ? "#d32f2f" : "var(--muted-text)",
                          display: "block",
                          marginLeft: 24,
                        }}
                      >
                        {b.hours}
                        {status && (
                          <span style={{ marginLeft: 4 }}>{status}</span>
                        )}
                      </span>
                    )}
                  </label>
                );
              })}
              <p style={{ fontSize: 14, color: "var(--muted-text)" }}>
                Ассортимент филиалов может отличаться.
              </p>
            </div>
            <PickupMap
              branches={branches}
              selected={branch}
              onSelect={setBranch}
              height={300}
              pickupTime={pickupTime}
            />
            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: "0 0 8px" }}>Желаемое время самовывоза</h3>
              <input
                type="text"
                inputMode="numeric"
                placeholder="00:00"
                maxLength={5}
                value={pickupTime}
                onChange={(e) => handleTimeInput(e.target.value)}
                onBlur={(e) => handleTimeBlur(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
              {timeError && (
                <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>{timeError}</div>
              )}
            </div>
            <button
              onClick={() => {
                if (!pickupTime || !isTimeAllowed(pickupTime, currentBranch?.hours)) {
                  setTimeError(`Филиал закрыт в это время (${openTime}–${closeTime})`);
                  return;
                }
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
        )}
      </div>
    </div>
  );
}

