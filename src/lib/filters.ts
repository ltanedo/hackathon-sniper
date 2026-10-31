import type { ApiEvent, SearchRequest } from '../api/types';
import { REGION_LOCATION, toApiRegion, type Region } from './regions';

/**
 * Local re-implementation of the backend's static-mode filters, used when the
 * API is unreachable and the bundled snapshot is served instead.
 */

const LOCATION_TO_REGION: Record<string, Region> = Object.fromEntries(
  (Object.entries(REGION_LOCATION) as [Region, string][]).map(([r, loc]) => [loc.toLowerCase(), r]),
);

export function matchesKeyword(e: ApiEvent, keyword: string): boolean {
  const kw = keyword.trim();
  if (!kw || kw === '*') return true;
  const hay = [e.title, e.description ?? '', e.organizer ?? ''].join('\n').toLowerCase();
  return kw
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

export function matchesLocations(e: ApiEvent, locations: string[]): boolean {
  if (locations.length === 0 || locations.some((l) => l.toLowerCase() === 'all')) return true;
  const wanted = new Set(
    locations.map((l) => LOCATION_TO_REGION[l.toLowerCase()]).filter(Boolean).map((r) => toApiRegion(r)),
  );
  return e.region !== null && wanted.has(e.region);
}

/** Inclusive date overlap on YYYY-MM-DD strings (lexicographic compare is safe for this format). */
export function matchesDateRange(e: ApiEvent, start?: string, end?: string): boolean {
  if (!start && !end) return true;
  const es = e.start_date ?? e.end_date;
  const ee = e.end_date ?? e.start_date;
  if (!es || !ee) return true; // undated events are never excluded by a date filter
  if (start && ee < start) return false;
  if (end && es > end) return false;
  return true;
}

export function matchesBbox(e: ApiEvent, bbox?: [number, number, number, number]): boolean {
  if (!bbox || !e.coordinates) return true;
  const [w, s, east, n] = bbox;
  const { latitude, longitude } = e.coordinates;
  return longitude >= w && longitude <= east && latitude >= s && latitude <= n;
}

export function applyLocalFilters(events: ApiEvent[], req: SearchRequest): ApiEvent[] {
  return events.filter(
    (e) =>
      matchesKeyword(e, req.keyword) &&
      matchesLocations(e, req.locations) &&
      matchesDateRange(e, req.start_date, req.end_date) &&
      matchesBbox(e, req.bbox),
  );
}
