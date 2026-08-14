import { useCallback, useEffect, useState } from "react";
import { REMINDER_WORKER_URL } from "../config/reminder";
import {
  getDateFromStorageKey,
  readTodayOffOverride,
  readWeeklyOffDays,
  writeTodayOffOverride,
} from "../utils/storage";
import type { TodayOffOverride } from "../utils/storage";

export function useTodayOff(todayStorageKey: string) {
  const [weeklyOffDays, setWeeklyOffDays] = useState(readWeeklyOffDays);
  const [storedOverride, setStoredOverride] = useState<{
    storageKey: string;
    value: TodayOffOverride;
  }>(() => ({
    storageKey: todayStorageKey,
    value: readTodayOffOverride(todayStorageKey),
  }));
  const todayOffOverride =
    storedOverride.storageKey === todayStorageKey
      ? storedOverride.value
      : readTodayOffOverride(todayStorageKey);
  const todayDay = new Date().getDay();
  const isTodayOff =
    todayOffOverride === "off" ||
    (todayOffOverride !== "work" && weeklyOffDays.includes(todayDay));

  const syncTodayOff = useCallback(async (subscription?: PushSubscription | null) => {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    const activeSubscription =
      subscription ??
      (await navigator.serviceWorker.ready.then((registration) =>
        registration.pushManager.getSubscription(),
      ));

    if (!activeSubscription) return;

    await fetch(`${REMINDER_WORKER_URL}/api/off-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: activeSubscription.endpoint,
        date: getDateFromStorageKey(todayStorageKey),
        isOff: isTodayOff,
        weeklyOffDays,
      }),
    });
  }, [isTodayOff, todayStorageKey, weeklyOffDays]);

  useEffect(() => {
    void syncTodayOff();
  }, [syncTodayOff]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncTodayOff();
      }
    };
    const handlePageShow = () => void syncTodayOff();

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncTodayOff]);

  const updateTodayOffOverride = (override: TodayOffOverride) => {
    writeTodayOffOverride(todayStorageKey, override);
    setStoredOverride({ storageKey: todayStorageKey, value: override });
  };

  return {
    weeklyOffDays,
    setWeeklyOffDays,
    todayDay,
    todayOffOverride,
    isTodayOff,
    updateTodayOffOverride,
    syncTodayOff,
  };
}
