import type { ScheduleItem } from "../data/schedule";

export type ScheduleViewItem = ScheduleItem & {
  startMinutes: number;
  endMinutes: number;
  turnNumber: number | null;
};

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getCurrentMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function buildScheduleView(
  schedule: ScheduleItem[],
  workerCount: number | null,
): ScheduleViewItem[] {
  let workIndex = 0;

  return schedule.map((item) => {
    const turnNumber =
      item.type === "work" && workerCount !== null
        ? (workIndex++ % workerCount) + 1
        : null;

    return {
      ...item,
      startMinutes: timeToMinutes(item.start),
      endMinutes: timeToMinutes(item.end),
      turnNumber,
    };
  });
}
