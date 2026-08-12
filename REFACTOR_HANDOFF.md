# TodayShift 리팩터링 2차 리뷰 handoff

## 리뷰 목적

이 문서는 `TodayShift`의 기능과 UI를 유지하면서 계산 중복과 `App.tsx` 책임을 정리한 변경을 2차 리뷰하기 위한 자료다. 작업 기준은 Git HEAD의 `0.2.1` 코드이며, 작업 결과 버전은 `0.2.2`다. 현재 변경은 로컬 작업 트리에만 있고 커밋·푸시·배포하지 않았다.

운영 주소: `https://vxrp.kr`  
저장소: `https://github.com/VerpJae/TodayShift`

## 1. 실제 변경한 파일

### 계산과 타입

- `src/data/schedule.ts`
  - `ScheduleItem`을 느슨한 단일 타입에서 `work | break` discriminated union으로 변경했다.
  - 두 종류 모두 `start`, `end`를 필수로 만들고 `label`은 `break`에만 필수로 뒀다.
  - 실제 시간표 데이터와 타입을 일치시키고 컴포넌트의 `undefined` 방어를 제거하기 위해 변경했다.
- `src/utils/schedule.ts` (신규)
  - `timeToMinutes`, `getCurrentMinutes`, `buildScheduleView`를 추가했다.
  - 시간 문자열 변환, work 순번, workerCount 기반 턴 순환, break 제외 규칙의 단일 출처다.
- `src/components/home/ScheduleCard.tsx`
  - 자체 `toMinutes`, `workIndex`, `turnNumber` 계산을 제거했다.
  - `buildScheduleView` 결과를 이용해 기존 시간표 UI를 그대로 렌더링한다.
- `src/components/home/CurrentShiftCard.tsx`
  - 자체 `TimedScheduleItem`, `toMinutes`, `workIndex`, `turnNumber` 계산을 제거했다.
  - `buildScheduleView` 결과로 현재 구간과 다음 내 근무를 찾는다.

### App 책임 분리와 저장

- `src/utils/storage.ts` (신규)
  - 오늘 storage key 생성, 날짜 추출, 오늘 설정 읽기, 주간 휴무 읽기, 당일 휴무 override 읽기·쓰기를 모았다.
  - 기존 key 이름과 JSON 형식은 유지했다.
- `src/hooks/useTodaySetup.ts` (신규)
  - `workerCount`, `myTurn`, 설정 편집 여부, 오늘 날짜 key, 설정 저장·복원, 1분 간격 날짜 전환 초기화를 담당한다.
- `src/hooks/useTodayOff.ts` (신규)
  - 주간 휴무, 당일 override, 오늘 휴무 판정, `/api/off-status` Push Worker 동기화를 담당한다.
- `src/hooks/useServiceWorkerUpdate.ts` (신규)
  - 앱 시작 시 및 24시간 간격 서비스워커 update 확인을 담당한다.
- `src/App.tsx`
  - 위 hook의 상태를 받아 화면을 조립하도록 축소했다.
  - 짧고 화면에 가까운 `#/admin` hash 분기는 App에 유지했다.
  - UI 구조와 사용자 문구는 변경하지 않았다.

### 네이밍

- `src/components/home/ShiftSelector.tsx` (삭제)
- `src/components/home/WorkerCountSelector.tsx` (신규)
  - 실제 역할이 교대 패턴이 아니라 `workerCount` 선택이므로 이름을 변경했다.
  - 버튼 구성과 색상은 동일하게 유지했고 명시적인 `type="button"`만 추가했다.

### PWA와 문서

- `vite.config.ts`
  - 비어 있던 manifest `icons`에 192px/512px PNG를 연결했다.
  - `background_color: "#ffffff"`, `lang: "ko"`를 명시했다.
- `index.html`
  - iOS 홈 화면용 `apple-touch-icon` 링크를 추가했다.
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` (신규)
  - 새 로고를 설계하지 않고 기존 `public/favicon.svg`를 흰 배경 PNG로 변환했다.
- `README.md`
  - 오래된 소개와 예정 기능을 현재 구현 기준으로 교체했다.
  - 현재 기능, 기술 스택, 개발·검사·배포 명령, 구조, 계산 규칙, PWA/Push, 범위 밖 항목을 기록했다.
- `package.json`, `package-lock.json`, `src/version.ts`
  - 버전을 `0.2.1`에서 `0.2.2`로 올렸다. 호환 동작을 유지한 리팩터링/PWA 보완이므로 patch 버전을 선택했다.
- `REFACTOR_HANDOFF.md` (신규)
  - 현재 문서다.

## 2. 핵심 로직 변경 전/후

### 시간표 및 workerCount / myTurn 계산

변경 전에는 두 카드가 각각 같은 규칙을 구현했다.

```ts
let workIndex = 0;

