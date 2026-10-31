import type { Hackathon } from '../types';

/**
 * DUMMY DATA. Hand-written placeholders spread over Oct 2026 – Feb 2027 so the
 * weekly timeline has busy weeks, quiet weeks and a few empty ones.
 * Replace via src/data/source.ts, not here.
 */
export const DUMMY_HACKATHONS: Hackathon[] = [
  {
    id: 'hack-001', name: 'HackNYU Fall', host: 'NYU Tandon', venue: 'Jacobs Academic Building',
    city: 'Brooklyn, NY', region: 'NYC', lat: 40.6942, lng: -73.9866,
    start: '2026-10-30T18:00:00-04:00', end: '2026-11-01T15:00:00-04:00',
    url: 'https://example.com/hacknyu', format: 'in-person', tags: ['student', 'general'], prize: '$10k',
  },
  {
    id: 'hack-002', name: 'Hoboken Hardware Jam', host: 'Stevens Institute', venue: 'Babbio Center',
    city: 'Hoboken, NJ', region: 'NJ', lat: 40.7449, lng: -74.0242,
    start: '2026-10-31T09:00:00-04:00', end: '2026-10-31T21:00:00-04:00',
    url: 'https://example.com/hoboken-hw', format: 'in-person', tags: ['hardware', 'iot'],
  },
  {
    id: 'hack-003', name: 'FinTech Sprint NYC', host: 'Betaworks', venue: 'Betaworks Studios',
    city: 'New York, NY', region: 'NYC', lat: 40.7404, lng: -74.0071,
    start: '2026-11-06T17:00:00-05:00', end: '2026-11-08T14:00:00-05:00',
    url: 'https://example.com/fintech-sprint', format: 'hybrid', tags: ['fintech', 'ai'], prize: '$25k',
  },
  {
    id: 'hack-004', name: 'HackRU', host: 'Rutgers USACS', venue: 'College Avenue Student Center',
    city: 'New Brunswick, NJ', region: 'NJ', lat: 40.5008, lng: -74.4474,
    start: '2026-11-07T10:00:00-05:00', end: '2026-11-08T12:00:00-05:00',
    url: 'https://example.com/hackru', format: 'in-person', tags: ['student', 'general'], prize: '$5k',
  },
  {
    id: 'hack-022', name: 'LaGuardia Queens Hack', host: 'LaGuardia CC', venue: 'E-Building Atrium',
    city: 'Long Island City, NY', region: 'NYC', lat: 40.7443, lng: -73.9353,
    start: '2026-11-07T09:00:00-05:00', end: '2026-11-07T20:00:00-05:00',
    url: 'https://example.com/lagcc-hack', format: 'in-person', tags: ['student', 'beginner'],
  },
  {
    id: 'hack-005', name: 'Hofstra Hacks', host: 'Hofstra CS Club', venue: 'Axinn Library',
    city: 'Hempstead, NY', region: 'LI', lat: 40.7144, lng: -73.6001,
    start: '2026-11-14T09:00:00-05:00', end: '2026-11-15T17:00:00-05:00',
    url: 'https://example.com/hofstra-hacks', format: 'in-person', tags: ['student', 'health'],
  },
  {
    id: 'hack-006', name: 'Climate Build Weekend', host: 'Newlab', venue: 'Brooklyn Navy Yard, Bldg 128',
    city: 'Brooklyn, NY', region: 'NYC', lat: 40.6996, lng: -73.9709,
    start: '2026-11-14T10:00:00-05:00', end: '2026-11-15T18:00:00-05:00',
    url: 'https://example.com/climate-build', format: 'in-person', tags: ['climate', 'hardware'], prize: '$15k',
  },
  {
    id: 'hack-007', name: 'Agentic AI Hack', host: 'Google NYC', venue: 'Pier 57',
    city: 'New York, NY', region: 'NYC', lat: 40.7467, lng: -74.0097,
    start: '2026-11-21T09:00:00-05:00', end: '2026-11-22T17:00:00-05:00',
    url: 'https://example.com/agentic-ai', format: 'in-person', tags: ['ai', 'agents'], prize: '$30k',
  },
  {
    id: 'hack-008', name: 'SBU Hacks', host: 'Stony Brook Computing Society', venue: 'Student Activities Center',
    city: 'Stony Brook, NY', region: 'LI', lat: 40.9126, lng: -73.1234,
    start: '2026-11-21T10:00:00-05:00', end: '2026-11-22T14:00:00-05:00',
    url: 'https://example.com/sbuhacks', format: 'in-person', tags: ['student', 'general'],
  },
  {
    id: 'hack-009', name: 'Newark Civic Tech Day', host: 'NJIT', venue: 'Central King Building',
    city: 'Newark, NJ', region: 'NJ', lat: 40.7424, lng: -74.1784,
    start: '2026-12-05T09:00:00-05:00', end: '2026-12-05T19:00:00-05:00',
    url: 'https://example.com/newark-civic', format: 'in-person', tags: ['civic', 'open-data'],
  },
  {
    id: 'hack-010', name: 'Columbia DevFest', host: 'ADI Columbia', venue: 'Lerner Hall',
    city: 'New York, NY', region: 'NYC', lat: 40.8075, lng: -73.9626,
    start: '2026-12-05T10:00:00-05:00', end: '2026-12-06T16:00:00-05:00',
    url: 'https://example.com/devfest', format: 'in-person', tags: ['student', 'general'], prize: '$8k',
  },
  {
    id: 'hack-023', name: 'Wagner Island Hack', host: 'Wagner College', venue: 'Spiro Hall',
    city: 'Staten Island, NY', region: 'NYC', lat: 40.615, lng: -74.094,
    start: '2026-12-05T10:00:00-05:00', end: '2026-12-05T18:00:00-05:00',
    url: 'https://example.com/wagner-hack', format: 'in-person', tags: ['student', 'beginner'],
  },
  {
    id: 'hack-011', name: 'Cornell Tech Health Hack', host: 'Cornell Tech', venue: 'Bloomberg Center',
    city: 'Roosevelt Island, NY', region: 'NYC', lat: 40.7556, lng: -73.956,
    start: '2026-12-12T09:00:00-05:00', end: '2026-12-13T15:00:00-05:00',
    url: 'https://example.com/health-hack', format: 'hybrid', tags: ['health', 'ai'], prize: '$20k',
  },
  {
    id: 'hack-012', name: 'Jersey City Game Jam', host: 'JC Makers', venue: 'Harborside 3',
    city: 'Jersey City, NJ', region: 'NJ', lat: 40.7194, lng: -74.0334,
    start: '2026-12-12T12:00:00-05:00', end: '2026-12-13T20:00:00-05:00',
    url: 'https://example.com/jc-gamejam', format: 'in-person', tags: ['games', 'indie'],
  },
  {
    id: 'hack-013', name: 'Holiday Hack Night', host: 'Microsoft NYC', venue: 'Microsoft Times Square',
    city: 'New York, NY', region: 'NYC', lat: 40.7568, lng: -73.9888,
    start: '2026-12-18T17:00:00-05:00', end: '2026-12-18T23:00:00-05:00',
    url: 'https://example.com/holiday-hack', format: 'in-person', tags: ['social', 'general'],
  },
  {
    id: 'hack-014', name: 'New Year Build-a-thon', host: 'Industry City Labs', venue: 'Industry City, Bldg 2',
    city: 'Brooklyn, NY', region: 'NYC', lat: 40.6565, lng: -74.0085,
    start: '2027-01-09T09:00:00-05:00', end: '2027-01-10T18:00:00-05:00',
    url: 'https://example.com/ny-buildathon', format: 'in-person', tags: ['general', 'startup'], prize: '$12k',
  },
  {
    id: 'hack-015', name: 'HackPrinceton', host: 'Princeton E-Club', venue: 'Friend Center',
    city: 'Princeton, NJ', region: 'NJ', lat: 40.3431, lng: -74.6551,
    start: '2027-01-16T09:00:00-05:00', end: '2027-01-17T15:00:00-05:00',
    url: 'https://example.com/hackprinceton', format: 'in-person', tags: ['student', 'general'], prize: '$15k',
  },
  {
    id: 'hack-016', name: 'Adelphi Data Dash', host: 'Adelphi University', venue: 'Nexus Building',
    city: 'Garden City, NY', region: 'LI', lat: 40.7217, lng: -73.6514,
    start: '2027-01-23T09:00:00-05:00', end: '2027-01-23T19:00:00-05:00',
    url: 'https://example.com/adelphi-data', format: 'in-person', tags: ['data', 'student'],
  },
  {
    id: 'hack-024', name: 'Bronx AI Night', host: 'Fordham Rose Hill', venue: 'John Mulcahy Hall',
    city: 'Bronx, NY', region: 'NYC', lat: 40.8612, lng: -73.8856,
    start: '2027-01-29T17:00:00-05:00', end: '2027-01-29T23:00:00-05:00',
    url: 'https://example.com/bronx-ai', format: 'in-person', tags: ['ai', 'social'],
  },
  {
    id: 'hack-017', name: 'CCNY Hacks', host: 'CCNY ACM', venue: 'NAC Building',
    city: 'New York, NY', region: 'NYC', lat: 40.82, lng: -73.9493,
    start: '2027-01-30T10:00:00-05:00', end: '2027-01-31T16:00:00-05:00',
    url: 'https://example.com/ccny-hacks', format: 'in-person', tags: ['student', 'general'],
  },
  {
    id: 'hack-018', name: 'Bell Works Robotics Weekend', host: 'Bell Works', venue: 'Bell Works Atrium',
    city: 'Holmdel, NJ', region: 'NJ', lat: 40.3718, lng: -74.1631,
    start: '2027-02-06T09:00:00-05:00', end: '2027-02-07T17:00:00-05:00',
    url: 'https://example.com/bellworks-robotics', format: 'in-person', tags: ['robotics', 'hardware'], prize: '$10k',
  },
  {
    id: 'hack-019', name: 'Fordham Social Impact Hack', host: 'Fordham Gabelli', venue: 'Lincoln Center Campus',
    city: 'New York, NY', region: 'NYC', lat: 40.7716, lng: -73.9846,
    start: '2027-02-13T09:00:00-05:00', end: '2027-02-14T14:00:00-05:00',
    url: 'https://example.com/fordham-impact', format: 'hybrid', tags: ['social-impact', 'nonprofit'],
  },
  {
    id: 'hack-020', name: 'Farmingdale Maker Hack', host: 'Farmingdale State College', venue: 'Lupton Hall',
    city: 'Farmingdale, NY', region: 'LI', lat: 40.7521, lng: -73.4283,
    start: '2027-02-20T09:00:00-05:00', end: '2027-02-20T20:00:00-05:00',
    url: 'https://example.com/farmingdale-maker', format: 'in-person', tags: ['hardware', 'student'],
  },
  {
    id: 'hack-021', name: 'Montclair Edu Hack', host: 'Montclair State', venue: 'Center for Computing',
    city: 'Montclair, NJ', region: 'NJ', lat: 40.8623, lng: -74.1983,
    start: '2027-02-27T09:00:00-05:00', end: '2027-02-28T15:00:00-05:00',
    url: 'https://example.com/montclair-edu', format: 'in-person', tags: ['edtech', 'student'],
  },
];
