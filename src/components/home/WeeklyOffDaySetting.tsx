type TodayOverride = "off" | "work" | null;

type WeeklyOffDaySettingProps = {
  offDays: number[];
  setOffDays: (offDays: number[]) => void;
  todayDay: number;
  todayOverride: TodayOverride;
  todayIsOff: boolean;
  setTodayOverride: (override: TodayOverride) => void;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function WeeklyOffDaySetting({
  offDays,
  setOffDays,
  todayDay,
  todayOverride,
  todayIsOff,
  setTodayOverride,
}: WeeklyOffDaySettingProps) {
  const toggleOffDay = (day: number) => {
    const next = offDays.includes(day)
      ? offDays.filter((value) => value !== day)
      : [...offDays, day].sort((a, b) => a - b);

    setOffDays(next);
    localStorage.setItem("weekly-off-days", JSON.stringify(next));
  };

  return (
    <details className="rounded-xl border p-4">
      <summary className="cursor-pointer font-semibold">정기 휴무일 설정</summary>
      <p className="mt-2 text-sm text-slate-500">
        선택한 요일은 이 기기에서 휴무일로 표시됩니다.
      </p>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((label, day) => {
          const selected = offDays.includes(day);

          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleOffDay(day)}
              className={`rounded-lg px-1 py-2 text-sm font-medium ${
                selected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t pt-3">
        <p className="text-sm font-medium">오늘({WEEKDAYS[todayDay]})만 예외 처리</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTodayOverride(todayIsOff ? "work" : "off")}
            className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white"
          >
            {todayIsOff ? "오늘 근무하기" : "오늘 휴무로 전환"}
          </button>
          {todayOverride ? (
            <button
              type="button"
              onClick={() => setTodayOverride(null)}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
            >
              기본 일정으로 되돌리기
            </button>
          ) : null}
        </div>
      </div>
    </details>
  );
}

export default WeeklyOffDaySetting;
