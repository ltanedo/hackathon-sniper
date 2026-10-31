# Hackathon Sniper

Map of upcoming hackathons across NYC, New Jersey and Long Island, with a weekly timeline
you scrub forward and back. The timeline shows a rolling window (1, 2 or 4 weeks) and the map
and sidebar only show hackathons that fall inside that window.

**Status: draft with dummy data.** All hackathons in `src/data/hackathons.ts` are placeholders.

## Run

```bash
npm install
npm run dev
```

## Wiring a real data source

`src/data/source.ts` exports one function:

```ts
export async function fetchHackathons(): Promise<Hackathon[]>
```

`App.tsx` calls it once on mount. Replace its body with a real fetch and map the response onto
the `Hackathon` type in `src/types.ts`. Nothing else in the UI needs to change.

Required fields per hackathon: `id`, `name`, `host`, `venue`, `city`, `region` (`NYC` | `NJ` | `LI`),
`lat`, `lng`, `start` / `end` (ISO 8601 with offset), `url`, `format`, `tags`. `prize` is optional.

## Stack

Vite · React 19 · TypeScript · react-leaflet (CARTO dark basemap, no API key) · date-fns

## Controls

- Click a week or drag the slider to move the window
- ← / → step one week, Home jumps to the current week
- 1w / 2w / 4w sets the window length
- Region pills in the header toggle NYC / NJ / LI
