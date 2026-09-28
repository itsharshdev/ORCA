import React, { useState } from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { MapLayerControl } from '@/components/map/MapLayerControl';
import { MapContextPanel } from '@/components/map/MapContextPanel';
import { MapLegend } from '@/components/map/MapLegend';
import { useRegion } from '@/hooks/useRegion';
import { useRole } from '@/hooks/useRole';
import { useConnectivity } from '@/hooks/useConnectivity';
import type { MapLayerVisibility, SelectedMapEntity } from '@/types/map';
import { Fish, AlertTriangle, ShieldAlert, Anchor } from 'lucide-react';

const ROLE_LAYER_PRESETS: Record<string, { label: string; layers: MapLayerVisibility }> = {
  FISHERMAN: {
    label: 'Fisherman View',
    layers: {
      userLocation: true,
      vessel: true,
      pfzZones: true,
      weatherRisk: true,
      hazards: false,
      boundaries: true,
      recommendedRoute: true,
      safeCorridor: true,
      riskAreas: false,
    },
  },
  COASTAL_AUTHORITY: {
    label: 'Authority Surveillance',
    layers: {
      userLocation: true,
      vessel: true,
      pfzZones: false,
      weatherRisk: false,
      hazards: true,
      boundaries: true,
      recommendedRoute: true,
      safeCorridor: true,
      riskAreas: true,
    },
  },
  DISASTER_MANAGER: {
    label: 'Disaster Hazard Perimeter',
    layers: {
      userLocation: true,
      vessel: true,
      pfzZones: false,
      weatherRisk: true,
      hazards: true,
      boundaries: true,
      recommendedRoute: false,
      safeCorridor: false,
      riskAreas: true,
    },
  },
  RESEARCHER: {
    label: 'Research Observations',
    layers: {
      userLocation: true,
      vessel: false,
      pfzZones: true,
      weatherRisk: true,
      hazards: true,
      boundaries: true,
      recommendedRoute: false,
      safeCorridor: true,
      riskAreas: true,
    },
  },
};

