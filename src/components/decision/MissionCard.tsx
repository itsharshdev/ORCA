import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation2, Clock, Timer, Anchor, Edit3 } from 'lucide-react';
import { ROUTES } from '@/routes';

interface MissionCardProps {
  departure?: string;
  duration?: string;
  asset?: string;
  targetZone?: string;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  departure = '05:45 IST',
  duration = '5 HOURS',
  asset = 'SMALL VESSEL (8.5M)',
  targetZone = 'ZONE ALPHA (18.5 KM)',
}) => {
  return (
    <div className="hud-glass rounded-xl p-4 flex flex-col gap-3 relative border border-slate-800/80 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-label-caps text-slate-400 tracking-wider">
          CURRENT MISSION
        </h2>
        <Link 
          to={ROUTES.MISSION} 
          className="text-[11px] font-label-caps text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>EDIT</span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Navigation2 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">FISHING OPERATION</h3>
          <p className="text-[11px] text-slate-400 font-telemetry">Alibaug Coastal Sector</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70">
          <div className="text-[10px] font-label-caps text-slate-400 flex items-center gap-1 mb-0.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>DEPARTURE</span>
          </div>
          <div className="font-telemetry text-xs text-slate-200 font-medium">{departure}</div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70">
          <div className="text-[10px] font-label-caps text-slate-400 flex items-center gap-1 mb-0.5">
            <Timer className="w-3 h-3 text-cyan-400" />
            <span>DURATION</span>
          </div>
          <div className="font-telemetry text-xs text-slate-200 font-medium">{duration}</div>
        </div>

        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70 col-span-2">
          <div className="text-[10px] font-label-caps text-slate-400 flex items-center gap-1 mb-0.5">
            <Anchor className="w-3 h-3 text-cyan-400" />
            <span>ASSET & TARGET</span>
          </div>
          <div className="font-telemetry text-xs text-slate-200 font-medium flex items-center justify-between">
            <span>{asset}</span>
            <span className="text-cyan-400 text-[11px]">{targetZone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
