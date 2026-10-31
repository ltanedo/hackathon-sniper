import type { ApiEvent, SearchMeta, SearchRequest, SearchResponse, Snapshot } from './types';
import { applyLocalFilters } from '../lib/filters';

/**
 * Event search client.
 *
 * - VITE_API_BASE_URL   base URL of the event-search backend (default http://127.0.0.1:8000)
 * - VITE_DATA_SOURCE    'auto' (default): try the API, fall back to the bundled snapshot
 *                       'api':            API only, surface errors
 *                       'static':         bundled snapshot only (for hosted previews)
 */
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || 'http://127.0.0.1:8000';

export type DataSourceMode = 'auto' | 'api' | 'static';
export const DATA_SOURCE: DataSourceMode = ((import.meta.env.VITE_DATA_SOURCE as string | undefined) || 'auto') as DataSourceMode;

export const MAX_LIMIT = 50;

export interface SearchResult {
  events: ApiEvent[];
  meta: SearchMeta;
  /** Where the data came from. */
  source: 'api' | 'bundled';
  /** Set when the API failed and the bundled snapshot was used instead. */
  fallbackReason?: string;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function buildSearchRequest(overrides: Partial<SearchRequest> = {}): SearchRequest {
  const req: SearchRequest = {
    mode: 'static',
    keyword: '*',
    locations: ['New York, NY', 'Long Island, NY', 'New Jersey'],
    start_date: '2026-10-31',
    end_date: '2027-12-31',
    timezone: 'America/New_York',
    limit: MAX_LIMIT,
    offset: 0,
    ...overrides,
  };
  const kw = req.keyword.trim();
  req.keyword = kw ? kw : '*';
  if (req.timeframe) {
    // The API rejects timeframe combined with an explicit range.
    delete req.start_date;
    delete req.end_date;
  }
  req.limit = Math.min(Math.max(1, req.limit), MAX_LIMIT);
  return req;
}

export async function searchEventsApi(req: SearchRequest, signal?: AbortSignal): Promise<SearchResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/v1/events/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal,
    });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ApiError(`Could not reach the event API at ${API_BASE_URL}`);
  }
  if (!res.ok) {
    let detail = '';
    try {
      detail = (await res.text()).slice(0, 200);
    } catch {
      /* ignore */
    }
    throw new ApiError(`Event API returned ${res.status}${detail ? `: ${detail}` : ''}`, res.status);
  }
  return (await res.json()) as SearchResponse;
}

/** Fetch every page from the API. The snapshot fits in one page, but honour next_offset anyway. */
export async function searchEventsApiAll(req: SearchRequest, signal?: AbortSignal): Promise<SearchResponse> {
  const first = await searchEventsApi(req, signal);
  const events = [...first.events];
  const features = [...first.geojson.features];
  let next = first.meta.next_offset;
  let guard = 0;
  while (next !== null && guard++ < 20) {
    const page = await searchEventsApi({ ...req, offset: next }, signal);
    events.push(...page.events);
    features.push(...page.geojson.features);
    next = page.meta.next_offset;
  }
  return {
    events,
    geojson: { type: 'FeatureCollection', features },
    meta: { ...first.meta, returned: events.length, next_offset: null },
  };
}

let snapshotCache: Promise<Snapshot> | null = null;

export function loadBundledSnapshot(signal?: AbortSignal): Promise<Snapshot> {
  if (!snapshotCache) {
    const url = `${import.meta.env.BASE_URL}data/events.json`;
    snapshotCache = fetch(url, { signal })
      .then((r) => {
        if (!r.ok) throw new ApiError(`Bundled snapshot missing (${r.status})`, r.status);
        return r.json() as Promise<Snapshot>;
      })
      .catch((e) => {
        snapshotCache = null;
        throw e;
      });
  }
  return snapshotCache;
}

export async function searchEventsBundled(req: SearchRequest, signal?: AbortSignal): Promise<SearchResult> {
  const snap = await loadBundledSnapshot(signal);
  const events = applyLocalFilters(snap.events, req);
  return {
    events,
    source: 'bundled',
    meta: {
      returned: events.length,
      matched_candidates: events.length,
      mapped: events.filter((e) => e.coordinates).length,
      next_offset: null,
      mode: 'static',
      captured_at: snap.captured_at,
      api_calls: 0,
      partial: false,
      warnings: [],
    },
  };
}

/**
 * Search according to VITE_DATA_SOURCE. In 'auto' mode an API failure is not
 * fatal: the bundled snapshot answers instead and `fallbackReason` says why.
 */
export async function searchEvents(req: SearchRequest, signal?: AbortSignal): Promise<SearchResult> {
  if (DATA_SOURCE === 'static') return searchEventsBundled(req, signal);
  try {
    const res = await searchEventsApiAll(req, signal);
    return { events: res.events, meta: res.meta, source: 'api' };
  } catch (e) {
    if (signal?.aborted || DATA_SOURCE === 'api') throw e;
    const reason = e instanceof Error ? e.message : String(e);
    const fallback = await searchEventsBundled(req, signal);
    return { ...fallback, fallbackReason: reason };
  }
}
