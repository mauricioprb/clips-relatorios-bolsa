export function formatHoursValue(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (m === 0) {
    return `${h}h`;
  }

  if (m === 60) {
    return `${h + 1}h`;
  }

  return `${h}:${m.toString().padStart(2, "0")}h`;
}

export function formatInterval(start: string, end: string) {
  return `${start}-${end}`;
}
