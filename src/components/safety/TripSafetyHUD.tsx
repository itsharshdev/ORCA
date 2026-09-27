import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Compass,
  Navigation,
  Anchor,
  CheckCircle2,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { gisSafetyService } from '@/services/gisSafetyService';
import type { GisSafetyEvaluationResponse } from '@/types/contract';
import type { PFZRecord, VesselProfile } from '@/types/marine';

interface TripSafetyHUDProps {
  vessel?: VesselProfile;
  nearestPfz?: PFZRecord | null;
  departureTime?: string;
  durationHours?: number;
  className?: string;
}

export const TripSafetyHUD: React.FC<TripSafetyHUDProps> = ({
  vessel = {
    id: 'VESSEL-01',
    name: 'Matsya Sagar 1',
    vesselType: 'motorized',
    lengthMeters: 8.5,
    maxWaveToleranceMeters: 1.4,
    cruisingSpeedKnots: 8,
    fuelCapacityHours: 12,
    homePort: { name: 'Sassoon Docks, Mumbai', latitude: 18.92, longitude: 72.84 },
    currentLocation: { latitude: 18.92, longitude: 72.84 },
    currentHeadingDegrees: 245,
  },
  nearestPfz,
  departureTime = '05:45 IST',
  durationHours = 5,
  className = '',
}) => {
  const [gisResult, setGisResult] = useState<GisSafetyEvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const targetWp = nearestPfz?.location
      ? [
          {
            latitude: nearestPfz.location.latitude,
            longitude: nearestPfz.location.longitude,
            sequenceOrder: 1,
            waypointType: 'FISHING_SPOT',
            label: nearestPfz.zoneName,
          },
        ]
      : [
          {
            latitude: 18.78,
            longitude: 72.72,
            sequenceOrder: 1,
            waypointType: 'FISHING_SPOT',
            label: 'Zone Alpha',
          },
        ];

    gisSafetyService
      .evaluateRoute({
        vesselPosition: {
          latitude: vessel.currentLocation.latitude,
          longitude: vessel.currentLocation.longitude,
        },
        waypoints: targetWp,
        safetyBufferKm: 1.0,
        cautionBufferKm: 2.5,
        targetPfzUid: nearestPfz?.id,
      })
      .then((res) => {
        if (isMounted) {
          setGisResult(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error in GIS safety evaluation:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [vessel, nearestPfz]);

  const isCaution = gisResult?.status === 'CAUTION';
  const isRestricted = gisResult?.status === 'RESTRICTED' || gisResult?.status === 'HAZARD';

  return (
    <div
      className={`hud-glass rounded-xl p-4 border shadow-xl flex flex-col gap-3 relative overflow-hidden ${
        isRestricted
          ? 'border-rose-500/40 bg-rose-950/10'
          : isCaution
          ? 'border-amber-500/40 bg-amber-950/10'
          : 'border-emerald-500/30 bg-[#071424]/90'
      } ${className}`}
    >
      {/* Header / Trip Identity */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-telemetry tracking-wider">
              YOUR TRIP
            </div>
            <h3 className="text-sm font-bold text-white tracking-wide font-display-decision">
              {vessel.name}
            </h3>
          </div>
        </div>

        <div className="text-right text-[11px] font-telemetry">
          <span className="text-cyan-300 font-bold">{departureTime} departure</span>
          <span className="text-slate-400 block text-[10px]">{durationHours} hr planned voyage</span>
        </div>
      </div>

      {/* 2-Column: Fishing Opportunity (Left) vs Deterministic Safety (Right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Fishing Opportunity Signal */}
        <div className="bg-slate-900/70 rounded-lg p-2.5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-label-caps text-emerald-400 font-bold uppercase flex items-center gap-1">
                <Compass className="w-3 h-3" />
                FISHING OPPORTUNITY
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                POTENTIAL ZONE
              </span>
            </div>
            <div className="mt-1.5">
              <div className="text-xs font-bold text-slate-200">
                {nearestPfz?.zoneName || 'Offshore Thermal Front Sector'}
              </div>
              <div className="text-[11px] font-telemetry text-slate-300 mt-0.5 flex items-center gap-2">
                <span>{nearestPfz?.distanceKmFromPort || 18.5} km</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Navigation className="w-2.5 h-2.5 inline-block text-cyan-400" />
                  WSW ({nearestPfz?.bearingDegrees || 245}°)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Valid until:</span>
            <strong className="text-slate-300 font-mono">
              {nearestPfz?.validUntil ? new Date(nearestPfz.validUntil).toLocaleDateString() : '28 Sep 2026'}
            </strong>
          </div>
        </div>

        {/* GIS Safety Clearance Status */}
        <div
          className={`rounded-lg p-2.5 border flex flex-col justify-between ${
            isRestricted
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              : isCaution
              ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-label-caps font-bold uppercase flex items-center gap-1">
                {isRestricted ? (
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                ) : isCaution ? (
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                )}
                SAFETY STATUS
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono uppercase ${
                  isRestricted
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : isCaution
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {gisResult ? gisResult.status : loading ? 'CHECKING...' : 'CLEAR'}
              </span>
            </div>

            <div className="text-[11px] font-medium mt-1.5 leading-snug">
              {isRestricted ? (
                <span className="text-rose-300 font-bold">CRITICAL: RESTRICTION CONFLICT</span>
              ) : isCaution ? (
                <span className="text-amber-300">CAUTION: PROXIMITY BUFFER</span>
              ) : (
                <span className="text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  CORRIDOR CLEAR
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-300 mt-1">
              {gisResult?.proximityChecks.nearestRestrictedZone ? (
                <span>
                  Nearest boundary: {gisResult.proximityChecks.nearestRestrictedZone.name} (
                  {gisResult.proximityChecks.nearestRestrictedZone.distanceKm} km)
                </span>
              ) : (
                <span>No active spatial hazard or restricted zone intersection.</span>
              )}
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-telemetry">PostGIS Geofence</span>
            <span className="font-bold">
              {gisResult?.safetyClearance ? 'CLEARANCE GRANTED' : 'CLEARANCE DENIED'}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Precedence Notice */}
      <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 text-[10px] text-slate-300 flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase font-label-caps">
            SAFETY PRECEDENCE PRINCIPLE:
          </span>{' '}
          PFZ indicates fishing opportunity. Spatial boundaries and weather warnings represent hard
          constraints. Opportunity NEVER overrides safety constraints.
        </div>
      </div>

      {/* Action Buttons & Explanation Toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-[11px] font-bold text-cyan-400 hover:text-white flex items-center gap-1 transition"
        >
          <span>{showExplanation ? 'HIDE DETAILS' : 'WHY THIS VERDICT?'}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showExplanation ? 'rotate-90' : ''}`} />
        </button>

        <Link
          to={ROUTES.MAP}
          className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-label-caps tracking-wider transition flex items-center gap-1.5 shadow-md"
        >
          <span>INSPECT ON MAP</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Expandable Explanation Panel */}
      {showExplanation && gisResult && (
        <div className="mt-1 bg-slate-950/80 rounded-lg p-3 border border-slate-800 text-xs flex flex-col gap-2 animate-fade-in">
          <div className="font-bold text-white text-[11px] uppercase tracking-wider font-label-caps">
            DETERMINISTIC EVALUATION DETAILS
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">{gisResult.explanation}</p>

          {gisResult.opportunityConflict && (
            <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300">
              <strong>Opportunity Conflict:</strong> {gisResult.opportunityConflict.conflictingReason}
            </div>
          )}

          <div className="text-[10px] font-telemetry text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Evaluated at: {new Date(gisResult.evaluatedAt).toLocaleTimeString()}</span>
            <span>Rules checked: {gisResult.provenance.rulesEnforced.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};
