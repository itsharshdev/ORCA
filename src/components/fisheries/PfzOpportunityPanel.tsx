import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  RefreshCw,
  Anchor,
  AlertTriangle,
  Navigation,
  Database,
  CheckCircle2,
  Fish,
} from 'lucide-react';
import { pfzService, type PfzResponseUI, type PfzOpportunityUI } from '../../services/pfzService';
import { observationService } from '../../services/observationService';

interface PfzOpportunityPanelProps {
  latitude?: number;
  longitude?: number;
  region?: string;
  onSelectOpportunity?: (opp: PfzOpportunityUI) => void;
  className?: string;
}

export const PfzOpportunityPanel: React.FC<PfzOpportunityPanelProps> = ({
  latitude = 18.92,
  longitude = 72.84,
  region = 'maharashtra',
  onSelectOpportunity,
  className = '',
}) => {
  const [data, setData] = useState<PfzResponseUI | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingDb, setSyncingDb] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [lastFetchedTime, setLastFetchedTime] = useState<string | null>(null);

  const fetchPfzData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pfzService.fetchPfz({
        latitude,
        longitude,
        region,
        allowFallback: true,
      });
      setData(res);
      setLastFetchedTime(new Date().toLocaleTimeString());
      if (res.nearestOpportunity && !selectedUid) {
        setSelectedUid(res.nearestOpportunity.uid);
      }
    } catch (err) {
      console.error('Error fetching PFZ data:', err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, region, selectedUid]);

  useEffect(() => {
    let isMounted = true;
    pfzService
      .fetchPfz({
        latitude,
        longitude,
        region,
        allowFallback: true,
      })
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
          setLastFetchedTime(new Date().toLocaleTimeString());
          if (res.nearestOpportunity) {
            setSelectedUid(res.nearestOpportunity.uid);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error in PFZ initial fetch:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, region]);

  const handleSyncToDb = async () => {
    setSyncingDb(true);
    setSyncMessage(null);
    try {
      const res = await observationService.triggerPfzIngestion({
        latitude,
        longitude,
        region,
        allowFallback: true,
      });
      if (res.success) {
        setSyncMessage(
          `Persisted ${res.totalReceived || 0} PFZ opportunities to Supabase (${res.isLive ? 'LIVE' : 'DEMO'})`
        );
      } else {
        setSyncMessage(`Sync failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : 'Persistence failure');
    } finally {
      setSyncingDb(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const getStatusBadge = () => {
    if (!data) return null;
    if (data.isLive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE INCOIS WFS
        </span>
      );
    }
    if (data.status === 'DEMO_SNAPSHOT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          DEMO SNAPSHOT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
        UNAVAILABLE
      </span>
    );
  };

  const nearest = data?.nearestOpportunity;

  return (
    <div
      className={`hud-glass rounded-xl p-4 border border-cyan-500/20 shadow-xl flex flex-col gap-3 relative overflow-hidden ${className}`}
    >
      {/* Glow Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Fish className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-label-caps flex items-center gap-2">
              Potential Fishing Zones (PFZ)
            </h3>
            <p className="text-[10px] text-slate-400">
              Official INCOIS Ocean Thermal & Chlorophyll Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={fetchPfzData}
            disabled={loading}
            title="Refresh PFZ intelligence"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Nearest PFZ Opportunity Card */}
      {loading && !data ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          <span>Querying official INCOIS PFZ GeoServer...</span>
        </div>
      ) : nearest ? (
        <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700/60 flex flex-col gap-2 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Nearest Opportunity: {nearest.stateName}
            </span>
            <span className="text-[10px] font-mono text-slate-400">UID: {nearest.uid}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            {/* Distance */}
            <div className="bg-slate-950/60 rounded p-1.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Distance</div>
              <div className="text-sm font-bold font-mono text-white">
                {nearest.distanceNm !== undefined ? `${nearest.distanceNm} NM` : `${nearest.distanceKm || 0} km`}
              </div>
              <div className="text-[9px] text-slate-500">{nearest.distanceKm || 0} km</div>
            </div>

            {/* Bearing / Direction */}
            <div className="bg-slate-950/60 rounded p-1.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Direction</div>
              <div className="text-sm font-bold font-mono text-cyan-300 flex items-center justify-center gap-1">
                <Navigation
                  className="w-3 h-3 inline-block"
                  style={{ transform: `rotate(${nearest.bearingDeg || 0}deg)` }}
                />
                {nearest.directionCompass || 'SW'}
              </div>
              <div className="text-[9px] text-slate-500">{nearest.bearingDeg || 0}° bearing</div>
            </div>

            {/* Zone Extent */}
            <div className="bg-slate-950/60 rounded p-1.5 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Zone Extent</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {nearest.lengthKm} km
              </div>
              <div className="text-[9px] text-slate-500">Front Length</div>
            </div>
          </div>

          {/* Timing & Validity */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>
              Advisory Date:{' '}
              <strong className="text-slate-200">{nearest.advisoryDate}</strong>
            </span>
            <span>
              Valid Until:{' '}
              <strong className="text-slate-200 font-mono">
                {new Date(nearest.validUntil).toLocaleDateString()}
              </strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-slate-400">
          No active PFZ advisories available for this sector.
        </div>
      )}

      {/* Safety Separation Callout */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-2 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-300 leading-relaxed">
          <strong className="text-amber-300 block font-label-caps uppercase text-[10px]">
            Safety Separation Guarantee
          </strong>
          PFZ indicates potential biological productivity (SST/Chlorophyll fronts). It does{' '}
          <span className="text-amber-200 font-bold underline">NOT</span> represent weather, wave, or safety clearance. Always verify IMD Marine Warnings before departure.
        </div>
      </div>

      {/* Opportunities List */}
      {data && data.opportunities.length > 1 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold font-label-caps uppercase">
            <span>Detected Aggregation Fronts ({data.total})</span>
            <span>Spatial Proximity Index</span>
          </div>
          <div className="max-h-36 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
            {data.opportunities.map((opp) => (
              <div
                key={opp.uid}
                onClick={() => {
                  setSelectedUid(opp.uid);
                  if (onSelectOpportunity) onSelectOpportunity(opp);
                }}
                className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition border ${
                  selectedUid === opp.uid
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-white'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Anchor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px]">
                      {opp.stateName} • Front {opp.uid.slice(-3)}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {opp.distanceNm !== undefined ? `${opp.distanceNm} NM` : `${opp.distanceKm} km`} • {opp.directionCompass} ({opp.bearingDeg}°) • Length: {opp.lengthKm} km
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20">
                    {opp.spatialRelevanceScore || 75}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supabase Persistence & Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSyncToDb}
            disabled={syncingDb}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold hover:text-white transition border border-slate-700 disabled:opacity-50"
          >
            <Database className="w-3 h-3 text-cyan-400" />
            {syncingDb ? 'Syncing...' : 'Sync to PostGIS'}
          </button>
          {syncMessage && (
            <span className="text-[9px] text-emerald-400 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3 h-3" />
              {syncMessage}
            </span>
          )}
        </div>
        <div className="text-right text-[9px] text-slate-500">
          Last check: {lastFetchedTime || 'Just now'}
        </div>
      </div>
    </div>
  );
};
