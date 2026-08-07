import Header from "./components/home/Header";
import ShiftSelector from "./components/home/ShiftSelector";
import { useState } from "react";
import ScheduleCard from "./components/home/ScheduleCard";
import { todaySchedule } from "./data/schedule";
import TurnSelector from "./components/home/TurnSelector";
import {
  getTodayText,
  getDefaultWorkerCount,
} from "./utils/date";
import CurrentShiftCard from "./components/home/CurrentShiftCard";

function App() {
  const [workerCount, setWorkerCount] = 
    useState<number | null>(getDefaultWorkerCount());
  const [myTurn, setMyTurn] = 
    useState<number | null>(null);
  const [isSetupEditing, setIsSetupEditing] = useState(true);

  const isSetupComplete = workerCount !== null && myTurn !== null;

  return (
    <main className="min-h-screen bg-slate-200 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white md:my-8 md:min-h-[800px] md:rounded-2xl md:shadow-2xl overflow-hidden">
        {/* Header */}
        <Header dateText={getTodayText()} />

        {/* Main */}
        <section className="p-5 space-y-6">
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
      </div>
    </main>
  );
}

export default App;
