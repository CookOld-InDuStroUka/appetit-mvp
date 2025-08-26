import { useEffect, useRef } from "react";
import { loadYmaps } from "../utils/ymapsLoader";

export type Branch = {
  id: string;
  name: string;
  coords: [number, number];
  hours?: string;
};

type Props = {
  branches: Branch[];
  selected: string;
  onSelect: (id: string) => void;
  height?: number | string;
  mobile?: boolean;
  pickupTime?: string;
};

export default function PickupMap({
  branches,
  selected,
  onSelect,
  height = 300,
  mobile = false,
  pickupTime,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const ymaps = await loadYmaps();
      const el = mapRef.current;
      if (!ymaps || !el || typeof (ymaps as any).Map !== "function") {
        el &&
          (el.innerHTML =
            '<div style="padding:8px">Карта недоступна: нет ключа Yandex Maps</div>');
        return;
      }
      const center: [number, number] = branches[0]?.coords || [49.9483, 82.6275];
      const map = new (ymaps.Map as any)(el, {
        center,
        zoom: 12,
        controls: [],
      });
      mapInstance.current = map;

      const locateMe = () => {
        ymaps.geolocation.get().then((res: any) => {
          const position =
            res.geoObjects.position ||
            res.geoObjects.get(0).geometry.getCoordinates();
          map.setCenter(position, 14);
        });
      };
      (map as any)._locateMe = locateMe;

      branches.forEach((b) => {
        const pm = new ymaps.Placemark(
          b.coords,
          { hintContent: b.name },
          { preset: "islands#circleIcon", iconColor: b.id === selected ? "#ff5500" : "#000" }
        );
        pm.events.add("click", () => onSelect(b.id));
        markers.current[b.id] = pm;
        map.geoObjects.add(pm);
      });
    };

    initMap();
  }, [branches]);

  useEffect(() => {
    const ymaps = (window as any).ymaps;
    if (!ymaps) return;
    Object.entries(markers.current).forEach(([id, pm]) => {
      pm.options.set("iconColor", id === selected ? "#ff5500" : "#000");
    });
  }, [selected]);

  const parseHours = (hours?: string) => {
    if (!hours) return { open: "00:00", close: "23:59", overnight: false };
    const lower = hours.toLowerCase();
    if (lower.includes("круглосуточ")) return { open: "00:00", close: "23:59", overnight: false };
    const m = hours.match(/(\d{2}:\d{2})\s*[–—−-]\s*(\d{2}:\d{2})/);
    if (m) {
      const open = m[1];
      const close = m[2];
      return { open, close, overnight: close < open };
    }
    return { open: "00:00", close: "23:59", overnight: false };
  };

  const toMin = (t: string) =>
    parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3, 5));

  const isTimeAllowed = (time: string, hours?: string) => {
    if (!time) return true;
    const { open, close, overnight } = parseHours(hours);
    const sel = toMin(time);
    const start = toMin(open);
    const end = toMin(close);
    return overnight ? sel >= start || sel <= end : sel >= start && sel <= end;
  };

  return (
    <div style={{ position: "relative", height }}>
      <div
        ref={mapRef}
        style={{ height: "100%", borderRadius: 8, overflow: "hidden", background: "#e5e5e5" }}
      />
      {mobile && (
        <div
          style={{
            position: "absolute",
            bottom: 72,
            left: 8,
            right: 56,
          }}
        >
          <div
            className="history-list"
            style={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: 8,
              padding: 8,
            }}
          >
            <h3 style={{ margin: "0 0 8px" }}>Откуда хотите забрать</h3>
            {branches.map((b) => {
              const status =
                pickupTime && isTimeAllowed(pickupTime, b.hours)
                  ? "открыт"
                  : pickupTime
                  ? "закрыт"
                  : null;
              return (
                <div
                  key={b.id}
                  style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
                >
                  <button
                    onClick={() => onSelect(b.id)}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: b.id === selected ? "var(--accent)" : "var(--text)",
                      fontSize: 16,
                    }}
                  >
                    {b.name}
                    {b.hours && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 12,
                          color:
                            status === "закрыт" ? "#d32f2f" : "var(--muted-text)",
                        }}
                      >
                        {b.hours}
                        {status && <span style={{ marginLeft: 4 }}>{status}</span>}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: mobile ? 72 : 8,
          right: 8,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <button
          onClick={() => mapInstance.current && (mapInstance.current as any)._locateMe?.()}
          aria-label="Моё местоположение"
          style={{
            width: mobile ? 40 : 32,
            height: mobile ? 40 : 32,
            borderRadius: 4,
            border: "1px solid var(--border)",
            background: "#fff",
            cursor: "pointer",
            fontSize: mobile ? 20 : 16,
          }}
        >
          📍
        </button>
        <button
          onClick={() => {
            if (mapInstance.current) {
              const current = mapInstance.current.getZoom();
              mapInstance.current.setZoom(current + 1);
            }
          }}
          aria-label="Увеличить"
          style={{
            width: mobile ? 40 : 32,
            height: mobile ? 40 : 32,
            borderRadius: 4,
            border: "1px solid var(--border)",
            background: "#fff",
            cursor: "pointer",
            fontSize: mobile ? 20 : 16,
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            if (mapInstance.current) {
              const current = mapInstance.current.getZoom();
              mapInstance.current.setZoom(current - 1);
            }
          }}
          aria-label="Уменьшить"
          style={{
            width: mobile ? 40 : 32,
            height: mobile ? 40 : 32,
            borderRadius: 4,
            border: "1px solid var(--border)",
            background: "#fff",
            cursor: "pointer",
            fontSize: mobile ? 20 : 16,
          }}
        >
          -
        </button>
      </div>
    </div>
  );
}

