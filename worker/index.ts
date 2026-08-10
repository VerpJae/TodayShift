type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

function resetPage() {
  return new Response(
    `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>오늘은몇턴? 초기화</title>
  </head>
  <body style="margin:0;display:grid;min-height:100vh;place-items:center;background:#f1f5f9;font-family:system-ui,sans-serif;color:#0f172a;">
    <main style="max-width:360px;padding:24px;text-align:center;background:white;border-radius:16px;box-shadow:0 10px 30px rgb(15 23 42 / 12%);">
      <h1 style="margin-top:0;font-size:20px;">앱 데이터를 초기화했습니다</h1>
      <p style="line-height:1.6;color:#475569;">이 기기의 앱 캐시와 저장된 근무 설정이 지워졌습니다. 알림은 다시 켜야 할 수 있습니다.</p>
      <p style="color:#64748b;font-size:14px;">잠시 후 최신 버전으로 이동합니다.</p>
    </main>
    <script>setTimeout(() => location.replace("/?reset=1"), 1200);</script>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store",
        "Clear-Site-Data": '"cache", "storage"',
      },
    },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/reset") {
      return resetPage();
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
