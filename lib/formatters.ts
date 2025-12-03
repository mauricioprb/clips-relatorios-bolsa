export function formatHoursValue(hours: number) {
  if (Number.isInteger(hours)) {
    return `${hours}h`;
  }
  return `${hours.toFixed(2).replace(".", ",")}h`;
}

export function formatInterval(start: string, end: string) {
  return `${start}-${end}`;
}
