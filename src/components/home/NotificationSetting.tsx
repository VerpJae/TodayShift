import { useState } from "react";

function NotificationSetting() {
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