const turnNumber =
  item.type === "work" && workerCount !== null
    ? (workIndex++ % workerCount) + 1
    : null;
```

`ScheduleCard`에는 별도의 IIFE와 `workIndex++`, `CurrentShiftCard`에는 `useMemo` 내부의 다른 구현이 있었다.

변경 후에는 두 카드가 아래 utility를 공유한다.

```ts
export function buildScheduleView(
  schedule: ScheduleItem[],
  workerCount: number | null,
): ScheduleViewItem[] {
  let workIndex = 0;

  return schedule.map((item) => {
    const turnNumber =
      item.type === "work" && workerCount !== null
        ? (workIndex++ % workerCount) + 1
        : null;

    return {
      ...item,
      startMinutes: timeToMinutes(item.start),
      endMinutes: timeToMinutes(item.end),
      turnNumber,
    };
  });
}
```

`myTurn`은 턴을 생성하는 값이 아니라 계산된 `turnNumber`와 비교하는 값이라는 기존 의미를 유지했다. 시간값과 25분/55분 기준은 수정하지 않았다.

### break 처리

`workIndex++`는 `item.type === "work"`일 때만 실행된다. 따라서 점심 `11:55 - 12:55`는 턴을 소비하지 않는다.

직접 확인한 4명 근무 순서는 점심 직전 `1턴, 2턴` 다음 점심을 건너뛰고 `3턴, 4턴`으로 이어졌다.

### localStorage

key와 값 형식은 바꾸지 않았다.

```text
today-turn-setup:YYYY-MM-DD -> { workerCount, myTurn }
weekly-off-days             -> number[]
today-off-override:YYYY-MM-DD -> "off" | "work"
shift-notifications-enabled
shift-reminder-offsets
```

변경 전에는 읽기·쓰기가 `App.tsx` 여러 위치에 있었다. 변경 후 순수 읽기·쓰기 함수는 `utils/storage.ts`, 오늘 설정의 lifecycle은 `useTodaySetup`에 있다.

날짜가 바뀌면 기존과 동일하게 1분 이내에 기본 근무 인원을 다시 계산하고 `myTurn`을 `null`로 만들며 설정 화면을 연다. 새 날짜의 과거 설정을 자동 복원하지 않는 기존 동작도 유지했다.

### 휴무 처리

주간 휴무와 당일 override 판정식은 그대로다.

```ts
const isTodayOff =
  todayOffOverride === "off" ||
  (todayOffOverride !== "work" && weeklyOffDays.includes(todayDay));
