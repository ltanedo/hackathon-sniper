import type { Hackathon } from '../types';
import { formatEventDates } from '../lib/time';
import { REGION_COLOR } from './HackathonMap';

interface Props {
  hackathons: Hackathon[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

export default function HackathonList({ hackathons, selectedId, hoveredId, onSelect, onHover }: Props) {
  if (hackathons.length === 0) {
    return (
      <div className="list-empty">
        <div className="list-empty-title">Quiet week</div>
        <div>No hackathons in this window. Step forward or widen the window.</div>
      </div>
    );
  }

  const sorted = [...hackathons].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <ul className="list">
      {sorted.map((h) => {
        const active = h.id === selectedId || h.id === hoveredId;
        return (
          <li
            key={h.id}
            className={`card ${active ? 'active' : ''}`}
            style={{ borderLeftColor: REGION_COLOR[h.region] }}
            onClick={() => onSelect(h.id === selectedId ? null : h.id)}
            onMouseEnter={() => onHover(h.id)}
            onMouseLeave={() => onHover(null)}
          >
            <div className="card-top">
              <span className="card-name">{h.name}</span>
              <span className="chip" style={{ background: REGION_COLOR[h.region] }}>
                {h.region}
              </span>
            </div>
            <div className="card-date">{formatEventDates(h)}</div>
            <div className="card-venue">
              {h.host} · {h.city}
            </div>
            <div className="card-tags">
              <span className="tag muted">{h.format}</span>
              {h.prize && <span className="tag prize">{h.prize}</span>}
              {h.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
