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
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

      if (!apiKey) {
        console.warn('Yandex Maps API key is not provided');
        resolve(null);
        return;
      }

      const script = document.createElement('script');
      const base = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
      script.src = `${base}&apikey=${apiKey}`;
      script.onload = () => {
        if (w.ymaps) {
          w.ymaps.ready(() => resolve(w.ymaps));
        } else {
          resolve(null);
        }
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }
  return ymapsPromise;
}
