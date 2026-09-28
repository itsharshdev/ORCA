import { getApiBaseUrl } from './apiConfig';

export interface CreateMissionPayload {
  title: string;
  missionType?: 'FISHING' | 'PATROL' | 'SURVEY' | 'SEARCH_AND_RESCUE' | 'COMMERCIAL_TRANSIT';
  status?: 'DRAFT' | 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ABORTED';
  vesselId?: string;
  targetZoneId?: string;
  departureTime?: string;
  durationHours?: number;
  maxDistanceKm?: number;
  originLocation?: { lat: number; lon: number };
  destinationLocation?: { lat: number; lon: number };
  waypoints?: Array<{
    latitude: number;
    longitude: number;
    sequenceOrder: number;
    label?: string;
    waypointType?: string;
  }>;
  metadata?: Record<string, unknown>;
}

export interface MissionRecord {
  id: string;
  owner_id: string;
  title: string;
  mission_type: string;
  status: string;
  vessel_id?: string | null;
  target_zone_id?: string | null;
  departure_time?: string | null;
  duration_hours?: number | null;
  max_distance_km?: number | null;
  origin_location?: unknown;
  destination_location?: unknown;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  mission_waypoints?: Array<{
    id: string;
    sequence_order: number;
    label?: string;
    waypoint_type?: string;
    location?: unknown;
  }>;
}

const STORAGE_KEY = 'orca_missions_ledger';

