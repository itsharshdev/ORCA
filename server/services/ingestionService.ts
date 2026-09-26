import { getSupabaseAdmin } from '../supabase.js';
import type { DataAdapter, AdapterQuery, NormalizedObservationPayload } from '../adapters/types.js';
import { DemoDataAdapter } from '../adapters/demoAdapter.js';
import { IncoisOsfAdapter } from '../adapters/incoisOsfAdapter.js';
import { ImdWeatherAdapter } from '../adapters/imdWeatherAdapter.js';
import { IncoisPfzAdapter } from '../adapters/incoisPfzAdapter.js';
import type { ObservationRecord, ObservationCategory } from '../types.js';

export interface IngestionResult {
  source: string;
  dataset: string;
  region?: string;
  totalReceived: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
  observedAt: string;
  retrievedAt: string;
}

export interface DemoIngestionSummary {
  success: boolean;
  totalObservationsProcessed: number;
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  regionsProcessed: string[];
  resultsByRegion: Record<string, IngestionResult>;
  executedAt: string;
  durationMs: number;
  errors: string[];
}

export interface ObservationFilterQuery {
  category?: ObservationCategory;
  datasetIdentifier?: string;
  variableName?: string;
  region?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// In-memory fallback storage for offline/testing environments
const inMemoryObservations: ObservationRecord[] = [];

/**
 * Normalizes and persists adapter observations into Supabase PostgreSQL PostGIS.
 */
export class IngestionService {
  private static instance: IngestionService;

  public static getInstance(): IngestionService {
    if (!IngestionService.instance) {
      IngestionService.instance = new IngestionService();
    }
    return IngestionService.instance;
  }

