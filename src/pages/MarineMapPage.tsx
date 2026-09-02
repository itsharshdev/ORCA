import React, { useState } from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { pfzData, hazardsData } from '@/data';
import { Map, AlertTriangle, Fish } from 'lucide-react';

export const MarineMapPage: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<any>(pfzData.zones[0]);

  return (
    <div className="relative w-full h-full flex-1 flex flex-col overflow-hidden">
      {/* Map Explorer Control Bar */}
      <div className="hud-glass border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white font-label-caps tracking-wider">
              MARINE GEOSPATIAL EXPLORER
            </span>
          </div>
          <span className="hidden md:inline text-[11px] font-telemetry text-slate-400">
            • 3 PFZ LOCATIONS • 2 GEOFENCES • 2 HAZARD NOTICES
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSelectedEntity(pfzData.zones[0])}
            className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-label-caps text-[11px] flex items-center gap-1.5"
          >
            <Fish className="w-3 h-3" />
            <span>Zone Alpha</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedEntity(hazardsData.alerts[0])}
            className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/60 text-amber-400 font-label-caps text-[11px] flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Hazard Alert</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative flex-1 w-full h-full">
        <MarineMapCanvas className="w-full h-full" showOverlayControls={true} />

        {/* Floating Details Drawer */}
        {selectedEntity && (
          <div className="absolute bottom-12 left-4 z-20 w-80 sm:w-96 hud-glass rounded-xl p-4 border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] font-label-caps text-cyan-400">
                {selectedEntity.zoneName ? 'PFZ ADVISORY DETAIL' : 'ACTIVE HAZARD ADVISORY'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                &times; CLOSE
              </button>
            </div>

            <div className="mt-2.5 flex flex-col gap-2">
              <h3 className="text-sm font-bold text-white">
                {selectedEntity.zoneName || selectedEntity.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedEntity.chlorophyllIndicator 
                  ? `Chlorophyll Indicator: ${selectedEntity.chlorophyllIndicator} • SST: ${selectedEntity.sstIndicator}`
                  : selectedEntity.areaDescription}
              </p>

              {selectedEntity.recommendedFishTypes && (
                <div className="text-[11px] font-telemetry text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-800/40">
                  Target Pelagic Species: {selectedEntity.recommendedFishTypes.join(', ')}
                </div>
              )}

              {selectedEntity.advisoryAction && (
                <div className="text-[11px] font-telemetry text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-800/40">
                  Required Action: {selectedEntity.advisoryAction}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
