import { useEffect, useRef } from "react";

export default function DeliveryMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const center: [number, number] = [49.9483, 82.6275];
    const zone: [number, number][] = [
      [49.995, 82.55],
      [49.9, 82.55],
      [49.9, 82.7],
      [49.995, 82.7]
    ];

    if (!mapRef.current) return;

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        await Promise.all([
          new Promise<void>((resolve) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
            link.onload = () => resolve();
          }),
          new Promise<void>((resolve) => {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = () => resolve();
            document.body.appendChild(script);
          })
        ]);
      }

      const L = (window as any).L;
      const map = L.map(mapRef.current!).setView(center, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      L.polygon(zone, { color: "#ff5500", fillOpacity: 0.15 }).addTo(map);
    };

    loadLeaflet();
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ height: 300, borderRadius: 8, background: "#e5e5e5" }}
    />
  );
}
