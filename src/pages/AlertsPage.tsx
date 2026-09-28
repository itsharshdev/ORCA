import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  CheckCheck, 
  CheckCircle2, 
  RefreshCw, 
  Map, 
  Layers
} from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';
import { useRole } from '@/hooks/useRole';
import { alertService } from '@/services/alertService';
import { AlertCard } from '@/components/alerts/AlertCard';
import { AlertDetailModal } from '@/components/alerts/AlertDetailModal';
import { MarineMapCanvas } from '@/components/map/MarineMapCanvas';
import type { AlertItem, AlertSeverity, AlertCategory } from '@/types/contract';

export const AlertsPage: React.FC = () => {
  const { activeRegion } = useRegion();
  const { activeRole, setRole } = useRole();

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'EXPIRED' | 'ALL'>('ACTIVE');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AlertCategory>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [showMapContext, setShowMapContext] = useState(false);

  useEffect(() => {
    let isMounted = true;
    alertService
      .getAlerts({
        status: statusFilter,
        severity: severityFilter === 'ALL' ? undefined : severityFilter,
        category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        role: activeRole,
      })
      .then((items) => {
        if (isMounted) {
          setAlerts(items);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load authoritative alerts.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter, severityFilter, categoryFilter, activeRole]);

  const refetchAlerts = useCallback(() => {
    setLoading(true);
    setError(null);
    alertService
      .getAlerts({
        status: statusFilter,
        severity: severityFilter === 'ALL' ? undefined : severityFilter,
        category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        role: activeRole,
      })
      .then((items) => {
        setAlerts(items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load authoritative alerts.');
        setLoading(false);
      });
  }, [statusFilter, severityFilter, categoryFilter, activeRole]);

  const handleAcknowledge = async (alert: AlertItem) => {
    try {
      const updated = await alertService.acknowledgeAlert(alert.id, 'OP-USER-01', activeRole);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (selectedAlert && selectedAlert.id === updated.id) {
        setSelectedAlert(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Acknowledgement failed.');
    }
  };

  const handleResolve = async (alert: AlertItem) => {
    try {
      const updated = await alertService.resolveAlert(alert.id, 'OP-USER-01', activeRole);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (selectedAlert && selectedAlert.id === updated.id) {
        setSelectedAlert(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resolution failed.');
    }
  };

  // Client-side text search
  const filteredAlerts = alerts.filter((a) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.title.toLowerCase().includes(term) ||
      a.message.toLowerCase().includes(term) ||
      a.affectedArea.name.toLowerCase().includes(term) ||
      a.id.toLowerCase().includes(term) ||
      a.ruleIds.some((r) => r.toLowerCase().includes(term))
    );
  });

  const isFisherman = activeRole === 'FISHERMAN';

  // Counts for summary metrics
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && a.status === 'ACTIVE').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-6 select-none animate-fade-in">
      {/* Header & Role Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8E5EC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-telemetry text-[#147FB3] mb-1 font-bold">
            <Bell className="w-3.5 h-3.5" />
            <span>OPERATIONAL SAFETY &amp; ADVISORY NOTICES • {activeRegion.name.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#123B5D] tracking-tight font-display-decision">
            Maritime Hazard &amp; Alert Center
          </h1>
          <p className="text-xs sm:text-sm text-[#587083]">
            Deterministic safety warnings, PostGIS geofence boundaries, and telemetry integrity audit
          </p>
        </div>

        {/* Role Selector & Quick Metrics */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D8E5EC] shadow-2xs text-xs">
            <span className="text-[#7E93A3] text-[11px] font-semibold">Active Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setRole(e.target.value as any)}
              className="bg-transparent font-bold text-[#147FB3] text-xs cursor-pointer focus:outline-none"
            >
              <option value="FISHERMAN">Fisherman</option>
              <option value="COASTAL_AUTHORITY">Coastal Authority</option>
              <option value="DISASTER_MANAGER">Disaster Manager</option>
              <option value="RESEARCHER">Researcher</option>
              <option value="MARITIME_OPERATOR">Maritime Operator</option>
            </select>
          </div>

          <button
            type="button"
            onClick={refetchAlerts}
            className="p-2 rounded-xl bg-white border border-[#D8E5EC] text-[#587083] hover:text-[#123B5D] hover:bg-[#F8FAFC] transition cursor-pointer shadow-2xs"
            title="Refresh active alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#147FB3]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Authority / Disaster Operational Summary Bar */}
      {!isFisherman && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-rose-200 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-rose-700">{criticalCount}</div>
              <div className="text-[11px] font-semibold text-[#587083]">Critical Overrides</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-amber-200 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-amber-700">{warningCount}</div>
              <div className="text-[11px] font-semibold text-[#587083]">Active Warnings</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-blue-200 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-blue-700">{acknowledgedCount}</div>
              <div className="text-[11px] font-semibold text-[#587083]">Acknowledged</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#D8E5EC] shadow-2xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#587083]">Map Overlay</span>
              <span className="text-xs font-bold text-[#123B5D]">
                {showMapContext ? 'Visible' : 'Hidden'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowMapContext(!showMapContext)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                showMapContext
                  ? 'bg-[#147FB3] text-white border-[#147FB3]'
                  : 'bg-[#F8FAFC] text-[#587083] border-[#D8E5EC] hover:text-[#123B5D]'
              }`}
            >
              <Map className="w-3.5 h-3.5 inline mr-1" />
              Toggle Map
            </button>
          </div>
        </div>
      )}

      {/* Spatial Hazard Map Drawer (Authority / Disaster) */}
      {showMapContext && !isFisherman && (
        <div className="bg-white rounded-2xl p-4 border border-[#D8E5EC] shadow-sm flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D]">
              <Layers className="w-4 h-4 text-[#147FB3]" />
              <span>Spatial Hazard &amp; Geofence Map Integration (Authoritative PostGIS)</span>
            </div>
            <span className="text-[11px] text-[#7E93A3] font-mono">EPSG:4326 WGS84</span>
          </div>
          <div className="h-72 sm:h-80 rounded-xl overflow-hidden border border-[#D8E5EC] relative">
            <MarineMapCanvas className="w-full h-full" showOverlayControls={true} />
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#D8E5EC] shadow-2xs flex flex-col gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0F5F8] pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#587083] mr-1">Status:</span>
            {(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'EXPIRED', 'ALL'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#147FB3] text-white shadow-2xs'
                    : 'bg-[#F8FAFC] text-[#587083] hover:text-[#123B5D] border border-[#E2EDF4]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E93A3]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search alerts, rules, areas..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#D8E5EC] text-xs bg-white text-[#123B5D] focus:outline-none focus:border-[#147FB3]"
            />
          </div>
        </div>

        {/* Severity & Category Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-[#587083] mr-1">Severity:</span>
            {['ALL', 'CRITICAL', 'WARNING', 'ADVISORY', 'INFO'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev as any)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-[#123B5D] text-white font-bold'
                    : 'bg-white text-[#587083] hover:text-[#123B5D] border border-[#D8E5EC]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {!isFisherman && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-[#587083] mr-1">Category:</span>
              {[
                { id: 'ALL', label: 'All' },
                { id: 'WEATHER_MARINE', label: 'Weather / Marine' },
                { id: 'GIS_SAFETY', label: 'GIS / Safety' },
                { id: 'MISSION', label: 'Mission' },
                { id: 'CONNECTIVITY', label: 'Connectivity' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#147FB3] text-white'
                      : 'bg-white text-[#587083] hover:text-[#123B5D] border border-[#D8E5EC]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={refetchAlerts}
            className="underline hover:text-rose-900 cursor-pointer ml-3"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && alerts.length === 0 && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#F1F5F9] animate-pulse border border-[#E2EDF4]" />
          ))}
        </div>
      )}

      {/* Alerts List */}
      <div className="flex flex-col gap-3.5">
        {!loading && filteredAlerts.length === 0 && (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#D8E5EC] flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#123B5D]">
              No Active Operational Alerts
            </h3>
            <p className="text-xs text-[#587083] max-w-md">
              There are currently no active hazards or warnings matching the selected filters for {activeRegion.name}. All evaluated marine security corridors remain clear.
            </p>
          </div>
        )}

        {filteredAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            userRole={activeRole}
            onSelect={(selected) => setSelectedAlert(selected)}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        ))}
      </div>

      {/* Progressive Disclosure Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          userRole={activeRole}
          onClose={() => setSelectedAlert(null)}
          onStatusUpdated={(updated) => {
            setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setSelectedAlert(updated);
          }}
        />
      )}
    </div>
  );
};
