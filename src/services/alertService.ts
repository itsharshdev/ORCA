import type {
  AlertItem,
  AlertDetailResponse,
  AlertFilterOptions,
  SyncMutationItem,
} from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';
import { offlineCacheService } from './offlineCacheService';
import { connectivityService } from './connectivityService';

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

    throw new Error(`Alert details for ${id} are unavailable offline.`);
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
