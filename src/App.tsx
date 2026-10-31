import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays } from 'date-fns';
import HackathonMap, { REGION_COLOR } from './components/HackathonMap';
import HackathonList from './components/HackathonList';
import Timeline from './components/Timeline';
import { fetchHackathons } from './data/source';
import { buildWeeks, formatRange, overlaps } from './lib/time';
import type { Hackathon, Region } from './types';

const REGIONS: Region[] = ['NYC', 'NJ', 'LI'];

export default function App() {
  const [all, setAll] = useState<Hackathon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekIndex, setWeekIndex] = useState(0);
  const [windowWeeks, setWindowWeeks] = useState(2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [regions, setRegions] = useState<Set<Region>>(new Set(REGIONS));

  useEffect(() => {
    fetchHackathons()
      .then(setAll)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const filtered = useMemo(() => (all ?? []).filter((h) => regions.has(h.region)), [all, regions]);
  const weeks = useMemo(() => buildWeeks(filtered, new Date()), [filtered]);

  // Once data lands, start on the current week.
  useEffect(() => {
    if (!all) return;
    const cur = weeks.findIndex((w) => w.isCurrent);
    if (cur >= 0) setWeekIndex(cur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all]);

  const windowStart = weeks[weekIndex]?.start;
  const windowEnd = windowStart ? addDays(weeks[Math.min(weekIndex + windowWeeks, weeks.length) - 1].end, 0) : undefined;

  const visible = useMemo(() => {
    if (!windowStart || !windowEnd) return [];
    return filtered.filter((h) => overlaps(h, windowStart, windowEnd));
  }, [filtered, windowStart, windowEnd]);

  // Drop the selection if it scrolls out of the window.
  useEffect(() => {
    if (selectedId && !visible.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [visible, selectedId]);

  const toggleRegion = useCallback((r: Region) => {
    setRegions((prev) => {
      const next = new Set(prev);
      if (next.has(r)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(r);
      } else next.add(r);
      return next;
    });
  }, []);

  const perRegion = REGIONS.map((r) => ({ r, n: visible.filter((h) => h.region === r).length }));

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark">◎</span>
          <div>
            <h1>Hackathon Sniper</h1>
            <div className="sub">NYC · New Jersey · Long Island</div>
          </div>
        </div>
        <div className="window-summary">
          {windowStart && windowEnd ? (
            <>
              <div className="window-range">{formatRange(windowStart, windowEnd)}</div>
              <div className="window-count">
                {visible.length} hackathon{visible.length === 1 ? '' : 's'} in a {windowWeeks}-week window
              </div>
            </>
          ) : (
            <div className="window-range">{error ? `Error: ${error}` : 'Loading…'}</div>
          )}
        </div>
        <div className="region-filters">
          {perRegion.map(({ r, n }) => (
            <button
              key={r}
              className={`region ${regions.has(r) ? 'on' : ''}`}
              style={{ ['--c' as string]: REGION_COLOR[r] }}
              onClick={() => toggleRegion(r)}
              title={`Toggle ${r}`}
            >
              <i />
              {r} <b>{n}</b>
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        <section className="map-wrap">
          <HackathonMap hackathons={visible} selectedId={selectedId} hoveredId={hoveredId} onSelect={setSelectedId} onHover={setHoveredId} />
          <div className="map-hint">← → to step weeks · Home for today</div>
        </section>
        <aside className="sidebar">
          <HackathonList hackathons={visible} selectedId={selectedId} hoveredId={hoveredId} onSelect={setSelectedId} onHover={setHoveredId} />
        </aside>
      </main>

      <footer className="footer">
        <Timeline weeks={weeks} weekIndex={weekIndex} windowWeeks={windowWeeks} onWeekIndex={setWeekIndex} onWindowWeeks={setWindowWeeks} />
      </footer>
    </div>
  );
}
