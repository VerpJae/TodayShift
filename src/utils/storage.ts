export type SavedTodaySetup = {
  workerCount: number;
  myTurn: number;
};

export type TodayOffOverride = "off" | "work" | null;

export function getTodayStorageKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `today-turn-setup:${year}-${month}-${day}`;
}

export function getDateFromStorageKey(storageKey: string) {
  return storageKey.slice(-10);
}

export function readTodaySetup(storageKey: string): SavedTodaySetup | null {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as SavedTodaySetup;
    const hasValidWorkerCount =
      Number.isInteger(parsed.workerCount) &&
      parsed.workerCount >= 1 &&
      parsed.workerCount <= 4;
    const hasValidMyTurn =
      Number.isInteger(parsed.myTurn) &&
      parsed.myTurn >= 1 &&
      parsed.myTurn <= parsed.workerCount;

    return hasValidWorkerCount && hasValidMyTurn ? parsed : null;
  } catch {
    return null;
  }
}

export function readWeeklyOffDays() {
  const saved = localStorage.getItem("weekly-off-days");
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as number[];
    return Array.isArray(parsed)
      ? parsed.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      : [];
  } catch {
    return [];
  }
}

export function readTodayOffOverride(storageKey: string): TodayOffOverride {
  const date = getDateFromStorageKey(storageKey);
  const value = localStorage.getItem(`today-off-override:${date}`);
  return value === "off" || value === "work" ? value : null;
}

export function writeTodayOffOverride(
  storageKey: string,
  override: TodayOffOverride,
) {
  const key = `today-off-override:${getDateFromStorageKey(storageKey)}`;

  if (override) {
    localStorage.setItem(key, override);
  } else {
    localStorage.removeItem(key);
  }
}
