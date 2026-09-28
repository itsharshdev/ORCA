import React from 'react';
import { 
  X, 
  Wifi, 
  WifiOff, 
  Radio, 
  Navigation, 
  RefreshCw, 
  ShieldAlert
} from 'lucide-react';
import { useConnectivity } from '@/hooks/useConnectivity';
import type { ConnectivityState } from '@/types/contract';

interface ConnectivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectivityModal: React.FC<ConnectivityModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    bearer,
    gpsStatus,
    isOnline,
    lastSuccessfulContact,
    lastSuccessfulSync,
    pendingSyncCount,
    isSimulated,
    safetyMessage,
    simulateState,
    resetSimulation,
    triggerSync,
  } = useConnectivity();

  if (!isOpen) return null;

  const getStateMeta = (st: ConnectivityState) => {
    switch (st) {
      case 'CONNECTED':
        return {
          title: 'CONNECTED (FULL LIVE ACCESS)',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dotClass: 'bg-emerald-500',
          desc: 'Bidirectional network reachability confirmed. Live oceanographic, meteorological, and PFZ feeds can be queried in real time.',
          icon: Wifi,
        };
      case 'DEGRADED':
        return {
          title: 'DEGRADED CONNECTIVITY (HIGH LATENCY / DROPOUTS)',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
          dotClass: 'bg-amber-500',
          desc: 'Network latency exceeds tolerance or external endpoints are intermittent. Serving cached telemetry where safe; source-level statuses apply.',
          icon: Radio,
        };
      case 'OFFLINE':
        return {
          title: 'OFFLINE MODE (LOCAL SECURE SHELL)',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
          dotClass: 'bg-rose-500',
          desc: 'Zero Internet connectivity detected. Safe offline mode engaged: previous cached decisions are replayable. New trip clearance is locked to INSUFFICIENT_DATA.',
          icon: WifiOff,
        };
      case 'SAFETY_MESSAGE_RECEIVED':
        return {
          title: 'SAFETY MESSAGE RECEIVED (BROADCAST OVERRIDE)',
          badgeClass: 'bg-purple-50 text-purple-900 border-purple-300',
          dotClass: 'bg-purple-600',
          desc: 'Urgent emergency maritime safety message received via broadcast receiver (NavIC / Coastal Radio Relay). Takes absolute precedence over normal operations.',
          icon: ShieldAlert,
        };
    }
  };

  const meta = getStateMeta(state);
  const StateIcon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#102B40]/60 backdrop-blur-xs select-none animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#D8E5EC] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E2EDF4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF6FC] text-[#147FB3] flex items-center justify-center border border-[#C2E0F0]">
              <StateIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-label-caps text-[10px] text-[#587083]">NETWORK &amp; SENSOR REALITY DESK</span>
                {isSimulated && (
                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                    TEST SIMULATION ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#123B5D]">
                Connectivity, Sensor &amp; Freshness Monitor
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#7E93A3] hover:text-[#123B5D] hover:bg-[#F1F5F9] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 text-xs">
          {/* Active State Card */}
          <div className={`p-4 rounded-2xl border ${meta.badgeClass}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${meta.dotClass} animate-pulse`} />
                <span className="font-bold text-xs uppercase tracking-wide">{meta.title}</span>
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase">
                Transport: {bearer}
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{meta.desc}</p>

            {safetyMessage && (
              <div className="mt-3 p-3 rounded-xl bg-purple-100 border border-purple-300 text-purple-950 flex flex-col gap-1">
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-700" />
                    {safetyMessage.headline}
                  </span>
                  <span className="text-[9px] bg-purple-200 px-1.5 py-0.5 rounded font-mono">
                    {safetyMessage.broadcastBearer}
                  </span>
                </div>
                <p className="text-xs leading-normal">{safetyMessage.body}</p>
                <div className="text-[10px] text-purple-800/80 mt-1 flex flex-wrap items-center justify-between gap-1">
                  <span>Issued by: {safetyMessage.sender} • Received: {new Date(safetyMessage.receivedAt).toLocaleTimeString()}</span>
                  <span className="font-semibold bg-purple-200/80 px-1.5 py-0.2 rounded text-[9px]">EXTERNAL SAFETY MESSAGE ADAPTER</span>
                </div>
              </div>
            )}
          </div>

          {/* CRITICAL SEPARATION: GNSS Satellite Sensor vs Internet Connectivity vs IP Geolocation */}
          <div className="p-4 rounded-2xl bg-[#F5F9FC] border border-[#D8E5EC] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#147FB3]" />
                <span className="font-bold text-[#123B5D] text-xs uppercase tracking-wider">
                  GNSS Sensor vs Network vs IP Geolocation
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                gpsStatus === 'GNSS_FIX_ACQUIRED' || gpsStatus === 'FIX_ACQUIRED'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : gpsStatus === 'IP_GEOLOCATION_ONLY'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {gpsStatus === 'GNSS_FIX_ACQUIRED' || gpsStatus === 'FIX_ACQUIRED'
                  ? 'GNSS SATELLITE FIX'
                  : gpsStatus === 'IP_GEOLOCATION_ONLY'
                  ? 'IP GEOLOCATION (NO GNSS SENSOR)'
                  : gpsStatus === 'SEARCHING'
                  ? 'GNSS SEARCHING'
                  : 'GNSS SENSOR UNAVAILABLE'}
              </span>
            </div>
            <p className="text-[11px] text-[#4A6478] leading-relaxed">
              <strong>Maritime Reality Invariant:</strong> A coastal vessel maintains continuous 3D satellite coordinates from orbital GNSS (NavIC / GPS) completely independent of cellular or data connectivity. ORCA strictly distinguishes real orbital satellite fixes from coarse browser IP geolocation, ensuring navigational coordinate tracking persists safely even with zero Internet.
            </p>
          </div>

          {/* Source-Level Status Matrix & Freshness Classification */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-label-caps text-[#587083]">
              SOURCE-LEVEL MULTI-AGENCY REACHABILITY &amp; FRESHNESS POLICIES
            </span>
            <div className="border border-[#D8E5EC] rounded-2xl overflow-hidden divide-y divide-[#EDF5F8]">
              <div className="p-3 bg-white flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#123B5D] text-xs">INCOIS OSF (Ocean State Forecast)</div>
                  <div className="text-[10px] text-[#587083]">Wave swell, period, current • ERDDAP REST • <span className="font-semibold text-[#147FB3]">OFFICIAL SOURCE VALIDITY: 6h Cycle</span></div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  state === 'OFFLINE'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {state === 'OFFLINE' ? 'CACHED (OFFLINE)' : 'LIVE (OSF)'}
                </span>
              </div>

              <div className="p-3 bg-white flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#123B5D] text-xs">INCOIS PFZ (Potential Fishing Zones)</div>
                  <div className="text-[10px] text-[#587083]">Chlorophyll &amp; SST fronts • GeoServer WFS • <span className="font-semibold text-[#147FB3]">OFFICIAL SOURCE VALIDITY: 24h Pass</span></div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  state === 'OFFLINE'
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {state === 'OFFLINE' ? 'CACHED (OFFLINE)' : 'LIVE (PFZ)'}
                </span>
              </div>

              <div className="p-3 bg-white flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#123B5D] text-xs">IMD Marine Weather &amp; Warnings</div>
                  <div className="text-[10px] text-[#587083]">Coastal squall alerts &amp; radar • REST Gateway • <span className="font-semibold text-[#147FB3]">OFFICIAL SOURCE VALIDITY: 3h Bulletin</span></div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200">
                  DEMO (ACCESS PENDING)
                </span>
              </div>

              <div className="p-3 bg-white flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#123B5D] text-xs">ORCA PostGIS Safety Engine</div>
                  <div className="text-[10px] text-[#587083]">Naval anchorage buffers &amp; sanctuary perimeters • <span className="font-semibold text-slate-500">ORCA PROTOTYPE POLICY: 72h Cache</span></div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-[#E8F4FA] text-[#147FB3] border-[#CFE6F3]">
                  DETERMINISTIC
                </span>
              </div>

              <div className="p-3 bg-white flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-[#123B5D] text-xs">Vessel Seaworthiness Envelope</div>
                  <div className="text-[10px] text-[#587083]">DG Shipping wave limit &amp; craft hull specs • <span className="font-semibold text-slate-500">ORCA PROTOTYPE POLICY: 7d Cache</span></div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-[#E8F4FA] text-[#147FB3] border-[#CFE6F3]">
                  LOCAL PROFILE
                </span>
              </div>
            </div>
          </div>

          {/* Sync Status & Offline Queue */}
          <div className="p-4 rounded-2xl bg-white border border-[#D8E5EC] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#123B5D] text-xs">Reconnection &amp; Synchronization</span>
              <button
                type="button"
                onClick={() => triggerSync()}
                disabled={!isOnline || pendingSyncCount === 0}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#EBF6FC] hover:bg-[#147FB3] hover:text-white text-[#147FB3] font-bold text-[11px] transition cursor-pointer border border-[#C2E0F0] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Queue Now</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] mt-1">
              <div className="p-2 rounded-xl bg-[#F5F9FC] border border-[#EDF5F8]">
                <div className="text-[9px] text-[#587083] font-semibold">LAST SUCCESSFUL CONTACT</div>
                <div className="font-mono text-[#123B5D] font-bold mt-0.5">
                  {lastSuccessfulContact ? new Date(lastSuccessfulContact).toLocaleTimeString() : 'None'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#F5F9FC] border border-[#EDF5F8]">
                <div className="text-[9px] text-[#587083] font-semibold">LAST DATA SYNC</div>
                <div className="font-mono text-[#123B5D] font-bold mt-0.5">
                  {lastSuccessfulSync ? new Date(lastSuccessfulSync).toLocaleTimeString() : 'Never'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#F5F9FC] border border-[#EDF5F8] col-span-2 sm:col-span-1">
                <div className="text-[9px] text-[#587083] font-semibold">QUEUED MUTATIONS</div>
                <div className="font-mono text-[#123B5D] font-bold mt-0.5">
                  {pendingSyncCount} pending
                </div>
              </div>
            </div>
          </div>

          {/* JUDGE / OPERATOR SIMULATION TOOLBAR */}
          <div className="p-4 rounded-2xl bg-[#E8F4FA] border border-[#CFE6F3] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#123B5D] text-xs flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#147FB3]" />
                SIH Judge &amp; Testbed Simulation Sandbox
              </span>
              {isSimulated && (
                <button
                  type="button"
                  onClick={() => resetSimulation()}
                  className="text-[10px] text-[#147FB3] font-bold underline cursor-pointer hover:text-[#123B5D]"
                >
                  Reset Auto-Detect
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#587083]">
              Quickly simulate maritime connectivity conditions to evaluate real UI degradation and conservative safety rules:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => simulateState('CONNECTED', 'CELLULAR_4G_5G')}
                className="p-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-emerald-500 font-bold text-[10px] text-emerald-800 transition cursor-pointer shadow-2xs text-center"
              >
                1. Connected (4G)
              </button>
              <button
                type="button"
                onClick={() => simulateState('DEGRADED', 'CELLULAR_2G')}
                className="p-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-amber-500 font-bold text-[10px] text-amber-800 transition cursor-pointer shadow-2xs text-center"
              >
                2. Degraded (2G)
              </button>
              <button
                type="button"
                onClick={() => simulateState('OFFLINE', 'NONE')}
                className="p-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-rose-500 font-bold text-[10px] text-rose-800 transition cursor-pointer shadow-2xs text-center"
              >
                3. Full Offline
              </button>
              <button
                type="button"
                onClick={() => simulateState('SAFETY_MESSAGE_RECEIVED', 'NAVIC_RECEIVER')}
                className="p-2 rounded-xl bg-white border border-[#CBD5E1] hover:border-purple-500 font-bold text-[10px] text-purple-900 transition cursor-pointer shadow-2xs text-center"
              >
                4. NavIC Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
