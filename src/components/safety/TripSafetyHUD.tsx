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
      className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all ${
        isRestricted
          ? 'border-rose-300 bg-rose-50/30'
          : isCaution
          ? 'border-amber-300 bg-amber-50/20'
          : 'border-[#D8E5EC] bg-white'
      } ${className}`}
    >
      {/* Header / Trip Identity */}
      <div className="flex items-center justify-between border-b border-[#EDF5F8] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#E8F4FA] border border-[#CFE6F3] text-[#147FB3]">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-[#587083] uppercase font-telemetry tracking-wider font-bold">
              YOUR TRIP CONTEXT
            </div>
            <h3 className="text-base font-bold text-[#123B5D] tracking-tight font-display-decision">
              {vessel.name} ({vessel.lengthMeters}m)
            </h3>
          </div>
        </div>

        <div className="text-right text-[11px] font-telemetry">
          <span className="text-[#147FB3] font-bold">{departureTime} departure</span>
          <span className="text-[#587083] block text-[10px]">{durationHours} hr planned voyage</span>
        </div>
      </div>

      {/* 2-Column: Fishing Opportunity (Left) vs Deterministic Safety (Right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Fishing Opportunity Signal */}
        <div className="bg-[#F5F9FC] rounded-xl p-3.5 border border-[#D8E5EC] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-label-caps text-[#2E9B73] font-bold uppercase flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#2E9B73]" />
                FISHING OPPORTUNITY
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold font-mono">
                POTENTIAL ZONE
              </span>
            </div>
            <div className="mt-1">
              <div className="text-xs font-bold text-[#123B5D]">
                {nearestPfz?.zoneName || 'Offshore Thermal Front Sector'}
              </div>
              <div className="text-[11px] font-telemetry text-[#587083] mt-0.5 flex items-center gap-2 font-medium">
                <span>{nearestPfz?.distanceKmFromPort || 18.5} km</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Navigation className="w-2.5 h-2.5 inline-block text-[#147FB3]" />
                  WSW ({nearestPfz?.bearingDegrees || 245}°)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#D8E5EC] text-[10px] text-[#587083] flex items-center justify-between font-telemetry">
            <span>Advisory Valid:</span>
            <strong className="text-[#123B5D]">
              {nearestPfz?.validUntil ? new Date(nearestPfz.validUntil).toLocaleDateString() : '28 Sep 2026'}
            </strong>
          </div>
        </div>

        {/* GIS Safety Clearance Status */}
        <div
          className={`rounded-xl p-3.5 border flex flex-col justify-between ${
            isRestricted
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : isCaution
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-label-caps font-bold uppercase flex items-center gap-1">
                {isRestricted ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                ) : isCaution ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
                SAFETY STATUS
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded font-bold font-mono uppercase ${
                  isRestricted
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : isCaution
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {gisResult ? gisResult.status : loading ? 'CHECKING...' : 'CLEAR'}
              </span>
            </div>

            <div className="text-xs font-bold mt-1 leading-snug">
              {isRestricted ? (
                <span className="text-rose-700 font-bold">CRITICAL: RESTRICTION CONFLICT</span>
              ) : isCaution ? (
                <span className="text-amber-800 font-bold">CAUTION: PROXIMITY BUFFER ACTIVE</span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  CORRIDOR VERIFIED CLEAR
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#587083] mt-1 font-medium">
              {gisResult?.proximityChecks.nearestRestrictedZone ? (
                <span>
                  Nearest boundary: {gisResult.proximityChecks.nearestRestrictedZone.name} (
                  {gisResult.proximityChecks.nearestRestrictedZone.distanceKm.toFixed(1)} km)
                </span>
              ) : (
                <span>No active spatial hazard or restricted zone intersection.</span>
              )}
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-telemetry">
            <span className="text-[#587083]">PostGIS Geofence</span>
            <span className="font-bold">
              {gisResult?.safetyClearance ? 'CLEARANCE GRANTED' : 'CLEARANCE DENIED'}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Precedence Notice */}
      <div className="bg-[#F5F9FC] rounded-xl p-3 border border-[#D8E5EC] text-xs text-[#102B40] flex items-start gap-2">
        <Info className="w-4 h-4 text-[#147FB3] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-[#123B5D] uppercase font-label-caps">
            SAFETY PRECEDENCE PRINCIPLE:
          </span>{' '}
          PFZ coordinates represent pelagic fishing opportunities. Naval restricted zones and marine warnings represent hard safety constraints. Opportunity signals NEVER override safety constraints.
        </div>
      </div>

      {/* Action Buttons & Explanation Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-[#EDF5F8]">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-xs font-bold text-[#147FB3] hover:text-[#0284C7] flex items-center gap-1 transition cursor-pointer"
        >
          <span>{showExplanation ? 'HIDE DETAILS' : 'WHY THIS VERDICT?'}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showExplanation ? 'rotate-90' : ''}`} />
        </button>

        <Link
          to={ROUTES.MAP}
          className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#147FB3] hover:bg-[#0284C7] text-white font-label-caps tracking-wider transition flex items-center gap-1.5 shadow-xs"
        >
          <span>INSPECT ON MAP</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Expandable Explanation Panel */}
      {showExplanation && gisResult && (
        <div className="bg-[#F5F9FC] rounded-xl p-3.5 border border-[#D8E5EC] text-xs flex flex-col gap-2 animate-fade-in">
          <div className="font-bold text-[#123B5D] text-[11px] uppercase tracking-wider font-label-caps">
            DETERMINISTIC EVALUATION DETAILS
          </div>
          <p className="text-[#587083] text-xs leading-relaxed">{gisResult.explanation}</p>

          {gisResult.opportunityConflict && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-800">
              <strong>Opportunity Conflict:</strong> {gisResult.opportunityConflict.conflictingReason}
            </div>
          )}

          <div className="text-[10px] font-telemetry text-[#587083] flex items-center justify-between pt-2 border-t border-[#D8E5EC]">
            <span>Evaluated at: {new Date(gisResult.evaluatedAt).toLocaleTimeString()}</span>
            <span>Rules checked: {gisResult.provenance.rulesEnforced.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};
