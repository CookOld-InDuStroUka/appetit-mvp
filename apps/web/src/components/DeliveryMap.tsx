import { useEffect, useRef } from "react";

type Props = {
  address: string;
  setAddress: (addr: string) => void;
  apt: string;
  setApt: (v: string) => void;
  entrance: string;
  setEntrance: (v: string) => void;
  doorCode: string;
  setDoorCode: (v: string) => void;
  floor: string;
  setFloor: (v: string) => void;
  height?: number;
};

export default function DeliveryMap({
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
  height = 360,
}: Props) {
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
          controls: [],
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

        if (inputRef.current && ymaps.SuggestView) {
          try {
            const suggest = new ymaps.SuggestView(inputRef.current);
            suggest.events.add("select", (e: any) => {
              geocodeAddress(e.get("item").value);
            });
          } catch (err) {
            console.warn("Yandex suggest unavailable", err);
          }
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

        const locateMe = () => {
          const ymaps = (window as any).ymaps;
          if (!ymaps) return;
          ymaps.geolocation.get().then((res: any) => {
            const position = res.geoObjects.position || res.geoObjects.get(0).geometry.getCoordinates();
            const coords: [number, number] = position;
            ymaps.geocode(coords).then((geo: any) => {
              const first = geo.geoObjects.get(0);
              if (first) {
                setAddress(first.getAddressLine());
              }
            });
            placeMarker(coords);
            map.setCenter(coords, 16);
          });
        };

        (map as any)._locateMe = locateMe;
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
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 8,
          right: 56,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
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
          onBlur={(e) => {
            const ymaps = (window as any).ymaps;
            if (ymaps && e.currentTarget.value) {
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
          }}
          placeholder="Адрес доставки"
          required
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "#fff",
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 4,
          }}
        >
          <input
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
        </div>
      </div>
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

