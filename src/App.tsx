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
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl shadow-slate-300/40">
        <h1 className="text-2xl font-bold tracking-tight">
          TodayShift 운영을 종료했습니다.
        </h1>
        <p className="mt-5 leading-7 text-slate-600">
          현재는 더 이상 사용하지 않아 서비스를 닫아두었습니다.
        </p>
        <p className="mt-3 leading-7 text-slate-600">
          다시 사용하고 싶다면 저에게 따로 연락해주세요.
        </p>
      </section>
    </main>
  );
}

export default App;
