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
          `Persisted ${res.totalReceived || 0} PFZ opportunities to PostGIS (${res.isLive ? 'LIVE' : 'DEMO'})`
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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          LIVE INCOIS WFS
        </span>
      );
    }
    if (data.status === 'DEMO_SNAPSHOT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          DEMO SNAPSHOT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
        UNAVAILABLE
      </span>
    );
  };

  const nearest = data?.nearestOpportunity;

  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E5EC] shadow-sm flex flex-col gap-4 relative overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EDF5F8] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] text-[#147FB3]">
            <Fish className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#123B5D] tracking-tight uppercase font-label-caps flex items-center gap-2">
              Potential Fishing Zones (PFZ)
            </h3>
            <p className="text-[11px] text-[#587083]">
              Official INCOIS Ocean Thermal &amp; Chlorophyll Fronts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <button
            onClick={fetchPfzData}
            disabled={loading}
            title="Refresh PFZ intelligence"
            className="p-1.5 rounded-lg bg-[#F5F9FC] hover:bg-[#E8F4FA] text-[#587083] hover:text-[#123B5D] transition border border-[#D8E5EC] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#147FB3]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Nearest PFZ Opportunity Card */}
      {loading && !data ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#587083] text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-[#147FB3]" />
          <span>Querying official INCOIS PFZ GeoServer...</span>
        </div>
      ) : nearest ? (
        <div className="bg-[#F5F9FC] rounded-xl p-3.5 border border-[#D8E5EC] flex flex-col gap-2.5 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#147FB3] uppercase tracking-wider flex items-center gap-1.5 font-label-caps">
              <Compass className="w-3.5 h-3.5 text-[#147FB3]" />
              Nearest Opportunity: {nearest.stateName}
            </span>
            <span className="text-[10px] font-mono text-[#587083] font-bold">UID: {nearest.uid}</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
            {/* Distance */}
            <div className="bg-white rounded-lg p-2 border border-[#D8E5EC]">
              <div className="text-[10px] text-[#587083] uppercase font-bold">Distance</div>
              <div className="text-sm font-bold font-mono text-[#123B5D]">
                {nearest.distanceNm !== undefined ? `${nearest.distanceNm} NM` : `${nearest.distanceKm || 0} km`}
              </div>
              <div className="text-[9px] text-[#7E93A3]">{nearest.distanceKm || 0} km</div>
            </div>

            {/* Bearing / Direction */}
            <div className="bg-white rounded-lg p-2 border border-[#D8E5EC]">
              <div className="text-[10px] text-[#587083] uppercase font-bold">Direction</div>
              <div className="text-sm font-bold font-mono text-[#147FB3] flex items-center justify-center gap-1">
                <Navigation
                  className="w-3 h-3 inline-block text-[#147FB3]"
                  style={{ transform: `rotate(${nearest.bearingDeg || 0}deg)` }}
                />
                {nearest.directionCompass || 'SW'}
              </div>
              <div className="text-[9px] text-[#7E93A3]">{nearest.bearingDeg || 0}° bearing</div>
            </div>

            {/* Zone Extent */}
            <div className="bg-white rounded-lg p-2 border border-[#D8E5EC]">
              <div className="text-[10px] text-[#587083] uppercase font-bold">Zone Extent</div>
              <div className="text-sm font-bold font-mono text-[#2E9B73]">
                {nearest.lengthKm} km
              </div>
              <div className="text-[9px] text-[#7E93A3]">Front Length</div>
            </div>
          </div>

          {/* Timing & Validity */}
          <div className="flex items-center justify-between text-[11px] text-[#587083] pt-2 border-t border-[#D8E5EC] font-telemetry">
            <span>
              Advisory Date:{' '}
              <strong className="text-[#123B5D]">{nearest.advisoryDate}</strong>
            </span>
            <span>
              Valid Until:{' '}
              <strong className="text-[#123B5D]">
                {new Date(nearest.validUntil).toLocaleDateString()}
              </strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-[#587083]">
          No active PFZ advisories available for this sector.
        </div>
      )}

      {/* Safety Separation Callout */}
      <div className="bg-amber-50/70 border border-amber-300/80 rounded-xl p-3 flex items-start gap-2.5 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-[#102B40] leading-relaxed">
          <strong className="text-amber-900 block font-label-caps uppercase text-[10px] font-bold">
            Safety Separation Guarantee
          </strong>
          PFZ coordinates indicate potential pelagic productivity. They do{' '}
          <span className="text-amber-900 font-bold underline">NOT</span> grant weather, wave, or navigational safety clearance.
        </div>
      </div>

      {/* Opportunities List */}
      {data && data.opportunities.length > 1 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-[#587083] font-bold font-label-caps uppercase">
            <span>Detected Aggregation Fronts ({data.total})</span>
            <span>Spatial Proximity Index</span>
          </div>
          <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1 custom-scrollbar">
            {data.opportunities.map((opp) => (
              <div
                key={opp.uid}
                onClick={() => {
                  setSelectedUid(opp.uid);
                  if (onSelectOpportunity) onSelectOpportunity(opp);
                }}
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition border ${
                  selectedUid === opp.uid
                    ? 'bg-[#E8F4FA] border-[#147FB3] text-[#123B5D] font-bold shadow-xs'
                    : 'bg-[#F5F9FC] border-[#D8E5EC] hover:bg-[#EDF5F8] text-[#587083]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Anchor className="w-3.5 h-3.5 text-[#147FB3] shrink-0" />
                  <div>
                    <div className="font-bold text-[11px] text-[#123B5D]">
                      {opp.stateName} • Front {opp.uid.slice(-3)}
                    </div>
                    <div className="text-[10px] text-[#587083]">
                      {opp.distanceNm !== undefined ? `${opp.distanceNm} NM` : `${opp.distanceKm} km`} • {opp.directionCompass} ({opp.bearingDeg}°) • Length: {opp.lengthKm} km
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-white text-[#147FB3] font-mono text-[10px] font-bold border border-[#CFE6F3]">
                    {opp.spatialRelevanceScore || 75}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supabase Persistence & Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#EDF5F8] text-[10px] text-[#587083]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncToDb}
            disabled={syncingDb}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F5F9FC] hover:bg-[#E8F4FA] text-[#123B5D] font-bold transition border border-[#D8E5EC] disabled:opacity-50 cursor-pointer text-xs"
          >
            <Database className="w-3.5 h-3.5 text-[#147FB3]" />
            {syncingDb ? 'Syncing...' : 'Sync to PostGIS'}
          </button>
          {syncMessage && (
            <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {syncMessage}
            </span>
          )}
        </div>
        <div className="text-right text-[10px] text-[#7E93A3] font-telemetry">
          Last check: {lastFetchedTime || 'Just now'}
        </div>
      </div>
    </div>
  );
};
