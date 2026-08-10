import { useState } from "react";
import type { FormEvent } from "react";
import { REMINDER_WORKER_URL } from "../../config/reminder";

function AdminPage() {
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("오늘은몇턴? 테스트");
  const [body, setBody] = useState("테스트 알림입니다.");
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendTestNotification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSending(true);

    try {
      const response = await fetch(`${REMINDER_WORKER_URL}/api/admin/test-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": password,
        },
        body: JSON.stringify({ title, body }),
      });
      const result = await response.json() as { sent?: number; error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "테스트 알림을 보낼 수 없습니다.");
      }

      setStatus(`${result.sent ?? 0}개 기기로 테스트 알림을 보냈습니다.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex min-h-screen justify-center bg-slate-200">
      <div className="min-h-screen w-full max-w-md bg-white p-5 md:my-8 md:min-h-[600px] md:rounded-2xl md:shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">관리자</h1>
            <p className="mt-1 text-sm text-slate-500">테스트 알림 발송</p>
          </div>
          <button
            type="button"
            onClick={() => { window.location.hash = ""; }}
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
          >
            앱으로
          </button>
        </div>

        <form onSubmit={sendTestNotification} className="space-y-4 rounded-xl border p-5">
          <label className="block text-sm font-medium text-slate-700">
            관리자 비밀번호
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            알림 제목
            <input
              required
              maxLength={80}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            알림 내용
            <textarea
              required
              maxLength={200}
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              className="mt-2 w-full resize-none rounded-lg border px-3 py-2"
            />
          </label>

          <button
            type="submit"
            disabled={isSending}
            className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSending ? "발송 중..." : "모두에게 테스트 알림 발송"}
          </button>

          {status ? <p className="text-sm text-slate-600">{status}</p> : null}
        </form>
      </div>
    </main>
  );
}

export default AdminPage;
