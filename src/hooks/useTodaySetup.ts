import { useEffect, useState } from "react";
import { getDefaultWorkerCount } from "../utils/date";
import {
  getTodayStorageKey,
  readTodaySetup,
} from "../utils/storage";

export function useTodaySetup() {
  const [todayStorageKey, setTodayStorageKey] = useState(getTodayStorageKey);
  const [savedTodaySetup] = useState(() => readTodaySetup(todayStorageKey));
  const [workerCount, setWorkerCount] = useState<number | null>(
    savedTodaySetup?.workerCount ?? getDefaultWorkerCount(),
  );
  const [myTurn, setMyTurn] = useState<number | null>(savedTodaySetup?.myTurn ?? null);
  const [isSetupEditing, setIsSetupEditing] = useState(!savedTodaySetup);
  const isSetupComplete = workerCount !== null && myTurn !== null;

  useEffect(() => {
    if (!isSetupComplete) return;
    localStorage.setItem(todayStorageKey, JSON.stringify({ workerCount, myTurn }));
  }, [isSetupComplete, myTurn, todayStorageKey, workerCount]);

  useEffect(() => {
    const syncCurrentDate = () => {
      const nextStorageKey = getTodayStorageKey();
      if (nextStorageKey === todayStorageKey) return;

      setTodayStorageKey(nextStorageKey);
      setWorkerCount(getDefaultWorkerCount());
      setMyTurn(null);
      setIsSetupEditing(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncCurrentDate();
      }
    };

    window.addEventListener("pageshow", syncCurrentDate);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const intervalId = window.setInterval(syncCurrentDate, 60_000);

    return () => {
      window.removeEventListener("pageshow", syncCurrentDate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [todayStorageKey]);

  const selectWorkerCount = (count: number) => {
    setWorkerCount(count);
    setMyTurn(null);
    localStorage.removeItem(todayStorageKey);
  };

  const selectMyTurn = (turn: number) => {
    setMyTurn(turn);
    setIsSetupEditing(false);
  };

  return {
    todayStorageKey,
    workerCount,
    myTurn,
    isSetupComplete,
    isSetupEditing,
    setIsSetupEditing,
    selectWorkerCount,
    selectMyTurn,
  };
}
