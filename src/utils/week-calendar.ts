const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday-start week containing `anchor`. */
export function getWeekStart(anchor: Date): Date {
  const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY_MS));
}

function formatDayMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** e.g. "11 May 2026 – 17 May 2026" */
export function formatWeekRangeLong(weekStart: Date): string {
  const end = new Date(weekStart.getTime() + 6 * DAY_MS);
  return `${formatDayMonthYear(weekStart)} – ${formatDayMonthYear(end)}`;
}

export function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart.getTime() + 6 * DAY_MS);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = weekStart.toLocaleDateString(undefined, opts);
  const endStr = end.toLocaleDateString(undefined, {
    ...opts,
    year: weekStart.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
  });
  return `${startStr} – ${endStr}`;
}

export function weekdayName(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long' });
}

export function shortWeekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export function dayNumber(date: Date): number {
  return date.getDate();
}

export function isToday(date: Date): boolean {
  return toDateKey(date) === toDateKey(new Date());
}
