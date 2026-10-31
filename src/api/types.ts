/** Normalized event as returned by POST /v1/events/search and bundled in public/data/events.json. */
export type ApiRegion = 'nyc' | 'long_island' | 'new_jersey';

export interface ApiCoordinates {
  latitude: number;
  longitude: number;
  source: string;
  precision: string;
  confidence: 'high' | 'medium';
}

export interface ApiEvent {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  source_links: string[];
  start_at: string | null;
  end_at: string | null;
  start_date: string | null;
  end_date: string | null;
  start_local: string | null;
  timezone: string | null;
  venue: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  region: ApiRegion | null;
  organizer: string | null;
  coordinates: ApiCoordinates | null;
  source: string;
  fetched_at: string;
  date_status: string;
  geocode_status: string;
  online: boolean;
  price: string | null;
}

export type Timeframe = 'today' | 'tomorrow' | 'this_weekend' | 'next_7_days' | 'next_30_days' | 'next_90_days';

export interface SearchRequest {
  mode: 'static';
  keyword: string;
  locations: string[];
  start_date?: string;
  end_date?: string;
  timeframe?: Timeframe;
  timezone: string;
  bbox?: [number, number, number, number];
  limit: number;
  offset: number;
}

export interface SearchMeta {
  returned: number;
  matched_candidates: number;
  mapped: number;
  next_offset: number | null;
  mode: string;
  captured_at: string;
  api_calls: number;
  partial: boolean;
  warnings: string[];
}

export interface SearchResponse {
  events: ApiEvent[];
  geojson: GeoJSON.FeatureCollection;
  meta: SearchMeta;
}

/** Shape of public/data/events.json. */
export interface Snapshot {
  schema_version: string;
  captured_at: string;
  capture_keyword: string;
  coverage: string;
  count: number;
  events: ApiEvent[];
}
