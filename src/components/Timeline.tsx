import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import type { Week } from '../lib/time';
import { REGION_COLOR, toUiRegion } from '../lib/regions';

interface Props {
  weeks: Week[];
  /** Index of the first week in the visible window. */
  weekIndex: number;
  /** Number of weeks the rolling window spans. */
  windowWeeks: number;
  onWeekIndex: (i: number) => void;
  onWindowWeeks: (n: number) => void;
  /** Small freshness / source label shown in the controls row. */
  footnote?: string;
}

const WINDOW_OPTIONS = [1, 2, 4];

export default function Timeline({ weeks, weekIndex, windowWeeks, onWeekIndex, onWindowWeeks, footnote }: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const maxIndex = Math.max(0, weeks.length - windowWeeks);

  // Keep the selected week scrolled into view.
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-week="${weekIndex}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [weekIndex]);

  // Arrow keys step the window; Home jumps to the current week. Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') onWeekIndex(Math.max(0, weekIndex - 1));
      if (e.key === 'ArrowRight') onWeekIndex(Math.min(maxIndex, weekIndex + 1));
      if (e.key === 'Home') {
        const cur = weeks.findIndex((w) => w.isCurrent);
        if (cur >= 0) onWeekIndex(Math.min(maxIndex, cur));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [weekIndex, maxIndex, weeks, onWeekIndex]);

  const jumpToToday = () => {
    const cur = weeks.findIndex((w) => w.isCurrent);
    if (cur >= 0) onWeekIndex(Math.min(maxIndex, cur));
  };

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button className="btn" onClick={() => onWeekIndex(Math.max(0, weekIndex - 1))} disabled={weekIndex === 0} aria-label="Previous week">
          ◀
        </button>
        <button className="btn" onClick={jumpToToday}>
          Today
        </button>
        <button className="btn" onClick={() => onWeekIndex(Math.min(maxIndex, weekIndex + 1))} disabled={weekIndex >= maxIndex} aria-label="Next week">
          ▶
        </button>
        {footnote && <span className="footnote">{footnote}</span>}
        <span className="spacer" />
        <span className="label">Window</span>
        <div className="segmented">
          {WINDOW_OPTIONS.map((n) => (
            <button key={n} className={n === windowWeeks ? 'on' : ''} onClick={() => onWindowWeeks(n)}>
              {n}w
            </button>
          ))}
        </div>
      </div>

      <div className="timeline-strip" ref={stripRef}>
        {weeks.map((w) => {
          const inWindow = w.index >= weekIndex && w.index < weekIndex + windowWeeks;
          const monthStart = w.start.getDate() <= 7;
          const n = w.events.length;
          return (
            <button
              key={w.index}
              data-week={w.index}
              className={['week', inWindow ? 'in-window' : '', w.isCurrent ? 'current' : '', n ? 'has-events' : ''].join(' ')}
              onClick={() => onWeekIndex(Math.min(maxIndex, w.index))}
              title={`${format(w.start, 'MMM d')} – ${format(w.end, 'MMM d')}: ${n} event${n === 1 ? '' : 's'}`}
            >
              <span className="week-month">{monthStart ? format(w.start, 'MMM') : ' '}</span>
              <span className="week-day">{format(w.start, 'd')}</span>
              <span className="week-dots">
                {w.events.slice(0, 6).map((e) => (
                  <i key={e.id} style={{ background: REGION_COLOR[toUiRegion(e.region)] }} />
                ))}
                {n > 6 && <em>+{n - 6}</em>}
              </span>
            </button>
          );
        })}
      </div>

      <input
        className="timeline-slider"
        type="range"
        min={0}
        max={maxIndex}
        value={Math.min(weekIndex, maxIndex)}
        onChange={(e) => onWeekIndex(Number(e.target.value))}
        aria-label="Scrub weeks"
      />
    </div>
  );
}
