import { addWeeks, differenceInCalendarWeeks, endOfWeek, format, isSameMonth, startOfWeek } from 'date-fns';
import type { ApiEvent } from '../api/types';

const WEEK_OPTS = { weekStartsOn: 1 as const }; // Monday

export interface Week {
  index: number;
  start: Date;
  end: Date;
  events: ApiEvent[];
  isCurrent: boolean;
}

export function weekStart(d: Date): Date {
  return startOfWeek(d, WEEK_OPTS);
}

function eventInterval(e: ApiEvent): [number, number] | null {
  const s = e.start_at ? new Date(e.start_at).getTime() : NaN;
  const en = e.end_at ? new Date(e.end_at).getTime() : s;
  if (Number.isNaN(s)) return null;
  return [s, Number.isNaN(en) ? s : en];
}

/** True when an event touches any part of [from, to]. Undated events never match. */
export function overlaps(e: ApiEvent, from: Date, to: Date): boolean {
  const iv = eventInterval(e);
  if (!iv) return false;
  return iv[0] <= to.getTime() && iv[1] >= from.getTime();
}

export function isUndated(e: ApiEvent): boolean {
  return eventInterval(e) === null;
}

/**
 * Build the list of weeks the timeline shows: from one week before the earliest
 * event to one week after the latest, always including the current week.
 */
export function buildWeeks(events: ApiEvent[], today: Date): Week[] {
  const todayWeek = weekStart(today);
  let min = todayWeek;
  let max = todayWeek;
  for (const e of events) {
    const iv = eventInterval(e);
    if (!iv) continue;
    const s = weekStart(new Date(iv[0]));
    const en = weekStart(new Date(iv[1]));
    if (s < min) min = s;
    if (en > max) max = en;
  }
  const first = addWeeks(min, -1);
  const last = addWeeks(max, 1);
  const count = differenceInCalendarWeeks(last, first, WEEK_OPTS) + 1;

  return Array.from({ length: count }, (_, i) => {
    const start = addWeeks(first, i);
    const end = endOfWeek(start, WEEK_OPTS);
    return {
      index: i,
      start,
      end,
      events: events.filter((e) => overlaps(e, start, end)),
      isCurrent: start.getTime() === todayWeek.getTime(),
    };
  });
}

export function formatRange(from: Date, to: Date): string {
  if (isSameMonth(from, to)) return `${format(from, 'MMM d')} – ${format(to, 'd, yyyy')}`;
  if (from.getFullYear() === to.getFullYear()) return `${format(from, 'MMM d')} – ${format(to, 'MMM d, yyyy')}`;
  return `${format(from, 'MMM d, yyyy')} – ${format(to, 'MMM d, yyyy')}`;
}

/* ---- Event timestamps, rendered in the event's own timezone when known ---- */

function fmt(iso: string, tz: string | null, opts: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: tz ?? undefined }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat('en-US', opts).format(new Date(iso));
  }
}

const DAY: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

/** "Sat Nov 1 · 1:00 PM – 4:00 PM" or "Sat Nov 1 – Sun Nov 2" or "Date to be announced". */
export function formatEventDates(e: ApiEvent): string {
  if (!e.start_at) return e.start_date ? e.start_date : 'Date to be announced';
  const tz = e.timezone;
  const startDay = fmt(e.start_at, tz, DAY);
  if (!e.end_at) return `${startDay} · ${fmt(e.start_at, tz, TIME)}`;
  const endDay = fmt(e.end_at, tz, DAY);
  if (startDay === endDay) return `${startDay} · ${fmt(e.start_at, tz, TIME)} – ${fmt(e.end_at, tz, TIME)}`;
  return `${startDay} – ${endDay}`;
}

/** "Oct 31, 2026" for the snapshot freshness label. */
export function formatSnapshotDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}
