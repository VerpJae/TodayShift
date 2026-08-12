# TodayShift — 오늘은몇턴?

TodayShift는 근무 인원 수와 내 담당 턴을 설정해 오늘의 현재·다음 근무 시간을 빠르게 확인하는 모바일 중심 PWA입니다.

교대 시간은 현장에서 사용하는 25분/55분 기준이며, 점심시간 같은 휴식 구간은 턴 순환 계산에서 제외됩니다.

## 현재 기능

- 1~4명의 오늘 근무 인원 설정
- 내 담당 턴 선택 및 오늘 날짜별 설정 저장
- 현재 진행 중인 근무와 다음 내 근무 표시
- 전체 시간표, 현재 구간, 내 담당 구간 강조
- 정기 휴무 요일과 오늘만 적용하는 휴무 예외 설정
- 시작 시각·3분 전·5분 전 Push 알림 선택
- 관리자 화면에서 전체 구독 기기로 테스트 알림 발송
- 새 서비스워커가 준비되었을 때 앱 내 업데이트 안내
- 오래된 PWA 캐시를 정리하기 위한 `/reset` 경로
- iOS 홈 화면을 포함한 PWA 설치 지원

설정은 현재 브라우저의 `localStorage`에 저장됩니다. Push 구독과 알림에 필요한 설정은 별도의 Cloudflare Worker와 D1에서 관리합니다.

## 기술 스택

- React 19
- TypeScript
- Vite
- Tailwind CSS
- `vite-plugin-pwa` custom service worker
- Cloudflare Workers 및 Static Assets
- 별도 알림 Worker, Web Push, Cloudflare D1

## 로컬 개발

Node.js와 npm이 설치되어 있어야 합니다.

```powershell
cd C:\Project\TodayShift
npm install
npm run dev
```

로컬 개발 서버에서는 브라우저·보안 컨텍스트 정책에 따라 실제 iOS PWA Push 동작을 완전히 재현하기 어렵습니다.

## 검사 및 production build

```powershell
cd C:\Project\TodayShift
npm run lint
npm run build
```

`npm run build`는 TypeScript 프로젝트 빌드 후 Vite production 번들을 생성합니다.

## 배포

Cloudflare 인증과 프로젝트 설정이 완료된 환경에서 실행합니다.

```powershell
cd C:\Project\TodayShift
npm run deploy
```

이 명령은 production build를 만든 뒤 Wrangler로 `todayshift` Worker와 정적 자산을 배포합니다. 운영 도메인은 [https://vxrp.kr](https://vxrp.kr)입니다.

알림 발송 백엔드는 별도 `today-turn-reminder` 저장소와 Worker로 배포되므로 이 저장소의 배포 명령에 포함되지 않습니다.

## 주요 구조

```text
src/
├── components/
│   ├── admin/             # 관리자 테스트 알림 화면
│   └── home/              # 근무 설정·현재 상태·시간표 UI
├── config/                # 알림 Worker 주소
├── data/                  # 실제 근무 시간표와 ScheduleItem 타입
├── hooks/                 # 오늘 설정, 휴무, 서비스워커 갱신 책임
├── utils/                 # 날짜·저장소·시간표 계산 규칙
├── service-worker.ts      # Push 수신과 알림 클릭 처리
└── App.tsx                # 화면 상태 조합과 최상위 화면 분기

worker/index.ts            # 정적 앱 제공 및 /reset 처리
wrangler.jsonc             # Cloudflare 배포 설정
```

## 시간표 계산 규칙

- `workerCount`: 오늘 근무하는 인원 수
- `myTurn`: 오늘 내가 담당하는 턴
- `work`: 턴 번호가 부여되는 실제 근무 구간
- `break`: 턴 번호 계산에서 제외되는 휴식 구간

`src/utils/schedule.ts`의 `buildScheduleView`가 시간 문자열 변환과 턴 순환 계산을 담당합니다. 시간값 자체는 `src/data/schedule.ts`에 정의된 실제 교대 기준을 사용합니다.

## PWA와 Push

custom service worker는 다음 동작을 담당합니다.

- 설치 후 새 서비스워커 활성화
- 열린 클라이언트 제어
- Push payload를 시스템 알림으로 표시
- 알림 선택 시 기존 앱 창을 열거나 포커스

앱은 실행 시와 24시간 간격으로 새 서비스워커를 확인하고, 새 버전이 준비되면 업데이트 버튼을 표시합니다.

예약 Push 발송은 별도 Cloudflare Worker가 처리합니다. 앱은 해당 Worker에 Push 구독, 담당 턴, 알림 시점, 당일 휴무 상태를 동기화합니다.

## 현재 범위 밖의 항목

- 완전한 오프라인 사용을 위한 앱 셸·데이터 캐시
- 여러 기기 사이의 localStorage 설정 동기화
- 관리자 화면의 계정 기반 인증

위 항목은 현재 구현된 기능이 아니며, 필요성과 운영 방식을 검토한 뒤 별도 작업으로 진행해야 합니다.
