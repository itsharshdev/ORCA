import type {
  AlertItem,
  AlertDetailResponse,
  AlertFilterOptions,
} from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';

export const alertService = {
  /**
   * Fetch alerts matching filter criteria from ORCA backend.
   */
  async getAlerts(filter?: AlertFilterOptions): Promise<AlertItem[]> {
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

    const qs = queryParams.toString();
    const url = `${baseUrl}/alerts${qs ? `?${qs}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: Failed to fetch alerts`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // use fallback
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.alerts || [];
  },

  /**
   * Fetch progressive-disclosure detail for an alert (Level 1-4).
   */
  async getAlertDetail(id: string): Promise<AlertDetailResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/alerts/${encodeURIComponent(id)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: Failed to fetch alert details for ${id}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // use fallback
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as AlertDetailResponse;
  },

  /**
   * Acknowledge an alert as operator.
   */
  async acknowledgeAlert(
    id: string,
    operatorId: string = 'OP-USER-01',
    role?: string,
    note?: string
  ): Promise<AlertItem> {
    const baseUrl = getApiBaseUrl();
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

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: Failed to acknowledge alert ${id}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // use fallback
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.alert;
  },

  /**
   * Resolve an alert.
   */
  async resolveAlert(
    id: string,
    operatorId: string = 'OP-USER-01',
    role?: string,
    note?: string
  ): Promise<AlertItem> {
    const baseUrl = getApiBaseUrl();
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

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: Failed to resolve alert ${id}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // use fallback
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.alert;
  },
};
