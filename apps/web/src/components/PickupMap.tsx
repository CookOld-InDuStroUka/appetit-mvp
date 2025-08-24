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
};

export default function PickupMap({
  branches,
  selected,
  onSelect,
  height = 300,
  mobile = false,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const ymaps = await loadYmaps();
      if (!ymaps || !mapRef.current) {
        if (mapRef.current) {
          mapRef.current.innerHTML =
            '<div style="padding:8px">Карта недоступна: нет ключа Yandex Maps</div>';
        }
        return;
      }
      const center: [number, number] = branches[0]?.coords || [49.9483, 82.6275];
      const map = new ymaps.Map(mapRef.current, {
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
            {branches.map((b) => (
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
                    <span style={{
                      display: "block",
                      fontSize: 12,
                      color: "var(--muted-text)",
                    }}>
                      {b.hours}
                    </span>
                  )}
                </button>
              </div>
            ))}
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

