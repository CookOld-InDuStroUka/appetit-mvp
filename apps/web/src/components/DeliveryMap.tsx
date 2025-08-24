import { useEffect, useRef } from "react";
import { loadYmaps } from "../utils/ymapsLoader";

type Props = {
  address: string;
  setAddress: (addr: string) => void;
  apt: string;
  setApt: (v: string) => void;
  entrance: string;
  setEntrance: (v: string) => void;
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
      if (!ymaps || !mapRef.current) {
        if (mapRef.current) {
          mapRef.current.innerHTML =
            '<div style="padding:8px">Карта недоступна: нет ключа Yandex Maps</div>';
        }
        return;
      }
      const center: [number, number] = [49.9483, 82.6275];
        const map = new ymaps.Map(mapRef.current, {
          center,
          zoom: 12,
          controls: [],
        });
        mapInstance.current = map;

        const violetZone = [
          [49.95846, 82.624979],
          [49.956209, 82.615576],
          [49.955639, 82.613504],
          [49.953047, 82.585578],
          [49.954739, 82.579566],
          [49.95554, 82.575413],
          [49.958677, 82.572319],
          [49.975467, 82.555823],
          [49.984726, 82.577318],
          [49.990487, 82.573297],
          [49.994606, 82.583638],
          [49.988557, 82.592573],
          [49.968048, 82.629707],
          [49.960424, 82.627909],
        ];
        const violetPolygon = new ymaps.Polygon([violetZone], {}, {
          fillColor: "rgba(128,0,128,0.15)",
          strokeColor: "#800080",
          strokeWidth: 2,
          interactivityModel: "default#transparent",
        });
        map.geoObjects.add(violetPolygon);

        const orangeZone = [
          [49.93986, 82.610628],
          [49.938199, 82.611808],
          [49.936349, 82.615632],
          [49.935313, 82.620763],
          [49.933884, 82.620535],
          [49.933998, 82.617711],
          [49.936231, 82.610828],
          [49.934135, 82.609081],
          [49.928487, 82.605859],
          [49.926869, 82.616025],
          [49.920376, 82.612297],
          [49.91737, 82.607254],
          [49.915546, 82.607695],
          [49.906701, 82.599742],
          [49.89852, 82.580903],
          [49.892806, 82.577399],
          [49.885311, 82.587705],
          [49.885109, 82.59728],
          [49.883636, 82.598312],
          [49.881393, 82.611969],
          [49.880802, 82.623488],
          [49.880306, 82.627112],
          [49.876196, 82.629152],
          [49.879426, 82.634032],
          [49.880108, 82.641135],
          [49.883487, 82.647334],
          [49.885937, 82.649278],
          [49.88589, 82.660533],
          [49.888578, 82.667409],
          [49.891586, 82.668081],
          [49.894293, 82.669307],
          [49.895057, 82.674867],
          [49.898049, 82.672002],
          [49.902556, 82.667219],
          [49.905635, 82.663513],
          [49.903561, 82.655182],
          [49.906244, 82.638877],
          [49.914682, 82.64091],
          [49.916573, 82.655153],
          [49.922559, 82.652636],
          [49.936336, 82.644132],
          [49.938521, 82.628097],
        ];
        const orangePolygon = new ymaps.Polygon([orangeZone], {}, {
          fillColor: "rgba(255,165,0,0.15)",
          strokeColor: "#FFA500",
          strokeWidth: 2,
          interactivityModel: "default#transparent",
        });
        map.geoObjects.add(orangePolygon);

        const blueZone = [
          [49.953563, 82.616128],
          [49.951029, 82.605287],
          [49.950503, 82.602815],
          [49.949636, 82.589558],
          [49.94914, 82.588454],
          [49.948718, 82.588185],
          [49.94824, 82.588172],
          [49.947805, 82.588341],
          [49.947403, 82.588782],
          [49.947017, 82.590184],
          [49.945619, 82.597499],
          [49.942039, 82.616519],
          [49.941478, 82.618907],
          [49.9414, 82.620406],
          [49.941241, 82.621081],
          [49.941056, 82.621353],
          [49.940805, 82.625364],
          [49.941579, 82.627941],
          [49.942924, 82.637491],
          [49.943669, 82.64145],
          [49.945926, 82.643886],
          [49.944284, 82.64739],
          [49.939327, 82.657186],
          [49.937576, 82.660859],
          [49.935243, 82.664446],
          [49.933181, 82.667905],
          [49.930167, 82.669151],
          [49.927921, 82.669487],
          [49.92493, 82.669023],
          [49.921582, 82.667356],
          [49.920931, 82.675011],
          [49.922658, 82.675896],
          [49.923376, 82.678448],
          [49.925409, 82.678551],
          [49.945845, 82.683826],
          [49.948076, 82.690761],
          [49.951344, 82.689303],
          [49.953217, 82.686525],
          [49.956748, 82.683335],
          [49.956815, 82.67961],
          [49.95851, 82.674877],
          [49.958204, 82.669341],
          [49.981605, 82.669084],
          [49.982165, 82.654651],
          [49.983426, 82.65321],
          [49.983185, 82.642673],
          [49.980664, 82.637137],
          [49.977341, 82.632892],
          [49.976442, 82.631727],
          [49.975839, 82.629733],
          [49.97503, 82.62938],
          [49.974336, 82.630404],
          [49.973629, 82.632182],
          [49.965642, 82.634127],
          [49.960025, 82.629872],
          [49.958511, 82.628759],
          [49.95632, 82.624224],
        ];
        const bluePolygon = new ymaps.Polygon([blueZone], {}, {
          fillColor: "rgba(0,0,255,0.15)",
          strokeColor: "#0000FF",
          strokeWidth: 2,
          interactivityModel: "default#transparent",
        });
        map.geoObjects.add(bluePolygon);

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
          ymaps.geolocation
            .get()
            .then((res: any) => {
              const position =
                res.geoObjects.position ||
                res.geoObjects.get(0).geometry.getCoordinates();
              const coords: [number, number] = position;
              ymaps.geocode(coords, { boundedBy: BOUNDS }).then((geo: any) => {
                const first = geo.geoObjects.get(0);
                if (first) {
                  setAddress(first.getAddressLine());
                }
              });
              placeMarker(coords);
              map.setCenter(coords, 16);
            })
            .catch(() => {
              /* geolocation unavailable */
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
      <div
        style={mobile ? {
          position: "absolute",
          bottom: 72,
          left: 8,
          right: 56,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        } : {
          position: "absolute",
          bottom: 8,
          left: 8,
          width: 260,
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

