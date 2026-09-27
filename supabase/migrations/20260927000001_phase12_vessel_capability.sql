-- ==============================================================================
-- ORCA — PHASE 12: VESSEL CAPABILITY MODEL MIGRATION
-- Extends public.vessels with deterministic capability fields, threshold
-- provenance metadata, and safety constraints without altering existing contracts.
-- ==============================================================================

-- 1. Add capability fields if they do not exist
ALTER TABLE public.vessels
  ADD COLUMN IF NOT EXISTS operating_range_nm NUMERIC(6, 2) DEFAULT 30.0,
  ADD COLUMN IF NOT EXISTS max_operating_distance_nm NUMERIC(6, 2) DEFAULT 15.0,
  ADD COLUMN IF NOT EXISTS endurance_hours NUMERIC(5, 2) DEFAULT 12.0,
  ADD COLUMN IF NOT EXISTS fuel_capacity_liters NUMERIC(7, 2) DEFAULT 80.0,
  ADD COLUMN IF NOT EXISTS fuel_burn_rate_lph NUMERIC(5, 2) DEFAULT 6.5,
  ADD COLUMN IF NOT EXISTS min_crew INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_crew INT DEFAULT 6,
  ADD COLUMN IF NOT EXISTS beam_meters NUMERIC(5, 2) DEFAULT 2.2,
  ADD COLUMN IF NOT EXISTS draft_meters NUMERIC(5, 2) DEFAULT 1.1,
  ADD COLUMN IF NOT EXISTS cruising_speed_knots NUMERIC(4, 1) DEFAULT 7.0,
  ADD COLUMN IF NOT EXISTS safety_equipment JSONB DEFAULT '["VHF_RADIO", "LIFE_JACKETS", "BASIC_FIRST_AID"]'::jsonb,
  ADD COLUMN IF NOT EXISTS capability_profile_status TEXT DEFAULT 'ACTIVE' 
    CHECK (capability_profile_status IN ('ACTIVE', 'PENDING_SURVEY', 'RESTRICTED', 'INCOMPLETE')),
  ADD COLUMN IF NOT EXISTS capability_provenance JSONB DEFAULT '{
    "wave": {"status": "PROTOTYPE_ASSUMPTION", "source": "ORCA Prototype Indian Coastal Fishing Craft Parameters"},
    "wind": {"status": "PROTOTYPE_ASSUMPTION", "source": "ORCA Prototype Coastal Advisory Threshold"},
    "range": {"status": "VESSEL_SPECIFIC", "source": "Owner Registered Specification"},
    "endurance": {"status": "VESSEL_SPECIFIC", "source": "Engine & Fuel Tank Specification"}
  }'::jsonb;

-- 2. Index for capability querying
CREATE INDEX IF NOT EXISTS idx_vessels_capability_status 
  ON public.vessels(capability_profile_status);

COMMENT ON COLUMN public.vessels.operating_range_nm IS 'Maximum total round-trip distance capability in nautical miles';
COMMENT ON COLUMN public.vessels.max_operating_distance_nm IS 'Maximum safe single-leg distance from departure port/shoreline in nautical miles';
COMMENT ON COLUMN public.vessels.endurance_hours IS 'Maximum operational duration on full fuel/supplies at cruising speed';
COMMENT ON COLUMN public.vessels.capability_provenance IS 'Explicit classification of threshold provenance (OFFICIAL_SOURCED, VESSEL_SPECIFIC, PROTOTYPE_ASSUMPTION, UNKNOWN)';
