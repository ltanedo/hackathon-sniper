import { addWeeks, differenceInCalendarWeeks, endOfWeek, format, isSameMonth, startOfWeek } from 'date-fns';
import type { Hackathon } from '../types';

const WEEK_OPTS = { weekStartsOn: 1 as const }; // Monday

export interface Week {
  index: number;
  start: Date;
  end: Date;
  hackathons: Hackathon[];
  isCurrent: boolean;
}

export function weekStart(d: Date): Date {
  return startOfWeek(d, WEEK_OPTS);
}

/** True when a hackathon touches any part of [from, to]. */
export function overlaps(h: Hackathon, from: Date, to: Date): boolean {
  const s = new Date(h.start).getTime();
  const e = new Date(h.end).getTime();
  return s <= to.getTime() && e >= from.getTime();
}

/**
 * Build the list of weeks the timeline shows: from one week before the earliest
 * hackathon to one week after the latest, always including the current week.
 */
export function buildWeeks(hackathons: Hackathon[], today: Date): Week[] {
  const todayWeek = weekStart(today);
  let min = todayWeek;
  let max = todayWeek;
  for (const h of hackathons) {
    const s = weekStart(new Date(h.start));
    const e = weekStart(new Date(h.end));
    if (s < min) min = s;
    if (e > max) max = e;
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
      hackathons: hackathons.filter((h) => overlaps(h, start, end)),
      isCurrent: start.getTime() === todayWeek.getTime(),
    };
  });
}

export function formatRange(from: Date, to: Date): string {
  if (isSameMonth(from, to)) return `${format(from, 'MMM d')} – ${format(to, 'd, yyyy')}`;
  if (from.getFullYear() === to.getFullYear()) return `${format(from, 'MMM d')} – ${format(to, 'MMM d, yyyy')}`;
  return `${format(from, 'MMM d, yyyy')} – ${format(to, 'MMM d, yyyy')}`;
}

export function formatEventDates(h: Hackathon): string {
  const s = new Date(h.start);
  const e = new Date(h.end);
  if (format(s, 'yyyy-MM-dd') === format(e, 'yyyy-MM-dd')) {
    return `${format(s, 'EEE MMM d')} · ${format(s, 'h:mm a')} – ${format(e, 'h:mm a')}`;
  }
  return `${format(s, 'EEE MMM d')} – ${format(e, 'EEE MMM d')}`;
}
