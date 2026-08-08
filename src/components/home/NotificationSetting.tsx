import { useEffect, useState } from "react";
import type { ScheduleItem } from "../../data/schedule";

type NotificationSettingProps = {
  schedule: ScheduleItem[];
  workerCount: number | null;
  myTurn: number | null;
};

const REMINDER_WORKER_URL = "https://today-turn-reminder.verp.workers.dev";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);

  return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

async function saveSettings(
  schedule: ScheduleItem[],
  workerCount: number,
  myTurn: number,
) {
  await fetch(`${REMINDER_WORKER_URL}/api/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schedule, workerCount, myTurn }),
  });
}

function NotificationSetting({
  schedule,
  workerCount,
  myTurn,
}: NotificationSettingProps) {
  const [permission, setPermission] = useState(
    "Notification" in window ? Notification.permission : "denied",
  );
  const [isEnabled, setIsEnabled] = useState(
    () => localStorage.getItem("shift-notifications-enabled") !== "false",
  );

  useEffect(() => {
    if (permission !== "granted" || !isEnabled || workerCount === null || myTurn === null) {
      return;
    }

    void saveSettings(schedule, workerCount, myTurn);
  }, [isEnabled, myTurn, permission, schedule, workerCount]);

  const enableNotifications = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const { publicKey } = await fetch(`${REMINDER_WORKER_URL}/vapid-public-key`).then(
      async (response) => response.json() as Promise<{ publicKey: string }>,
    );
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }));

    await fetch(`${REMINDER_WORKER_URL}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON() }),
    });

    if (workerCount !== null && myTurn !== null) {
      await saveSettings(schedule, workerCount, myTurn);
    }

    setIsEnabled(true);
    localStorage.setItem("shift-notifications-enabled", "true");
  };

  const disableNotifications = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await fetch(`${REMINDER_WORKER_URL}/api/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }

    setIsEnabled(false);
    localStorage.setItem("shift-notifications-enabled", "false");
  };

  const toggleNotifications = () => {
    if (permission === "granted" && isEnabled) {
      void disableNotifications();
      return;
    }

    void enableNotifications();
  };

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
          🔕 알림 켜기
        </button>
      )}
    </div>
  );
}

export default NotificationSetting;
