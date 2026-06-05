'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { ClassListItem } from '@/types/api';

interface ClassMapProps {
  classes: ClassListItem[];
  center?: [number, number];
  zoom?: number;
}

export function ClassMap({ classes, center = [-34.6037, -58.3816], zoom = 13 }: ClassMapProps) {
  const inPersonClasses = classes.filter(c => c.modality === 'in_person' && c.location?.lat != null && c.location?.lng != null);
  
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-[var(--fn-border)] shadow-sm">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {inPersonClasses.map(c => (
          <Marker key={c.id} position={[c.location!.lat!, c.location!.lng!]}>
            <Popup>
              <div className="space-y-2 p-1">
                <p className="font-bold text-[var(--fn-text)]">{c.title}</p>
                <p className="text-sm text-[var(--fn-text-muted)]">{c.location?.label}</p>
                <p className="text-sm font-semibold text-[var(--fn-primary)]">
                  ${(c.price.amount / 100).toFixed(2)}
                </p>
                <Link
                  href={`/athlete/class/${c.id}`}
                  className="inline-block rounded-lg bg-[var(--fn-primary)] px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  View class
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
