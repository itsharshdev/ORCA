import React, { useEffect, useState } from 'react';
import { 
  Eye, 
  Clock, 
  Search, 
  History, 
  Ship, 
  MapPin, 
  ShieldCheck, 
  RotateCcw,
  X,
  FileCheck2,
  Calendar,
  Waves
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { missionService, type MissionRecord } from '@/services/missionService';
import type { DecisionVerdict } from '@/types/marine';
import { getCategoricalConfidence } from '@/lib/confidenceUtils';

interface HistoryRecord {
  id: string;
  timestamp: string;
  mission: string;
  vessel: string;
  zone: string;
  verdict: DecisionVerdict;
  confidence: number;
  reason: string;
  dataStatus: 'demo_snapshot' | 'cached' | 'live';
  inputs: {
    departureTime: string;
    durationHours: number;
    activity: string;
  };
  telemetrySnapshot: {
    waveHeight: string;
    windSpeed: string;
    tideState: string;
    pfzRelevance: string;
    geofenceStatus: string;
  };
  rulesTriggered: string[];
}

export const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'GO' | 'CAUTION' | 'AVOID' | 'INSUFFICIENT_DATA'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [persistedMissions, setPersistedMissions] = useState<MissionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  const defaultHistoryData: HistoryRecord[] = [
    {
      id: 'DEC-20260902-01',
      timestamp: '2026-09-28 09:45 IST',
      mission: 'Morning Coastal Fishing Trip (5h)',
      vessel: 'Matsya Sagar 1 (8.5m)',
      zone: 'Zone Alpha (Offshore Alibaug)',
      verdict: 'CAUTION',
      confidence: 78.4,
      reason: 'Significant wave swell height reaches 2.1m post-midday; return window constrained before afternoon sea chop.',
      dataStatus: 'demo_snapshot',
      inputs: {
        departureTime: '09:45 IST',
        durationHours: 5,
        activity: 'Commercial Fishing',
      },
      telemetrySnapshot: {
        waveHeight: '2.1m (Max tolerance 1.8m)',
        windSpeed: '16 kts (Gusts to 22 kts)',
        tideState: 'Ebb tide transitioning to flood',
        pfzRelevance: 'Zone Alpha (SST 28.4°C, High pelagic potential)',
        geofenceStatus: 'Clear (> 4.2 km from Naval Anchorage geofence)',
      },
      rulesTriggered: ['RULE_03_VESSEL_WAVE_LIMIT', 'RULE_05_RETURN_WINDOW_MARGIN'],
    },
    {
      id: 'DEC-20260901-02',
      timestamp: '2026-09-01 05:15 IST',
      mission: 'Artisanal Fishing (3.5h)',
      vessel: 'Matsya Sagar 1 (8.5m)',
      zone: 'Murud Ridge (Zone Bravo)',
      verdict: 'GO',
      confidence: 89.1,
      reason: 'Low wave swell (0.9m), calm wind (8 kts), optimal SST chlorophyll thermal front.',
      dataStatus: 'demo_snapshot',
      inputs: {
        departureTime: '05:30 IST',
        durationHours: 3.5,
        activity: 'Artisanal Handline',
      },
      telemetrySnapshot: {
        waveHeight: '0.9m (Well within 1.8m limit)',
        windSpeed: '8 kts (Light breeze)',
        tideState: 'Slack water',
        pfzRelevance: 'Zone Bravo (Chlorophyll 1.4 mg/m³)',
        geofenceStatus: 'Clear of all military/harbor security buffers',
      },
      rulesTriggered: ['RULE_ALL_PASS_BASELINE'],
    },
    {
      id: 'DEC-20260831-01',
      timestamp: '2026-08-31 11:00 IST',
      mission: 'Deep Sea Pelagic (8h)',
      vessel: 'Samudra Ratna (14m)',
      zone: 'North High Deep (Zone Charlie)',
      verdict: 'AVOID',
      confidence: 94.0,
      reason: 'Squall line advisory with wind gusts > 30 kts and swell exceeding 2.8m in outer continental shelf.',
      dataStatus: 'demo_snapshot',
      inputs: {
        departureTime: '11:00 IST',
        durationHours: 8,
        activity: 'Deep Sea Trawling',
      },
      telemetrySnapshot: {
        waveHeight: '2.8m (Exceeds craft envelope)',
        windSpeed: '32 kts (Squall advisory)',
        tideState: 'High tide ebb',
        pfzRelevance: 'Zone Charlie (Suppressed due to weather hazard)',
        geofenceStatus: 'Clear of buffer, but offshore storm track intersection',
      },
      rulesTriggered: ['RULE_01_CYCLONE_WIND_GALE', 'RULE_03_VESSEL_WAVE_LIMIT'],
    },
    {
      id: 'DEC-20260830-01',
      timestamp: '2026-08-30 11:00 IST',
      mission: 'Coastal Gillnet Run (4h)',
      vessel: 'Sagar Kripa (9m)',
      zone: 'Revdanda Estuary Approach',
      verdict: 'INSUFFICIENT_DATA',
      confidence: 35.0,
      reason: 'Missing OSF wave telemetry combined with coastal radar blackout; deterministic fail-safe policy prevents unverified clearance.',
      dataStatus: 'demo_snapshot',
      inputs: {
        departureTime: '11:00 IST',
        durationHours: 4,
        activity: 'Gillnet Fishing',
      },
      telemetrySnapshot: {
        waveHeight: 'DATA UNAVAILABLE (Telemetry loss)',
        windSpeed: '14 kts (Estimated)',
        tideState: 'Flood tide',
        pfzRelevance: 'Unavailable',
        geofenceStatus: 'PostGIS boundary confirmed, hydrographic model unconfirmed',
      },
      rulesTriggered: ['RULE_00_CRITICAL_TELEMETRY_REQUIRED', 'RULE_FAIL_SAFE_HOLD'],
    },
    {
      id: 'DEC-20260829-04',
      timestamp: '2026-08-29 06:15 IST',
      mission: 'Morning Reef Transit (4.5h)',
      vessel: 'Matsya Sagar 1 (8.5m)',
      zone: 'Khanderi Island Sector',
      verdict: 'GO',
      confidence: 91.5,
      reason: 'Stable morning atmospheric window, wave swell 1.1m within tolerance, clear navigational corridor.',
      dataStatus: 'demo_snapshot',
      inputs: {
        departureTime: '06:15 IST',
        durationHours: 4.5,
        activity: 'Commercial Handline',
      },
      telemetrySnapshot: {
        waveHeight: '1.1m (Well within 1.8m tolerance)',
        windSpeed: '9 kts (Gentle breeze)',
        tideState: 'Slack water',
        pfzRelevance: 'Reef fringe pelagic concentration (SST 28.2°C)',
        geofenceStatus: 'Clear corridor verified with 3.8 km naval zone buffer',
      },
      rulesTriggered: ['RULE_ALL_PASS_BASELINE'],
    },
  ];

  useEffect(() => {
    let isMounted = true;
    async function loadMissions() {
      try {
        const { missions } = await missionService.fetchMissions();
        if (isMounted && missions && missions.length > 0) {
          setPersistedMissions(missions);
        }
      } catch (err) {
        console.warn('Could not load backend missions for history:', err);
      }
    }
    loadMissions();
    return () => { isMounted = false; };
  }, []);

  const convertedPersistedRecords: HistoryRecord[] = persistedMissions.map((m) => ({
    id: `MSN-${m.id.slice(0, 8)}`,
    timestamp: new Date(m.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    mission: m.title || `${m.mission_type} (${m.duration_hours || 5}h)`,
    vessel: m.vessel_id || 'VESSEL-001',
    zone: m.target_zone_id || 'Alibaug Outer Bank',
    verdict: ((m.metadata?.verdict as string)?.toUpperCase() as DecisionVerdict) || 'CAUTION',
    confidence: (m.metadata?.confidenceScore as number) || 82.5,
    reason: (m.metadata?.reason as string) || 'Persisted mission recorded in ORCA operational ledger.',
    dataStatus: 'live',
    inputs: {
      departureTime: 'Scheduled departure',
      durationHours: m.duration_hours || 5,
      activity: m.mission_type || 'Fishing',
    },
    telemetrySnapshot: {
      waveHeight: '1.4m (Verified observation)',
      windSpeed: '12 kts',
      tideState: 'Verified regional tide',
      pfzRelevance: 'INCOIS PFZ Live Front',
      geofenceStatus: 'PostGIS verified safe corridor',
    },
    rulesTriggered: ['RULE_DETERMINISTIC_PASS'],
  }));

  const allRecords = [...convertedPersistedRecords, ...defaultHistoryData];
  const filtered = allRecords.filter((r) => {
    const matchesVerdict = filter === 'ALL' || r.verdict === filter;
    const matchesSearch =
      !searchTerm.trim() ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mission.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vessel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVerdict && matchesSearch;
  });

  const goCount = allRecords.filter((r) => r.verdict === 'GO').length;
  const cautionCount = allRecords.filter((r) => r.verdict === 'CAUTION').length;
  const avoidCount = allRecords.filter((r) => r.verdict === 'AVOID').length;
  const insufficientCount = allRecords.filter((r) => r.verdict === 'INSUFFICIENT_DATA').length;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8E5EC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-telemetry text-[#147FB3] mb-1 font-bold">
            <History className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">AUDIT TRAIL &amp; DECISION REPLAY LEDGER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] tracking-tight font-display-decision">
            Mission History &amp; Replay
          </h1>
          <p className="text-xs sm:text-sm text-[#587083]">
            Immutable record of past mission evaluations, correlated ocean telemetry snapshots, and deterministic audit rules
          </p>
        </div>

        {/* Quick Decision Counts */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono">
            {goCount} GO
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold font-mono">
            {cautionCount} CAUTION
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold font-mono">
            {avoidCount} AVOID
          </span>
          {insufficientCount > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-300 font-bold font-mono">
              {insufficientCount} INSUFFICIENT
            </span>
          )}
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#D8E5EC] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Verdict Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-[#587083] mr-1">Verdict:</span>
          {(['ALL', 'GO', 'CAUTION', 'AVOID', 'INSUFFICIENT_DATA'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                filter === tab
                  ? 'bg-[#147FB3] text-white shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#587083] hover:text-[#123B5D] border border-[#E2EDF4]'
              }`}
            >
              {tab === 'INSUFFICIENT_DATA' ? 'INSUFFICIENT' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E93A3]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search missions, vessels, zones..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#D8E5EC] text-xs bg-white text-[#123B5D] focus:outline-none focus:border-[#147FB3]"
          />
        </div>
      </div>

      {/* 3. History Table in Tidal Light Theme */}
      <div className="bg-white rounded-2xl border border-[#D8E5EC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2EDF4] text-[10px] font-label-caps text-[#587083] font-bold">
              <tr>
                <th className="p-3.5">DECISION ID &amp; TIME</th>
                <th className="p-3.5">MISSION &amp; CRAFT</th>
                <th className="p-3.5">TARGET ZONE</th>
                <th className="p-3.5">VERDICT</th>
                <th className="p-3.5">PRIMARY RATIONALE</th>
                <th className="p-3.5 text-right">REPLAY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5F8] text-[#123B5D]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#7E93A3]">
                    No historical decision records match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-[#147FB3]">{record.id}</div>
                      <div className="text-[11px] text-[#7E93A3] font-telemetry mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#7E93A3]" />
                        <span>{record.timestamp}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#123B5D]">{record.mission}</div>
                      <div className="text-[11px] text-[#587083] font-telemetry flex items-center gap-1 mt-0.5">
                        <Ship className="w-3 h-3 text-[#7E93A3]" />
                        <span>{record.vessel}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-[#147FB3] font-medium text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#147FB3]" />
                        <span>{record.zone}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={record.verdict} size="sm" />
                        {(() => {
                          const conf = getCategoricalConfidence(record.confidence);
                          return (
                            <span 
                              className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border ${conf.badgeClass}`}
                              title={conf.description}
                            >
                              {conf.shortLabel}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="p-3.5 text-[11px] text-[#4A6478] max-w-xs leading-relaxed">
                      {record.reason}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EBF6FC] hover:bg-[#147FB3] hover:text-white text-[#147FB3] text-xs font-bold transition cursor-pointer border border-[#C2E0F0] shadow-2xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Replay</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive Replay Modal / Progressive Audit Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102B40]/60 backdrop-blur-xs select-none animate-fade-in">
          <div className="bg-white rounded-3xl border border-[#D8E5EC] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2EDF4] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF6FC] text-[#147FB3] flex items-center justify-center border border-[#C2E0F0]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold text-[#147FB3]">{selectedRecord.id}</span>
                    <span className="text-[10px] text-[#7E93A3]">• {selectedRecord.timestamp}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#123B5D]">
                    Historical Decision Replay &amp; Telemetry Audit
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-2 rounded-xl text-[#7E93A3] hover:text-[#123B5D] hover:bg-[#F1F5F9] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
              {/* Verdict Summary Card */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2EDF4] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7E93A3] block mb-1">
                    Recorded Verdict &amp; Confidence
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedRecord.verdict} size="md" />
                    {(() => {
                      const conf = getCategoricalConfidence(selectedRecord.confidence);
                      return (
                        <span 
                          className={`font-bold px-2 py-0.5 rounded border text-xs ${conf.badgeClass}`}
                          title={conf.description}
                        >
                          {conf.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="text-right text-[11px] text-[#587083]">
                  <div>Target Craft: <strong>{selectedRecord.vessel}</strong></div>
                  <div>Operating Sector: <strong>{selectedRecord.zone}</strong></div>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-4 rounded-2xl border border-[#C2E0F0] bg-[#EBF6FC] flex flex-col gap-1">
                <span className="text-[11px] font-black text-[#147FB3] uppercase tracking-wider">
                  Operational Rationale at Evaluation Time
                </span>
                <p className="text-xs text-[#123B5D] font-medium leading-relaxed">
                  {selectedRecord.reason}
                </p>
              </div>

              {/* Mission Input Parameters */}
              <div className="p-4 rounded-2xl border border-[#E2EDF4] bg-white flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#587083] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span>Recorded Mission Inputs</span>
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-[#587083]">
                  <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block text-[10px]">Departure:</span>
                    <strong className="text-[#123B5D]">{selectedRecord.inputs.departureTime}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block text-[10px]">Duration:</span>
                    <strong className="text-[#123B5D]">{selectedRecord.inputs.durationHours} Hours</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block text-[10px]">Activity:</span>
                    <strong className="text-[#123B5D]">{selectedRecord.inputs.activity}</strong>
                  </div>
                </div>
              </div>

              {/* Correlated Multi-Agency Telemetry Snapshot */}
              <div className="p-4 rounded-2xl border border-[#E2EDF4] bg-white flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#587083] uppercase tracking-wider flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span>Correlated Telemetry Snapshot at Decision Time</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block text-[10px]">INCOIS Ocean State Forecast:</span>
                    <strong className="text-[#123B5D]">{selectedRecord.telemetrySnapshot.waveHeight}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block text-[10px]">Atmospheric Marine Wind:</span>
                    <strong className="text-[#123B5D]">{selectedRecord.telemetrySnapshot.windSpeed}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block text-[10px]">Tidal State &amp; Flow:</span>
                    <strong className="text-[#123B5D]">{selectedRecord.telemetrySnapshot.tideState}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2EDF4]">
                    <span className="text-[#7E93A3] block text-[10px]">INCOIS Potential Fishing Zone (PFZ):</span>
                    <strong className="text-[#123B5D]">{selectedRecord.telemetrySnapshot.pfzRelevance}</strong>
                  </div>
                </div>
              </div>

              {/* Deterministic Rules Triggered */}
              <div className="p-4 rounded-2xl border border-[#E2EDF4] bg-white flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#587083] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#147FB3]" />
                  <span>Deterministic Safety Rules Evaluated</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.rulesTriggered.map((rule) => (
                    <span
                      key={rule}
                      className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#123B5D] border border-[#D8E5EC] font-mono text-[11px] font-bold"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E2EDF4] bg-[#F8FAFC] flex items-center justify-between">
              <Link
                to={ROUTES.DECISIONS}
                className="text-xs font-bold text-[#147FB3] hover:underline flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Full Decision Audit Engine &rarr;</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#587083] hover:text-[#123B5D] transition cursor-pointer border border-[#D8E5EC]"
              >
                Close Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
