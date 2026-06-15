'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Maximize2, Minimize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './map-styles.css';

import { formatMoney, formatMoneyFromCents } from '@/utils/format';
import type { MapMarker } from '@/services/api';
import type { ClassListItem } from '@/types/api';

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816];
const MIN_ZOOM = 2;
const MAX_ZOOM = 20;
const DEFAULT_ZOOM = 13;

const ROADMAP_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  maxZoom: MAX_ZOOM,
};

const SATELLITE_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri',
  maxZoom: 19,
};

const SATELLITE_LABELS = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
  attribution: '',
  maxZoom: MAX_ZOOM,
};

type MapType = 'roadmap' | 'satellite';

function createPinIcon(active = false): L.DivIcon {
  const fill = active ? '#d93025' : '#ea4335';
  return L.divIcon({
    className: `fn-map-pin${active ? ' is-active' : ''}`,
    html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path class="pin-body" d="M16 0C9.373 0 4 5.373 4 12c0 8.25 12 24 12 24s12-15.75 12-24C28 5.373 22.627 0 16 0z" fill="${fill}"/>
      <circle cx="16" cy="12" r="5" fill="#fff"/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  });
}

function MapFitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (positions.length === 1) {
      map.setView(positions[0], 16);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [56, 56], maxZoom: 17 });
  }, [map, positions]);

  return null;
}

function MapZoomControls() {
  const map = useMap();

  return (
    <div className="fn-map-controls" aria-label="Controles de zoom">
      <button type="button" onClick={() => map.zoomIn()} aria-label="Acercar">
        +
      </button>
      <button type="button" onClick={() => map.zoomOut()} aria-label="Alejar">
        −
      </button>
    </div>
  );
}

function MapTypeControl({
  mapType,
  onChange,
}: {
  mapType: MapType;
  onChange: (type: MapType) => void;
}) {
  return (
    <div className="fn-map-type-control" role="group" aria-label="Tipo de mapa">
      <button
        type="button"
        className={mapType === 'roadmap' ? 'is-active' : ''}
        onClick={() => onChange('roadmap')}
      >
        Mapa
      </button>
      <button
        type="button"
        className={mapType === 'satellite' ? 'is-active' : ''}
        onClick={() => onChange('satellite')}
      >
        Satélite
      </button>
    </div>
  );
}

function MapToolbar({
  onRecenter,
  onToggleFullscreen,
  isFullscreen,
}: {
  onRecenter: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}) {
  return (
    <div className="fn-map-toolbar">
      <button type="button" onClick={onRecenter} aria-label="Centrar marcadores" title="Centrar marcadores">
        <Crosshair size={18} />
      </button>
      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
    </div>
  );
}

type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  priceLabel: string;
  subtitle?: string;
  href: string;
};

interface ClassMapProps {
  classes?: ClassListItem[];
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
}

function toMapPoints(classes: ClassListItem[], markers: MapMarker[]): MapPoint[] {
  if (markers.length > 0) {
    return markers.map((m) => ({
      id: m.id,
      lat: m.lat,
      lng: m.lng,
      title: m.title,
      priceLabel: formatMoneyFromCents(m.price.amount, m.price.currency),
      subtitle: new Date(m.startAt).toLocaleString('es-UY', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      href: `/class/${m.id}`,
    }));
  }
  return classes
    .filter((c) => c.modality === 'in_person' && c.location?.lat != null && c.location?.lng != null)
    .map((c) => ({
      id: c.id,
      lat: c.location!.lat!,
      lng: c.location!.lng!,
      title: c.title,
      priceLabel: formatMoney(c.price),
      subtitle: c.location?.label,
      href: `/class/${c.id}`,
    }));
}

export function ClassMap({
  classes = [],
  markers = [],
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: ClassMapProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [mapType, setMapType] = useState<MapType>('roadmap');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [recenterToken, setRecenterToken] = useState(0);

  const mapPoints = useMemo(() => toMapPoints(classes, markers), [classes, markers]);

  const positions = useMemo(
    () => mapPoints.map((p) => [p.lat, p.lng] as [number, number]),
    [mapPoints],
  );

  const defaultPin = useMemo(() => createPinIcon(false), []);
  const activePin = useMemo(() => createPinIcon(true), []);

  const fitPositions = useMemo(() => {
    void recenterToken;
    return positions;
  }, [positions, recenterToken]);

  const handleRecenter = useCallback(() => {
    setRecenterToken((t) => t + 1);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div ref={shellRef} className="fn-map-shell relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom
        doubleClickZoom
        touchZoom
        boxZoom
        keyboard
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={80}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        {mapType === 'roadmap' ? (
          <TileLayer
            attribution={ROADMAP_TILES.attribution}
            url={ROADMAP_TILES.url}
            maxZoom={ROADMAP_TILES.maxZoom}
          />
        ) : (
          <>
            <TileLayer
              attribution={SATELLITE_TILES.attribution}
              url={SATELLITE_TILES.url}
              maxZoom={SATELLITE_TILES.maxZoom}
            />
            <TileLayer url={SATELLITE_LABELS.url} maxZoom={SATELLITE_LABELS.maxZoom} opacity={0.85} />
          </>
        )}

        <MapFitBounds positions={fitPositions} />
        <MapZoomControls />

        {mapPoints.map((point) => {
          const isActive = activeMarkerId === point.id;
          return (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={isActive ? activePin : defaultPin}
              eventHandlers={{
                click: () => setActiveMarkerId(point.id),
                popupopen: () => setActiveMarkerId(point.id),
                popupclose: () => setActiveMarkerId((id) => (id === point.id ? null : id)),
              }}
            >
              <Popup>
                <div className="space-y-2 p-4">
                  <p className="font-bold text-[var(--fn-text)]">{point.title}</p>
                  {point.subtitle ? (
                    <p className="text-sm text-[var(--fn-text-muted)]">{point.subtitle}</p>
                  ) : null}
                  <p className="text-sm font-semibold text-[var(--fn-primary)]">{point.priceLabel}</p>
                  <Link
                    href={point.href}
                    className="inline-block rounded-lg bg-[var(--fn-primary)] px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Ver clase
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <MapTypeControl mapType={mapType} onChange={setMapType} />
      <MapToolbar
        onRecenter={handleRecenter}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
      />
    </div>
  );
}
