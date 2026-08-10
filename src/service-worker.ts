/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const payload = event.data?.json() as
    | { title?: string; body?: string; url?: string }
    | undefined;

  event.waitUntil(
    self.registration.showNotification(payload?.title ?? "오늘은몇턴?", {
      body: payload?.body ?? "근무 알림이 도착했습니다.",
      data: { url: payload?.url ?? "https://vxrp.kr" },
      icon: "/favicon.svg",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.startsWith("https://vxrp.kr"));

      return existingClient ? existingClient.focus() : self.clients.openWindow("https://vxrp.kr");
    }),
  );
});