```

변경 전 `App.tsx`에 있던 이 상태와 `/api/off-status` fetch를 `useTodayOff`로 이동했다. endpoint, `YYYY-MM-DD`, `isOff` payload는 바꾸지 않았다.

날짜 전환 때 effect에서 `setTodayOffOverride(...)`를 즉시 호출하는 대신, 상태에 적용 대상 storage key를 함께 보관하고 현재 key가 다르면 새 날짜의 값을 읽도록 했다. React lint의 `set-state-in-effect` 오류를 피하기 위한 설계이며 의미상 같은 결과를 의도한다. 이 부분은 날짜 경계 회귀 가능성 때문에 리뷰가 필요하다.

### PWA / Service Worker / Push

- `src/service-worker.ts`는 수정하지 않았다.
- install의 `skipWaiting`, message의 `SKIP_WAITING`, activate의 `clients.claim`, push 알림 표시, notification click 동작은 그대로다.
- `src/components/home/NotificationSetting.tsx`도 수정하지 않았다.
- Push Worker URL, 구독 API, 알림 설정 API 계약을 바꾸지 않았다.
- App에 있던 서비스워커 update 확인 effect만 `useServiceWorkerUpdate`로 그대로 이동했다.
- manifest icon과 iOS `apple-touch-icon`만 기존 favicon 디자인으로 보완했다.
- offline cache는 추가하지 않았다.

## 3. 리팩터링 설계 결정

### `buildScheduleView` 하나를 선택한 이유

시간표는 작고 고정된 배열이며 두 컴포넌트 모두 같은 파생 데이터가 필요하다. Context, class, service 계층보다 순수 함수 하나가 규칙을 가장 직접적으로 표현한다. `useMemo`는 각 컴포넌트에서 파생 배열 생성을 감싸되 계산 규칙 자체는 utility에만 둔다.

### hook을 세 개만 만든 이유

- 오늘 설정은 저장·복원·자정 초기화가 하나의 lifecycle이다.
- 휴무는 localStorage 판정과 원격 알림 상태 동기화가 하나의 책임이다.
- 서비스워커 갱신은 독립적인 브라우저 side effect다.

hash 분기, 단순 렌더 조건, 컴포넌트 조립은 App에 남겼다. 모든 함수를 hook으로 바꾸거나 Context/상태관리 라이브러리를 도입하지 않았다.

### discriminated union을 선택한 이유

현재 모든 schedule 항목은 `start`/`end`를 가지고 break만 `label`을 가진다. 내부 정적 데이터에 없는 `undefined` 상태를 타입이 허용할 이유가 없으므로 실제 데이터를 표현하도록 좁혔다.

### 일부러 건드리지 않은 부분

- `schedule.ts`의 시간과 배열 순서: 실제 현장 규칙이므로 그대로 유지했다.
- Tailwind class와 카드 배치: 실제 모바일 UI 회귀를 피하기 위해 유지했다.
- 알림 설정 및 service worker 본문: 운영 Push 회귀 위험이 커서 이동·정리하지 않았다.
- Cloudflare `/reset` Worker: 현재 동작과 배포 구조를 유지했다.
- `App.css`: 현재 import되지 않는 Vite 템플릿 잔재로 보이지만 기능 리팩터링 범위와 무관해 삭제하지 않았다.
- offline cache: 요구사항상 필수가 아니며 캐시 무효화·Push 업데이트 흐름을 복잡하게 만들 수 있어 보류했다.

## 4. 기존 동작에서 달라진 부분

### 의도적으로 달라진 것

- 설치 manifest에 실제 아이콘이 포함된다.
- iOS가 `apple-touch-icon.png`를 사용할 수 있다.
- manifest 언어가 `ko`, 배경색이 흰색으로 명시된다.
- 표시 버전이 `0.2.2`가 된다.
- 근무 인원 선택 버튼에 `type="button"`이 명시됐다. 현재 form 밖이라 화면 동작 차이는 없다.

### 사용자 UI/UX

레이아웃, 색상, 카드 순서, 사용자 문구, 시간표 표시에는 의도적 변경이 없다. 컴포넌트 파일 이름 변경은 번들 내부 변경이라 사용자에게 보이지 않는다.

### 의도하지 않았지만 달라질 가능성이 있는 것

- `timeToMinutes`는 타입이 보장된 내부 schedule 문자열을 바로 파싱한다. 추후 잘못된 문자열을 외부에서 주입하면 이전 일부 코드의 `null` 방어 대신 `NaN`이 전파될 수 있다. 현재 데이터에는 해당하지 않는다.
- 날짜 전환 시 휴무 override를 새 key에서 파생해 읽는 방식이 기존의 명시적 setState와 미세하게 다르다. 1분 타이머에 의한 자정 전환은 실제 시간 이동을 기다려 테스트하지 못했다.
- PNG 아이콘은 SVG를 정사각형 흰 배경에 contain 처리했다. 실제 iOS 홈 화면의 마스킹/여백 결과는 실기기에서 확인하지 못했다.

## 5. 검증 결과

### 자동 검사

- `npm run lint`: 성공, ESLint 오류 0개.
- `node_modules\\.bin\\tsc.cmd --noEmit -p tsconfig.app.json`: 성공, TypeScript 오류 0개.
- `npm run build`: 성공, Vite client/Worker와 custom service worker 산출물 생성.
- `git diff --check`: 성공, whitespace 오류 없음.
- 생성된 `manifest.webmanifest`: 192px/512px 아이콘, `lang: ko`, 흰 배경 확인.

build 중 Wrangler가 sandbox 밖 로그 파일에 쓰지 못했다는 `EPERM` 메시지와 `inlineDynamicImports` deprecation 경고가 출력됐지만 command exit code는 0이고 모든 build 산출물이 생성됐다.

### 로컬 브라우저에서 직접 확인

- 초기 근무 인원 선택 UI와 턴 선택 UI 표시.
- 4명 근무 및 4턴 선택 후 요약 표시.
- 4명 순환에서 점심 break가 턴을 소비하지 않음.
- 선택 후 새로고침해 `4명 근무 · 내 담당 4턴` 복원.
- 다음 내 근무 `10:25 - 10:55` 표시.
- 오늘 휴무 전환 시 휴무 화면 표시.
- 오늘 근무하기로 휴무 해제.
- `#/admin`에서 관리자 테스트 알림 폼 표시.
- 375px client viewport에서 `scrollWidth === clientWidth`, 가로 overflow 없음.
- 브라우저 console error/warn 없음.

