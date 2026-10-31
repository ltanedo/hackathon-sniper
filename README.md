# Hackathon Sniper

Map of local events across NYC, New Jersey and Long Island, fed by the event-search backend,
with a weekly timeline you scrub forward and back. The timeline shows a rolling window
(1, 2 or 4 weeks) and the map and sidebar only show events that fall inside that window.

Data is a Meetup snapshot captured October 31, 2026 (49 events: 42 NYC, 2 Long Island, 5 NJ).
It includes loosely related recommendations; only one event literally mentions "hackathon", so
the map is labelled "Local events".

## Run

```bash
npm install
npm run dev
```

The app expects the event-search backend at http://127.0.0.1:8000 (static mode, no auth, no
paid calls). If the backend is unreachable it falls back to the bundled snapshot automatically.

## Configuration

Copy `.env.example` to `.env.local`:

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Backend base URL |
| `VITE_DATA_SOURCE` | `auto` | `auto` tries the API then falls back; `api` is API only; `static` serves only the bundled snapshot |

For a hosted preview that cannot reach this machine's localhost, build with the bundled data:

```bash
VITE_DATA_SOURCE=static npm run build
```

## How the integration works

- `src/api/client.ts` posts to `POST /v1/events/search` with `mode: "static"`, the three region
  locations, and the broad date range `2026-10-31 … 2027-12-31`, `limit: 50`, following
  `meta.next_offset` if more pages exist. An empty keyword is sent as `"*"`. In-flight requests are
  aborted when the query changes so stale responses never overwrite newer ones.
- `src/lib/filters.ts` re-implements the keyword (all words, case-insensitive, title + description +
  organizer), region and inclusive date-overlap filters for the bundled snapshot in
  `public/data/events.json` (`events.geojson` is alongside it).
- Region pills change the `locations` sent to the API. The weekly timeline filters client-side on
  top of the returned set, so stepping weeks never hits the network.
- `src/components/EventMap.tsx` renders one marker per event with coordinates (GeoJSON is
  `[lng, lat]`, Leaflet is `[lat, lng]`). Events sharing exact coordinates are fanned out in a
  small ring so none is hidden, and the popup says how many share the venue. Events with no
  coordinates stay in the list with a "no map pin" tag.
- Markers, cards and selection are keyed by `event.id`. Bounds are fitted only when a search
  completes, never while the user is panning.
- Times render in the event's own timezone. Descriptions are shown as plain text, never HTML.

## Checks

```bash
npx tsc -b
npm run lint
```

## Stack

Vite · React 19 · TypeScript · react-leaflet (OpenStreetMap tiles, no API key) · date-fns

## Controls

- Type to search (300 ms debounce) or press Enter; the × clears it
- Click a week or drag the slider to move the window; ← / → step a week, Home jumps to today
- 1w / 2w / 4w sets the window length
- Region pills toggle NYC / Long Island / New Jersey
