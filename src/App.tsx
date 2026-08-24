import { useEffect } from "react";

function App() {
  useEffect(() => {
    const removeLegacyPwa = async () => {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.allSettled(
          registrations.map((registration) => registration.unregister()),
        );
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.allSettled(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }
    };

    void removeLegacyPwa();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-8">
      <a
        href="/farewell.jpg"
        target="_blank"
        rel="noreferrer"
        aria-label="손편지 원본 이미지 보기"
        className="mx-auto block w-full max-w-4xl"
      >
        <img
          src="/farewell.jpg"
          alt="TodayShift 운영 종료 손편지"
          className="block h-auto w-full"
        />
      </a>
    </main>
  );
}

export default App;
