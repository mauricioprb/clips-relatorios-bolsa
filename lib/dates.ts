export function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { start, end };
}

export function formatDatePt(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function parseHoursFromTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatMinutesToTime(minutes: number) {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const m = (normalized % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function calculateHours(startTime: string, endTime: string) {
  if (!startTime || !endTime) return 0;
  const start = parseHoursFromTime(startTime);
  const end = parseHoursFromTime(endTime);
  const diffMinutes = end - start;
  return diffMinutes / 60;
}

export function addHoursToTime(startTime: string, hours: number) {
  const minutesToAdd = Math.round(hours * 60);
  const startMinutes = parseHoursFromTime(startTime);
  return formatMinutesToTime(startMinutes + minutesToAdd);
}

export function getMonthDays(year: number, month: number) {
  const date = new Date(Date.UTC(year, month - 1, 1));
  const days = [];
  while (date.getUTCMonth() === month - 1) {
    days.push(new Date(date));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}

export function getWorkingDays(year: number, month: number) {
  return getMonthDays(year, month).filter((day) => {
    const weekday = day.getUTCDay();
    return weekday !== 0 && weekday !== 6;
  });
}
