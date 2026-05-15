import type { ScheduleEntry } from '@/types/schedule';

const LEGACY_MEAL_TIMES: Record<string, string> = {
  breakfast: '08:00',
  lunch: '12:30',
  dinner: '18:30',
  snack: '15:00',
};

export function normalizeScheduleEntry(raw: unknown): ScheduleEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.recipeId !== 'string' || typeof e.date !== 'string') return null;

  if (typeof e.time === 'string' && /^\d{2}:\d{2}$/.test(e.time)) {
    return {
      id: typeof e.id === 'string' ? e.id : `schedule-${Date.now()}`,
      recipeId: e.recipeId,
      date: e.date,
      time: e.time,
    };
  }

  if (typeof e.meal === 'string') {
    return {
      id: typeof e.id === 'string' ? e.id : `schedule-${Date.now()}`,
      recipeId: e.recipeId,
      date: e.date,
      time: LEGACY_MEAL_TIMES[e.meal] ?? '12:00',
    };
  }

  return null;
}

export function scheduleSortKey(entry: ScheduleEntry): number {
  const [y, m, d] = entry.date.split('-').map(Number);
  const [hh, mm] = entry.time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm).getTime();
}

export function formatScheduleWhen(entry: ScheduleEntry): string {
  const [y, m, d] = entry.date.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const datePart = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const [hh, mm] = entry.time.split(':').map(Number);
  const t = new Date();
  t.setHours(hh, mm, 0, 0);
  const timePart = t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}

export function toTimeString(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatTimeLabel(time: string): string {
  const [hh, mm] = time.split(':').map(Number);
  const t = new Date();
  t.setHours(hh, mm, 0, 0);
  return t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function combineDateAndTime(dateKey: string, time: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
}
