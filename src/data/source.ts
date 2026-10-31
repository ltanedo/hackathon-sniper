import type { Hackathon } from '../types';
import { DUMMY_HACKATHONS } from './hackathons';

/**
 * THE API SEAM.
 *
 * App.tsx calls this once on mount and nothing else in the UI knows where the
 * data came from. To wire a real backend, replace the body with a fetch and
 * map the response onto the `Hackathon` type in src/types.ts. Keep the
 * signature; everything downstream only needs an array of Hackathon.
 */
export async function fetchHackathons(): Promise<Hackathon[]> {
  // Simulate network latency so loading states are exercised.
  await new Promise((r) => setTimeout(r, 150));
  return DUMMY_HACKATHONS;
}
