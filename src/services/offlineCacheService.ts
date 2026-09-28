import type {
  FreshnessState,
  OfflineCachedItem,
  SyncMutationItem,
  DecisionDetailResponse,
  AlertItem,
} from '@/types/contract';

const DB_NAME = 'orca_offline_store';
const DB_VERSION = 1;

type EntityStoreName =
  | 'decisions'
  | 'missions'
  | 'alerts'
  | 'observations'
  | 'restricted_zones'
  | 'vessels'
  | 'sync_queue';

/**
 * Dataset-specific freshness rules with explicit classification of:
 * - OFFICIAL_SOURCE_VALIDITY: Published update cycle from official government agency
 * - ORCA_PROTOTYPE_POLICY: Engineering cache policy for prototype operations
 */
export interface DatasetFreshnessPolicy {
  freshMinutes: number;
  agingMinutes: number;
  staleMinutes: number;
  validityBasis: 'OFFICIAL_SOURCE_VALIDITY' | 'ORCA_PROTOTYPE_POLICY';
  basisDescription: string;
}

export const DATASET_FRESHNESS_CONFIG: Record<string, DatasetFreshnessPolicy> = {
  INCOIS_OSF: {
    freshMinutes: 180,
    agingMinutes: 360,
    staleMinutes: 720,
    validityBasis: 'OFFICIAL_SOURCE_VALIDITY',
    basisDescription: 'INCOIS 6-hour operational wave forecast numerical cycle',
  },
  INCOIS_PFZ: {
    freshMinutes: 720,
    agingMinutes: 1440,
    staleMinutes: 2880,
    validityBasis: 'OFFICIAL_SOURCE_VALIDITY',
    basisDescription: 'INCOIS daily composite satellite chlorophyll/SST advisory pass',
  },
  IMD_WEATHER: {
    freshMinutes: 60,
    agingMinutes: 180,
    staleMinutes: 360,
    validityBasis: 'OFFICIAL_SOURCE_VALIDITY',
    basisDescription: 'IMD 3-hour marine coastal weather bulletin & squall warning',
  },
  GIS_SAFETY_ENGINE: {
    freshMinutes: 4320, // 72h
    agingMinutes: 8640,
    staleMinutes: 14400,
    validityBasis: 'ORCA_PROTOTYPE_POLICY',
    basisDescription: 'ORCA PostGIS deterministic boundary cache (72h refresh policy)',
  },
  GIS_RESTRICTED_ZONES: {
    freshMinutes: 4320,
    agingMinutes: 8640,
    staleMinutes: 14400,
    validityBasis: 'ORCA_PROTOTYPE_POLICY',
    basisDescription: 'ORCA PostGIS restricted zone geofence cache (72h policy)',
  },
  VESSEL_CAPABILITY: {
    freshMinutes: 10080, // 7d
    agingMinutes: 20160,
    staleMinutes: 43200,
    validityBasis: 'ORCA_PROTOTYPE_POLICY',
    basisDescription: 'ORCA Vessel registry seaworthiness specification profile (7-day policy)',
  },
  VESSEL_TELEMETRY: {
    freshMinutes: 15,
    agingMinutes: 30,
    staleMinutes: 60,
    validityBasis: 'ORCA_PROTOTYPE_POLICY',
    basisDescription: 'Onboard vessel engine & speed telemetry cache (30-minute policy)',
  },
};

/**
 * Evaluates the deterministic freshness lifecycle state of a cached observation or record.
 */
export function evaluateFreshness(
  datasetName: string,
  observedAt: string,
  validUntil?: string | null
): FreshnessState {
  if (datasetName === 'IMD_WEATHER') {
    return 'ACCESS_PENDING';
  }
  if (datasetName === 'GIS_SAFETY_ENGINE' || datasetName === 'VESSEL_CAPABILITY') {
    return 'DETERMINISTIC';
  }

  const now = Date.now();
  if (validUntil) {
    const expiresAt = new Date(validUntil).getTime();
    if (!isNaN(expiresAt) && now > expiresAt) {
      return 'EXPIRED';
    }
  }

  const observedTime = new Date(observedAt).getTime();
  if (isNaN(observedTime)) {
    return 'UNAVAILABLE';
  }

  const ageMinutes = Math.max(0, Math.floor((now - observedTime) / (1000 * 60)));
  const config = DATASET_FRESHNESS_CONFIG[datasetName] || {
    freshMinutes: 120,
    agingMinutes: 360,
    staleMinutes: 720,
  };

  if (ageMinutes <= config.freshMinutes) {
    return 'LIVE';
  }
  if (ageMinutes <= config.agingMinutes) {
    return 'AGING';
  }
  if (ageMinutes <= config.staleMinutes) {
    return 'STALE';
  }
  return 'EXPIRED';
}

class OfflineCacheService {
  private db: IDBDatabase | null = null;
  private isSupported: boolean = typeof window !== 'undefined' && 'indexedDB' in window;
  private memoryFallback: Map<string, Map<string, unknown>> = new Map();