  /**
   * Resolves or ensures the data source ID from data_sources table.
   */
  async resolveSourceId(sourceName: string): Promise<string | null> {
    const admin = getSupabaseAdmin();
    if (!admin) return null;

    try {
      const { data, error } = await admin
        .from('data_sources')
        .select('id')
        .eq('name', sourceName)
        .maybeSingle();

      if (!error && data) {
        return data.id;
      }

      // If not found, insert default demo source record
      const { data: inserted, error: insertError } = await admin
        .from('data_sources')
        .insert({
          name: sourceName,
          dataset_name: `${sourceName} Ingested Feed`,
          source_type: 'DEMO_SIMULATION',
          status: 'SIMULATED',
        })
        .select('id')
        .single();

      if (!insertError && inserted) {
        return inserted.id;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Ingests and normalizes data from any DataAdapter instance.
   */
  async ingestAdapter(
    adapter: DataAdapter,
    query: AdapterQuery = {}
  ): Promise<IngestionResult> {
    const region = query.regionId || 'maharashtra';
    const adapterResponse = await adapter.fetch(query);

    const result: IngestionResult = {
      source: adapter.source,
      dataset: adapter.dataset,
      region,
      totalReceived: adapterResponse.normalizedObservations.length,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      observedAt: adapterResponse.observedAt,
      retrievedAt: adapterResponse.retrievedAt,
    };

    if (adapterResponse.status !== 'READY') {
      result.errors.push(`Adapter returned non-ready status: ${adapterResponse.status}`);
      return result;
    }

    const admin = getSupabaseAdmin();
    const sourceId = await this.resolveSourceId(adapter.source);

    for (const obs of adapterResponse.normalizedObservations) {
      try {
        const dedupKey = (obs.metadata?.dedup_key as string) || (obs.metadata?.region as string) || region;
        const locationWkt = obs.location
          ? `SRID=4326;POINT(${obs.location.lon} ${obs.location.lat})`
          : null;

        if (admin) {
          // Check for existing observation to guarantee idempotency
          const { data: existingRows } = await admin
            .from('observations')
            .select('id, raw_metadata')
            .eq('dataset_identifier', adapterResponse.dataset)
            .eq('category', obs.category)
            .eq('variable_name', obs.variableName)
            .eq('observed_at', obs.observedAt);

          const matchedRow = existingRows?.find((r) => {
            const rowDedup = (r.raw_metadata as Record<string, unknown>)?.dedup_key || (r.raw_metadata as Record<string, unknown>)?.region;
            return rowDedup === dedupKey;
          });

          if (matchedRow) {
            // Update existing observation
            const { error: updateError } = await admin
              .from('observations')
              .update({
                numeric_value: obs.numericValue ?? null,
                unit: obs.unit ?? null,
                structured_value: obs.structuredValue || {},
                location: locationWkt,
                retrieved_at: adapterResponse.retrievedAt,
                valid_until: obs.validUntil ?? null,
                status: obs.status,
                quality_level: obs.qualityLevel,
                uncertainty_range: obs.uncertaintyRange ?? null,
                raw_metadata: obs.metadata || {},
              })
              .eq('id', matchedRow.id);

            if (updateError) {
              result.errors.push(`Failed to update observation ${obs.variableName}: ${updateError.message}`);
            } else {
              result.updated++;
            }
          } else {
            // Insert new observation
            const { error: insertError } = await admin
              .from('observations')
              .insert({
                source_id: sourceId,
                dataset_identifier: adapterResponse.dataset,
                category: obs.category,
                variable_name: obs.variableName,
                numeric_value: obs.numericValue ?? null,
                unit: obs.unit ?? null,
                structured_value: obs.structuredValue || {},
                location: locationWkt,
                observed_at: obs.observedAt,
                retrieved_at: adapterResponse.retrievedAt,
                valid_until: obs.validUntil ?? null,
                status: obs.status,
                quality_level: obs.qualityLevel,
                uncertainty_range: obs.uncertaintyRange ?? null,
                raw_metadata: obs.metadata || {},
              });

            if (insertError) {
              result.errors.push(`Failed to insert observation ${obs.variableName}: ${insertError.message}`);
            } else {
              result.inserted++;
            }
          }
        } else {
          // In-memory fallback
          this.persistInMemory(obs, adapterResponse.dataset, sourceId, adapterResponse.retrievedAt, dedupKey);
          result.inserted++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Error processing ${obs.variableName}: ${msg}`);
      }
    }

    return result;
  }

  /**
   * Triggers ingestion across all available demo regions.
   */
  async ingestDemoData(options: { regions?: string[] } = {}): Promise<DemoIngestionSummary> {
    const startTime = Date.now();
    const regions = options.regions && options.regions.length > 0 
      ? options.regions 
      : ['maharashtra', 'tamil_nadu'];

    const summary: DemoIngestionSummary = {
      success: true,
      totalObservationsProcessed: 0,
      totalInserted: 0,
      totalUpdated: 0,
      totalSkipped: 0,
      regionsProcessed: [],
      resultsByRegion: {},
      executedAt: new Date().toISOString(),
      durationMs: 0,
      errors: [],
    };

    const adapter = new DemoDataAdapter('demo_marine_conditions');

    for (const region of regions) {
      try {
        const result = await this.ingestAdapter(adapter, { regionId: region });
        summary.resultsByRegion[region] = result;
        summary.regionsProcessed.push(region);
        summary.totalObservationsProcessed += result.totalReceived;
        summary.totalInserted += result.inserted;
        summary.totalUpdated += result.updated;
        summary.totalSkipped += result.skipped;

        if (result.errors.length > 0) {
          summary.errors.push(...result.errors);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        summary.errors.push(`Region ${region} failed: ${msg}`);
        summary.success = false;
      }
    }

    summary.durationMs = Date.now() - startTime;
    return summary;
  }

  /**
   * Ingests real INCOIS Ocean State Forecast (OSF) data into Supabase.
   * If INCOIS service is unreachable and fallback is allowed, falls back to demo snapshot.
   */
  async ingestIncoisData(options: {
    latitude?: number;
    longitude?: number;
    region?: string;
    allowFallback?: boolean;
    adapter?: IncoisOsfAdapter;
  } = {}): Promise<{
    success: boolean;
    isLive: boolean;
    result: IngestionResult;
    fallbackUsed: boolean;
    source: string;
    dataset: string;
    errors: string[];
  }> {
    const adapter = options.adapter || new IncoisOsfAdapter();
    const region = options.region || (options.latitude && options.latitude < 14 ? 'tamil_nadu' : 'maharashtra');

    const result = await this.ingestAdapter(adapter, {
      latitude: options.latitude,
      longitude: options.longitude,
      regionId: region,
    });

    const hasErrors = result.errors.length > 0;
    const isLive = result.totalReceived > 0 && !hasErrors;

    if (!isLive && options.allowFallback) {
      // Fallback to Demo snapshot
      const demoAdapter = new DemoDataAdapter('demo_marine_conditions');
      const fallbackResult = await this.ingestAdapter(demoAdapter, { regionId: region });

      return {
        success: fallbackResult.totalReceived > 0,
        isLive: false,
        result: fallbackResult,
        fallbackUsed: true,
        source: 'ORCA_DEMO',
        dataset: 'demo_marine_conditions',
        errors: [`INCOIS unavailable (${result.errors.join('; ')}). Demo fallback engaged.`],
      };
    }

    return {
      success: !hasErrors && result.totalReceived > 0,
      isLive,
      result,
      fallbackUsed: false,
      source: adapter.source,
      dataset: adapter.dataset,
      errors: result.errors,
    };
  }

  /**
   * Ingests official IMD Weather & Marine Warning data into Supabase.
   * If IMD service is unreachable and fallback is allowed, falls back to demo snapshot.
   */
  async ingestImdData(options: {
    latitude?: number;
    longitude?: number;
    region?: string;
    stationCode?: string;
    allowFallback?: boolean;
    adapter?: ImdWeatherAdapter;
  } = {}): Promise<{
    success: boolean;
    isLive: boolean;
    result: IngestionResult;
    fallbackUsed: boolean;
    source: string;
    dataset: string;
    errors: string[];
  }> {
    const adapter = options.adapter || new ImdWeatherAdapter();
    const region = options.region || (options.latitude && options.latitude < 14 ? 'tamil_nadu' : 'maharashtra');

    const result = await this.ingestAdapter(adapter, {
      latitude: options.latitude,
      longitude: options.longitude,
      regionId: region,
      stationCode: options.stationCode,
    } as AdapterQuery & { stationCode?: string });

    const hasErrors = result.errors.length > 0;
    const isLive = result.totalReceived > 0 && !hasErrors;

    if (!isLive && options.allowFallback) {
      // Fallback to Demo snapshot for weather
      const demoAdapter = new DemoDataAdapter('demo_marine_conditions');
      const fallbackResult = await this.ingestAdapter(demoAdapter, { regionId: region });

      return {
        success: fallbackResult.totalReceived > 0,
        isLive: false,
        result: fallbackResult,
        fallbackUsed: true,
        source: 'ORCA_DEMO',
        dataset: 'demo_marine_conditions',
        errors: [`IMD weather service unreachable (${result.errors.join('; ')}). Demo snapshot fallback engaged.`],
      };
    }

    return {
      success: !hasErrors && result.totalReceived > 0,
      isLive,
      result,
      fallbackUsed: false,
      source: adapter.source,
      dataset: adapter.dataset,
      errors: result.errors,
    };
  }

  /**
   * Ingests official INCOIS Potential Fishing Zone (PFZ) intelligence into Supabase.
   * If INCOIS PFZ service is unreachable and fallback is allowed, falls back to demo snapshot.
   */
  async ingestPfzData(options: {
    latitude?: number;
    longitude?: number;
    region?: string;
    state?: string;
    allowFallback?: boolean;
    adapter?: IncoisPfzAdapter;
  } = {}): Promise<{
    success: boolean;
    isLive: boolean;
    result: IngestionResult;
    fallbackUsed: boolean;
    source: string;
    dataset: string;
    errors: string[];
  }> {
    const adapter = options.adapter || new IncoisPfzAdapter();
    const region = options.region || (options.latitude && options.latitude < 14 ? 'tamil_nadu' : 'maharashtra');

    const result = await this.ingestAdapter(adapter, {
      latitude: options.latitude,
      longitude: options.longitude,
      regionId: region,
      state: options.state,
    } as AdapterQuery & { state?: string });

    const hasErrors = result.errors.length > 0;
    const isLive = result.totalReceived > 0 && !hasErrors;

    if (!isLive && options.allowFallback) {
      // Fallback to Demo snapshot for PFZ
      const demoAdapter = new DemoDataAdapter('demo_pfz_advisories');
      const fallbackResult = await this.ingestAdapter(demoAdapter, { regionId: region });

      return {
        success: fallbackResult.totalReceived > 0,
        isLive: false,
        result: fallbackResult,
        fallbackUsed: true,
        source: 'ORCA_DEMO',
        dataset: 'demo_pfz_advisories',
        errors: [`INCOIS PFZ WFS unreachable (${result.errors.join('; ')}). Demo snapshot fallback engaged.`],
      };
    }

    return {
      success: !hasErrors && result.totalReceived > 0,
      isLive,
      result,
      fallbackUsed: false,
      source: adapter.source,
      dataset: adapter.dataset,
      errors: result.errors,
    };
  }

  /**
   * Retrieves persisted normalized observations with optional filtering.
   */
  async getObservations(filter: ObservationFilterQuery = {}): Promise<{
    observations: ObservationRecord[];
    total: number;
    count: number;
  }> {
    const limit = Math.min(Math.max(filter.limit || 50, 1), 200);
    const offset = Math.max(filter.offset || 0, 0);

    const admin = getSupabaseAdmin();
    if (admin) {
      try {
        let query = admin
          .from('observations')
          .select('*', { count: 'exact' });

        if (filter.category) {
          query = query.eq('category', filter.category);
        }
        if (filter.datasetIdentifier) {
          query = query.eq('dataset_identifier', filter.datasetIdentifier);
        }
        if (filter.variableName) {
          query = query.eq('variable_name', filter.variableName);
        }
        if (filter.status) {
          query = query.eq('status', filter.status);
        }
        if (filter.region) {
          query = query.contains('raw_metadata', { region: filter.region });
        }

        query = query.order('observed_at', { ascending: false }).range(offset, offset + limit - 1);

        const { data, count, error } = await query;
        if (!error && data) {
          return {
            observations: data as ObservationRecord[],
            total: count || data.length,
            count: data.length,
          };
        }
      } catch {
        // Fallback to in-memory if query encounters issues
      }
    }

    // In-memory fallback filtering
    let filtered = [...inMemoryObservations];
    if (filter.category) {
      filtered = filtered.filter((o) => o.category === filter.category);
    }
    if (filter.datasetIdentifier) {
      filtered = filtered.filter((o) => o.dataset_identifier === filter.datasetIdentifier);
    }
    if (filter.variableName) {
      filtered = filtered.filter((o) => o.variable_name === filter.variableName);
    }
    if (filter.status) {
      filtered = filtered.filter((o) => o.status === filter.status);
    }
    if (filter.region) {
      filtered = filtered.filter((o) => (o.raw_metadata as Record<string, unknown>)?.region === filter.region);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      observations: paginated,
      total,
      count: paginated.length,
    };
  }

  private persistInMemory(
    obs: NormalizedObservationPayload,
    dataset: string,
    sourceId: string | null,
    retrievedAt: string,
    dedupKey: string
  ): void {
    const existingIndex = inMemoryObservations.findIndex(
      (o) =>
        o.dataset_identifier === dataset &&
        o.category === obs.category &&
        o.variable_name === obs.variableName &&
        o.observed_at === obs.observedAt &&
        ((o.raw_metadata as Record<string, unknown>)?.dedup_key === dedupKey ||
          (o.raw_metadata as Record<string, unknown>)?.region === dedupKey)
    );

    const record: ObservationRecord = {
      id: existingIndex >= 0 ? inMemoryObservations[existingIndex].id : `mem-obs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      source_id: sourceId,
      dataset_identifier: dataset,
      category: obs.category,
      variable_name: obs.variableName,
      numeric_value: obs.numericValue ?? null,
      unit: obs.unit ?? null,
      structured_value: obs.structuredValue || {},
      observed_at: obs.observedAt,
      retrieved_at: retrievedAt,
      valid_until: obs.validUntil ?? null,
      status: obs.status,
      quality_level: obs.qualityLevel,
      uncertainty_range: obs.uncertaintyRange ?? null,
      raw_metadata: obs.metadata || {},
      created_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      inMemoryObservations[existingIndex] = record;
    } else {
      inMemoryObservations.push(record);
    }
  }

  public clearInMemoryObservations(): void {
    inMemoryObservations.length = 0;
  }
}

export const ingestionService = IngestionService.getInstance();
