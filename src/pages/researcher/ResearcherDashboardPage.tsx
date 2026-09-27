import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  RefreshCw,
  Code2,
  Table
} from 'lucide-react';
import { observationService } from '@/services/observationService';
import type { NormalizedObservationContract } from '@/types/contract';
import { useRegion } from '@/hooks/useRegion';

export const ResearcherDashboardPage: React.FC = () => {
  const { activeRegion } = useRegion();
  const [observations, setObservations] = useState<NormalizedObservationContract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedObs, setSelectedObs] = useState<NormalizedObservationContract | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    observationService
      .fetchObservations({ limit: 50 })
      .then((res) => {
        if (isMounted && res && res.observations) {
          setObservations(res.observations);
          if (res.observations.length > 0) {
            setSelectedObs(res.observations[0]);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load researcher observations:', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeRegion, reloadTrigger]);

  const filtered = observations.filter((obs) => {
    const matchesCat = categoryFilter === 'ALL' || obs.category === categoryFilter;
    const matchesSearch =
      searchTerm === '' ||
      obs.dataset_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.variable_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-telemetry text-purple-400 mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>OCEANOGRAPHIC RESEARCH &amp; EVIDENCE EXPLORER • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display-decision">
            Multi-Agency Marine Observation Explorer
          </h1>
          <p className="text-xs text-slate-400">
            Raw &amp; normalized observation evidence • INCOIS OSF • INCOIS PFZ WFS • IMD Marine • PostGIS Geometry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              setReloadTrigger((prev) => prev + 1);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Re-query Database</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="hud-glass rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'OCEAN', 'PFZ', 'WEATHER', 'GEO_SAFETY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-label-caps transition ${
                categoryFilter === cat
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search variable or dataset ID..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Main Grid: Observation Table (Left 7 Cols) + Selected Observation JSON/Metadata (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table of Observations */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="hud-glass rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase font-label-caps flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                Ingested Observation Records ({filtered.length})
              </span>
              <span className="text-[10px] font-telemetry text-slate-400">Supabase public.observations</span>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] font-label-caps text-slate-400">
                    <th className="p-3">Variable / Metric</th>
                    <th className="p-3">Dataset ID</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        {loading ? 'Querying observation database...' : 'No observations matching filter criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((obs) => (
                      <tr
                        key={obs.id}
                        onClick={() => setSelectedObs(obs)}
                        className={`cursor-pointer transition ${
                          selectedObs?.id === obs.id
                            ? 'bg-purple-950/30 text-white font-medium'
                            : 'hover:bg-slate-900/40 text-slate-300'
                        }`}
                      >
                        <td className="p-3 font-semibold text-white">
                          <div>{obs.variable_name}</div>
                          <div className="text-[10px] text-slate-500 font-telemetry">{obs.category}</div>
                        </td>
                        <td className="p-3 text-[11px] font-mono text-slate-400">{obs.dataset_identifier}</td>
                        <td className="p-3 font-mono text-cyan-300">
                          {obs.numeric_value !== null && obs.numeric_value !== undefined
                            ? `${obs.numeric_value} ${obs.unit || ''}`
                            : 'Complex Geometry'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border ${
                              obs.status === 'LIVE'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {obs.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Observation Metadata & Raw Payload */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedObs ? (
            <div className="hud-glass rounded-2xl p-4 sm:p-5 border border-purple-500/30 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase font-label-caps">
                    Observation Provenance Audit
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-purple-300">ID: {selectedObs.id.slice(0, 8)}...</span>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-[11px] font-telemetry">
                  <div className="flex justify-between text-slate-400">
                    <span>Observed At:</span>
                    <strong className="text-slate-200">{new Date(selectedObs.observed_at).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Retrieved At:</span>
                    <strong className="text-slate-200">{new Date(selectedObs.retrieved_at).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Quality Level:</span>
                    <strong className="text-emerald-400 font-bold">{selectedObs.quality_level}</strong>
                  </div>
                </div>

                <div className="text-[10px] font-label-caps text-slate-400 uppercase font-bold mt-1">
                  Structured Payload Snapshot:
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-64 custom-scrollbar">
                  {JSON.stringify(selectedObs.structured_value || selectedObs.raw_metadata, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="hud-glass rounded-2xl p-8 border border-slate-800 text-center text-slate-500 text-xs">
              Select an observation to inspect provenance telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
