import Header from "./components/home/Header";
import WorkerCountSelector from "./components/home/WorkerCountSelector";
import { useEffect, useState } from "react";
import ScheduleCard from "./components/home/ScheduleCard";
import { todaySchedule } from "./data/schedule";
import TurnSelector from "./components/home/TurnSelector";
import { getTodayText } from "./utils/date";
import CurrentShiftCard from "./components/home/CurrentShiftCard";
import { APP_VERSION } from "./version";
import AdminPage from "./components/admin/AdminPage";
import UpdatePrompt from "./components/UpdatePrompt";
import WeeklyOffDaySetting from "./components/home/WeeklyOffDaySetting";
import { useTodaySetup } from "./hooks/useTodaySetup";
import { useTodayOff } from "./hooks/useTodayOff";
import { useServiceWorkerUpdate } from "./hooks/useServiceWorkerUpdate";

function App() {
  const {
    todayStorageKey,
    workerCount,
    myTurn,
    isSetupComplete,
    isSetupEditing,
    setIsSetupEditing,
    selectWorkerCount,
    selectMyTurn,
  } = useTodaySetup();
  const {
    weeklyOffDays,
    setWeeklyOffDays,
    todayDay,
    todayOffOverride,
    isTodayOff,
    updateTodayOffOverride,
    syncTodayOff,
  } = useTodayOff(todayStorageKey);
  const [isAdminPage, setIsAdminPage] = useState(
    () => window.location.hash === "#/admin",
  );

  useServiceWorkerUpdate();

  useEffect(() => {
    const updatePage = () => setIsAdminPage(window.location.hash === "#/admin");

    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  if (isAdminPage) {
    return <AdminPage />;
  }

  if (isTodayOff) {
    return (
      <main className="min-h-screen bg-slate-200 flex justify-center">
        <div className="flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-white md:my-8 md:min-h-[800px] md:rounded-2xl md:shadow-2xl">
          <Header dateText={getTodayText()} />
          <section className="flex-1 space-y-6 p-5">
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-center">
              <h2 className="font-semibold text-violet-950">오늘은 휴무일입니다</h2>
              <p className="mt-2 text-sm text-violet-700">휴무일 설정은 아래에서 변경할 수 있습니다.</p>
              <button
                type="button"
                onClick={() => updateTodayOffOverride("work")}
                className="mt-4 rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white"
              >
                오늘 근무하기
              </button>
            </div>
            <WeeklyOffDaySetting
              offDays={weeklyOffDays}
              setOffDays={setWeeklyOffDays}
              todayDay={todayDay}
              todayOverride={todayOffOverride}
              todayIsOff={isTodayOff}
              setTodayOverride={updateTodayOffOverride}
            />
          </section>
          <footer className="px-5 pb-4 text-center text-xs text-slate-400">v{APP_VERSION}</footer>
        </div>
        <UpdatePrompt />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-200 flex justify-center">
      <div className="flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-white md:my-8 md:min-h-[800px] md:rounded-2xl md:shadow-2xl">
        {/* Header */}
        <Header dateText={getTodayText()} />

        {/* Main */}
        <section className="flex-1 space-y-6 p-5">
          <WeeklyOffDaySetting
            offDays={weeklyOffDays}
            setOffDays={setWeeklyOffDays}
            todayDay={todayDay}
            todayOverride={todayOffOverride}
            todayIsOff={isTodayOff}
            setTodayOverride={updateTodayOffOverride}
          />
          <div className="rounded-xl border p-5">
            {isSetupComplete && !isSetupEditing ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">오늘의 설정</p>
                  <p className="mt-1 font-semibold">
                    {workerCount}명 근무 · 내 담당 {myTurn}턴
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSetupEditing(true)}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  수정
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-semibold mb-4">
                  오늘 근무 인원 설정
                </h2>

                <WorkerCountSelector
                  workerCount={workerCount}
                  setWorkerCount={selectWorkerCount}
                />
                <TurnSelector
                  workerCount={workerCount}
                  myTurn={myTurn}
                  setMyTurn={selectMyTurn}
                />
              </>
            )}
          </div>

          <CurrentShiftCard
            schedule={todaySchedule}
            workerCount={workerCount}
            myTurn={myTurn}
          />

          <ScheduleCard
            schedule={todaySchedule}
            workerCount={workerCount}
            myTurn={myTurn}
            onNotificationSubscribed={syncTodayOff}
          />
        </section>

        <footer className="px-5 pb-4 text-center text-xs text-slate-400">
          v{APP_VERSION}
        </footer>
      </div>
      <UpdatePrompt />
    </main>
  );
}

export default App;