### 확인하지 못한 기능

- iOS 실기기 홈 화면 아이콘 렌더링.
- Notification 권한 prompt, 실제 Push 구독·수신·클릭.
- 원격 reminder Worker의 `/api/off-status` 실제 반영.
- 새 service worker 배포 후 update prompt 전 과정.
- 실제 자정을 넘기는 1분 타이머 기반 날짜 초기화.
- `/reset`의 `Clear-Site-Data` 실제 브라우저 동작.

`npm run dev`는 코드 오류가 아니라 로컬 Workers runtime이 `compatibility_date: 2026-08-10`을 지원하지 않아 시작되지 않았다. 설치 runtime 최대 지원일은 `2026-08-08`이었다. 운영 설정은 바꾸지 않고 production build 정적 결과를 별도 서버로 검증했다.

## 6. 남아 있는 문제와 기술 부채

- 프런트엔드와 별도 reminder Worker가 동일한 턴 계산 규칙을 코드로 공유하지 않는다. 별도 저장소/런타임 경계 때문에 이번에는 건드리지 않았다.
- 시간 문자열 형식에 대한 runtime validation이 없다. 현재 정적 데이터에는 문제가 없다.
- Push fetch 실패에 대한 사용자 표시나 retry 정책이 없다. 기존 동작을 유지했다.
- service worker에 offline app-shell cache가 없다.
- `App.css`, `public/icons.svg`는 사용되지 않는 초기 템플릿 자산으로 보인다.
- 컴포넌트 테스트나 schedule utility 단위 테스트 환경이 없다.
- Cloudflare Vite/Miniflare runtime과 compatibility date가 맞지 않아 현재 `npm run dev`가 실패한다.
- `inlineDynamicImports` deprecation 경고가 남아 있다.
- 관리자 인증은 공유 비밀번호 header 방식이며 계정 기반 인증이 아니다.

## 7. 리뷰어에게 특히 확인받고 싶은 부분

1. `buildScheduleView`가 기존 두 컴포넌트의 턴 계산을 완전히 동일하게 대체하는지, 특히 `workerCount === null`과 break 전후를 확인해 달라.
2. `useTodaySetup`의 날짜 전환 시 새 날짜의 저장값을 복원하지 않고 초기화하는 동작이 기존 설계 의도와 맞는지 확인해 달라.
3. `useTodayOff`의 `{ storageKey, value }` 상태와 파생 read 방식이 자정 경계에서 stale override를 만들 가능성이 없는지 확인해 달라.
4. `ScheduleItem`의 `start`/`end` 필수화와 break `label` 필수화가 향후 다른 schedule 입력 계획과 충돌하지 않는지 확인해 달라.
5. 기존 favicon SVG를 흰 배경 정사각 PNG로 변환한 아이콘 여백이 iOS 홈 화면에 적절한지 확인해 달라.
6. `App.tsx` 분리 수준이 작은 프로젝트에 적절한지, hook 세 개가 과도하거나 반대로 더 분리해야 할 책임이 있는지 검토해 달라.
7. 실제 Push 코드와 service worker를 수정하지 않은 선택이 이번 리팩터링 범위에서 충분히 보수적인지 확인해 달라.

## 핵심 diff 요약

```diff
- const startMinutes = toMinutes(item.start);
- const turnNumber = (workIndex++ % workerCount) + 1;
+ const scheduleView = useMemo(
+   () => buildScheduleView(schedule, workerCount),
+   [schedule, workerCount],
+ );
```

```diff
- type ScheduleItem = {
-   type: "work" | "break";
-   start?: string;
-   end?: string;
-   label?: string;
- };
+ type ScheduleItem =
+   | { type: "work"; start: string; end: string }
+   | { type: "break"; start: string; end: string; label: string };
```

```diff
- // App.tsx 내부에 저장·휴무·서비스워커·날짜 전환 effect가 함께 존재
+ const todaySetup = useTodaySetup();
+ const todayOff = useTodayOff(todaySetup.todayStorageKey);
+ useServiceWorkerUpdate();
```

## 현재 상태

- 로컬 변경 완료
- lint/type/build 완료
- 제한된 로컬 브라우저 회귀 점검 완료
- 커밋하지 않음
- GitHub에 push하지 않음
- Cloudflare에 배포하지 않음
