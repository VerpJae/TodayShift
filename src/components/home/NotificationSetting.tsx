import { useState } from "react";
import { useEffect } from "react";
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


  const requestPermission = async () => {
    if (!("Notification" in window)) {
        return;
    }

    const result = await Notification.requestPermission();

    setPermission(result);
  };


  const sendTestNotification = () => {
    if (
        !("Notification" in window) ||
        permission !== "granted"
    ) {
        return;
    }

    new Notification("TodayShift", {
        body: "알림 테스트입니다.",
    });
  };

  useEffect(() => {
    if (
      permission !== "granted" ||
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
  }, [myTurn, permission, schedule, workerCount]);


  return (
    <div className="rounded-xl border p-5">
      <h2 className="font-semibold mb-4">
        알림 설정
      </h2>


      {permission === "granted" ? (
        <div className="space-y-3">
          <p className="text-sm text-green-600">
            🔔 알림이 켜져 있습니다.
          </p>
          <p className="text-sm text-gray-500">
            내 근무 시작 5분 전에 알려드립니다.
          </p>

          <button
            onClick={sendTestNotification}
            className="
              w-full
              rounded-lg
              bg-blue-500
              p-3
              text-white
            "
          >
            테스트 알림 보내기
          </button>
        </div>
      ) : (
        <button
          onClick={requestPermission}
          className="
            w-full
            rounded-lg
            bg-blue-500
            p-3
            text-white
          "
        >
          🔔 알림 켜기
        </button>
      )}
    </div>
  );
}

export default NotificationSetting;
