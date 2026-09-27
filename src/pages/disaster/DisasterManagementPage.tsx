import React from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  Layers
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';

export const DisasterManagementPage: React.FC = () => {
  const { activeRegion } = useRegion();

  const activeHazards = [
    {
      id: 'HAZ-SQUALL-01',
      title: 'Squally Wind Warning for Outer Continental Shelf',
      category: 'METEOROLOGICAL',
      severity: 'CRITICAL',
      source: 'IMD Marine Bulletin / INCOIS OSF',
      affectedArea: 'Offshore Raigad & Ratnagiri beyond 25 NM',
      riskWindow: '12:00 IST – 18:00 IST',
      windForecast: '25–32 kts gusts',
      waveSwell: '2.1m – 2.8m rough seas',
      advisoryAction: 'Small fishing craft and motorized boats advised to return to coastal harbor before 13:00 IST.',
      exposedCrafts: 2,
    },
    {
      id: 'HAZ-SHOAL-02',
      title: 'Submerged Shoal / Shallow Sandbar Navigational Hazard',
      category: 'BATHYMETRIC',
      severity: 'WARNING',
      source: 'National Hydrographic Office (NHO)',
      affectedArea: 'Dharamtal Creek Entrance Shoal Bank',
      riskWindow: 'Active during low tide ebb window',
      windForecast: 'N/A',
      waveSwell: '1.2m breaking crests',
      advisoryAction: 'Maintain minimum 1.5 NM clearance during ebb tide transition.',
      exposedCrafts: 0,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D65B5B] mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[11px]">DISASTER MANAGEMENT AUTHORITY (NDRF / SDMA) • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123B5D] tracking-tight">
            Coastal Hazard Exposure &amp; Emergency Coordination
          </h1>
          <p className="text-xs text-[#5A7C99]">
            Real-time meteorological warnings • Wave hazard perimeter monitoring • Evacuation advisories
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-xs text-[#9B1C1C] flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D65B5B]" />
            <span><strong>2</strong> Active Hazard Zones</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#D8E5EC] text-xs text-[#123B5D] shadow-sm flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#147FB3]" />
            <span><strong>2</strong> Crafts in Exposure Sector</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Hazard Map (Left 7 Cols) + Active Hazard Advisories (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial Hazard Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#D65B5B]" />
                <span>Hazard Spatial Extent &amp; Warning Sector</span>
              </div>
              <span className="text-[10px] text-[#5A7C99]">
                WGS84 • Hazard Polygon Boundaries
              </span>
            </div>

            <div className="h-96 sm:h-[480px] rounded-xl overflow-hidden border border-[#D8E5EC] relative">
              <MarineMapCanvas className="w-full h-full" showOverlayControls={true} />
            </div>
          </div>
        </div>

        {/* Hazard Intelligence Detail Panel */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {activeHazards.map((hazard) => (
            <div
              key={hazard.id}
              className="bg-white rounded-2xl p-5 border border-[#F8B4B4] shadow-sm flex flex-col gap-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#D65B5B]" />

              <div className="flex items-start justify-between gap-2 pl-2">
                <div>
                  <span className="px-2 py-0.5 rounded bg-[#FDF2F2] text-[#9B1C1C] font-mono text-[10px] font-bold border border-[#F8B4B4]">
                    {hazard.severity} • {hazard.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#123B5D] mt-1.5">
                    {hazard.title}
                  </h3>
                </div>
              </div>

              <div className="pl-2 flex flex-col gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px] text-[#5A7C99]">
                    <span>Affected Perimeter:</span>
                    <strong className="text-[#123B5D]">{hazard.affectedArea}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#5A7C99]">
                    <span>Critical Time Window:</span>
                    <strong className="text-[#D65B5B] font-mono">{hazard.riskWindow}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-[#F9FCFE] border border-[#D8E5EC]">
                    <div className="text-[10px] text-[#5A7C99] uppercase">Wind Forecast</div>
                    <div className="text-xs font-bold text-[#147FB3] font-mono">{hazard.windForecast}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F9FCFE] border border-[#D8E5EC]">
                    <div className="text-[10px] text-[#5A7C99] uppercase">Wave Swell</div>
                    <div className="text-xs font-bold text-[#D99520] font-mono">{hazard.waveSwell}</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[11px] text-[#9B1C1C]">
                  <strong className="block text-[#D65B5B] uppercase text-[10px] font-bold mb-0.5">
                    MANDATORY ADVISORY ACTION:
                  </strong>
                  {hazard.advisoryAction}
                </div>
              </div>

              <div className="pl-2 pt-2 border-t border-[#E2EDF4] flex items-center justify-between text-[10px] text-[#5A7C99]">
                <span>Source: {hazard.source}</span>
                <span className="text-[#D65B5B] font-bold">Crafts in Perimeter: {hazard.exposedCrafts}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

