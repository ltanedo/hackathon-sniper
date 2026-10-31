import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { ApiEvent } from '../api/types';
import { REGION_COLOR, toUiRegion } from '../lib/regions';
import { formatEventDates } from '../lib/time';

const CENTER: [number, number] = [40.72, -73.9];
const ZOOM = 9;

/** Space to leave for the floating panels when fitting bounds (header / sidebar / timeline). */
const FIT_PADDING = { paddingTopLeft: L.point(24, 96), paddingBottomRight: L.point(416, 190) };

interface Props {
  events: ApiEvent[];
  selectedId: string | null;
  hoveredId: string | null;
  /** Bump to fit the map to the current events (initial load, explicit search). */
  fitKey: number;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

interface Placed {
  event: ApiEvent;
  /** Leaflet order: [latitude, longitude]. */
  pos: [number, number];
  /** Number of events sharing this exact venue coordinate. */
  shared: number;
}

/**
 * Events at identical coordinates are fanned out in a small ring so none is
 * hidden under another. The popup still names the shared venue.
 */
function placeEvents(events: ApiEvent[]): Placed[] {
  const groups = new Map<string, ApiEvent[]>();
  for (const e of events) {
    if (!e.coordinates) continue;
    const key = `${e.coordinates.latitude},${e.coordinates.longitude}`;
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  const out: Placed[] = [];
  for (const group of groups.values()) {
    const n = group.length;
    group.forEach((e, i) => {
      const { latitude, longitude } = e.coordinates!;
      if (n === 1) {
        out.push({ event: e, pos: [latitude, longitude], shared: 1 });
        return;
      }
      const r = 0.00045; // ~50 m
      const a = (2 * Math.PI * i) / n;
      const lat = latitude + r * Math.sin(a);
      const lng = longitude + (r * Math.cos(a)) / Math.cos((latitude * Math.PI) / 180);
      out.push({ event: e, pos: [lat, lng], shared: n });
    });
  }
  return out;
}

function FlyToSelected({ placed, selectedId }: { placed: Placed[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const p = placed.find((x) => x.event.id === selectedId);
    if (p) map.flyTo(p.pos, Math.max(map.getZoom(), 12), { duration: 0.6 });
  }, [selectedId, placed, map]);
  return null;
}

function FitToEvents({ placed, fitKey }: { placed: Placed[]; fitKey: number }) {
  const map = useMap();
  useEffect(() => {
    if (fitKey === 0 || placed.length === 0) return;
    const bounds = L.latLngBounds(placed.map((p) => p.pos));
    map.fitBounds(bounds.pad(0.05), { ...FIT_PADDING, maxZoom: 13, animate: true });
    // Only refit when the caller asks; events changing on their own must not yank the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map]);
  return null;
}

export default function EventMap({ events, selectedId, hoveredId, fitKey, onSelect, onHover }: Props) {
  const placed = useMemo(() => placeEvents(events), [events]);

  return (
    <MapContainer center={CENTER} zoom={ZOOM} className="map" zoomControl={false} minZoom={8} maxZoom={17}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected placed={placed} selectedId={selectedId} />
      <FitToEvents placed={placed} fitKey={fitKey} />
      {placed.map(({ event: e, pos, shared }) => {
        const active = e.id === selectedId || e.id === hoveredId;
        const color = REGION_COLOR[toUiRegion(e.region)];
        const approx = e.coordinates?.confidence === 'medium';
        return (
          <CircleMarker
            key={e.id}
            center={pos}
            radius={active ? 11 : 7}
            pathOptions={{ color: '#fff', weight: active ? 3 : 1.5, fillColor: color, fillOpacity: 1 }}
            eventHandlers={{
              click: () => onSelect(e.id),
              mouseover: () => onHover(e.id),
              mouseout: () => onHover(null),
            }}
          >
            <Popup>
              <div className="popup">
                <strong>{e.title}</strong>
                {e.organizer && <div className="popup-host">{e.organizer}</div>}
                <div>{formatEventDates(e)}</div>
                <div className="popup-venue">
                  {[e.venue, e.address].filter(Boolean).join(', ') || [e.city, e.state].filter(Boolean).join(', ') || 'Venue not listed'}
                  {approx && ' (approximate location)'}
                </div>
                {shared > 1 && <div className="popup-shared">{shared} events at this venue</div>}
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noreferrer">
                    Open on Meetup
                  </a>
                ) : (
                  <span className="popup-host">No event link</span>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
