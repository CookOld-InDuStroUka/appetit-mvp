let ymapsPromise: Promise<any> | null = null;

export function loadYmaps(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  const w = window as any;
  if (w.ymaps) {
    return Promise.resolve(w.ymaps);
  }
  if (!ymapsPromise) {
    ymapsPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
      const base = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.src = apiKey ? `${base}&apikey=${apiKey}` : base;
      script.onload = () => {
        w.ymaps.ready(() => resolve(w.ymaps));
      };
      document.head.appendChild(script);
    });
  }
  return ymapsPromise;
}
