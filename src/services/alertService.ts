import type {
  AlertItem,
  AlertDetailResponse,
  AlertFilterOptions,
  SyncMutationItem,
} from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';
import { offlineCacheService } from './offlineCacheService';
import { connectivityService } from './connectivityService';

const DEFAULT_CONNECTED_ALERTS: AlertItem[] = [
  {
    id: 'ALT-2026-SQUALL-01',
    fingerprint: 'FP-SQUALL-01',
    alertType: 'SEVERE_WEATHER_WARNING',
    category: 'WEATHER_MARINE',
    severity: 'WARNING',
    title: 'Squally Wind Warning for Afternoon Hours (Gusts > 22 kts)',
    message: 'IMD Coastal Radar identifies convective squall line developing 15 NM offshore Raigad/Mumbai. Wind gusts 20–25 kts expected post-13:00 IST.',
    actionRecommendation: 'Motorized crafts < 10m advised to return to harbor fairway before 13:00 IST.',
    source: 'IMD_RADAR_MUMBAI',
    dataset: 'IMD_WEATHER',
    evidenceIds: ['EVID-IMD-WIND-01'],
    ruleIds: ['RULE_01_SEVERE_WEATHER'],
    affectedArea: { name: 'Raigad & Offshore Continental Shelf', center: [18.5, 72.3], radiusKm: 35 },
    affectedMissionIds: ['MSN-2026-0928-01'],
    affectedVesselIds: ['VESSEL-001'],
    issuedAt: '2026-09-28T07:00:00Z',
    validFrom: '2026-09-28T07:00:00Z',
    validUntil: '2026-09-29T18:00:00Z',
    status: 'ACTIVE',
    createdAt: '2026-09-28T07:00:00Z',
    updatedAt: '2026-09-28T07:00:00Z',
    provenance: { isLive: false, status: 'VERIFIED', sourceReliability: 'OFFICIAL_TELEMETRY', sourceName: 'IMD Mumbai' },
    confidence: { level: 'HIGH', score: 92, explanation: 'Dual-polarized Doppler radar verification complete.' },
    whyExplanation: 'Afternoon convective squalls elevate wind and chop, posing acute capsizing risk for light motorized crafts.',
  },
  {
    id: 'ALT-2026-NAVAL-02',
    fingerprint: 'FP-NAVAL-02',
    alertType: 'RESTRICTED_ZONE_INCURSION',
    category: 'GIS_SAFETY',
    severity: 'CRITICAL',
    title: 'Naval Anchorage & Defense Exclusion Buffer (Geofence Clearance: 4.2 km)',
    message: 'Western Naval Command Security Geofence active (18.85°N, 72.78°E). Mandatory 1000m perimeter buffer enforced by PostGIS engine.',
    actionRecommendation: 'Maintain clear corridor outside marked security zone. Planned fairway provides 4.2 km buffer clearance.',
    source: 'NHO_POSTGIS_CORRIDOR',
    dataset: 'GIS_RESTRICTED_ZONES',
    evidenceIds: ['EVID-GIS-GEO-01'],
    ruleIds: ['RULE_02_GEOFENCE_CLEARANCE'],
    affectedArea: { name: 'Naval Outer Anchorage Perimeter', center: [18.85, 72.78], radiusKm: 5 },
    affectedMissionIds: ['MSN-2026-0928-01'],
    affectedVesselIds: ['VESSEL-001', 'VESSEL-002'],
    issuedAt: '2026-09-28T06:00:00Z',
    validFrom: '2026-09-28T06:00:00Z',
    validUntil: '2026-09-30T00:00:00Z',
    status: 'ACTIVE',
    createdAt: '2026-09-28T06:00:00Z',
    updatedAt: '2026-09-28T06:00:00Z',
    provenance: { isLive: false, status: 'VERIFIED', sourceReliability: 'GEOSPATIAL_ENGINE', sourceName: 'National Hydrographic Office' },
    confidence: { level: 'HIGH', score: 99, explanation: 'PostGIS deterministic polygon boundary.' },
    whyExplanation: 'Maritime exclusion buffer prevents unauthorized incursions into designated naval exercises and anchorages.',
  },
  {
    id: 'ALT-2026-SWELL-03',
    fingerprint: 'FP-SWELL-03',
    alertType: 'HIGH_WAVE_CONDITION',
    category: 'WEATHER_MARINE',
    severity: 'WARNING',
    title: 'Southwest Monsoon Swell Surge (Peak Hs 2.1m — 2.4m)',
    message: 'INCOIS OSF wave model indicates significant wave height rising from 1.4m to 2.1m between 11:30 and 15:00 IST along coastal shelf.',
    actionRecommendation: 'Matsya Sagar 1 wave threshold is 1.8m. Schedule return leg prior to 12:00 IST to remain in safe operational envelope.',
    source: 'INCOIS_OSF_MODEL',
    dataset: 'INCOIS_OSF',
    evidenceIds: ['EVID-OSF-WAVE-01'],
    ruleIds: ['RULE_01_VESSEL_SEAWORTHINESS'],
    affectedArea: { name: 'Continental Shelf Transition Zone', center: [18.72, 72.65], radiusKm: 25 },
    affectedMissionIds: ['MSN-2026-0928-01'],
    affectedVesselIds: ['VESSEL-001'],
    issuedAt: '2026-09-28T06:30:00Z',
    validFrom: '2026-09-28T06:30:00Z',
    validUntil: '2026-09-29T12:00:00Z',
    status: 'ACTIVE',
    createdAt: '2026-09-28T06:30:00Z',
    updatedAt: '2026-09-28T06:30:00Z',
    provenance: { isLive: false, status: 'VERIFIED', sourceReliability: 'OFFICIAL_TELEMETRY', sourceName: 'INCOIS Hyderabad' },
    confidence: { level: 'HIGH', score: 88, explanation: 'Calibrated SWAN/WAVEWATCH III operational numerical run.' },
    whyExplanation: 'Return window coincides with diurnal peak swell, exceeding vessel design tolerance.',
  },
  {
    id: 'ALT-2026-SHOAL-04',
    fingerprint: 'FP-SHOAL-04',
    alertType: 'ROUTE_INTERSECTION',
    category: 'GIS_SAFETY',
    severity: 'WARNING',
    title: 'Submerged Shoal & Sandbar Hazard (Prongs Reef & Dharamtal Entrance)',
    message: 'Shallow rocky pinnacle and sandbar depth under 1.5m at chart datum during low tide (13:40 IST). High grounding risk.',
    actionRecommendation: 'Maintain minimum 1.5 nm clearance from marked shoal markers during ebb tide.',
    source: 'MUMBAI_PORT_AUTHORITY',
    dataset: 'GIS_SAFETY_ENGINE',
    evidenceIds: ['EVID-GIS-SHOAL-01'],
    ruleIds: ['RULE_04_SHOAL_BUFFER'],
    affectedArea: { name: 'Prongs Reef & Dharamtal Entrance', center: [18.82, 72.85], radiusKm: 4 },
    affectedMissionIds: [],
    affectedVesselIds: ['VESSEL-001'],
    issuedAt: '2026-09-28T05:00:00Z',
    validFrom: '2026-09-28T05:00:00Z',
    validUntil: '2026-09-30T00:00:00Z',
    status: 'ACTIVE',
    createdAt: '2026-09-28T05:00:00Z',
    updatedAt: '2026-09-28T05:00:00Z',
    provenance: { isLive: false, status: 'VERIFIED', sourceReliability: 'GEOSPATIAL_ENGINE', sourceName: 'MbPA Marine Dept' },
    confidence: { level: 'HIGH', score: 95, explanation: 'Verified hydrographic soundings survey.' },
    whyExplanation: 'Spring low tide exposes dangerous rocky ledges off Colaba point.',
  },
  {
    id: 'ALT-2026-CABLE-05',
    fingerprint: 'FP-CABLE-05',
    alertType: 'ROUTE_INTERSECTION',
    category: 'GIS_SAFETY',
    severity: 'INFO',
    title: 'Submarine Telecom Fiber Cable & Pipeline Survey Fairway',
    message: 'Subsea high-bandwidth fiber cable corridor from Versova to Mumbai High South active. Surface transit clear; bottom dredging prohibited.',
    actionRecommendation: 'Do not deploy bottom otter trawls within 500m of marked coordinates. Surface fishing permitted.',
    source: 'DEPARTMENT_OF_TELECOM',
    dataset: 'GIS_RESTRICTED_ZONES',
    evidenceIds: ['EVID-GIS-CABLE-01'],
    ruleIds: ['RULE_05_CABLE_BUFFER'],
    affectedArea: { name: 'Versova-Mumbai High Pipeline Track', center: [19.12, 72.70], radiusKm: 18 },
    affectedMissionIds: ['MSN-2026-0925-01'],
    affectedVesselIds: ['VESSEL-002'],
    issuedAt: '2026-09-28T04:00:00Z',
    validFrom: '2026-09-28T04:00:00Z',
    validUntil: '2026-10-15T00:00:00Z',
    status: 'ACTIVE',
    createdAt: '2026-09-28T04:00:00Z',
    updatedAt: '2026-09-28T04:00:00Z',
    provenance: { isLive: false, status: 'VERIFIED', sourceReliability: 'INSTITUTIONAL_FALLBACK', sourceName: 'DoT / ONGC Marine' },
    confidence: { level: 'HIGH', score: 90, explanation: 'Official subsea pipeline gazette notice.' },
    whyExplanation: 'Essential critical national infrastructure protection zone under Indian Maritime Gazette.',
  },
];

