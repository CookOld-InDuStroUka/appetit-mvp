import React, { useEffect, useState } from "react";

export default function DeliveryMap() {
  const [rl, setRl] = useState<any>(null);

  useEffect(() => {
    // Dynamically import leaflet and react-leaflet on client side
    import("react-leaflet").then((mod) => setRl(mod));
  }, []);

  if (!rl) {
    return <div style={{ height: 300, borderRadius: 8, background: "#e5e5e5" }} />;
  }

  const { MapContainer, TileLayer, Polygon } = rl;
  const center: [number, number] = [49.9483, 82.6275];
  const zone: [number, number][] = [
    [49.995, 82.55],
    [49.90, 82.55],
    [49.90, 82.70],
    [49.995, 82.70],
  ];

  return (
    <div style={{ position: "relative", height: 300 }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polygon positions={zone} pathOptions={{ color: "#ff5500", fillOpacity: 0.15 }} />
      </MapContainer>
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: "var(--card-bg)",
          padding: 8,
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          width: 220,
        }}
      >
        <label style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
          Адрес доставки
          <input
            type="text"
            placeholder="Усть-Каменогорск"
            style={{
              display: "block",
              width: "100%",
              marginTop: 4,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid var(--border)",
              background: "var(--input-bg)",
              color: "var(--text)",
            }}
          />
        </label>
      </div>
    </div>
  );
}

