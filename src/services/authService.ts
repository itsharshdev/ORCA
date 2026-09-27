import type { MeResponse } from '@/types/contract';
import { getApiBaseUrl } from './apiConfig';

export const authService = {
  /**
   * Fetches current authenticated user profile, active vessel, and permissions from /me.
   */
  async fetchMe(token?: string): Promise<MeResponse> {
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/me`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch current user session.`);
    }

    return (await response.json()) as MeResponse;
  },
};
