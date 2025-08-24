import { useEffect, useRef } from "react";
import { loadYmaps } from "../utils/ymapsLoader";

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
  comment: string;
  setComment: (v: string) => void;
  history: string[];
  onHistorySelect: (addr: string) => void;
  removeHistory: (addr: string) => void;
  height?: number | string;
  mobile?: boolean;
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
  comment,
  setComment,
  history,
  onHistorySelect,
  removeHistory,
  height = 360,
  mobile = false,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocodeRef = useRef<((q: string) => void) | null>(null);
  const BOUNDS: [[number, number], [number, number]] = [
    [49.7, 82.4],
    [50.1, 83.1],
  ];

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      const ymaps = await loadYmaps();
      if (!ymaps || !mapRef.current) return;
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
          interactivityModel: "default#transparent",
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
          ymaps.geocode(query, { boundedBy: BOUNDS }).then((res: any) => {
            const first = res.geoObjects.get(0);
            if (first) {
              const coords = first.geometry.getCoordinates();
              setAddress(first.getAddressLine());
              placeMarker(coords);
              map.setCenter(coords, 16);
            }
          });
        };
        geocodeRef.current = geocodeAddress;

        // Yandex Suggest requires a separate API permission. Attempting to
        // initialize it without the necessary access throws a FeatureRemovedError
        // that bubbles out of the library. To keep the map functional for keys
        // without Suggest, we simply skip its initialization entirely. Manual
        // address entry still triggers geocoding on Enter/blur.
        // (SuggestView initialization removed to avoid FeatureRemovedError.)

        map.events.add("click", (e: any) => {
          const coords = e.get("coords") as [number, number];
          ymaps.geocode(coords, { boundedBy: BOUNDS }).then((res: any) => {
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
            ymaps.geocode(coords, { boundedBy: BOUNDS }).then((geo: any) => {
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
    };

    initMap();
  }, []);

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
            bottom: 8,
            left: 8,
            right: 56,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {history.length > 0 && (
            <div className="history-list">
              {history.map((h) => (
                <div key={h} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                  <button
                    onClick={() => {
                      geocodeRef.current?.(h);
                      onHistorySelect(h);
                    }}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "var(--text)",
                    }}
                  >
                    {h}
                  </button>
                  <button
                    onClick={() => removeHistory(h)}
                    aria-label="Удалить"
                    style={{
                      marginLeft: 8,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted-text)",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={inputRef}
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && mapInstance.current) {
                const ymaps = (window as any).ymaps;
                if (ymaps) {
                  ymaps
                    .geocode(e.currentTarget.value, { boundedBy: BOUNDS })
                    .then((res: any) => {
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
                ymaps
                  .geocode(e.currentTarget.value, { boundedBy: BOUNDS })
                  .then((res: any) => {
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
              name="entrance"
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
              name="doorCode"
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
              name="floor"
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
              name="apartment"
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
            <input
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Комментарий"
              style={{
                gridColumn: "1 / -1",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "#fff",
              }}
            />
          </div>
        </div>
      )}
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

