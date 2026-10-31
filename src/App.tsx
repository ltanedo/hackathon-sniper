import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EventMap from './components/EventMap';
import EventList from './components/EventList';
import SearchBox from './components/SearchBox';
import Timeline from './components/Timeline';
import { buildSearchRequest, searchEvents, type SearchResult } from './api/client';
import { buildWeeks, formatRange, formatSnapshotDate, isUndated, overlaps } from './lib/time';
import { REGION_COLOR, REGION_LOCATION, SELECTABLE_REGIONS, toUiRegion, type Region } from './lib/regions';

type Status = 'loading' | 'ready' | 'error';
type SelectableRegion = Exclude<Region, 'OTHER'>;

export default function App() {
  // ---- query state (drives API calls) ----
  const [keyword, setKeyword] = useState('');
  const [regions, setRegions] = useState<Set<SelectableRegion>>(new Set(SELECTABLE_REGIONS));
  const [reloadTick, setReloadTick] = useState(0);

  // ---- results ----
  const [result, setResult] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [fitKey, setFitKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const initialisedRef = useRef(false);

  // ---- view state (local, no API calls) ----
  const [weekIndex, setWeekIndex] = useState(0);
  const [windowWeeks, setWindowWeeks] = useState(2);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Run a search whenever the query changes. The previous in-flight request is
  // aborted, and a response from a superseded request is ignored.
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('loading');
    setError(null);

    const locations = SELECTABLE_REGIONS.filter((r) => regions.has(r)).map((r) => REGION_LOCATION[r]);
    const req = buildSearchRequest({ keyword, locations });

    searchEvents(req, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setResult(res);
        setStatus('ready');
        setFitKey((k) => k + 1);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      });

    return () => controller.abort();
  }, [keyword, regions, reloadTick]);

  const events = useMemo(() => result?.events ?? [], [result]);
  const weeks = useMemo(() => buildWeeks(events, new Date()), [events]);

  // After each search: first load lands on the current week, later loads keep the
  // user's place. Either way, if the window would be empty but results exist
  // elsewhere, jump to the first week that has any, so a search never looks blank.
  useEffect(() => {
    if (!result) return;
    const maxIndex = Math.max(0, weeks.length - windowWeeks);
    const hasEvents = (i: number) => weeks.slice(i, i + windowWeeks).some((w) => w.events.length > 0);
    const firstWithEvents = weeks.findIndex((w) => w.events.length > 0);
    const settle = (i: number) => {
      const c = Math.min(Math.max(0, i), maxIndex);
      if (hasEvents(c) || firstWithEvents < 0) return c;
      return Math.min(firstWithEvents, maxIndex);
    };
    if (!initialisedRef.current) {
      initialisedRef.current = true;
      const cur = weeks.findIndex((w) => w.isCurrent);
      setWeekIndex(settle(cur >= 0 ? cur : 0));
    } else {
      setWeekIndex((i) => settle(i));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, weeks.length]);

  const windowStart = weeks[weekIndex]?.start;
  const windowEnd = weeks[Math.min(weekIndex + windowWeeks, weeks.length) - 1]?.end;

  // Events in the rolling window. Undated events are always listed so they are never lost.
  const visible = useMemo(() => {
    if (!windowStart || !windowEnd) return [];
    return events.filter((e) => isUndated(e) || overlaps(e, windowStart, windowEnd));
  }, [events, windowStart, windowEnd]);

  // Drop the selection if it scrolls out of the window.
  useEffect(() => {
    if (selectedId && !visible.some((e) => e.id === selectedId)) setSelectedId(null);
  }, [visible, selectedId]);

  const toggleRegion = useCallback((r: SelectableRegion) => {
    setRegions((prev) => {
      const next = new Set(prev);
      if (next.has(r)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(r);
      } else next.add(r);
      return next;
    });
  }, []);

  const retry = () => setReloadTick((t) => t + 1);

  const perRegion = SELECTABLE_REGIONS.map((r) => ({ r, n: visible.filter((e) => toUiRegion(e.region) === r).length }));
  const snapshotLabel = result ? `Meetup snapshot · ${formatSnapshotDate(result.meta.captured_at)}` : undefined;

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark">⬤</span>
          <div>
            <h1>Local events</h1>
            <div className="sub">Hackathon Sniper · NYC, New Jersey and Long Island</div>
          </div>
        </div>
        <SearchBox value={keyword} onChange={setKeyword} onSubmit={setKeyword} busy={status === 'loading'} />
        <div className="window-summary">
          {windowStart && windowEnd ? (
            <>
              <div className="window-range">{formatRange(windowStart, windowEnd)}</div>
              <div className="window-count">
                {visible.length} of {events.length} event{events.length === 1 ? '' : 's'} in a {windowWeeks}-week window
              </div>
            </>
          ) : (
            <div className="window-range">{status === 'error' ? 'Search failed' : 'Loading events…'}</div>
          )}
        </div>
        <div className="region-filters">
          {perRegion.map(({ r, n }) => (
            <button
              key={r}
              className={`region ${regions.has(r) ? 'on' : ''}`}
              style={{ ['--c' as string]: REGION_COLOR[r] }}
              onClick={() => toggleRegion(r)}
              title={`Toggle ${REGION_LOCATION[r]}`}
            >
              <i />
              {r} <b>{n}</b>
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        <section className="map-wrap">
          <EventMap events={visible} selectedId={selectedId} hoveredId={hoveredId} fitKey={fitKey} onSelect={setSelectedId} onHover={setHoveredId} />
          <div className="map-hint">← → to step weeks · Home for today</div>
        </section>

        <aside className="sidebar">
          <div className="sidebar-status">
            <span>
              {status === 'loading' && !result ? 'Loading…' : `${visible.length} shown · ${events.length} matched`}
            </span>
            {result && (
              <span className="source-label" title={result.source === 'api' ? 'Live from the event API (static mode)' : 'Bundled snapshot served with the app'}>
                {result.source === 'api' ? 'API' : 'Bundled data'}
              </span>
            )}
          </div>

          {status === 'error' && (
            <div className="notice error">
              <div>Could not load events. {error}</div>
              <button className="btn" onClick={retry}>
                Try again
              </button>
            </div>
          )}

          {result?.fallbackReason && status !== 'error' && (
            <div className="notice">
              <div>Event API unreachable, showing the bundled snapshot. {result.fallbackReason}</div>
              <button className="btn" onClick={retry}>
                Retry API
              </button>
            </div>
          )}

          {result && result.meta.warnings.length > 0 && (
            <div className="notice">{result.meta.warnings.join(' ')}</div>
          )}

          {result && events.length === 0 && status === 'ready' && (
            <div className="list-empty">
              <div className="list-empty-title">No events match</div>
              <div>
                {keyword.trim() ? (
                  <>
                    Nothing mentions “{keyword.trim()}” in the selected regions.{' '}
                    <button className="linkish" onClick={() => setKeyword('')}>
                      Clear search
                    </button>
                  </>
                ) : (
                  'Try turning on another region.'
                )}
              </div>
            </div>
          )}

          {result && events.length > 0 && visible.length === 0 && (
            <div className="list-empty">
              <div className="list-empty-title">Quiet week</div>
              <div>No events in this window. Step forward or widen the window.</div>
            </div>
          )}

          <EventList events={visible} selectedId={selectedId} hoveredId={hoveredId} onSelect={setSelectedId} onHover={setHoveredId} />
        </aside>
      </main>

      <footer className="footer">
        <Timeline
          weeks={weeks}
          weekIndex={weekIndex}
          windowWeeks={windowWeeks}
          onWeekIndex={setWeekIndex}
          onWindowWeeks={setWindowWeeks}
          footnote={snapshotLabel}
        />
      </footer>
    </div>
  );
}
