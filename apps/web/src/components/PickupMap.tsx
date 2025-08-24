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
          controls: ["geolocationControl", "zoomControl"],
        });

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

  return <div ref={mapRef} style={{ height, borderRadius: 8, overflow: "hidden", background: "#e5e5e5" }} />;
}

