import Header from "./components/home/Header";
import ShiftSelector from "./components/home/ShiftSelector";
import { useEffect, useState } from "react";
import ScheduleCard from "./components/home/ScheduleCard";
import { todaySchedule } from "./data/schedule";
import TurnSelector from "./components/home/TurnSelector";
import {
  getTodayText,
  getDefaultWorkerCount,
} from "./utils/date";
import CurrentShiftCard from "./components/home/CurrentShiftCard";
import { APP_VERSION } from "./version";
import AdminPage from "./components/admin/AdminPage";
import UpdatePrompt from "./components/UpdatePrompt";
import WeeklyOffDaySetting from "./components/home/WeeklyOffDaySetting";
import { REMINDER_WORKER_URL } from "./config/reminder";

type SavedTodaySetup = {
  workerCount: number;
  myTurn: number;
};

type TodayOffOverride = "off" | "work" | null;

function getTodayStorageKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `today-turn-setup:${year}-${month}-${date}`;
}

function getSavedTodaySetup(): SavedTodaySetup | null {
  const saved = localStorage.getItem(getTodayStorageKey());

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as SavedTodaySetup;

    return Number.isInteger(parsed.workerCount) && Number.isInteger(parsed.myTurn)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function getWeeklyOffDays() {
  const saved = localStorage.getItem("weekly-off-days");

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved) as number[];
    return Array.isArray(parsed)
      ? parsed.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      : [];
  } catch {
    return [];
  }
}

function getTodayOffOverride(): TodayOffOverride {
  const value = localStorage.getItem(`today-off-override:${getTodayStorageKey().slice(-10)}`);
  return value === "off" || value === "work" ? value : null;
}

function App() {
  const [todayStorageKey, setTodayStorageKey] = useState(getTodayStorageKey);
  const [savedTodaySetup] = useState(getSavedTodaySetup);
  const [workerCount, setWorkerCount] = useState<number | null>(
    savedTodaySetup?.workerCount ?? getDefaultWorkerCount(),
  );
  const [myTurn, setMyTurn] = useState<number | null>(savedTodaySetup?.myTurn ?? null);
  const [isSetupEditing, setIsSetupEditing] = useState(!savedTodaySetup);
  const [isAdminPage, setIsAdminPage] = useState(
    () => window.location.hash === "#/admin",
  );
  const [weeklyOffDays, setWeeklyOffDays] = useState(getWeeklyOffDays);
  const [todayOffOverride, setTodayOffOverride] = useState<TodayOffOverride>(getTodayOffOverride);

  const isSetupComplete = workerCount !== null && myTurn !== null;
  const todayDay = new Date().getDay();
  const isTodayOff =
    todayOffOverride === "off" ||
    (todayOffOverride !== "work" && weeklyOffDays.includes(todayDay));

  const updateTodayOffOverride = (override: TodayOffOverride) => {
    const key = `today-off-override:${getTodayStorageKey().slice(-10)}`;

    if (override) {
      localStorage.setItem(key, override);
    } else {
      localStorage.removeItem(key);
    }

    setTodayOffOverride(override);
  };

  useEffect(() => {
    if (!isSetupComplete || workerCount === null || myTurn === null) {
      return;
    }

    localStorage.setItem(
      todayStorageKey,
      JSON.stringify({ workerCount, myTurn }),
    );
  }, [isSetupComplete, myTurn, todayStorageKey, workerCount]);

  useEffect(() => {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    void navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!subscription) {
          return;
        }

        return fetch(`${REMINDER_WORKER_URL}/api/off-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            date: todayStorageKey.slice(-10),
            isOff: isTodayOff,
          }),
        });
      });
  }, [isTodayOff, todayStorageKey]);

  useEffect(() => {
    const updatePage = () => setIsAdminPage(window.location.hash === "#/admin");

    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const checkForUpdate = () => {
      void navigator.serviceWorker
        .getRegistration()
        .then((registration) => registration?.update());
    };

    checkForUpdate();
    const intervalId = window.setInterval(checkForUpdate, 24 * 60 * 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (getTodayStorageKey() === todayStorageKey) {
        return;
      }

      setTodayStorageKey(getTodayStorageKey());
      setWorkerCount(getDefaultWorkerCount());
      setMyTurn(null);
      setIsSetupEditing(true);
      setTodayOffOverride(getTodayOffOverride());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [todayStorageKey]);

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

                <ShiftSelector
                  workerCount={workerCount}
                  setWorkerCount={(count) => {
                    setWorkerCount(count);
                    setMyTurn(null);
                    localStorage.removeItem(getTodayStorageKey());
                  }}
                />
                <TurnSelector
                  workerCount={workerCount}
                  myTurn={myTurn}
                  setMyTurn={(turn) => {
                    setMyTurn(turn);
                    setIsSetupEditing(false);
                  }}
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
