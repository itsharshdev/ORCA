import React, { useState } from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { MapLayerControl } from '@/components/map/MapLayerControl';
import { MapContextPanel } from '@/components/map/MapContextPanel';
import { MapLegend } from '@/components/map/MapLegend';
import { useRegion } from '@/hooks/useRegion';
import type { MapLayerVisibility, SelectedMapEntity } from '@/types/map';
import { Fish, AlertTriangle, ShieldAlert, Anchor, Compass } from 'lucide-react';

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
        vesselLength: `${v.lengthMeters} m`,
        enginePower: `${v.engineHp || 30} HP`,
        cruisingSpeed: `${v.cruisingSpeedKnots} kts`,
        waveLimit: `${v.maxWaveToleranceMeters} m`,
        homePort: v.homePort.name,
      },
      source: vesselsData.metadata.source,
      observedAt: '2026-09-02 08:30 IST',
    };
    setSelectedEntity(ent);
    setFlyToCoords([v.currentLocation.latitude, v.currentLocation.longitude]);
  };

  const selectHazard = () => {
    const h = hazardsData.alerts[0];
    const ent: SelectedMapEntity = {
      id: h.id,
      type: 'hazard',
      title: h.title,
      subtitle: h.areaDescription,
      status: String(h.severity).toUpperCase(),
      severity: h.severity as any,
      location: { latitude: h.affectedCoordinates[0][0], longitude: h.affectedCoordinates[0][1] },
      details: {
        hazardType: h.hazardType.toUpperCase(),
        severity: String(h.severity).toUpperCase(),
        activeState: h.isActive ? 'ACTIVE WARNING' : 'INACTIVE',
      },
      source: hazardsData.metadata.source,
      observedAt: hazardsData.metadata.updatedAt || '2026-09-02 06:00 IST',
      validUntil: hazardsData.metadata.validUntil,
      actionRequired: h.advisoryAction,
    };
    setSelectedEntity(ent);
    setFlyToCoords([h.affectedCoordinates[0][0], h.affectedCoordinates[0][1]]);
  };

  const selectBoundary = () => {
    const b = boundariesData.features[0];
    const ent: SelectedMapEntity = {
      id: b.id,
      type: 'boundary',
      title: b.properties.name,
      subtitle: b.properties.restrictionDescription,
      status: b.properties.zoneType.toUpperCase(),
      severity: b.properties.severityOnIncursion as any,
      location: { latitude: mapCenter[0] + 0.1, longitude: mapCenter[1] + 0.1 },
      details: {
        zoneType: b.properties.zoneType.toUpperCase(),
        bufferRequired: `${b.properties.bufferDistanceMeters || 500} m`,
        incursionSeverity: b.properties.severityOnIncursion.toUpperCase(),
      },
      source: boundariesData.metadata.source,
      observedAt: boundariesData.metadata.updatedAt || '2026-09-02 06:00 IST',
      actionRequired: b.properties.restrictionDescription,
    };
    setSelectedEntity(ent);
    setFlyToCoords([mapCenter[0] + 0.1, mapCenter[1] + 0.1]);
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col overflow-hidden">
      {/* Top Quick Explorer Bar */}
      <div className="hud-glass border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white font-label-caps tracking-wider">
              INTERACTIVE MARINE MAP
            </span>
            <span className="hidden sm:inline text-[11px] font-telemetry text-slate-400 ml-2">
              • {activeRegion.name.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Quick Inspector Jump Chips */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={selectVessel}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-label-caps flex items-center gap-1.5 transition-colors ${
              selectedEntity?.type === 'vessel'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-slate-900/80 border-slate-800 text-cyan-300 hover:border-cyan-500/40'
            }`}
          >
            <Anchor className="w-3 h-3" />
            <span>Vessel</span>
          </button>

          <button
            type="button"
            onClick={selectTopZone}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-label-caps flex items-center gap-1.5 transition-colors ${
              selectedEntity?.type === 'pfz'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                : 'bg-slate-900/80 border-slate-800 text-emerald-400 hover:border-emerald-500/40'
            }`}
          >
            <Fish className="w-3 h-3" />
            <span>Candidate PFZ</span>
          </button>

          <button
            type="button"
            onClick={selectHazard}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-label-caps flex items-center gap-1.5 transition-colors ${
              selectedEntity?.type === 'hazard'
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-slate-900/80 border-slate-800 text-amber-400 hover:border-amber-500/40'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Hazard Alert</span>
          </button>

          <button
            type="button"
            onClick={selectBoundary}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-label-caps flex items-center gap-1.5 transition-colors ${
              selectedEntity?.type === 'boundary'
                ? 'bg-rose-500 text-slate-950 font-bold border-rose-400'
                : 'bg-slate-900/80 border-slate-800 text-rose-400 hover:border-rose-500/40'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Restricted Zone</span>
          </button>
        </div>
      </div>

      {/* Main Map + Context Panel Layout */}
      <div className="relative flex-1 w-full h-full flex flex-col md:flex-row overflow-hidden">
        {/* Full Interactive Canvas */}
        <div className="relative flex-1 w-full h-full">
          <MarineMapCanvas
            className="w-full h-full"
            layers={layers}
            selectedEntityId={selectedEntity?.id}
            onSelectEntity={(ent) => setSelectedEntity(ent)}
            flyToCoords={flyToCoords}
            showOverlayControls={false}
          />

          {/* Floating Top-Left / Top-Right Controls on Canvas */}
          <div className="absolute top-4 left-4 z-20 max-w-xs hidden sm:block">
            <MapLayerControl layers={layers} onChange={setLayers} />
          </div>

          <div className="absolute bottom-12 left-4 z-20 max-w-xs hidden lg:block">
            <MapLegend />
          </div>
        </div>

        {/* Right Desktop Context Panel */}
        <div className="hidden md:flex w-80 xl:w-96 p-4 flex-col gap-4 overflow-y-auto bg-slate-950/60 border-l border-slate-800/80 shrink-0 z-20">
          <MapContextPanel
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
            onFocusEntity={handleFocusEntity}
          />

          <div className="sm:hidden">
            <MapLayerControl layers={layers} onChange={setLayers} />
          </div>

          <div className="lg:hidden">
            <MapLegend />
          </div>
        </div>

        {/* Mobile Expandable Bottom Context Sheet */}
        {selectedEntity && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 p-3 z-40">
            <MapContextPanel
              entity={selectedEntity}
              onClose={() => setSelectedEntity(null)}
              onFocusEntity={handleFocusEntity}
            />
          </div>
        )}
      </div>
    </div>
  );
};
