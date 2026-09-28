import { useState, useEffect } from 'react';
import { connectivityService } from '@/services/connectivityService';
import type {
  ConnectivityState,
  ConnectivityStatus,
  NetworkBearer,
  SafetyBroadcastMessage,
} from '@/types/contract';

/**
 * Phase 21: Full 4-state connectivity hook adhering to the ORCA North Star.
 * Distinguishes GPS fix availability from Internet connectivity.
 * Tracks DEGRADED, OFFLINE, CONNECTED, and SAFETY_MESSAGE_RECEIVED states.
 */
export function useConnectivity() {
  const [status, setStatus] = useState<ConnectivityStatus>(() =>
    connectivityService.getStatus()
  );

  useEffect(() => {
    const unsubscribe = connectivityService.subscribe((updatedStatus) => {
      setStatus(updatedStatus);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    // Structured status
    status,
    state: status.state,
    bearer: status.bearer,
    gpsStatus: status.gpsStatus,
    isOnline: status.isOnline && status.apiReachable,
    isOffline: status.state === 'OFFLINE',
    isDegraded: status.state === 'DEGRADED',
    isSafetyMessageReceived: status.state === 'SAFETY_MESSAGE_RECEIVED',
    safetyMessage: status.safetyMessage,
    apiReachable: status.apiReachable,
    lastSuccessfulContact: status.lastSuccessfulContact,
    lastSuccessfulSync: status.lastSuccessfulSync,
    pendingSyncCount: status.pendingSyncCount,
    isSimulated: status.isSimulated,

    // Actions
    simulateState: (
      st: ConnectivityState,
      bearer?: NetworkBearer,
      msg?: SafetyBroadcastMessage | null
    ) => connectivityService.simulateState(st, bearer, msg),
    resetSimulation: () => connectivityService.resetSimulation(),
    triggerSync: () => connectivityService.triggerSync(),
    checkReachability: () => connectivityService.checkApiReachability(),
  };
}
