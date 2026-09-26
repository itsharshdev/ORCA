export interface PfzOpportunityUI {
  uid: string;
  stateName: string;
  advisoryDate: string;
  validFrom: string;
  validUntil: string;
  isExpired: boolean;
  lengthKm: number;
  midpoint: { lat: number; lon: number };
  coordinates: [number, number][]; // [lon, lat]
  distanceKm?: number;
  distanceNm?: number;
  bearingDeg?: number;
  directionCompass?: string;
  nearestLandingCentre?: {
    name: string;
    distanceKm: number;
  };
  spatialRelevanceScore?: number;
  sstC?: number | null;
  chlorophyllMgM3?: number | null;
}

export interface PfzResponseUI {
  success: boolean;
  source: string;
  dataset: string;
  isLive: boolean;
  status: 'LIVE' | 'DEMO_SNAPSHOT' | 'STALE' | 'DEGRADED';
  retrievedAt: string;
  observedAt: string;
  validUntil: string | null;
  total: number;
  count: number;
  opportunities: PfzOpportunityUI[];
  nearestOpportunity: PfzOpportunityUI | null;
  disclaimer: string;
  safetySeparation: {
    isSafetyClearance: boolean;
    mandatoryCheck: string;
  };
  error?: string | null;
}

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  }
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};

export const pfzService = {
  /**
   * Fetches mission-relevant PFZ opportunities from the ORCA backend.
   */
  async fetchPfz(params: {
    latitude?: number;
    longitude?: number;
    region?: string;
    state?: string;
    limit?: number;
    allowFallback?: boolean;
  } = {}): Promise<PfzResponseUI> {
    const baseUrl = getApiBaseUrl();
    const queryParams = new URLSearchParams();

    if (params.latitude !== undefined) queryParams.set('latitude', String(params.latitude));
    if (params.longitude !== undefined) queryParams.set('longitude', String(params.longitude));
    if (params.region) queryParams.set('region', params.region);
    if (params.state) queryParams.set('state', params.state);
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.allowFallback !== undefined) queryParams.set('allowFallback', String(params.allowFallback));

    const url = `${baseUrl}/pfz${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          source: 'INCOIS_PFZ',
          dataset: 'pfz_advisories',
          isLive: false,
          status: 'DEGRADED',
          retrievedAt: new Date().toISOString(),
          observedAt: new Date().toISOString(),
          validUntil: null,
          total: 0,
          count: 0,
          opportunities: [],
          nearestOpportunity: null,
          disclaimer: 'Failed to retrieve PFZ intelligence from server.',
          safetySeparation: {
            isSafetyClearance: false,
            mandatoryCheck: 'Check IMD Marine Warnings and INCOIS Ocean Wave/Current Forecast.',
          },
          error: `HTTP ${response.status}`,
        };
      }

      const data = (await response.json()) as PfzResponseUI;
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network failure';
      return {
        success: false,
        source: 'INCOIS_PFZ',
        dataset: 'pfz_advisories',
        isLive: false,
        status: 'DEGRADED',
        retrievedAt: new Date().toISOString(),
        observedAt: new Date().toISOString(),
        validUntil: null,
        total: 0,
        count: 0,
        opportunities: [],
        nearestOpportunity: null,
        disclaimer: 'Network error connecting to ORCA backend.',
        safetySeparation: {
          isSafetyClearance: false,
          mandatoryCheck: 'Check IMD Marine Warnings and INCOIS Ocean Wave/Current Forecast.',
        },
        error: msg,
      };
    }
  },
};
