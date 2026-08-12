import { useEffect } from "react";

const UPDATE_CHECK_INTERVAL = 24 * 60 * 60_000;

export function useServiceWorkerUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const checkForUpdate = () => {
      void navigator.serviceWorker
        .getRegistration()
        .then((registration) => registration?.update());
    };

    checkForUpdate();
    const intervalId = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, []);
}
