/** Geographic bucket used for marker colour and filters. */
export type Region = 'NYC' | 'NJ' | 'LI';

export type Format = 'in-person' | 'hybrid' | 'online';

/**
 * One hackathon. This is the contract the UI consumes.
 * Whatever feeds data in (see src/data/source.ts) should return objects of this shape.
 */
export interface Hackathon {
  id: string;
  name: string;
  host: string;
  venue: string;
  city: string;
  region: Region;
  lat: number;
  lng: number;
  /** ISO 8601 date-time, local to America/New_York. */
  start: string;
  /** ISO 8601 date-time, inclusive end. */
  end: string;
  url: string;
  format: Format;
  tags: string[];
  prize?: string;
}
