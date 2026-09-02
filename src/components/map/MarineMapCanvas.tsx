import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { pfzData, hazardsData, boundariesData, vesselsData, weatherData, oceanData } from '@/data';
import type { MapLayerVisibility, SelectedMapEntity } from '@/types/map';

// Custom Map Controller to smoothly pan / zoom when an entity is selected
const MapViewController: React.FC<{ targetCoords?: [number, number] | null }> = ({ targetCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 11, { duration: 1.2 });
    }
  }, [targetCoords, map]);

  return null;
};

// Custom Glowing Vessel Icon with Heading Indicator
const createVesselIcon = (heading: number = 245) => {
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(70, 234, 237, 0.25);
          animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          width: 18px;
          height: 18px;
          background: #46eaed;
          border: 2px solid #071424;
          border-radius: 50%;
          box-shadow: 0 0 14px #46eaed;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 0; 
            height: 0; 
            border-left: 3px solid transparent;
            border-right: 3px solid transparent;
            border-bottom: 7px solid #071424;
            transform: rotate(${heading}deg);
          "></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Custom User / Port Icon
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-port-marker',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: #3b82f6;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Custom PFZ Marker Icon
const createPfzIcon = (score: string, isSelected: boolean = false) => {
  const color = score === 'high' ? '#2ecc71' : '#f1c40f';
  return L.divIcon({
    className: 'custom-pfz-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        gap: 5px;
        background: rgba(14, 26, 45, 0.95);
        border: ${isSelected ? `2px solid #ffffff` : `1px solid ${color}`};
        padding: 3px 8px;
        border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        color: ${color};
        white-space: nowrap;
        box-shadow: ${isSelected ? '0 0 16px rgba(255,255,255,0.6)' : '0 2px 10px rgba(0,0,0,0.6)'};
        cursor: pointer;
      ">
        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${color};"></span>
        PFZ (${score.toUpperCase()})
      </div>
    `,
    iconSize: [88, 24],
    iconAnchor: [44, 12],
  });
};

// Custom Hazard Pin Icon
const createHazardIcon = () => {
  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: rgba(231, 76, 60, 0.2);
        border: 2px solid #e74c3c;
        border-radius: 50%;
        color: #e74c3c;
        font-family: sans-serif;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 0 10px rgba(231, 76, 60, 0.6);
        cursor: pointer;
      ">
        !
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface MarineMapCanvasProps {
  interactive?: boolean;
  className?: string;
  layers?: MapLayerVisibility;
  selectedEntityId?: string;
  onSelectEntity?: (entity: SelectedMapEntity) => void;
  flyToCoords?: [number, number] | null;
  showOverlayControls?: boolean;
}

const DEFAULT_LAYERS: MapLayerVisibility = {
  userLocation: true,
  vessel: true,
  pfzZones: true,
  weatherRisk: true,
  hazards: true,
  boundaries: true,
  recommendedRoute: true,
  safeCorridor: true,
  riskAreas: true,
};

export const MarineMapCanvas: React.FC<MarineMapCanvasProps> = ({
  interactive = true,
  className = 'w-full h-full min-h-[400px]',
  layers = DEFAULT_LAYERS,
  selectedEntityId,
  onSelectEntity,
  flyToCoords,
}) => {
  const vessel = vesselsData.profiles[0];
  const mapCenter: [number, number] = [18.78, 72.72];

  // Planned demo route: Home Port -> Waypoint -> Target Zone Alpha
  const routeCoordinates: [number, number][] = [
    [vessel.homePort.latitude, vessel.homePort.longitude],
    [18.84, 72.76],
    [18.72, 72.65],
  ];

  // Safe navigation corridor polygon (depth envelope)
  const safeCorridorPolygon: [number, number][] = [
    [18.92, 72.82],
    [18.86, 72.78],
    [18.74, 72.67],
    [18.70, 72.62],
    [18.68, 72.64],
    [18.82, 72.78],
    [18.90, 72.84],
    [18.92, 72.82],
  ];

  // Squall / elevated risk area beyond 25 nm offshore post-midday
  const elevatedRiskAreaPolygon: [number, number][] = [
    [18.90, 72.30],
    [18.40, 72.35],
    [18.00, 72.45],
    [18.05, 72.20],
    [18.85, 72.10],
    [18.90, 72.30],
  ];

  const handleVesselClick = () => {
    if (onSelectEntity) {
      onSelectEntity({
        id: vessel.id,
        type: 'vessel',
        title: vessel.name,
        subtitle: `${vessel.vesselType.replace('_', ' ').toUpperCase()} • Reg: ${vessel.registrationNo}`,
        status: 'Active Operations',
        severity: 'favorable',
        location: {
          latitude: vessel.currentLocation.latitude,
          longitude: vessel.currentLocation.longitude,
        },
        details: {
          vesselLength: `${vessel.lengthMeters} m`,
          enginePower: `${vessel.engineHp} HP`,
          cruisingSpeed: `${vessel.cruisingSpeedKnots} kts`,
          waveLimit: `${vessel.maxWaveToleranceMeters} m`,
          homePort: vessel.homePort.name,
          fuelCapacity: `${vessel.fuelCapacityHours} hrs`,
        },
        source: vesselsData.metadata.source,
        observedAt: '2026-09-02 08:30 IST',
      });
    }
  };

  const handleUserLocationClick = () => {
    if (onSelectEntity) {
      onSelectEntity({
        id: 'PORT-SASSOON',
        type: 'userLocation',
        title: 'Sassoon Docks Harbor',
        subtitle: 'Primary artisanal and mechanized fishing terminal',
        status: 'Operational',
        severity: 'favorable',
        location: {
          latitude: vessel.homePort.latitude,
          longitude: vessel.homePort.longitude,
        },
        details: {
          berthStatus: 'Berth Clearance OK',
          tideLevel: 'High Tide 3.82m CD',
          harborSpeedLimit: '6 kts',
          vhfChannel: 'Channel 16 / 68',
        },
        source: 'MUMBAI_PORT_TRUST_DEMO',
        observedAt: '2026-09-02 08:00 IST',
      });
    }
  };

  const handlePfzClick = (zone: typeof pfzData.zones[0]) => {
    if (onSelectEntity) {
      onSelectEntity({
        id: zone.id,
        type: 'pfz',
        title: zone.zoneName,
        subtitle: `Optimal pelagic aggregation zone detected via EO Thermal/Chlorophyll Fronts`,
        status: zone.potentialScore.toUpperCase(),
        severity: zone.potentialScore === 'high' ? 'favorable' : 'cautionary',
        location: {
          latitude: zone.location.latitude,
          longitude: zone.location.longitude,
        },
        details: {
          potentialScore: zone.potentialScore.toUpperCase(),
          distance: `${zone.distanceKmFromPort} km`,
          bearing: `${zone.bearingDegrees}° WSW`,
          waterDepth: `${zone.location.depthMeters} m`,
          sstGradient: zone.sstIndicator,
          chlorophyll: zone.chlorophyllIndicator,
        },
        source: pfzData.metadata.source,
        observedAt: pfzData.metadata.updatedAt,
        validUntil: pfzData.metadata.validUntil,
        recommendedFishTypes: zone.recommendedFishTypes,
      });
    }
  };

  const handleHazardClick = (hazard: typeof hazardsData.alerts[0]) => {
    if (onSelectEntity) {
      onSelectEntity({
        id: hazard.id,
        type: 'hazard',
        title: hazard.title,
        subtitle: hazard.areaDescription,
        status: hazard.severity.toUpperCase(),
        severity: hazard.severity as any,
        location: {
          latitude: hazard.affectedCoordinates[0][0],
          longitude: hazard.affectedCoordinates[0][1],
        },
        details: {
          hazardType: hazard.hazardType.toUpperCase(),
          severity: hazard.severity.toUpperCase(),
          activeState: hazard.isActive ? 'ACTIVE WARNING' : 'INACTIVE',
        },
        source: hazardsData.metadata.source,
        observedAt: hazardsData.metadata.updatedAt,
        validUntil: hazardsData.metadata.validUntil,
        actionRequired: hazard.advisoryAction,
      });
    }
  };

  const handleBoundaryClick = (feature: any) => {
    if (onSelectEntity) {
      onSelectEntity({
        id: feature.id,
        type: 'boundary',
        title: feature.properties.name,
        subtitle: feature.properties.restrictionDescription,
        status: feature.properties.zoneType.toUpperCase(),
        severity: feature.properties.severityOnIncursion as any,
        details: {
          zoneType: feature.properties.zoneType.toUpperCase(),
          bufferRequired: `${feature.properties.bufferDistanceMeters || 500} m`,
          incursionSeverity: feature.properties.severityOnIncursion.toUpperCase(),
        },
        source: boundariesData.metadata.source,
        observedAt: boundariesData.metadata.updatedAt,
        actionRequired: feature.properties.restrictionDescription,
      });
    }
  };

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
        <MapViewController targetCoords={flyToCoords} />

        {/* Dark Marine Cartographic Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Safe Navigation Corridor Polygon */}
        {layers.safeCorridor && (
          <Polygon
            positions={safeCorridorPolygon}
            pathOptions={{
              color: '#14b8a6',
              fillColor: '#14b8a6',
              fillOpacity: 0.1,
              weight: 1,
              dashArray: '3, 3',
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-teal-400 font-label-caps">SAFE NAVIGATION CORRIDOR</div>
                <div className="text-slate-300 text-[11px] mt-1">Recommended coastal bathymetry depth envelope (20m - 50m).</div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Weather & Squall Risk Area Overlay */}
        {layers.weatherRisk && (
          <Polygon
            positions={elevatedRiskAreaPolygon}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-amber-400 font-label-caps">ELEVATED WEATHER RISK ZONE</div>
                <div className="text-slate-300 text-[11px] mt-1">Wind gusts &gt; 22 kts &amp; wave swell &gt; 2.2m post-12:00 IST.</div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Home Port / User Location Marker */}
        {layers.userLocation && (
          <Marker
            position={[vessel.homePort.latitude, vessel.homePort.longitude]}
            icon={createUserLocationIcon()}
            eventHandlers={{ click: handleUserLocationClick }}
          >
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-blue-400 font-label-caps">{vessel.homePort.name}</div>
                <div className="text-slate-300 text-[11px] mt-0.5">Operator Departure Port</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Vessel Position & Heading */}
        {layers.vessel && (
          <Marker
            position={[vessel.currentLocation.latitude, vessel.currentLocation.longitude]}
            icon={createVesselIcon(vessel.currentHeadingDegrees)}
            eventHandlers={{ click: handleVesselClick }}
          >
            <Popup>
              <div className="text-xs p-1">
                <div className="font-bold text-cyan-400 font-label-caps">{vessel.name}</div>
                <div className="text-slate-300 font-telemetry mt-1">Speed: {vessel.cruisingSpeedKnots} kts • Heading: {vessel.currentHeadingDegrees}°</div>
                <div className="text-slate-400 text-[11px]">Tolerance: Swell &le; {vessel.maxWaveToleranceMeters}m</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Recommended Route Polyline with Corridor Width */}
        {layers.recommendedRoute && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#46eaed',
                weight: 3,
                dashArray: '6, 6',
                opacity: 0.95,
              }}
            />
            {/* Waypoint Indicator */}
            <Circle
              center={[18.84, 72.76]}
              radius={800}
              pathOptions={{
                color: '#46eaed',
                fillColor: '#46eaed',
                fillOpacity: 0.3,
                weight: 1,
              }}
            />
          </>
        )}

        {/* PFZ Zones */}
        {layers.pfzZones &&
          pfzData.zones.map((zone) => {
            const isSelected = selectedEntityId === zone.id;
            return (
              <React.Fragment key={zone.id}>
                <Circle
                  center={[zone.location.latitude, zone.location.longitude]}
                  radius={4500}
                  pathOptions={{
                    color: zone.potentialScore === 'high' ? '#2ecc71' : '#f1c40f',
                    fillColor: zone.potentialScore === 'high' ? '#2ecc71' : '#f1c40f',
                    fillOpacity: isSelected ? 0.3 : 0.15,
                    weight: isSelected ? 2.5 : 1.5,
                  }}
                  eventHandlers={{ click: () => handlePfzClick(zone) }}
                />
                <Marker
                  position={[zone.location.latitude, zone.location.longitude]}
                  icon={createPfzIcon(zone.potentialScore, isSelected)}
                  eventHandlers={{ click: () => handlePfzClick(zone) }}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <div className="font-bold text-emerald-400 font-label-caps">{zone.zoneName}</div>
                      <div className="text-slate-300 font-telemetry mt-1">SST: {zone.sstIndicator}</div>
                      <div className="text-slate-300 font-telemetry">Chlorophyll: {zone.chlorophyllIndicator}</div>
                      <div className="text-slate-400 text-[11px] mt-1">
                        Target: {zone.recommendedFishTypes?.join(', ')}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

        {/* Restricted Boundaries from GeoJSON */}
        {layers.boundaries &&
          boundariesData.features.map((feature: any) => {
            const rawCoords: number[][] = feature.geometry.coordinates[0];
            const polygonCoords: [number, number][] = rawCoords.map(([lng, lat]: number[]) => [lat, lng]);
            const isRestricted = feature.properties.zoneType === 'restricted';
            return (
              <Polygon
                key={feature.id}
                positions={polygonCoords}
                pathOptions={{
                  color: isRestricted ? '#e74c3c' : '#a855f7',
                  fillColor: isRestricted ? '#e74c3c' : '#a855f7',
                  fillOpacity: 0.18,
                  weight: 1.5,
                  dashArray: '5, 5',
                }}
                eventHandlers={{ click: () => handleBoundaryClick(feature) }}
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

        {/* Navigational Hazards */}
        {layers.hazards &&
          hazardsData.alerts.map((hazard) => (
            <React.Fragment key={hazard.id}>
              <Circle
                center={[hazard.affectedCoordinates[0][0], hazard.affectedCoordinates[0][1]]}
                radius={7500}
                pathOptions={{
                  color: '#f1c40f',
                  fillColor: '#f1c40f',
                  fillOpacity: 0.12,
                  weight: 1.5,
                }}
                eventHandlers={{ click: () => handleHazardClick(hazard) }}
              />
              <Marker
                position={[hazard.affectedCoordinates[0][0], hazard.affectedCoordinates[0][1]]}
                icon={createHazardIcon()}
                eventHandlers={{ click: () => handleHazardClick(hazard) }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <div className="font-bold text-amber-400 font-label-caps">{hazard.title}</div>
                    <div className="text-slate-300 text-[11px] mt-1">{hazard.areaDescription}</div>
                    <div className="text-slate-400 text-[11px] mt-1">Advisory: {hazard.advisoryAction}</div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
      </MapContainer>

      {/* Telemetry Bar at Base of Canvas */}
      <div className="absolute bottom-0 left-0 right-0 h-8 hud-glass border-t border-slate-800/80 z-20 flex items-center justify-between px-4 text-[11px] font-telemetry text-slate-400">
        <div className="flex items-center gap-3 sm:gap-4">
          <span>CENTER: 18°46'N 72°43'E</span>
          <span className="hidden sm:inline">SST: {oceanData.parameters.seaSurfaceTemperatureCelsius}°C</span>
          <span className="hidden md:inline">WIND: {weatherData.currentConditions.windSpeedKnots} kts ({weatherData.currentConditions.windDirection})</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>ORCA GEOSPATIAL REASONING</span>
        </div>
      </div>
    </div>
  );
};
