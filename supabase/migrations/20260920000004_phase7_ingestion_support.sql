-- ORCA Phase 7: Demo Data Normalization & Ingestion Pipeline Migration
-- 1. Expands data_sources.source_type check constraint to include 'DEMO_SIMULATION' and 'MULTI_DOMAIN_DEMO'
-- 2. Seeds 'ORCA_DEMO' baseline data source record
-- 3. Adds unique deduplication index on observations table for deterministic idempotency

ALTER TABLE public.data_sources DROP CONSTRAINT IF EXISTS data_sources_source_type_check;
ALTER TABLE public.data_sources ADD CONSTRAINT data_sources_source_type_check 
    CHECK (source_type IN ('OCEAN_FORECAST', 'WEATHER_RADAR', 'SATELLITE_CHLOROPHYLL', 'MARITIME_BOUNDARY', 'BATHYMETRY', 'DEMO_SIMULATION', 'MULTI_DOMAIN_DEMO'));

INSERT INTO public.data_sources (name, dataset_name, source_type, status)
VALUES ('ORCA_DEMO', 'ORCA Multi-Domain Demo Snapshot', 'DEMO_SIMULATION', 'SIMULATED')
ON CONFLICT (name) DO UPDATE SET
    dataset_name = EXCLUDED.dataset_name,
    source_type = EXCLUDED.source_type,
    status = EXCLUDED.status;

CREATE UNIQUE INDEX IF NOT EXISTS uq_observations_dedup 
    ON public.observations (dataset_identifier, category, variable_name, observed_at, (COALESCE(raw_metadata->>'dedup_key', raw_metadata->>'region', 'default')));
