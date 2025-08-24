import { useEffect, useRef } from "react";

type Props = {
  address: string;
  setAddress: (addr: string) => void;
  height?: number;
};

export default function DeliveryMap({ address, setAddress, height = 360 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

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
          controls: ["geolocationControl"],
        });
        mapInstance.current = map;
        const polygon = new ymaps.Polygon([zone], {}, {
          fillColor: "rgba(255,85,0,0.15)",
          strokeColor: "#ff5500",
          strokeWidth: 2,
        });
        map.geoObjects.add(polygon);

        const placeMarker = (coords: [number, number]) => {
          if (markerRef.current) {
            map.geoObjects.remove(markerRef.current);
          }
          markerRef.current = new ymaps.Placemark(coords, {}, {
            preset: "islands#dotIcon",
            iconColor: "#ff5500",
          });
          map.geoObjects.add(markerRef.current);
        };

        const geocodeAddress = (query: string) => {
          ymaps.geocode(query).then((res: any) => {
            const first = res.geoObjects.get(0);
            if (first) {
              const coords = first.geometry.getCoordinates();
              setAddress(first.getAddressLine());
              placeMarker(coords);
              map.setCenter(coords, 16);
            }
          });
        };

        if (inputRef.current) {
          const suggest = new ymaps.SuggestView(inputRef.current);
          suggest.events.add("select", (e: any) => {
            geocodeAddress(e.get("item").value);
          });
        }

        map.events.add("click", (e: any) => {
          const coords = e.get("coords") as [number, number];
          ymaps.geocode(coords).then((res: any) => {
            const first = res.geoObjects.get(0);
            if (first) {
              setAddress(first.getAddressLine());
            }
          });
          placeMarker(coords);
        });
      });
    };

    initMap();
  }, []);

  return (
    <div style={{ position: "relative", height }}>
      <div
        ref={mapRef}
        style={{ height: "100%", borderRadius: 8, overflow: "hidden", background: "#e5e5e5" }}
      />
      <input
        ref={inputRef}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && mapInstance.current) {
            const ymaps = (window as any).ymaps;
            if (ymaps) {
              ymaps.geocode(e.currentTarget.value).then((res: any) => {
                const first = res.geoObjects.get(0);
                if (first) {
                  const coords = first.geometry.getCoordinates();
                  setAddress(first.getAddressLine());
                  if (markerRef.current) {
                    mapInstance.current.geoObjects.remove(markerRef.current);
                  }
                  markerRef.current = new ymaps.Placemark(coords, {}, {
                    preset: "islands#dotIcon",
                    iconColor: "#ff5500",
                  });
                  mapInstance.current.geoObjects.add(markerRef.current);
                  mapInstance.current.setCenter(coords, 16);
                }
              });
            }
          }
        }}
        placeholder="Адрес доставки"
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          width: "60%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "#fff",
        }}
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
          onClick={() => mapInstance.current && mapInstance.current.zoomIn()}
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
          onClick={() => mapInstance.current && mapInstance.current.zoomOut()}
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

