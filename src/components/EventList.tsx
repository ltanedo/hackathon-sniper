import type { ApiEvent } from '../api/types';
import { REGION_COLOR, REGION_LABEL, toUiRegion } from '../lib/regions';
import { formatEventDates, isUndated } from '../lib/time';

interface Props {
  events: ApiEvent[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

/** Strip the most common Markdown so descriptions read as plain text. Rendered as text, never HTML. */
function plainText(md: string | null, max = 140): string | null {
  if (!md) return null;
  const t = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return null;
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

export default function EventList({ events, selectedId, hoveredId, onSelect, onHover }: Props) {
  if (events.length === 0) return null;

  const sorted = [...events].sort((a, b) => {
    if (isUndated(a) !== isUndated(b)) return isUndated(a) ? 1 : -1;
    return (a.start_at ?? '').localeCompare(b.start_at ?? '');
  });

  return (
    <ul className="list">
      {sorted.map((e) => {
        const active = e.id === selectedId || e.id === hoveredId;
        const region = toUiRegion(e.region);
        const where = [e.venue, e.city].filter(Boolean).join(' · ') || e.address || 'Venue not listed';
        const blurb = plainText(e.description);
        return (
          <li
            key={e.id}
            className={`card ${active ? 'active' : ''}`}
            onClick={() => onSelect(e.id === selectedId ? null : e.id)}
            onMouseEnter={() => onHover(e.id)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="card-top">
              <span className="card-name">{e.title}</span>
              <span className="chip" style={{ background: REGION_COLOR[region] }} title={REGION_LABEL[region]}>
                {region}
              </span>
            </div>
            <div className="card-date">{formatEventDates(e)}</div>
            <div className="card-venue">
              {e.organizer ? `${e.organizer} · ` : ''}
              {where}
            </div>
            {blurb && <div className="card-blurb">{blurb}</div>}
            <div className="card-tags">
              {e.online && <span className="tag muted">online</span>}
              {!e.coordinates && <span className="tag muted">no map pin</span>}
              {e.price && <span className="tag prize">{e.price}</span>}
              {e.url ? (
                <a className="tag link" href={e.url} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()}>
                  Open on Meetup
                </a>
              ) : (
                <span className="tag muted">no link</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
