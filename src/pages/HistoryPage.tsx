import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';

interface HistoryRecord {
  id: string;
  timestamp: string;
  mission: string;
  vessel: string;
  zone: string;
  verdict: 'GO' | 'CAUTION' | 'AVOID';
  confidence: number;
  reason: string;
  dataStatus: 'demo_snapshot' | 'cached' | 'live';
}

export const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'GO' | 'CAUTION' | 'AVOID'>('ALL');

  const historyData: HistoryRecord[] = [
    {
      id: 'DEC-20260902-01',
      timestamp: '2026-09-02 08:30 IST',
      mission: 'Commercial Fishing (5h)',
      vessel: 'Matsya Sagar 1 (8.5m)',
      zone: 'Zone Alpha (Offshore Alibaug)',
      verdict: 'CAUTION',
      confidence: 78.4,
      reason: 'Wave swell reaches 2.1m post-midday; return window constrained.',
      dataStatus: 'demo_snapshot',
    },
    {
      id: 'DEC-20260901-02',
      timestamp: '2026-09-01 05:15 IST',
      mission: 'Artisanal Fishing (3.5h)',
      vessel: 'Matsya Sagar 1 (8.5m)',
      zone: 'Murud Ridge (Zone Bravo)',
      verdict: 'GO',
      confidence: 89.1,
      reason: 'Low wave swell (0.9m), calm wind (8 kts), optimal SST chlorophyll front.',
      dataStatus: 'demo_snapshot',
    },
    {
      id: 'DEC-20260831-01',
      timestamp: '2026-08-31 11:00 IST',
      mission: 'Deep Sea Pelagic (8h)',
      vessel: 'Samudra Ratna (14m)',
      zone: 'North High Deep (Zone Charlie)',
      verdict: 'AVOID',
      confidence: 94.0,
      reason: 'Squall line advisory with wind gusts > 30 kts in outer continental shelf.',
      dataStatus: 'demo_snapshot',
    },
  ];

  const filtered = filter === 'ALL' ? historyData : historyData.filter((r) => r.verdict === filter);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-label-caps px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              MISSION AUDIT LOG
            </span>
            <span className="text-xs text-slate-400 font-telemetry">DECISION REPLAY REPOSITORY</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Decision Replay & Operational History
          </h1>
          <p className="text-xs text-slate-400">
            Audit trail of historical operational recommendations, recorded constraints, and evidence snapshots.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-label-caps">
          {(['ALL', 'GO', 'CAUTION', 'AVOID'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === tab
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="hud-glass rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] font-label-caps text-slate-400 font-bold">
              <tr>
                <th className="p-3">DECISION ID & TIME</th>
                <th className="p-3">MISSION & VESSEL</th>
                <th className="p-3">TARGET ZONE</th>
                <th className="p-3">VERDICT</th>
                <th className="p-3">PRIMARY RATIONALE</th>
                <th className="p-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-slate-300">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3">
                    <div className="font-telemetry font-bold text-slate-200">{record.id}</div>
                    <div className="text-[11px] text-slate-400 font-telemetry mt-0.5">{record.timestamp}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">{record.mission}</div>
                    <div className="text-[11px] text-slate-400 font-telemetry">{record.vessel}</div>
                  </td>
                  <td className="p-3 text-cyan-300 font-telemetry text-xs font-medium">
                    {record.zone}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={record.verdict} size="sm" />
                      <span className="font-telemetry text-[11px] text-slate-400 font-bold">
                        {record.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-[11px] text-slate-400 max-w-xs leading-relaxed">
                    {record.reason}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={ROUTES.DECISIONS}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] font-label-caps font-semibold transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Replay</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
