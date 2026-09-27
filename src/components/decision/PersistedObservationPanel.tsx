import React, { useEffect, useState } from 'react';
import {
  Database,
  Waves,
  Wind,
  Thermometer,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Radio,
  Compass,
  MapPin,
  ShieldAlert,
  Eye,
  CloudRain,
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { observationService, type ObservationServiceResult } from '@/services/observationService';
import type { NormalizedObservationContract } from '@/types/contract';

export const PersistedObservationPanel: React.FC = () => {
  const { activeRegion } = useRegion();
  const [data, setData] = useState<ObservationServiceResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingIncois, setSyncingIncois] = useState<boolean>(false);
  const [syncingImd, setSyncingImd] = useState<boolean>(false);
  const [syncingDemo, setSyncingDemo] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';

    observationService.fetchObservations({ region: regionId, limit: 12 }).then((result) => {
      if (isMounted) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeRegion.id]);

  const handleSyncIncois = async () => {
    setSyncingIncois(true);
    setStatusMessage('Querying official INCOIS OSF endpoints...');
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';
    const lat = activeRegion.id === 'tamil_nadu' ? 10.76 : 18.92;
    const lon = activeRegion.id === 'tamil_nadu' ? 79.84 : 72.83;

    const res = await observationService.triggerIncoisIngestion({
      region: regionId,
      latitude: lat,
      longitude: lon,
      allowFallback: true,
    });

    if (res.success && res.isLive) {
      setStatusMessage('✓ Successfully ingested live INCOIS OSF oceanography into PostGIS.');
    } else if (res.fallbackUsed) {
      setStatusMessage('ⓘ INCOIS server unreachable. Retained verified demo baseline.');
    } else {
      setStatusMessage(`⚠ Ingestion notice: ${res.error || 'Check server connection'}`);
    }

    const refreshed = await observationService.fetchObservations({ region: regionId, limit: 12 });
    setData(refreshed);
    setSyncingIncois(false);
  };

  const handleSyncImd = async () => {
    setSyncingImd(true);
    setStatusMessage('Querying official IMD Weather & Marine Warning feeds...');
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';
    const lat = activeRegion.id === 'tamil_nadu' ? 10.76 : 18.92;
    const lon = activeRegion.id === 'tamil_nadu' ? 79.84 : 72.83;

    const res = await observationService.triggerImdIngestion({
      region: regionId,
      latitude: lat,
      longitude: lon,
      allowFallback: true,
    });

    if (res.success && res.isLive) {
      setStatusMessage('✓ Ingested official IMD Weather & Coastal Warning bulletins.');
    } else if (res.fallbackUsed) {
      setStatusMessage('ⓘ IMD service unreachable. Retained verified baseline snapshot.');
    } else {
      setStatusMessage(`⚠ IMD ingestion notice: ${res.error || 'Check connection'}`);
    }

    const refreshed = await observationService.fetchObservations({ region: regionId, limit: 12 });
    setData(refreshed);
    setSyncingImd(false);
  };

  const handleSyncDemo = async () => {
    setSyncingDemo(true);
    setStatusMessage('Refreshing deterministic baseline snapshot...');
    const regionId = activeRegion.id === 'tamil_nadu' ? 'tamil_nadu' : 'maharashtra';
    await observationService.triggerDemoIngestion([regionId]);
    const refreshed = await observationService.fetchObservations({ region: regionId, limit: 12 });
    setData(refreshed);
    setStatusMessage('✓ Deterministic baseline snapshot synchronized with PostGIS.');
    setSyncingDemo(false);
  };

  const getVariableIcon = (varName: string) => {
    if (varName.includes('wave') || varName.includes('swell')) {
      return <Waves className="w-3.5 h-3.5 text-[#147FB3]" />;
    }
    if (varName.includes('wind') || varName.includes('gust')) {
      return <Wind className="w-3.5 h-3.5 text-[#4DB7D8]" />;
    }
    if (varName.includes('temp') || varName.includes('sst')) {
      return <Thermometer className="w-3.5 h-3.5 text-[#D99520]" />;
    }
    if (varName.includes('current')) {
      return <Compass className="w-3.5 h-3.5 text-[#2E9B73]" />;
    }
    if (varName.includes('visibility')) {
      return <Eye className="w-3.5 h-3.5 text-[#123B5D]" />;
    }
    if (varName.includes('rain')) {
      return <CloudRain className="w-3.5 h-3.5 text-[#147FB3]" />;
    }
    if (varName.includes('warning') || varName.includes('alert')) {
      return <ShieldAlert className="w-3.5 h-3.5 text-[#D65B5B]" />;
    }
    return <Activity className="w-3.5 h-3.5 text-[#2E9B73]" />;
  };

  const formatVarTitle = (name: string): string => {
    return name
      .replace(/imd_/g, '')
      .replace(/_/g, ' ')
      .toUpperCase();
  };

  const observations = data?.observations || [];
  const isLiveIncois = observations.some((o) => o.status === 'LIVE' && o.dataset_identifier.includes('ocean_state'));
  const isLiveImd = observations.some((o) => o.status === 'LIVE' && o.dataset_identifier.includes('weather'));
  const isAnyLive = isLiveIncois || isLiveImd;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 flex flex-col gap-4 border border-[#D8E5EC] shadow-sm select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EDF5F8]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] text-[#147FB3]">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-[#123B5D] font-label-caps tracking-wide block">
              ENVIRONMENTAL OBSERVATIONS
            </span>
            <span className="text-[11px] font-telemetry text-[#587083] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#147FB3]" />
              {activeRegion.name} • PostGIS Ingestion Layer
            </span>
          </div>
        </div>

        {/* Live / Baseline Badge */}
        <div className="flex items-center gap-1.5">
          {isAnyLive ? (
            <span className="text-[10px] font-telemetry text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              LIVE TELEMETRY
            </span>
          ) : (
            <span className="text-[10px] font-telemetry text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded font-bold">
              DEMO SNAPSHOT
            </span>
          )}
        </div>
      </div>

      {/* Backend Provenance Bar */}
      <div className="flex items-center justify-between text-xs font-telemetry px-3 py-2 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC]">
        <div className="flex items-center gap-2">
          {data?.isPersistedBackend ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-800 font-semibold">PostGIS Database Persisted</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-amber-800 font-medium">Memory Cache Mode</span>
            </>
          )}
        </div>
        <div className="text-[#587083] text-right text-[11px] truncate max-w-[160px]">
          {isAnyLive ? (
            <span className="text-emerald-700 font-bold">INCOIS + IMD</span>
          ) : (
            <span className="text-[#123B5D] font-medium">ORCA_DEMO</span>
          )}
        </div>
      </div>

      {/* Ingestion Actions Bar (3-column responsive) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleSyncIncois}
          disabled={syncingIncois || syncingImd || syncingDemo}
          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F5F9FC] hover:bg-[#E8F4FA] border border-[#CBD5E1] hover:border-[#147FB3] text-[#123B5D] font-bold text-[10px] font-label-caps transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          title="Query official INCOIS ERDDAP oceanography feed"
        >
          <RefreshCw className={`w-3 h-3 ${syncingIncois ? 'animate-spin text-[#147FB3]' : 'text-[#147FB3]'}`} />
          <span>{syncingIncois ? 'INCOIS...' : 'INCOIS OSF'}</span>
        </button>

        <button
          onClick={handleSyncImd}
          disabled={syncingIncois || syncingImd || syncingDemo}
          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F5F9FC] hover:bg-[#E8F4FA] border border-[#CBD5E1] hover:border-[#147FB3] text-[#123B5D] font-bold text-[10px] font-label-caps transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          title="Query official IMD weather & marine warning bulletin"
        >
          <RefreshCw className={`w-3 h-3 ${syncingImd ? 'animate-spin text-[#4DB7D8]' : 'text-[#4DB7D8]'}`} />
          <span>{syncingImd ? 'IMD...' : 'IMD WEATHER'}</span>
        </button>

        <button
          onClick={handleSyncDemo}
          disabled={syncingIncois || syncingImd || syncingDemo}
          className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#F5F9FC] hover:bg-[#E8F4FA] border border-[#CBD5E1] text-[#587083] font-bold text-[10px] font-label-caps transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          title="Reset to deterministic baseline snapshot"
        >
          <RefreshCw className={`w-3 h-3 ${syncingDemo ? 'animate-spin text-[#587083]' : 'text-[#587083]'}`} />
          <span>{syncingDemo ? 'DEMO...' : 'DEMO'}</span>
        </button>
      </div>

      {/* Status Notice if present */}
      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] text-xs text-[#123B5D] font-telemetry animate-fade-in">
          {statusMessage}
        </div>
      )}

      {/* Observations Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="col-span-full py-8 text-center text-xs text-[#587083] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#147FB3]" />
            <span>Loading observations from PostGIS database...</span>
          </div>
        ) : observations.length > 0 ? (
          observations.map((obs: NormalizedObservationContract) => (
            <div
              key={obs.id}
              className="p-3 rounded-xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-col justify-between gap-1 transition hover:border-[#147FB3]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#587083] uppercase truncate max-w-[90px]">
                  {formatVarTitle(obs.variable_name)}
                </span>
                {getVariableIcon(obs.variable_name)}
              </div>

              <div className="text-sm font-bold text-[#123B5D] font-mono">
                {obs.numeric_value !== null && obs.numeric_value !== undefined ? (
                  <>
                    {obs.numeric_value} {obs.unit || ''}
                  </>
                ) : (
                  <span className="text-xs font-semibold text-[#587083]">Active</span>
                )}
              </div>

              <div className="flex items-center justify-between text-[9px] text-[#7E93A3] pt-1 border-t border-[#EDF5F8] font-telemetry">
                <span className="truncate max-w-[65px]">{obs.dataset_identifier.replace('incois_', '').replace('imd_', '')}</span>
                <span className={`px-1 rounded font-bold ${obs.status === 'LIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  {obs.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-6 text-center text-xs text-[#587083]">
            No observation records currently persisted for {activeRegion.name}. Click Ingestion buttons above.
          </div>
        )}
      </div>
    </div>
  );
};
