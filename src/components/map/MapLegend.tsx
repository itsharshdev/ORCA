import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const legendItems = [
    { label: 'Active Vessel (Matsya Sagar 1)', symbol: '●', color: 'text-cyan-400', desc: 'Real-time telemetry' },
    { label: 'Port / User Location', symbol: '◉', color: 'text-blue-400', desc: 'Sassoon Docks' },
    { label: 'PFZ Zone (High Potential)', symbol: '▰', color: 'text-emerald-400', desc: 'Chlorophyll > 1.5 mg/m³' },
    { label: 'PFZ Zone (Moderate Potential)', symbol: '▰', color: 'text-amber-400', desc: 'Chlorophyll ~ 1.0 mg/m³' },
    { label: 'Recommended Route Line', symbol: '— —', color: 'text-cyan-300 font-mono font-bold', desc: 'Corridor to target PFZ' },
    { label: 'Restricted Naval Geofence', symbol: '△', color: 'text-rose-400', desc: 'Strict no-entry zone' },
    { label: 'Submerged Shoal / Weather Hazard', symbol: '▲', color: 'text-amber-400', desc: 'Clearance required' },
    { label: 'Safe Navigation Corridor', symbol: '▱', color: 'text-teal-400', desc: 'Low risk depth envelope' },
  ];

  return (
    <div className="hud-glass rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-2xl flex flex-col gap-2 select-none">
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between cursor-pointer pb-1 border-b border-slate-800/80"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white font-label-caps tracking-wider">
            CARTOGRAPHIC LEGEND
          </h2>
        </div>
        <button type="button" className="text-slate-400 hover:text-white">
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-1.5 pt-1 text-xs">
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/40">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${item.color}`}>{item.symbol}</span>
                <span className="text-slate-200 text-[11px] font-medium">{item.label}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-telemetry">{item.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
