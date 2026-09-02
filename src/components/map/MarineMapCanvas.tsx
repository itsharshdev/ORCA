import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { pfzData, hazardsData, boundariesData, vesselsData } from '@/data';
import { Layers, Eye, ShieldAlert, Crosshair } from 'lucide-react';

// Custom Glowing Vessel Icon
const createVesselIcon = () => {
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(70, 234, 237, 0.3);
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 14px;
          height: 14px;
          background: #46eaed;
          border: 2px solid #071424;
          border-radius: 50%;
          box-shadow: 0 0 12px #46eaed;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Custom PFZ Marker Icon
const createPfzIcon = (score: string) => {
  const color = score === 'high' ? '#2ecc71' : '#f1c40f';
  return L.divIcon({
    className: 'custom-pfz-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(14, 26, 45, 0.9);
        border: 1px solid ${color};
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: ${color};
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${color};"></span>
        PFZ (${score.toUpperCase()})
      </div>
    `,
    iconSize: [80, 20],
    iconAnchor: [40, 10],
  });
};

interface MarineMapCanvasProps {
  interactive?: boolean;
  className?: string;
  showOverlayControls?: boolean;
}

export const MarineMapCanvas: React.FC<MarineMapCanvasProps> = ({
  interactive = true,
  className = 'w-full h-full min-h-[400px]',
  showOverlayControls = true,
}) => {
  const [showPfz, setShowPfz] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showRoute, setShowRoute] = useState(true);

  const vessel = vesselsData.profiles[0];
  const mapCenter: [number, number] = [18.78, 72.72];

  // Planned demo route: Home Port -> Alibaug Outer Bank (PFZ-MUM-01)
  const routeCoordinates: [number, number][] = [
    [vessel.homePort.latitude, vessel.homePort.longitude],
    [18.84, 72.76],
    [18.72, 72.65],
  ];

  return (
    <div className={`relative ${className} bg-[#071424] overflow-hidden`}>
      <MapContainer
        center={mapCenter}
        zoom={10}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        {/* Dark Marine Tile Layer (OSM / CartoDB Dark equivalent styling) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Vessel Position Marker */}
        <Marker
          position={[vessel.currentLocation.latitude, vessel.currentLocation.longitude]}
          icon={createVesselIcon()}
        >
          <Popup>
            <div className="text-xs p-1">
              <div className="font-bold text-cyan-400 font-label-caps">{vessel.name}</div>
              <div className="text-slate-300 font-telemetry mt-1">Status: Active Fishing Asset</div>
              <div className="text-slate-400 text-[11px]">Tolerance: Wave &le; {vessel.maxWaveToleranceMeters}m</div>
            </div>
          </Popup>
        </Marker>

        {/* Home Port Anchor Zone */}
        <Circle
          center={[vessel.homePort.latitude, vessel.homePort.longitude]}
          radius={2000}
          pathOptions={{
            color: '#46eaed',
            fillColor: '#46eaed',
            fillOpacity: 0.1,
            dashArray: '4, 4',
            weight: 1,
          }}
        />

        {/* Planned Mission Route Corridor */}
        {showRoute && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#46eaed',
              weight: 2.5,
              dashArray: '6, 6',
              opacity: 0.9,
            }}
          />
        )}

        {/* PFZ Zones */}
        {showPfz &&
          pfzData.zones.map((zone) => (
            <React.Fragment key={zone.id}>
              <Circle
                center={[zone.location.latitude, zone.location.longitude]}
                radius={4000}
                pathOptions={{
                  color: zone.potentialScore === 'high' ? '#2ecc71' : '#f1c40f',
                  fillColor: zone.potentialScore === 'high' ? '#2ecc71' : '#f1c40f',
                  fillOpacity: 0.15,
                  weight: 1.5,
                }}
              />
              <Marker
                position={[zone.location.latitude, zone.location.longitude]}
                icon={createPfzIcon(zone.potentialScore)}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <div className="font-bold text-emerald-400 font-label-caps">{zone.zoneName}</div>
                    <div className="text-slate-300 font-telemetry mt-1">SST: {zone.sstIndicator}</div>
                    <div className="text-slate-300 font-telemetry">Chlorophyll: {zone.chlorophyllIndicator}</div>
                    <div className="text-slate-400 text-[11px] mt-1">
                      Target Species: {zone.recommendedFishTypes?.join(', ')}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

        {/* Restricted Boundaries from GeoJSON */}
        {showBoundaries &&
          boundariesData.features.map((feature: any) => {
            const rawCoords: number[][] = feature.geometry.coordinates[0];
            const polygonCoords: [number, number][] = rawCoords.map(([lng, lat]: number[]) => [lat, lng]);
            return (
              <Polygon
                key={feature.id}
                positions={polygonCoords}
                pathOptions={{
                  color: '#e74c3c',
                  fillColor: '#e74c3c',
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: '5, 5',
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <div className="font-bold text-rose-400 font-label-caps">{feature.properties.name}</div>
                    <div className="text-rose-300 text-[11px] mt-1 font-semibold">
                      Restriction: {feature.properties.zoneType.toUpperCase()}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {feature.properties.restrictionDescription}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Hazards Alert Circles */}
        {showHazards &&
          hazardsData.alerts.map((hazard) => (
            <Circle
              key={hazard.id}
              center={[hazard.affectedCoordinates[0][0], hazard.affectedCoordinates[0][1]]}
              radius={8000}
              pathOptions={{
                color: '#f1c40f',
                fillColor: '#f1c40f',
                fillOpacity: 0.12,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <div className="font-bold text-amber-400 font-label-caps">{hazard.title}</div>
                  <div className="text-slate-300 text-[11px] mt-1">{hazard.areaDescription}</div>
                  <div className="text-slate-400 text-[11px] mt-1">Advisory: {hazard.advisoryAction}</div>
                </div>
              </Popup>
            </Circle>
          ))}
      </MapContainer>

      {/* Layer Toggle Floating Controls */}
      {showOverlayControls && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 p-2 rounded-xl hud-glass text-xs shadow-xl">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800 text-[10px] font-label-caps text-slate-400 px-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>MAP LAYERS</span>
          </div>

          <button
            type="button"
            onClick={() => setShowPfz(!showPfz)}
            className={`flex items-center justify-between gap-3 px-2 py-1 rounded text-[11px] transition-colors ${
              showPfz ? 'bg-emerald-950/40 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              PFZ Zones
            </span>
            <Eye className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`flex items-center justify-between gap-3 px-2 py-1 rounded text-[11px] transition-colors ${
              showBoundaries ? 'bg-rose-950/40 text-rose-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Geofences
            </span>
            <ShieldAlert className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setShowHazards(!showHazards)}
            className={`flex items-center justify-between gap-3 px-2 py-1 rounded text-[11px] transition-colors ${
              showHazards ? 'bg-amber-950/40 text-amber-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Hazards
            </span>
            <Eye className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setShowRoute(!showRoute)}
            className={`flex items-center justify-between gap-3 px-2 py-1 rounded text-[11px] transition-colors ${
              showRoute ? 'bg-cyan-950/40 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Route Line
            </span>
            <Crosshair className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Bottom Telemetry Coordinates Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-8 hud-glass border-t border-slate-800/80 z-20 flex items-center justify-between px-4 text-[11px] font-telemetry text-slate-400">
        <div className="flex items-center gap-4">
          <span>CENTER: 18°46'N 72°43'E</span>
          <span className="hidden sm:inline">PROJECTION: WGS84</span>
          <span className="hidden md:inline">DATUM: CHART DATUM</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>GEOSPATIAL ENGINE ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
