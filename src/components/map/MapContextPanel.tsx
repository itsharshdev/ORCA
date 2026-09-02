import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { SelectedMapEntity } from '@/types/map';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  Fish, 
  AlertTriangle, 
  ShieldAlert, 
  Anchor, 
  MapPin, 
  Crosshair, 
  Navigation2, 
  Compass, 
  Layers, 
  X,
  Database
} from 'lucide-react';
import { ROUTES } from '@/routes';

const EntityTypeIcon: React.FC<{ type: string; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'pfz':
      return <Fish className={className} />;
    case 'hazard':
      return <AlertTriangle className={className} />;
    case 'boundary':
      return <ShieldAlert className={className} />;
    case 'vessel':
      return <Anchor className={className} />;
    case 'userLocation':
      return <MapPin className={className} />;
    default:
      return <Crosshair className={className} />;
  }
};

interface MapContextPanelProps {
  entity: SelectedMapEntity | null;
  onClose: () => void;
  onFocusEntity?: (entity: SelectedMapEntity) => void;
}

export const MapContextPanel: React.FC<MapContextPanelProps> = ({
  entity,
  onClose,
  onFocusEntity,
}) => {
  const navigate = useNavigate();

  if (!entity) {
    return (
      <div className="hud-glass rounded-2xl p-5 border border-slate-800 shadow-2xl flex flex-col gap-4 text-xs select-none">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white font-label-caps tracking-wider">
            OPERATIONAL CONTEXT
          </h2>
        </div>

        <div className="py-4 text-center flex flex-col items-center gap-2 text-slate-400">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <p className="font-medium text-slate-300">No Map Feature Selected</p>
          <p className="text-[11px] leading-relaxed max-w-xs text-slate-400">
            Click any Potential Fishing Zone, vessel, hazard warning, or restricted boundary on the map to inspect its operational evidence.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between font-telemetry text-[11px]">
          <span className="text-slate-400">ACTIVE SECTOR:</span>
          <span className="text-cyan-400 font-bold">ARABIAN SEA (MUMBAI)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hud-glass rounded-2xl p-5 border border-slate-800 shadow-2xl flex flex-col gap-4 text-xs select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <EntityTypeIcon type={entity.type} className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-label-caps text-cyan-400 block">
              {entity.type.toUpperCase()} CONTEXT
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">{entity.title}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status & Severity */}
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-[11px] font-label-caps">STATUS / LEVEL:</span>
        <StatusBadge status={entity.status} size="sm" showPulse />
      </div>

      {/* Subtitle / Description */}
      {entity.subtitle && (
        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          {entity.subtitle}
        </p>
      )}

      {/* Target Species for PFZ */}
      {entity.recommendedFishTypes && (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
          <span className="text-[10px] font-label-caps text-emerald-400 font-bold">
            TARGET COMMERCIAL SPECIES:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {entity.recommendedFishTypes.map((sp, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 text-[10px] font-telemetry"
              >
                {sp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Advisory for Hazards */}
      {entity.actionRequired && (
        <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-800/40 text-xs">
          <span className="text-[10px] font-label-caps text-amber-400 font-bold block mb-1">
            MANDATORY ADVISORY:
          </span>
          <p className="text-slate-200 text-[11px] font-sans leading-relaxed">
            {entity.actionRequired}
          </p>
        </div>
      )}

      {/* Key Metric Details */}
      <div className="grid grid-cols-2 gap-2 font-telemetry text-[11px]">
        {Object.entries(entity.details).map(([key, val]) => (
          <div key={key} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <span className="text-slate-500 block text-[9px] uppercase font-label-caps truncate">
              {key.replace(/([A-Z])/g, ' $1')}
            </span>
            <span className="text-slate-200 font-semibold truncate block mt-0.5">
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Provenance Metadata */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1 text-[10px] font-telemetry text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>SOURCE:</span>
          </span>
          <span className="text-cyan-300 font-semibold">{entity.source}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>OBSERVED:</span>
          <span className="text-slate-300">{entity.observedAt}</span>
        </div>
        {entity.validUntil && (
          <div className="flex items-center justify-between">
            <span>VALID UNTIL:</span>
            <span className="text-slate-300">{entity.validUntil}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-1">
        {onFocusEntity && (
          <button
            type="button"
            onClick={() => onFocusEntity(entity)}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-label-caps text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>FOCUS MAP</span>
          </button>
        )}

        {entity.type === 'pfz' && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.MISSION)}
            className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-label-caps text-xs flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(70,234,237,0.3)]"
          >
            <Navigation2 className="w-3.5 h-3.5" />
            <span>PLAN TRIP</span>
          </button>
        )}
      </div>
    </div>
  );
};
