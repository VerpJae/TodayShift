import type { ScheduleItem } from "../../data/schedule";

type ScheduleCardProps = {
  schedule: ScheduleItem[];
  workerCount: number | null;
  myTurn: number | null;
};

function ScheduleCard({
  schedule,
  workerCount,
  myTurn,
}: ScheduleCardProps) {
  return (
    <div className="rounded-xl border p-5">
      <h2 className="font-semibold mb-4">
        오늘 시간표
      </h2>

      {workerCount === null ? (
        <p className="text-gray-400">
          근무 패턴을 선택해주세요.
        </p>
      ) : (
        <div className="space-y-2">
            {(() => {
                let workIndex = 0;

                return schedule.map((item, index) => {
                if (item.type === "break") {
                    return (
                    <div
                        key={index}
                        className="
                        rounded-lg
                        bg-gray-200
                        p-3
                        text-center
                        text-gray-500
                        "
                    >
                        🍚 {item.label}

                        <span className="ml-2">
                        {item.start} - {item.end}
                        </span>
                    </div>
                    );
                }

                const turnNumber =
                    (workIndex++ % workerCount) + 1;

                const isMyTurn =
                    turnNumber === myTurn;

                return (
                    <div
                    key={index}
                    className={`
                        flex justify-between
                        rounded-lg
                        p-3

                        ${
                        isMyTurn
                            ? "bg-yellow-300 font-bold"
                            : "bg-slate-100"
                        }
                    `}
                    >
                    <span>
                        {turnNumber}턴
                    </span>

                    <span>
                        {item.start} - {item.end}
                    </span>
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