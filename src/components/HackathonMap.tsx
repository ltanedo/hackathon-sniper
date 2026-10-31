import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Hackathon, Region } from '../types';
import { formatEventDates } from '../lib/time';

export const REGION_COLOR: Record<Region, string> = {
  NYC: '#ff6b35',
  NJ: '#4cc9f0',
  LI: '#b5e853',
};

const CENTER: [number, number] = [40.72, -73.9];
const ZOOM = 9;

interface Props {
  hackathons: Hackathon[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

/** Pans to the selected hackathon when it changes. */
function FlyToSelected({ hackathons, selectedId }: { hackathons: Hackathon[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const h = hackathons.find((x) => x.id === selectedId);
    if (h) map.flyTo([h.lat, h.lng], Math.max(map.getZoom(), 11), { duration: 0.6 });
  }, [selectedId, hackathons, map]);
  return null;
}

export default function HackathonMap({ hackathons, selectedId, hoveredId, onSelect, onHover }: Props) {
  return (
    <MapContainer center={CENTER} zoom={ZOOM} className="map" zoomControl={false} minZoom={8} maxZoom={16}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected hackathons={hackathons} selectedId={selectedId} />
      {hackathons.map((h) => {
        const active = h.id === selectedId || h.id === hoveredId;
        const color = REGION_COLOR[h.region];
        return (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lng]}
            radius={active ? 12 : 8}
            pathOptions={{
              color: active ? '#fff' : color,
              weight: active ? 3 : 2,
              fillColor: color,
              fillOpacity: active ? 0.95 : 0.7,
            }}
            eventHandlers={{
              click: () => onSelect(h.id),
              mouseover: () => onHover(h.id),
              mouseout: () => onHover(null),
            }}
          >
            <Popup>
              <div className="popup">
                <strong>{h.name}</strong>
                <div className="popup-host">{h.host}</div>
                <div>{formatEventDates(h)}</div>
                <div className="popup-venue">
                  {h.venue}, {h.city}
                </div>
                <a href={h.url} target="_blank" rel="noreferrer">
                  Details ↗
                </a>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
