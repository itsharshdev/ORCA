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

export const missionService = {
  /**
   * Creates a new mission with optional route waypoints.
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

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: Failed to create mission`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // fallback
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as { mission: MissionRecord; message: string };
  },

  /**
   * Fetches the user's active and historical missions.
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

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return { missions: [] };
    }

    return (await response.json()) as { missions: MissionRecord[] };
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

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { mission: MissionRecord };
    return data.mission || null;
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

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    return response.ok;
  },
};
