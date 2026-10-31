import type { ApiRegion } from '../api/types';

/** UI region codes. 'OTHER' covers events the backend could not classify. */
export type Region = 'NYC' | 'LI' | 'NJ' | 'OTHER';

export const SELECTABLE_REGIONS: Exclude<Region, 'OTHER'>[] = ['NYC', 'LI', 'NJ'];

export const REGION_LABEL: Record<Region, string> = {
  NYC: 'NYC',
  LI: 'Long Island',
  NJ: 'New Jersey',
  OTHER: 'Other',
};

/** Google Maps palette: red / green / blue, grey for unknown. */
export const REGION_COLOR: Record<Region, string> = {
  NYC: '#ea4335',
  LI: '#34a853',
  NJ: '#1a73e8',
  OTHER: '#9aa0a6',
};

/** Location strings the search API expects for each region. */
export const REGION_LOCATION: Record<Exclude<Region, 'OTHER'>, string> = {
  NYC: 'New York, NY',
  LI: 'Long Island, NY',
  NJ: 'New Jersey',
};

const API_TO_UI: Record<ApiRegion, Region> = {
  nyc: 'NYC',
  long_island: 'LI',
  new_jersey: 'NJ',
};

export function toUiRegion(r: ApiRegion | null): Region {
  return r ? API_TO_UI[r] : 'OTHER';
}

export function toApiRegion(r: Region): ApiRegion | null {
  return (Object.keys(API_TO_UI) as ApiRegion[]).find((k) => API_TO_UI[k] === r) ?? null;
}