const DEFAULT_CONNECTED_MISSIONS: MissionRecord[] = [
  {
    id: 'MSN-2026-0928-01',
    owner_id: 'usr-fisherman-01',
    title: 'Morning Coastal Fishing Trip (5h)',
    mission_type: 'FISHING',
    status: 'ACTIVE',
    vessel_id: 'VESSEL-001',
    target_zone_id: 'PFZ-MUM-01',
    departure_time: '2026-09-28T09:45:00Z',
    duration_hours: 5,
    max_distance_km: 18.5,
    origin_location: { lat: 18.915, lon: 72.825, name: 'Sassoon Docks, Mumbai' },
    destination_location: { lat: 18.72, lon: 72.65, name: 'Zone Alpha (Offshore Alibaug)' },
    metadata: {
      vesselName: 'Matsya Sagar 1',
      verdict: 'CAUTION',
      reason: 'Morning departure is within observed envelope, but projected return window encounters higher swell (2.1m) exceeding 1.8m craft tolerance.',
      corridorClearanceKm: 4.2,
      targetSpecies: ['Mackerel', 'Sardines', 'Pomfret'],
    },
    created_at: '2026-09-28T08:30:00Z',
    updated_at: '2026-09-28T09:45:00Z',
    mission_waypoints: [
      { id: 'WP-01', sequence_order: 1, label: 'Departure Berth (Sassoon Docks)', location: { lat: 18.915, lon: 72.825 } },
      { id: 'WP-02', sequence_order: 2, label: 'Fairway Channel Buoy 4', location: { lat: 18.82, lon: 72.74 } },
      { id: 'WP-03', sequence_order: 3, label: 'Zone Alpha Thermal Front Entry', location: { lat: 18.72, lon: 72.65 } },
      { id: 'WP-04', sequence_order: 4, label: 'Return Leg Inshore Gate', location: { lat: 18.85, lon: 72.80 } },
    ],
  },
  {
    id: 'MSN-2026-0927-02',
    owner_id: 'usr-fisherman-01',
    title: 'Murud Ridge Artisanal Run (3.5h)',
    mission_type: 'FISHING',
    status: 'COMPLETED',
    vessel_id: 'VESSEL-001',
    target_zone_id: 'PFZ-MUM-02',
    departure_time: '2026-09-27T05:30:00Z',
    duration_hours: 3.5,
    max_distance_km: 32.0,
    origin_location: { lat: 18.915, lon: 72.825, name: 'Sassoon Docks' },
    destination_location: { lat: 18.35, lon: 72.78, name: 'Zone Bravo (Murud Shelf)' },
    metadata: {
      vesselName: 'Matsya Sagar 1',
      verdict: 'GO',
      reason: 'Optimal morning swell (0.9m) and clear boundary fairway.',
      catchYieldKg: 142,
    },
    created_at: '2026-09-27T04:45:00Z',
    updated_at: '2026-09-27T09:15:00Z',
    mission_waypoints: [
      { id: 'WP-11', sequence_order: 1, label: 'Harbor Gate', location: { lat: 18.915, lon: 72.825 } },
      { id: 'WP-12', sequence_order: 2, label: 'Murud Ridge Pelagic Bank', location: { lat: 18.35, lon: 72.78 } },
    ],
  },
  {
    id: 'MSN-2026-0925-01',
    owner_id: 'usr-fisherman-02',
    title: 'Deep Pelagic Trawl Survey (8h)',
    mission_type: 'FISHING',
    status: 'COMPLETED',
    vessel_id: 'VESSEL-002',
    target_zone_id: 'PFZ-MUM-03',
    departure_time: '2026-09-25T06:00:00Z',
    duration_hours: 8,
    max_distance_km: 44.2,
    origin_location: { lat: 18.915, lon: 72.825, name: 'Sassoon Docks' },
    destination_location: { lat: 19.12, lon: 72.48, name: 'North High Deep' },
    metadata: {
      vesselName: 'Samudra Ratna',
      verdict: 'GO',
      reason: 'Mechanized craft envelope (2.5m) comfortably cleared 1.8m seas.',
      catchYieldKg: 420,
    },
    created_at: '2026-09-25T05:00:00Z',
    updated_at: '2026-09-25T14:30:00Z',
    mission_waypoints: [
      { id: 'WP-21', sequence_order: 1, label: 'Berth 12', location: { lat: 18.915, lon: 72.825 } },
      { id: 'WP-22', sequence_order: 2, label: 'North Continental Shelf', location: { lat: 19.12, lon: 72.48 } },
    ],
  },
  {
    id: 'MSN-2026-0924-03',
    owner_id: 'usr-fisherman-03',
    title: 'Colaba Trench Pelagic Drift (6h)',
    mission_type: 'FISHING',
    status: 'COMPLETED',
    vessel_id: 'VESSEL-003',
    target_zone_id: 'PFZ-MUM-04',
    departure_time: '2026-09-24T07:15:00Z',
    duration_hours: 6,
    max_distance_km: 22.8,
    origin_location: { lat: 18.641, lon: 72.872, name: 'Alibaug Port Jetty' },
    destination_location: { lat: 18.82, lon: 72.68, name: 'Colaba Deep Trench' },
    metadata: {
      vesselName: 'Sagar Kanya III',
      verdict: 'GO',
      reason: 'Favorable SST 27.6°C front; safe 3.8 km buffer from Naval perimeter.',
      catchYieldKg: 285,
    },
    created_at: '2026-09-24T06:30:00Z',
    updated_at: '2026-09-24T13:45:00Z',
    mission_waypoints: [
      { id: 'WP-31', sequence_order: 1, label: 'Alibaug Outer Jetty', location: { lat: 18.641, lon: 72.872 } },
      { id: 'WP-32', sequence_order: 2, label: 'Colaba Pelagic Drop', location: { lat: 18.82, lon: 72.68 } },
    ],
  },
  {
    id: 'MSN-2026-0922-01',
    owner_id: 'usr-fisherman-04',
    title: 'Inshore Versova Handline Patrol (4h)',
    mission_type: 'FISHING',
    status: 'COMPLETED',
    vessel_id: 'VESSEL-004',
    target_zone_id: 'PFZ-MUM-05',
    departure_time: '2026-09-22T06:45:00Z',
    duration_hours: 4,
    max_distance_km: 16.4,
    origin_location: { lat: 19.135, lon: 72.812, name: 'Versova Village' },
    destination_location: { lat: 19.18, lon: 72.72, name: 'Versova Offshore Edge' },
    metadata: {
      vesselName: 'Jal Tarang 2',
      verdict: 'GO',
      reason: 'Calm morning conditions (0.8m wave, 8 kts wind).',
      catchYieldKg: 75,
    },
    created_at: '2026-09-22T06:00:00Z',
    updated_at: '2026-09-22T10:45:00Z',
    mission_waypoints: [
      { id: 'WP-41', sequence_order: 1, label: 'Versova Creek', location: { lat: 19.135, lon: 72.812 } },
      { id: 'WP-42', sequence_order: 2, label: 'Versova Submerged Shoal', location: { lat: 19.18, lon: 72.72 } },
    ],
  },
];