  constructor() {
    this.memoryFallback.set('decisions', new Map());
    this.memoryFallback.set('missions', new Map());
    this.memoryFallback.set('alerts', new Map());
    this.memoryFallback.set('observations', new Map());
    this.memoryFallback.set('restricted_zones', new Map());
    this.memoryFallback.set('vessels', new Map());
    this.memoryFallback.set('sync_queue', new Map());
  }

  public async init(): Promise<void> {
    if (!this.isSupported) return;

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const stores: EntityStoreName[] = [
            'decisions',
            'missions',
            'alerts',
            'observations',
            'restricted_zones',
            'vessels',
            'sync_queue',
          ];

          for (const storeName of stores) {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          }
        };

        request.onsuccess = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          resolve();
        };

        request.onerror = () => {
          console.warn('IndexedDB initialization failed; falling back to in-memory/localStorage.');
          this.isSupported = false;
          resolve();
        };
      } catch (err) {
        console.warn('IndexedDB unavailable:', err);
        this.isSupported = false;
        resolve();
      }
    });
  }

  public async saveItem<T>(
    storeName: EntityStoreName,
    item: OfflineCachedItem<T>
  ): Promise<void> {
    if (!this.db || !this.isSupported) {
      this.memoryFallback.get(storeName)?.set(item.id, item);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(
            `orca_${storeName}_${item.id}`,
            JSON.stringify(item)
          );
        }
      } catch {
        // localStorage quota exceeded or unavailable
      }
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch {
        this.memoryFallback.get(storeName)?.set(item.id, item);
        resolve();
      }
    });
  }

  public async getItem<T>(
    storeName: EntityStoreName,
    id: string
  ): Promise<OfflineCachedItem<T> | null> {
    if (!this.db || !this.isSupported) {
      const fromMem = this.memoryFallback.get(storeName)?.get(id) as OfflineCachedItem<T> | undefined;
      if (fromMem) return fromMem;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem(`orca_${storeName}_${id}`);
          if (raw) return JSON.parse(raw);
        }
      } catch {
        // localStorage read error
      }
      return null;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(id);
        req.onsuccess = () => {
          resolve((req.result as OfflineCachedItem<T>) || null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  public async getAll<T>(storeName: EntityStoreName): Promise<Array<OfflineCachedItem<T>>> {
    if (!this.db || !this.isSupported) {
      const map = this.memoryFallback.get(storeName);
      const items = map ? Array.from(map.values()) as Array<OfflineCachedItem<T>> : [];
      return items;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => {
          resolve((req.result as Array<OfflineCachedItem<T>>) || []);
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  public async deleteItem(storeName: EntityStoreName, id: string): Promise<void> {
    if (!this.db || !this.isSupported) {
      this.memoryFallback.get(storeName)?.delete(id);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(`orca_${storeName}_${id}`);
        }
      } catch {
        // localStorage removal error
      }
      return;
    }

    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // --- Convenience helpers ---

  public async cacheDecision(decision: DecisionDetailResponse): Promise<void> {
    const id = decision.decision.decisionId;
    const now = new Date().toISOString();
    const item: OfflineCachedItem<DecisionDetailResponse> = {
      id,
      entityType: 'decision',
      data: decision,
      source: 'ORCA_DETERMINISTIC_DECISION_ENGINE',
      retrievedAt: now,
      observedAt: decision.decision.evaluatedAt,
      validUntil: decision.decision.recommendedReturn || null,
      cachedAt: now,
      status: 'CACHED',
      qualityLevel: 'HIGH',
    };
    await this.saveItem('decisions', item);
  }

  public async cacheAlerts(alerts: AlertItem[]): Promise<void> {
    const now = new Date().toISOString();
    for (const a of alerts) {
      const item: OfflineCachedItem<AlertItem> = {
        id: a.id,
        entityType: 'alert',
        data: a,
        source: a.source,
        dataset: a.dataset,
        retrievedAt: now,
        observedAt: a.issuedAt,
        validUntil: a.validUntil,
        cachedAt: now,
        status: evaluateFreshness(a.dataset || 'ORCA', a.issuedAt, a.validUntil),
        qualityLevel: 'HIGH',
      };
      await this.saveItem('alerts', item);
    }
  }

  public async enqueueMutation(mutation: SyncMutationItem): Promise<void> {
    const now = new Date().toISOString();
    const item: OfflineCachedItem<SyncMutationItem> = {
      id: mutation.id,
      entityType: 'mission', // stored in sync_queue store
      data: mutation,
      source: 'OFFLINE_LOCAL_QUEUE',
      retrievedAt: now,
      observedAt: now,
      validUntil: null,
      cachedAt: now,
      status: 'CACHED',
      qualityLevel: 'HIGH',
    };
    await this.saveItem('sync_queue', item);
  }

  public async getPendingMutations(): Promise<SyncMutationItem[]> {
    const items = await this.getAll<SyncMutationItem>('sync_queue');
    return items.map((i) => i.data);
  }

  public async removePendingMutation(id: string): Promise<void> {
    await this.deleteItem('sync_queue', id);
  }
}

export const offlineCacheService = new OfflineCacheService();
// Auto-initialize on browser import
if (typeof window !== 'undefined') {
  offlineCacheService.init().catch(console.warn);
}
