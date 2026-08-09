import { useEffect, useState } from "react";
import type { ScheduleItem } from "../../data/schedule";

type NotificationSettingProps = {
  schedule: ScheduleItem[];
  workerCount: number | null;
  myTurn: number | null;
};

const REMINDER_WORKER_URL = "https://today-turn-reminder.verp.workers.dev";
const REMINDER_OPTIONS = [0, 3, 5];

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
  reminderOffsets: number[],
) {
  await fetch(`${REMINDER_WORKER_URL}/api/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schedule, workerCount, myTurn, reminderOffsets }),
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
  const [reminderOffsets, setReminderOffsets] = useState<number[]>(() => {
    const saved = localStorage.getItem("shift-reminder-offsets");

    if (!saved) {
      return [5];
    }

    try {
      const parsed = JSON.parse(saved) as number[];
      return Array.isArray(parsed)
        ? parsed.filter((offset) => REMINDER_OPTIONS.includes(offset))
        : [5];
    } catch {
      return [5];
    }
  });

  useEffect(() => {
    if (permission !== "granted" || !isEnabled || workerCount === null || myTurn === null) {
      return;
    }

    void saveSettings(schedule, workerCount, myTurn, reminderOffsets);
  }, [isEnabled, myTurn, permission, reminderOffsets, schedule, workerCount]);

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
      await saveSettings(schedule, workerCount, myTurn, reminderOffsets);
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

  const toggleReminderOffset = (offset: number) => {
    setReminderOffsets((current) => {
      const next = current.includes(offset)
        ? current.filter((value) => value !== offset)
        : [...current, offset].sort((a, b) => a - b);

      localStorage.setItem("shift-reminder-offsets", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="mb-4 rounded-lg bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">근무 알림</span>
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

      <div className="mt-3 flex gap-2">
        {REMINDER_OPTIONS.map((offset) => (
          <label
            key={offset}
            className="flex items-center gap-1 text-xs text-slate-600"
          >
            <input
              type="checkbox"
              checked={reminderOffsets.includes(offset)}
              onChange={() => toggleReminderOffset(offset)}
            />
            {offset === 0 ? "시작" : `${offset}분 전`}
          </label>
        ))}
      </div>
    </div>
  );
}

export default NotificationSetting;