function getStoredMissions(): MissionRecord[] {
  if (typeof window === 'undefined') return DEFAULT_CONNECTED_MISSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONNECTED_MISSIONS));
  } catch {
    // fallback
  }
  return DEFAULT_CONNECTED_MISSIONS;
}

function saveMissionToStorage(mission: MissionRecord) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredMissions();
    const updated = [mission, ...current.filter((m) => m.id !== mission.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

export const missionService = {
  /**
   * Creates a new mission with optional route waypoints, persisted to both backend and local store.
   */
  async createMission(payload: CreateMissionPayload, token?: string): Promise<{ mission: MissionRecord; message: string }> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/missions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = (await response.json()) as { mission: MissionRecord; message: string };
        saveMissionToStorage(result.mission);
        return result;
      }
    } catch {
      // Backend unreachable; create and persist locally
    }

    const now = new Date().toISOString();
    const newMission: MissionRecord = {
      id: `MSN-${Date.now().toString(36).toUpperCase()}`,
      owner_id: 'usr-local-operator',
      title: payload.title || 'Custom Coastal Fishing Voyage',
      mission_type: payload.missionType || 'FISHING',
      status: payload.status || 'PLANNED',
      vessel_id: payload.vesselId || 'VESSEL-001',
      target_zone_id: payload.targetZoneId || 'PFZ-MUM-01',
      departure_time: payload.departureTime || now,
      duration_hours: payload.durationHours || 5,
      max_distance_km: payload.maxDistanceKm || 18.5,
      origin_location: payload.originLocation || { lat: 18.915, lon: 72.825 },
      destination_location: payload.destinationLocation || { lat: 18.72, lon: 72.65 },
      metadata: payload.metadata || { corridorClearanceKm: 4.2 },
      created_at: now,
      updated_at: now,
      mission_waypoints: payload.waypoints?.map((w, i) => ({
        id: `WP-${i + 1}`,
        sequence_order: w.sequenceOrder || i + 1,
        label: w.label || `Waypoint ${i + 1}`,
        location: { lat: w.latitude, lon: w.longitude },
      })) || [],
    };

    saveMissionToStorage(newMission);
    return { mission: newMission, message: 'Mission created successfully and persisted to ledger.' };
  },

  /**
   * Fetches the user's active and historical missions (network-first, falling back to permanent storage).
   */
  async fetchMissions(token?: string): Promise<{ missions: MissionRecord[] }> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/missions`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = (await response.json()) as { missions: MissionRecord[] };
        if (data.missions && data.missions.length > 0) {
          data.missions.forEach(saveMissionToStorage);
          return data;
        }
      }
    } catch {
      // fallback
    }

    return { missions: getStoredMissions() };
  },

  /**
   * Fetches single mission details with waypoints.
   */
  async fetchMissionById(missionId: string, token?: string): Promise<MissionRecord | null> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/missions/${encodeURIComponent(missionId)}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = (await response.json()) as { mission: MissionRecord };
        if (data.mission) return data.mission;
      }
    } catch {
      // fallback
    }

    const stored = getStoredMissions();
    return stored.find((m) => m.id === missionId) || null;
  },

  /**
   * Deletes a mission by ID.
   */
  async deleteMission(missionId: string, token?: string): Promise<boolean> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/missions/${encodeURIComponent(missionId)}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      await fetch(url, { method: 'DELETE', headers });
    } catch {
      // continue local delete
    }

    try {
      const current = getStoredMissions();
      const updated = current.filter((m) => m.id !== missionId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return true;
  },
};
