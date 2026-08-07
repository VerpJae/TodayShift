import { useEffect, useState } from "react";
import type { ScheduleItem } from "../../data/schedule";

type NotificationSettingProps = {
  schedule: ScheduleItem[];
  workerCount: number | null;
  myTurn: number | null;
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

function NotificationSetting({
  schedule,
  workerCount,
  myTurn,
}: NotificationSettingProps) {
  const [permission, setPermission] = useState(
    "Notification" in window
        ? Notification.permission
        : "denied"
    );
  const [isEnabled, setIsEnabled] = useState(
    () => localStorage.getItem("shift-notifications-enabled") !== "false",
  );


  const requestPermission = async () => {
    if (!("Notification" in window)) {
        return;
    }

    const result = await Notification.requestPermission();

    setPermission(result);

    if (result === "granted") {
      setIsEnabled(true);
      localStorage.setItem("shift-notifications-enabled", "true");
    }
  };


  const toggleNotifications = () => {
    if (permission !== "granted") {
      void requestPermission();
      return;
    }

    setIsEnabled((enabled) => {
      localStorage.setItem("shift-notifications-enabled", String(!enabled));
      return !enabled;
    });
  };

  useEffect(() => {
    if (
      permission !== "granted" ||
      !isEnabled ||
      workerCount === null ||
      myTurn === null
    ) {
      return;
    }

    const checkShiftNotifications = () => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const todayKey = now.toISOString().slice(0, 10);
      let workIndex = 0;

      schedule.forEach((item) => {
        if (item.type !== "work") {
          return;
        }

        const turnNumber = (workIndex++ % workerCount) + 1;
        const startMinutes = toMinutes(item.start);

        if (turnNumber !== myTurn || startMinutes === null) {
          return;
        }

        const reminderMinutes = startMinutes - 5;
        const notificationKey = `shift-reminder:${todayKey}:${item.start}:${myTurn}`;

        if (
          nowMinutes >= reminderMinutes &&
          nowMinutes < startMinutes &&
          !sessionStorage.getItem(notificationKey)
        ) {
          new Notification("오늘몇교대", {
            body: `5분 뒤 ${turnNumber}턴 근무가 시작됩니다. (${item.start} - ${item.end})`,
          });
          sessionStorage.setItem(notificationKey, "sent");
        }
      });
    };

    checkShiftNotifications();
    const intervalId = window.setInterval(checkShiftNotifications, 30_000);

    return () => window.clearInterval(intervalId);
  }, [isEnabled, myTurn, permission, schedule, workerCount]);


  return (
    <div className="shrink-0">
      {permission === "granted" && isEnabled ? (
        <button
          type="button"
          onClick={toggleNotifications}
          title="탭하면 근무 알림을 끕니다."
          className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
        >
          🔔 켜짐
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleNotifications}
          className="rounded-md bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700"
        >
          🔕 꺼짐
        </button>
      )}
    </div>
  );
}

export default NotificationSetting;
