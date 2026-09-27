import React, { useState } from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { MapLayerControl } from '@/components/map/MapLayerControl';
import { MapContextPanel } from '@/components/map/MapContextPanel';
import { MapLegend } from '@/components/map/MapLegend';
import { useRegion } from '@/hooks/useRegion';
import type { MapLayerVisibility, SelectedMapEntity } from '@/types/map';
import { Fish, AlertTriangle, ShieldAlert, Anchor } from 'lucide-react';

export const MarineMapPage: React.FC = () => {
  const { activeRegion } = useRegion();
  const { pfzData, hazardsData, boundariesData, vesselsData, mapCenter } = activeRegion;

  const [layers, setLayers] = useState<MapLayerVisibility>({
    userLocation: true,
    vessel: true,
    pfzZones: true,
    weatherRisk: true,
    hazards: true,
    boundaries: true,
    recommendedRoute: true,
    safeCorridor: true,
    riskAreas: true,
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

      {/* Quick Jump Ribbon (Top Center / Right) */}
      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D8E5EC] shadow-md">
        <button
          onClick={selectTopZone}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#147FB3] bg-[#E8F4FA] hover:bg-[#CFE6F3] transition cursor-pointer"
        >
          <Fish className="w-3.5 h-3.5" />
          <span>PFZ Zone</span>
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