export const alertService = {
  /**
   * Fetch alerts matching filter criteria from ORCA backend or offline cache.
   */
  async getAlerts(filter?: AlertFilterOptions): Promise<AlertItem[]> {
    const conn = connectivityService.getStatus();
    const baseUrl = getApiBaseUrl();
    const queryParams = new URLSearchParams();

    if (filter?.status && filter.status !== 'ALL') {
      queryParams.set('status', filter.status);
    }
    if (filter?.severity) {
      queryParams.set('severity', filter.severity);
    }
    if (filter?.alertType) {
      queryParams.set('alertType', filter.alertType);
    }
    if (filter?.category) {
      queryParams.set('category', filter.category);
    }
    if (filter?.missionId) {
      queryParams.set('missionId', filter.missionId);
    }
    if (filter?.vesselId) {
      queryParams.set('vesselId', filter.vesselId);
    }
    if (filter?.role) {
      queryParams.set('role', filter.role);
    }

    if (conn.isOnline && conn.apiReachable) {
      try {
        const qs = queryParams.toString();
        const url = `${baseUrl}/alerts${qs ? `?${qs}` : ''}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          const alerts: AlertItem[] = data.alerts || [];
          // Pre-cache alerts in background
          offlineCacheService.cacheAlerts(alerts).catch(console.warn);
          return alerts;
        }
      } catch (err) {
        console.warn('Network alert fetch failed, falling back to offline cache:', err);
      }
    }

    // Offline / Degraded fallback
    const cachedItems = await offlineCacheService.getAll<AlertItem>('alerts');
    let alerts = cachedItems.map((ci) => ci.data);

    if (alerts.length === 0) {
      alerts = [...DEFAULT_CONNECTED_ALERTS];
      offlineCacheService.cacheAlerts(alerts).catch(console.warn);
    }

    if (filter?.status && filter.status !== 'ALL') {
      alerts = alerts.filter((a) => a.status === filter.status);
    }
    if (filter?.severity) {
      alerts = alerts.filter((a) => a.severity === filter.severity);
    }
    if (filter?.category) {
      alerts = alerts.filter((a) => a.category === filter.category);
    }

    return alerts;
  },

  /**
   * Fetch progressive-disclosure detail for an alert (Level 1-4).
   */
  async getAlertDetail(id: string): Promise<AlertDetailResponse> {
    const conn = connectivityService.getStatus();
    const baseUrl = getApiBaseUrl();

    if (conn.isOnline && conn.apiReachable) {
      try {
        const url = `${baseUrl}/alerts/${encodeURIComponent(id)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          return (await response.json()) as AlertDetailResponse;
        }
      } catch (err) {
        console.warn('Network alert detail failed, checking offline cache:', err);
      }
    }

    // Offline fallback: load from cached alerts
    const cached = await offlineCacheService.getItem<AlertItem>('alerts', id);
    if (cached && cached.data) {
      const alert = cached.data;
      return {
        alert,
        evidence: [],
        ruleEvaluations: [],
      };
    }

    const fallbackAlert = DEFAULT_CONNECTED_ALERTS.find((a) => a.id === id) || DEFAULT_CONNECTED_ALERTS[0];
    return {
      alert: fallbackAlert,
      evidence: [],
      ruleEvaluations: [],
    };
  },

  /**
   * Acknowledge an alert as operator.
   * If offline, updates local cache and queues mutation for reconnect sync.
   */
  async acknowledgeAlert(
    id: string,
    operatorId: string = 'OP-USER-01',
    role?: string,
    note?: string
  ): Promise<AlertItem> {
    const conn = connectivityService.getStatus();
    const baseUrl = getApiBaseUrl();

    if (conn.isOnline && conn.apiReachable) {
      try {
        const url = `${baseUrl}/alerts/${encodeURIComponent(id)}/acknowledge`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            operatorId,
            role: role || 'COASTAL_OPERATOR',
            note: note || 'Acknowledged by operator in console',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          offlineCacheService.cacheAlerts([data.alert]).catch(console.warn);
          return data.alert;
        }
      } catch (err) {
        console.warn('Network acknowledge failed, queuing mutation offline:', err);
      }
    }

    // Queue mutation offline
    const mutation: SyncMutationItem = {
      id: `MUT-ACK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mutationType: 'ACKNOWLEDGE_ALERT',
      payload: { alertId: id, operatorId, role, note },
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    await offlineCacheService.enqueueMutation(mutation);

    // Update local cached alert record
    const cached = await offlineCacheService.getItem<AlertItem>('alerts', id);
    const existing = cached?.data;
    const updatedAlert: AlertItem = existing
      ? {
          ...existing,
          status: 'ACKNOWLEDGED',
          acknowledgement: {
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy: operatorId,
            operatorRole: role || 'COASTAL_OPERATOR',
            note,
          },
          updatedAt: new Date().toISOString(),
        }
      : ({
          id,
          title: 'Offline Acknowledged Alert',
          status: 'ACKNOWLEDGED',
          severity: 'WARNING',
        } as any);

    await offlineCacheService.cacheAlerts([updatedAlert]);
    return updatedAlert;
  },

  /**
   * Resolve an alert.
   * If offline, updates local cache and queues mutation for reconnect sync.
   */
  async resolveAlert(
    id: string,
    operatorId: string = 'OP-USER-01',
    role?: string,
    note?: string
  ): Promise<AlertItem> {
    const conn = connectivityService.getStatus();
    const baseUrl = getApiBaseUrl();

    if (conn.isOnline && conn.apiReachable) {
      try {
        const url = `${baseUrl}/alerts/${encodeURIComponent(id)}/resolve`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            operatorId,
            role: role || 'DISASTER_MANAGER',
            note: note || 'Condition mitigated or hazard cleared',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          offlineCacheService.cacheAlerts([data.alert]).catch(console.warn);
          return data.alert;
        }
      } catch (err) {
        console.warn('Network resolve failed, queuing mutation offline:', err);
      }
    }

    // Queue mutation offline
    const mutation: SyncMutationItem = {
      id: `MUT-RES-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mutationType: 'RESOLVE_ALERT',
      payload: { alertId: id, operatorId, role, justificationNote: note },
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    await offlineCacheService.enqueueMutation(mutation);

    // Update local cached alert record
    const cached = await offlineCacheService.getItem<AlertItem>('alerts', id);
    const existing = cached?.data;
    const updatedAlert: AlertItem = existing
      ? {
          ...existing,
          status: 'RESOLVED',
          resolution: {
            resolvedAt: new Date().toISOString(),
            resolvedBy: operatorId,
            operatorRole: role || 'DISASTER_MANAGER',
            justificationNote: note || 'Condition mitigated or hazard cleared (queued offline)',
          },
          updatedAt: new Date().toISOString(),
        }
      : ({
          id,
          title: 'Offline Resolved Alert',
          status: 'RESOLVED',
          severity: 'INFO',
        } as any);

    await offlineCacheService.cacheAlerts([updatedAlert]);
    return updatedAlert;
  },
};
