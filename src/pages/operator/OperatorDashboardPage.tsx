import React from 'react';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import { 
  Ship, 
  Compass, 
  Calendar, 
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { useRegion } from '@/hooks/useRegion';

export const OperatorDashboardPage: React.FC = () => {
  const { activeRegion } = useRegion();

  const scheduledVoyages = [
    {
      id: 'VOY-2026-0926-A',
      craft: 'Sassoon Ferry Express (18m)',
      type: 'Passenger / Coastal Transit',
      route: 'Gateway of India &rarr; Alibaug Mandwa',
      departure: '06:30 IST',
      eta: '07:15 IST',
      status: 'CLEARED (PASS)',
      statusStyle: 'text-[#2E8B57] bg-[#EBF7EE] border-[#A3E6B5]',
      waveEnvelope: '0.8m (&le; 1.8m limit)',
      wind: '11 kts (Clear)',
    },
    {
      id: 'VOY-2026-0926-B',
      craft: 'Ocean Survey Tug 04 (24m)',
      type: 'Hydrographic Survey',
      route: 'Mumbai Anchorage &rarr; Bombay High Sector',
      departure: '08:00 IST',
      eta: '16:00 IST',
      status: 'CAUTION (AFTERNOON SWELL)',
      statusStyle: 'text-[#D99520] bg-[#FEF9EE] border-[#FAD889]',
      waveEnvelope: '1.2m morning &rarr; 2.2m afternoon',
      wind: '18–22 kts gusts',
    },
    {
      id: 'VOY-2026-0926-C',
      craft: 'Alibaug Pelagic Trawler 02 (12m)',
      type: 'Commercial Gillnetter',
      route: 'Sassoon Docks &rarr; Murud Ridge',
      departure: '05:45 IST',
      eta: '11:00 IST',
      status: 'CLEARED (MORNING WINDOW)',
      statusStyle: 'text-[#2E8B57] bg-[#EBF7EE] border-[#A3E6B5]',
      waveEnvelope: '0.9m (&le; 1.4m limit)',
      wind: '12 kts (Favorable)',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2EDF4]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#147FB3] mb-1">
            <Ship className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[11px]">COMMERCIAL MARITIME OPERATOR • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#123B5D] tracking-tight">
            Fleet Dispatch &amp; Voyage Route Clearance
          </h1>
          <p className="text-xs text-[#5A7C99]">
            Commercial tug, passenger ferry, and survey operations • Scheduled departure envelope monitoring
          </p>
        </div>

        <Link
          to={ROUTES.MISSION}
          className="px-4 py-2 rounded-xl bg-[#147FB3] hover:bg-[#106A96] text-white font-bold text-xs tracking-wider transition flex items-center gap-1.5 shadow-sm"
        >
          <Compass className="w-4 h-4" />
          <span>DISPATCH NEW VOYAGE</span>
        </Link>
      </div>

      {/* Main Grid: Map (Left 7 Cols) + Scheduled Voyages (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fleet Route Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#147FB3]" />
                <span>Commercial Route Corridors</span>
              </div>
              <span className="text-[10px] text-[#5A7C99]">
                Bathymetric Navigation Corridors
              </span>
            </div>

            <div className="h-96 sm:h-[480px] rounded-xl overflow-hidden border border-[#D8E5EC] relative">
              <MarineMapCanvas className="w-full h-full" showOverlayControls={true} />
            </div>
          </div>
        </div>

        {/* Scheduled Voyages Detail */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E2EDF4] pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#147FB3]" />
                <h3 className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Today's Scheduled Departures
                </h3>
              </div>
              <span className="text-[10px] text-[#5A7C99]">
                {scheduledVoyages.length} Voyages Logged
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {scheduledVoyages.map((voy) => (
                <div
                  key={voy.id}
                  className="p-3.5 rounded-xl bg-[#F9FCFE] border border-[#D8E5EC] flex flex-col gap-2 text-xs hover:border-[#147FB3] transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#123B5D] text-sm">{voy.craft}</div>
                      <div className="text-[10px] text-[#5A7C99] font-medium">{voy.type}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${voy.statusStyle}`}>
                      {voy.status}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-white border border-[#D8E5EC] flex items-center justify-between text-[11px] text-[#123B5D]">
                    <span className="text-[#5A7C99]">{voy.route}</span>
                    <span className="text-[#147FB3] font-bold">{voy.departure} &rarr; {voy.eta}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-[#5A7C99]">
                    <div>Wave: <span className="text-[#123B5D] font-medium">{voy.waveEnvelope}</span></div>
                    <div className="text-right">Wind: <span className="text-[#123B5D] font-medium">{voy.wind}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

