/**
 * Shared API configuration for ORCA frontend services.
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
  }
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};