export const MarineMapPage: React.FC = () => {
  const { activeRegion } = useRegion();
  const { activeRole } = useRole();
  const { state, gpsStatus } = useConnectivity();
  const { pfzData, hazardsData, boundariesData, vesselsData, mapCenter } = activeRegion;

  // Initialize with active role's recommended layers
  const [layers, setLayers] = useState<MapLayerVisibility>(() => {
    return ROLE_LAYER_PRESETS[activeRole]?.layers || {
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
  });

  const topPfz = pfzData.zones[0];
  const [selectedEntity, setSelectedEntity] = useState<SelectedMapEntity | null>(() => {
    if (!topPfz) return null;
    return {
      id: topPfz.id,
      type: 'pfz',
      title: topPfz.zoneName,
      subtitle: 'Optimal pelagic aggregation zone detected via EO Thermal/Chlorophyll Fronts',
      status: topPfz.potentialScore.toUpperCase(),
      severity: 'favorable',
      location: {
        latitude: topPfz.location.latitude,
        longitude: topPfz.location.longitude,
      },
      details: {
        potentialScore: topPfz.potentialScore.toUpperCase(),
        distance: `${topPfz.distanceKmFromPort || 18.5} km`,
        bearing: `${topPfz.bearingDegrees || 245}°`,
        waterDepth: `${topPfz.location.depthMeters || 35} m`,
        sstGradient: topPfz.sstIndicator,
        chlorophyll: topPfz.chlorophyllIndicator,
      },
      source: pfzData.metadata.source,
      observedAt: pfzData.metadata.updatedAt || '2026-09-02 06:00 IST',
      validUntil: pfzData.metadata.validUntil,
      recommendedFishTypes: topPfz.recommendedFishTypes,
    };
  });

  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(() => {
    return topPfz ? [topPfz.location.latitude, topPfz.location.longitude] : mapCenter;
  });

  const handleFocusEntity = (entity: SelectedMapEntity) => {
    if (entity.location) {
      setFlyToCoords([entity.location.latitude, entity.location.longitude]);
    }
  };

  const selectTopZone = () => {
    const z = pfzData.zones[0];
    const ent: SelectedMapEntity = {
      id: z.id,
      type: 'pfz',
      title: z.zoneName,
      subtitle: 'Optimal pelagic aggregation zone detected via EO Thermal/Chlorophyll Fronts',
      status: z.potentialScore.toUpperCase(),
      severity: 'favorable',
      location: { latitude: z.location.latitude, longitude: z.location.longitude },
      details: {
        potentialScore: z.potentialScore.toUpperCase(),
        distance: `${z.distanceKmFromPort || 18.5} km`,
        bearing: `${z.bearingDegrees || 245}°`,
        waterDepth: `${z.location.depthMeters || 35} m`,
        sstGradient: z.sstIndicator,
        chlorophyll: z.chlorophyllIndicator,
      },
      source: pfzData.metadata.source,
      observedAt: pfzData.metadata.updatedAt || '2026-09-02 06:00 IST',
      validUntil: pfzData.metadata.validUntil,
      recommendedFishTypes: z.recommendedFishTypes,
    };
    setSelectedEntity(ent);
    setFlyToCoords([z.location.latitude, z.location.longitude]);
  };

  const selectVessel = () => {
    const v = vesselsData.profiles[0];
    const ent: SelectedMapEntity = {
      id: v.id,
      type: 'vessel',
      title: v.name,
      subtitle: `${v.vesselType.replace('_', ' ').toUpperCase()} • Reg: ${v.registrationNo || 'IND-REG'}`,
      status: 'Active Operations',
      severity: 'favorable',
      location: { latitude: v.currentLocation.latitude, longitude: v.currentLocation.longitude },
      details: {
        maxWaveTolerance: `${v.maxWaveToleranceMeters} m`,
        cruisingSpeed: `${v.cruisingSpeedKnots} kts`,
        fuelCapacity: `${v.fuelCapacityHours} hours`,
        homePort: v.homePort.name,
      },
      source: 'ORCA_VESSEL_TELEMETRY',
      observedAt: '2026-09-02 08:00 IST',
    };
    setSelectedEntity(ent);
    setFlyToCoords([v.currentLocation.latitude, v.currentLocation.longitude]);
  };

  const selectHazard = () => {
    const h = hazardsData.alerts[0];
    const coords = h.affectedCoordinates && h.affectedCoordinates.length > 0 
      ? h.affectedCoordinates[0] 
      : [18.90, 72.80] as [number, number];

    const ent: SelectedMapEntity = {
      id: h.id,
      type: 'hazard',
      title: h.title,
      subtitle: h.areaDescription,
      status: 'CRITICAL ALERT',
      severity: 'critical',
      location: {
        latitude: coords[0],
        longitude: coords[1],
      },
      details: {
        hazardType: h.hazardType,
        advisoryAction: h.advisoryAction,
        severityLevel: h.severity,
      },
      source: hazardsData.metadata.source || 'IMD_INCOIS',
      observedAt: hazardsData.metadata.updatedAt || '2026-09-02 06:00 IST',
      validUntil: h.validUntil,
    };
    setSelectedEntity(ent);
    setFlyToCoords([coords[0], coords[1]]);
  };

  const selectBoundary = () => {
    const b = boundariesData.features[0];
    const coords = b.geometry.coordinates[0][0];
    const ent: SelectedMapEntity = {
      id: b.properties.name,
      type: 'boundary',
      title: b.properties.name,
      subtitle: b.properties.restrictionDescription,
      status: 'RESTRICTED AREA',
      severity: 'cautionary',
      location: { latitude: coords[1], longitude: coords[0] },
      details: {
        zoneType: b.properties.zoneType,
        severity: b.properties.severityOnIncursion,
        bufferDistance: `${b.properties.bufferDistanceMeters || 500} m`,
      },
      source: boundariesData.metadata.source,
      observedAt: 'Permanent Geofence Regulation',
    };
    setSelectedEntity(ent);
    setFlyToCoords([coords[1], coords[0]]);
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#E2EFF7] select-none">
      {/* Map Canvas Background */}
      <div className="flex-1 h-full relative z-0">
        <MarineMapCanvas
          layers={layers}
          onSelectEntity={setSelectedEntity}
          flyToCoords={flyToCoords}
        />
      </div>

      {/* Floating Layer Controls (Top Left) */}
      <div className="absolute top-4 left-4 z-20">
        <MapLayerControl layers={layers} onChange={setLayers} />
      </div>

      {/* Floating Connectivity Notice (Top Center) */}
      {state !== 'CONNECTED' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#D8E5EC] shadow-md flex items-center gap-2 text-xs font-semibold text-[#123B5D]">
          <span className={`w-2 h-2 rounded-full ${state === 'OFFLINE' ? 'bg-[#EF4444]' : 'bg-[#D99520]'}`} />
          <span>{state === 'OFFLINE' ? 'OFFLINE: CACHED VECTOR SHELL' : 'DEGRADED: HIGH LATENCY'}</span>
          <span className="text-[10px] text-[#5A7C99] font-mono border-l border-[#D8E5EC] pl-2">GPS: {gpsStatus}</span>
        </div>
      )}

      {/* Quick Jump & Preset Ribbon (Top Right) */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D8E5EC] shadow-md">
        {/* Role Layer Presets */}
        <div className="flex items-center gap-1 pr-2 border-r border-[#D8E5EC]">
          {Object.entries(ROLE_LAYER_PRESETS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setLayers(config.layers)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                activeRole === key
                  ? 'bg-[#147FB3] text-white shadow-2xs font-bold'
                  : 'text-[#587083] hover:text-[#123B5D] hover:bg-[#F5F9FC]'
              }`}
              title={`Apply ${config.label} layer configuration`}
            >
              {config.label.split(' ')[0]}
            </button>
          ))}
          <button
            onClick={() => setLayers({
              userLocation: true,
              vessel: true,
              pfzZones: true,
              weatherRisk: true,
              hazards: true,
              boundaries: true,
              recommendedRoute: true,
              safeCorridor: true,
              riskAreas: true,
            })}
            className="px-2 py-1 rounded-lg text-[10px] text-[#7E93A3] hover:text-[#123B5D] hover:bg-[#F5F9FC] transition cursor-pointer"
            title="Enable all layers"
          >
            All
          </button>
        </div>

        <button
          onClick={selectTopZone}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#147FB3] bg-[#E8F4FA] hover:bg-[#CFE6F3] transition cursor-pointer"
        >
          <Fish className="w-3.5 h-3.5" />
          <span>PFZ</span>
        </button>

        <button
          onClick={selectVessel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#123B5D] hover:bg-[#F5F9FC] transition cursor-pointer"
        >
          <Anchor className="w-3.5 h-3.5 text-[#147FB3]" />
          <span>Vessel</span>
        </button>

        <button
          onClick={selectHazard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Hazard</span>
        </button>

        <button
          onClick={selectBoundary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Geofence</span>
        </button>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-20 hidden md:block">
        <MapLegend />
      </div>

      {/* Right Entity Details Drawer / Panel */}
      <div className="w-full md:w-80 lg:w-96 h-1/2 md:h-full z-20 p-3 md:p-4 shrink-0 flex flex-col justify-end md:justify-start pointer-events-none">
        <div className="pointer-events-auto h-full flex flex-col shadow-xl">
          <MapContextPanel
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
            onFocusEntity={handleFocusEntity}
          />
        </div>
      </div>
    </div>
  );
};
