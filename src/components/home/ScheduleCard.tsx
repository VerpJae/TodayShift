import { useEffect, useState } from "react";
import type { ScheduleItem } from "../../data/schedule";
import NotificationSetting from "./NotificationSetting";

type ScheduleCardProps = {
  schedule: ScheduleItem[];
  workerCount: number | null;
  myTurn: number | null;
};

function toMinutes(time: string | undefined) {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return Number.isNaN(hours) || Number.isNaN(minutes)
    ? null
    : hours * 60 + minutes;
}

function ScheduleCard({
  schedule,
  workerCount,
  myTurn,
}: ScheduleCardProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="rounded-xl border p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold">오늘 시간표</h2>
      </div>

      <NotificationSetting
        schedule={schedule}
        workerCount={workerCount}
        myTurn={myTurn}
      />

      {workerCount === null ? (
        <p className="text-gray-400">
          근무 패턴을 선택해주세요.
        </p>
      ) : (
        <div className="space-y-2">
            {(() => {
                let workIndex = 0;

                return schedule.map((item, index) => {
                const startMinutes = toMinutes(item.start);
                const endMinutes = toMinutes(item.end);
                const isCurrent =
                  startMinutes !== null &&
                  endMinutes !== null &&
                  startMinutes <= currentMinutes &&
                  currentMinutes < endMinutes;
                const isPast = endMinutes !== null && currentMinutes >= endMinutes;
                const timeStateClass = isCurrent
                  ? "ring-2 ring-blue-600 shadow-lg"
                  : isPast
                    ? "shadow-inner"
                    : "shadow-sm";

                if (item.type === "break") {
                    return (
                    <div
                        key={index}
                        className={`relative rounded-lg p-3 text-center transition ${timeStateClass} ${
                          isPast
                            ? "bg-slate-300 text-slate-500"
                            : isCurrent
                              ? "bg-blue-100 text-blue-900"
                              : "bg-gray-200 text-gray-500"
                        }`}
                    >
                        🍚 {item.label}

                        <span className="ml-2">
                        {item.start} - {item.end}
                        </span>

                        {isCurrent ? (
                          <span className="ml-2 rounded bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white">
                            지금
                          </span>
                        ) : null}

                        {isPast ? (
                          <span className="ml-2 text-xs font-medium text-slate-500">완료</span>
                        ) : null}
                    </div>
                    );
                }

                const turnNumber =
                    (workIndex++ % workerCount) + 1;

                const isMyTurn =
                    turnNumber === myTurn;
                const workStateClass = isPast
                  ? "bg-slate-300 text-slate-500"
                  : isCurrent
                    ? "bg-blue-100 font-bold text-blue-950"
                    : isMyTurn
                      ? "bg-yellow-300 font-bold"
                      : "bg-slate-100";

                return (
                    <div
                    key={index}
                    className={`
                        relative flex justify-between
                        rounded-lg
                        p-3
                        transition
                        ${timeStateClass}

                        ${workStateClass}
                    `}
                    >
                    <span>
                        {turnNumber}턴
                    </span>

                    <span>
                        {item.start} - {item.end}
                    </span>

                    {isCurrent ? (
                      <span className="absolute -right-1 -top-2 rounded bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white shadow">
                        지금
                      </span>
                    ) : null}

                    {isPast ? (
                      <span className="absolute -right-1 -top-2 rounded bg-slate-500 px-1.5 py-0.5 text-xs font-medium text-white shadow">
                        완료
                      </span>
                    ) : null}
                    </div>
                );
                });
            })()}
        </div>
      )}
    </div>
  );
}

export default ScheduleCard;
