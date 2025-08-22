import { useEffect, useRef } from "react";

type Props = {
  address: string;
  setAddress: (addr: string) => void;
};

export default function DeliveryMap({ address, setAddress }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      if (!(window as any).ymaps) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      (window as any).ymaps.ready(() => {
        const ymaps = (window as any).ymaps;
        const center: [number, number] = [49.9483, 82.6275];
        const zone = [
          [49.995, 82.55],
          [49.9, 82.55],
          [49.9, 82.7],
          [49.995, 82.7],
        ];
        const map = new ymaps.Map(mapRef.current, {
          center,
          zoom: 12,
          controls: [],
        });
        const polygon = new ymaps.Polygon([zone], {}, {
          fillColor: "rgba(255,85,0,0.15)",
          strokeColor: "#ff5500",
          strokeWidth: 2,
        });
        map.geoObjects.add(polygon);
      });
    };

    initMap();
  }, []);

  return (
    <div style={{ position: "relative", height: 300 }}>
      <div
        ref={mapRef}
        style={{ height: "100%", borderRadius: 8, overflow: "hidden", background: "#e5e5e5" }}
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Адрес доставки"
        style={{
          position: "absolute",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "#fff",
        }}
      />
    </div>
  );
}

