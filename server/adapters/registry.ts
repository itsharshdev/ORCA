import type { DataAdapter, AdapterSourceType, AdapterStatus } from './types.js';
import { DemoDataAdapter } from './demoAdapter.js';

export class AdapterRegistry {
  private adapters: Map<string, DataAdapter> = new Map();

  private makeKey(source: string, dataset: string): string {
    return `${source.trim().toUpperCase()}::${dataset.trim().toLowerCase()}`;
  }

  register(adapter: DataAdapter): void {
    const key = this.makeKey(adapter.source, adapter.dataset);
    this.adapters.set(key, adapter);
  }

  has(source: string, dataset: string): boolean {
    return this.adapters.has(this.makeKey(source, dataset));
  }

  get(source: string, dataset: string): DataAdapter {
    const key = this.makeKey(source, dataset);
    const adapter = this.adapters.get(key);
    if (!adapter) {
      throw new Error(`Data adapter not found for source '${source}' and dataset '${dataset}'.`);
    }
    return adapter;
  }

  list(): Array<{
    source: string;
    dataset: string;
    sourceType: AdapterSourceType;
    isLive: boolean;
  }> {
    return Array.from(this.adapters.values()).map((adapter) => ({
      source: adapter.source,
      dataset: adapter.dataset,
      sourceType: adapter.sourceType,
      isLive: adapter.sourceType !== 'DEMO',
    }));
  }

  async checkAllHealth(): Promise<
    Array<{
      source: string;
      dataset: string;
      sourceType: AdapterSourceType;
      status: AdapterStatus;
      latencyMs: number;
      message: string;
    }>
  > {
    const results = [];
    for (const adapter of this.adapters.values()) {
      const health = await adapter.checkHealth();
      results.push({
        source: adapter.source,
        dataset: adapter.dataset,
        sourceType: adapter.sourceType,
        status: health.status,
        latencyMs: health.latencyMs,
        message: health.message,
      });
    }
    return results;
  }
}

// Global registry instance
export const adapterRegistry = new AdapterRegistry();

// Register default Phase 6 adapters
adapterRegistry.register(new DemoDataAdapter('demo_marine_conditions'));
adapterRegistry.register(new DemoDataAdapter('demo_pfz_advisories'));
