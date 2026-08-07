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
import NotificationSetting from "./components/home/NotificationSetting";
import CurrentShiftCard from "./components/home/CurrentShiftCard";

function App() {
  const [workerCount, setWorkerCount] = 
    useState<number | null>(getDefaultWorkerCount());
  
  const [myTurn, setMyTurn] = 
    useState<number | null>(null);

  return (
    <main className="min-h-screen bg-slate-200 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white md:my-8 md:min-h-[800px] md:rounded-2xl md:shadow-2xl overflow-hidden">
        {/* Header */}
        <Header dateText={getTodayText()} />

        {/* Main */}
        <section className="p-5 space-y-6">
          <div className="rounded-xl border p-5">
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
              setMyTurn={setMyTurn}
            />
            
          </div>

          <CurrentShiftCard
            schedule={todaySchedule}
            workerCount={workerCount}
            myTurn={myTurn}
          />

          <NotificationSetting />
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
