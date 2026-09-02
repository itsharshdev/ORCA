import React from 'react';
import type { MapLayerVisibility } from '@/types/map';
import { 
  Layers, 
  MapPin, 
  Anchor, 
  Fish, 
  CloudSun, 
  AlertTriangle, 
  ShieldAlert, 
  Crosshair, 
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

interface MapLayerControlProps {
  layers: MapLayerVisibility;
  onChange: (layers: MapLayerVisibility) => void;
  className?: string;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  layers,
  onChange,
  className = '',
}) => {
  const toggleLayer = (key: keyof MapLayerVisibility) => {
    onChange({
      ...layers,
      [key]: !layers[key],
    });
  };

  const layerItems: Array<{
    key: keyof MapLayerVisibility;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    activeColor: string;
    count?: string;
  }> = [
    { key: 'vessel', label: 'Active Vessel', icon: Anchor, color: 'text-cyan-400', activeColor: 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40', count: '1' },
    { key: 'userLocation', label: 'User Location', icon: MapPin, color: 'text-blue-400', activeColor: 'bg-blue-950/50 text-blue-300 border-blue-500/40', count: 'Port' },
    { key: 'pfzZones', label: 'PFZ Fishing Zones', icon: Fish, color: 'text-emerald-400', activeColor: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40', count: '3' },
    { key: 'weatherRisk', label: 'Weather Risk Overlays', icon: CloudSun, color: 'text-sky-400', activeColor: 'bg-sky-950/50 text-sky-300 border-sky-500/40', count: 'Wind/Waves' },
    { key: 'hazards', label: 'Navigational Hazards', icon: AlertTriangle, color: 'text-amber-400', activeColor: 'bg-amber-950/50 text-amber-300 border-amber-500/40', count: '2' },
    { key: 'boundaries', label: 'Geofences & Sanctuaries', icon: ShieldAlert, color: 'text-rose-400', activeColor: 'bg-rose-950/50 text-rose-300 border-rose-500/40', count: '2' },
    { key: 'recommendedRoute', label: 'Recommended Route', icon: Crosshair, color: 'text-cyan-400', activeColor: 'bg-cyan-950/50 text-cyan-300 border-cyan-500/40', count: 'Active' },
    { key: 'safeCorridor', label: 'Safe Navigation Corridor', icon: ShieldCheck, color: 'text-teal-400', activeColor: 'bg-teal-950/50 text-teal-300 border-teal-500/40', count: 'Verified' },
  ];

  const handleToggleAll = (enable: boolean) => {
    onChange({
      userLocation: enable,
      vessel: enable,
      pfzZones: enable,
      weatherRisk: enable,
      hazards: enable,
      boundaries: enable,
      recommendedRoute: enable,
      safeCorridor: enable,
      riskAreas: enable,
    });
  };

  return (
    <div className={`hud-glass rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-2xl flex flex-col gap-2.5 select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white font-label-caps tracking-wider">
            MAP LAYERS CONTROL
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-label-caps">
          <button
            type="button"
            onClick={() => handleToggleAll(true)}
            className="px-1.5 py-0.5 rounded text-cyan-400 hover:text-white transition-colors"
          >
            All
          </button>
          <span className="text-slate-600">/</span>
          <button
            type="button"
            onClick={() => handleToggleAll(false)}
            className="px-1.5 py-0.5 rounded text-slate-400 hover:text-white transition-colors"
          >
            None
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-1.5 max-h-[300px] overflow-y-auto">
        {layerItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = layers[item.key];

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleLayer(item.key)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left transition-all ${
                isEnabled
                  ? `${item.activeColor} shadow-[0_0_8px_rgba(0,0,0,0.3)]`
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${isEnabled ? item.color : 'text-slate-600'}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.count && (
                  <span className="text-[10px] font-telemetry px-1.5 py-0.2 rounded bg-slate-950/60 text-slate-400">
                    {item.count}
                  </span>
                )}
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                    isEnabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  {isEnabled ? <Check className="w-3 h-3 font-bold" /> : <X className="w-2.5 h-2.5" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
