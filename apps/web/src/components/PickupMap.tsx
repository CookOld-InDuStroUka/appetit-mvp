import { useEffect, useRef } from "react";

export type Branch = {
  id: string;
  name: string;
  coords: [number, number];
};

type Props = {
  branches: Branch[];
  selected: string;
  onSelect: (id: string) => void;
  height?: number;
};

export default function PickupMap({ branches, selected, onSelect, height = 300 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      if (!(window as any).ymaps) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
          const base = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
          script.src = apiKey ? `${base}&apikey=${apiKey}` : base;
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      (window as any).ymaps.ready(() => {
        const ymaps = (window as any).ymaps;
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
      <div
        style={{
          position: "absolute",
          bottom: 8,
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
            width: 32,
            height: 32,
            borderRadius: 4,
            border: "1px solid var(--border)",
            background: "#fff",
            cursor: "pointer",
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
            width: 32,
            height: 32,
            borderRadius: 4,
            border: "1px solid var(--border)",
            background: "#fff",
            cursor: "pointer",
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
            width: 32,
            height: 32,
            borderRadius: 4,
            border: "1px solid var(--border)",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          -
        </button>
      </div>
    </div>
  );
}

