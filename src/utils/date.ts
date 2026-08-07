export function getTodayText() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  const weekdays = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토",
  ];

  const day = weekdays[today.getDay()];

  return `${year}-${month}-${date} (${day})`;
}


export function getDefaultWorkerCount() {
  const day = new Date().getDay();

  // 일요일(0), 토요일(6)
  if (day === 0 || day === 6) {
    return 4;
  }

  return 3;
}