import { useEffect, useMemo, useState } from "react";
import type { ScheduleItem } from "../../data/schedule";

type CurrentShiftCardProps = {
  schedule: ScheduleItem[];
  workerCount: number | null;
  myTurn: number | null;
};

type TimedScheduleItem = ScheduleItem & {
  startMinutes: number;
  endMinutes: number;
  turnNumber: number | null;
};

function toMinutes(time: string | undefined) {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getCurrentMinutes(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function formatRemaining(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}분`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

function CurrentShiftCard({
  schedule,
  workerCount,
  myTurn,
}: CurrentShiftCardProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const timedSchedule = useMemo<TimedScheduleItem[]>(() => {
    let workIndex = 0;

    return schedule.flatMap((item) => {
      const startMinutes = toMinutes(item.start);
      const endMinutes = toMinutes(item.end);

      if (startMinutes === null || endMinutes === null) {
        return [];
      }

      const turnNumber =
        item.type === "work" && workerCount !== null
          ? (workIndex++ % workerCount) + 1
          : null;

      return [{ ...item, startMinutes, endMinutes, turnNumber }];
    });
  }, [schedule, workerCount]);

  if (workerCount === null || myTurn === null) {
    return (
      <div className="rounded-xl border p-5">
        <h2 className="font-semibold">현재 상태</h2>
        <p className="mt-2 text-sm text-gray-400">
          근무 인원과 내 담당 턴을 선택해주세요.
        </p>
      </div>
    );
  }

  if (timedSchedule.length === 0) {
    return (
      <div className="rounded-xl border p-5">
        <h2 className="font-semibold">현재 상태</h2>
        <p className="mt-2 text-sm text-gray-400">
          선택한 인원의 시간표가 없습니다.
        </p>
      </div>
    );
  }

  const currentMinutes = getCurrentMinutes(now);
  const currentItem = timedSchedule.find(
    (item) => item.startMinutes <= currentMinutes && currentMinutes < item.endMinutes,
  );
  const nextMyShift = timedSchedule.find(
    (item) =>
      item.type === "work" &&
      item.turnNumber === myTurn &&
      item.startMinutes > currentMinutes,
  );

  const isMyShift = currentItem?.type === "work" && currentItem.turnNumber === myTurn;
  const remainingMinutes = currentItem ? currentItem.endMinutes - currentMinutes : 0;
  const elapsedMinutes = currentItem ? currentMinutes - currentItem.startMinutes : 0;
  const totalMinutes = currentItem ? currentItem.endMinutes - currentItem.startMinutes : 0;
  const progress = totalMinutes > 0 ? Math.min((elapsedMinutes / totalMinutes) * 100, 100) : 0;

  let title = "근무 전";
  let detail = "오늘 근무 시작 전입니다.";
  let cardColor = "bg-slate-50 border-slate-200";

  if (isMyShift && currentItem) {
    title = "🟢 현재 근무 중";
    detail = `${currentItem.start} - ${currentItem.end} · ${formatRemaining(remainingMinutes)} 남음`;
    cardColor = "bg-green-50 border-green-200";
  } else if (currentItem?.type === "break") {
    title = `🍴 ${currentItem.label ?? "휴식시간"}`;
    detail = `${currentItem.start} - ${currentItem.end} · ${formatRemaining(remainingMinutes)} 남음`;
    cardColor = "bg-amber-50 border-amber-200";
  } else if (currentItem?.type === "work") {
    title = `현재 ${currentItem.turnNumber}턴 근무 중`;
    detail = `${currentItem.start} - ${currentItem.end}`;
  } else if (currentMinutes >= timedSchedule[timedSchedule.length - 1].endMinutes) {
    title = "오늘 근무 종료";
    detail = "오늘 시간표가 모두 끝났습니다.";
  }

  return (
    <div className={`rounded-xl border p-5 ${cardColor}`}>
      <p className="text-sm font-medium text-gray-600">현재 상태</p>
      <h2 className="mt-1 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{detail}</p>

      {currentItem ? (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/80">
            <div
              className={
                currentItem.type === "break" ? "h-full bg-amber-400 transition-all" : "h-full bg-green-500 transition-all"
              }
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {nextMyShift ? (
        <div className="mt-4 rounded-lg bg-white/70 p-3 text-sm">
          <span className="font-semibold">다음 내 근무</span>
          <span className="ml-2 text-gray-600">
            {nextMyShift.start} - {nextMyShift.end}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default CurrentShiftCard;
