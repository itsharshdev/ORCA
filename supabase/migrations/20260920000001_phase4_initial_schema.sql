-- ORCA Phase 4: Initial Schema Migration
-- Sets up core tables: profiles, vessels, data_sources, missions, decisions, evidence
-- Configures PostGIS spatial types, indexes, Row-Level Security (RLS) policies, and grants.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA extensions;

-- ==============================================================================
-- 1. PROFILES TABLE (Linked directly to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'fisherman' CHECK (role IN ('fisherman', 'fleet_operator', 'admin', 'scientist')),
    phone TEXT,
    home_port TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'fisherman')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. VESSELS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    registration_number TEXT,
    vessel_type TEXT NOT NULL CHECK (vessel_type IN ('TRADITIONAL_NON_MOTORIZED', 'MOTORIZED_TRADITIONAL', 'FRP_BOAT', 'MECHANIZED_TRAWLER', 'DEEP_SEA_VESSEL')),
    length_meters NUMERIC(5, 2),
    engine_hp NUMERIC(6, 2),
    max_safe_wind_knots NUMERIC(4, 1),
    max_safe_wave_meters NUMERIC(4, 1),
    capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vessels_owner ON public.vessels(owner_id);
CREATE TRIGGER trg_vessels_updated_at
    BEFORE UPDATE ON public.vessels
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 3. DATA SOURCES REGISTRY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    dataset_name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('OCEAN_FORECAST', 'WEATHER_RADAR', 'SATELLITE_CHLOROPHYLL', 'MARITIME_BOUNDARY', 'BATHYMETRY')),
    endpoint TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEGRADED', 'OFFLINE', 'SIMULATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_sources_status ON public.data_sources(status);

-- Seed baseline data source entries
INSERT INTO public.data_sources (name, dataset_name, source_type, status)
VALUES 
    ('INCOIS_OSF', 'Ocean State Forecast', 'OCEAN_FORECAST', 'SIMULATED'),
    ('IMD_WEATHER', 'High-Resolution Weather Forecast', 'WEATHER_RADAR', 'SIMULATED'),
    ('INCOIS_PFZ', 'Potential Fishing Zone Advisories', 'SATELLITE_CHLOROPHYLL', 'SIMULATED'),
    ('GEOSAFETY_REGISTRY', 'Maritime Safety Boundaries & Marine Protected Areas', 'MARITIME_BOUNDARY', 'ACTIVE')
ON CONFLICT (name) DO UPDATE SET
    dataset_name = EXCLUDED.dataset_name,
    source_type = EXCLUDED.source_type,
    status = EXCLUDED.status;

-- ==============================================================================
-- 4. MISSIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    mission_type TEXT NOT NULL DEFAULT 'FISHING' CHECK (mission_type IN ('FISHING', 'TRANSIT', 'SURVEY', 'TRAINING')),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ABORTED')),
    origin_location extensions.geometry(Point, 4326),
    destination_location extensions.geometry(Point, 4326),
    target_zone_id TEXT,
    departure_time TIMESTAMPTZ,
    duration_hours NUMERIC(5, 2),
    max_distance_km NUMERIC(6, 2),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_missions_owner ON public.missions(owner_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_origin_geom ON public.missions USING GIST (origin_location);
CREATE INDEX IF NOT EXISTS idx_missions_destination_geom ON public.missions USING GIST (destination_location);

CREATE TRIGGER trg_missions_updated_at
    BEFORE UPDATE ON public.missions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. DECISIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    decision_id TEXT UNIQUE,
    verdict TEXT NOT NULL CHECK (verdict IN ('GO', 'CAUTION', 'AVOID', 'INSUFFICIENT_DATA')),
    confidence NUMERIC(5, 2) NOT NULL,
    advisory_level TEXT NOT NULL CHECK (advisory_level IN ('SAFE', 'WARNING', 'DANGER', 'UNKNOWN')),
    primary_reason TEXT NOT NULL,
    concise_recommendation TEXT NOT NULL,
    provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decisions_mission ON public.decisions(mission_id);
CREATE INDEX IF NOT EXISTS idx_decisions_verdict ON public.decisions(verdict);
CREATE TRIGGER trg_decisions_updated_at
    BEFORE UPDATE ON public.decisions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. EVIDENCE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
    source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('WAVE_HEIGHT', 'WIND_SPEED', 'CURRENT_DRIFT', 'PFZ_SST_GRADIENT', 'CYCLONE_ALERT', 'ZONE_RESTRICTION', 'VISIBILITY')),
    observation JSONB NOT NULL,
    freshness_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    quality_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (quality_status IN ('VERIFIED', 'ESTIMATED', 'UNCERTAIN', 'DEGRADED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_decision ON public.evidence(decision_id);
CREATE INDEX IF NOT EXISTS idx_evidence_source ON public.evidence(source_id);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

-- 7.1 Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 7.2 Vessels policies
CREATE POLICY "Users can view their own vessels"
    ON public.vessels FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own vessels"
    ON public.vessels FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own vessels"
    ON public.vessels FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own vessels"
    ON public.vessels FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- 7.3 Data sources policies (Public/authenticated read-only)
CREATE POLICY "Data sources registry is viewable by all authenticated users and anon"
    ON public.data_sources FOR SELECT
    TO authenticated, anon
    USING (true);

-- 7.4 Missions policies
CREATE POLICY "Users can view their own missions"
    ON public.missions FOR SELECT
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own missions"
    ON public.missions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own missions"
    ON public.missions FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own missions"
    ON public.missions FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- 7.5 Decisions policies (Access via mission ownership)
CREATE POLICY "Users can view decisions for their own missions"
    ON public.decisions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = decisions.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert decisions for their own missions"
    ON public.decisions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = decisions.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

-- 7.6 Evidence policies (Access via decision and mission ownership)
CREATE POLICY "Users can view evidence for their own decisions"
    ON public.evidence FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.decisions
            JOIN public.missions ON public.missions.id = public.decisions.mission_id
            WHERE public.decisions.id = evidence.decision_id
            AND public.missions.owner_id = auth.uid()
        )
    );

-- ==============================================================================
-- 8. GRANTS
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vessels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.missions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decisions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence TO authenticated;

GRANT SELECT ON public.data_sources TO authenticated, anon;
