-- ORCA Phase 5: Domain Database Model Migration
-- Expands domain storage around complete ORCA mission lifecycle:
-- 1. mission_waypoints (ordered geographic route vertices)
-- 2. regions (reusable marine & operational zones)
-- 3. restricted_zones (marine protected areas, defence zones, hazard sectors)
-- 4. observations (normalized multi-agency ocean/weather/PFZ observations)
-- 5. alerts (operational safety alerts & lifecycle states)
-- 6. connectivity_events (field connectivity & telemetry tracking)
-- 7. decision_rules & decision_rule_evaluations (deterministic constraint foundation)
-- 8. replay_records (explainable audit & decision state reconstruction)

-- Ensure PostGIS is ready
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA extensions;

-- ==============================================================================
-- 1. MISSION WAYPOINTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mission_waypoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL CHECK (sequence_order >= 0),
    location extensions.geometry(Point, 4326) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL CHECK (latitude BETWEEN -90.0 AND 90.0),
    longitude NUMERIC(9, 6) NOT NULL CHECK (longitude BETWEEN -180.0 AND 180.0),
    waypoint_type TEXT NOT NULL DEFAULT 'TRANSIT' CHECK (waypoint_type IN ('ORIGIN', 'TRANSIT', 'FISHING_SPOT', 'HAZARD_AVOIDANCE', 'DESTINATION', 'PORT')),
    label TEXT,
    planned_eta TIMESTAMPTZ,
    planned_etd TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_mission_waypoint_seq UNIQUE (mission_id, sequence_order)
);

CREATE INDEX IF NOT EXISTS idx_mission_waypoints_mission ON public.mission_waypoints(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_waypoints_geom ON public.mission_waypoints USING GIST (location);
CREATE TRIGGER trg_mission_waypoints_updated_at
    BEFORE UPDATE ON public.mission_waypoints
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 2. REGIONS TABLE (Reusable Marine Geographic Regions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    region_type TEXT NOT NULL CHECK (region_type IN ('COASTAL_OPERATIONAL', 'FISHING_ZONE', 'RESEARCH', 'ADMINISTRATIVE', 'PORT_APPROACH')),
    boundary extensions.geometry(Geometry, 4326) NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DEMO_TEST')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regions_code ON public.regions(code);
CREATE INDEX IF NOT EXISTS idx_regions_status ON public.regions(status);
CREATE INDEX IF NOT EXISTS idx_regions_boundary_geom ON public.regions USING GIST (boundary);
CREATE TRIGGER trg_regions_updated_at
    BEFORE UPDATE ON public.regions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Seed Demo / Test Regions (Explicitly labeled as DEMO_TEST per rules)
INSERT INTO public.regions (code, name, region_type, boundary, status, metadata)
VALUES 
    (
        'DEMO_REGION_MAHARASHTRA_COAST',
        'Maharashtra Coastal Sector (Demo / Test Baseline)',
        'COASTAL_OPERATIONAL',
        extensions.ST_GeomFromText('POLYGON((72.0 18.0, 73.5 18.0, 73.5 20.0, 72.0 20.0, 72.0 18.0))', 4326),
        'DEMO_TEST',
        '{"is_demo": true, "harbors": ["Sassoon Docks", "Alibaug", "Ratnagiri"]}'::jsonb
    ),
    (
        'DEMO_REGION_TAMIL_NADU_COAST',
        'Tamil Nadu Coastal Sector (Demo / Test Baseline)',
        'COASTAL_OPERATIONAL',
        extensions.ST_GeomFromText('POLYGON((79.0 8.0, 81.0 8.0, 81.0 13.5, 79.0 13.5, 79.0 8.0))', 4326),
        'DEMO_TEST',
        '{"is_demo": true, "harbors": ["Chennai Kasimedu", "Tuticorin", "Cuddalore"]}'::jsonb
    )
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 3. RESTRICTED ZONES TABLE (Spatial Marine Hazard & Restricted Sectors)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.restricted_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    zone_type TEXT NOT NULL CHECK (zone_type IN ('MARINE_PROTECTED_AREA', 'MILITARY_DEFENCE_ZONE', 'HIGH_COLLISION_CORRIDOR', 'OFFSHORE_RIG_BUFFER', 'WEATHER_HAZARD_ZONE', 'INTERNATIONAL_BORDER_BUFFER')),
    severity TEXT NOT NULL DEFAULT 'WARNING' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'FORBIDDEN')),
    boundary extensions.geometry(Geometry, 4326) NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SEASONAL', 'DEMO_TEST')),
    effective_from TIMESTAMPTZ,
    effective_until TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restricted_zones_code ON public.restricted_zones(code);
CREATE INDEX IF NOT EXISTS idx_restricted_zones_severity ON public.restricted_zones(severity);
CREATE INDEX IF NOT EXISTS idx_restricted_zones_boundary_geom ON public.restricted_zones USING GIST (boundary);
CREATE TRIGGER trg_restricted_zones_updated_at
    BEFORE UPDATE ON public.restricted_zones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Seed Demo Restricted Zones (Explicitly labeled as DEMO_TEST per rules)
INSERT INTO public.restricted_zones (code, name, zone_type, severity, boundary, status, metadata)
VALUES
    (
        'DEMO_ZONE_MALVAN_MPA',
        'Malvan Marine Sanctuary Buffer (Demo / Test Baseline)',
        'MARINE_PROTECTED_AREA',
        'FORBIDDEN',
        extensions.ST_GeomFromText('POLYGON((73.40 15.95, 73.55 15.95, 73.55 16.10, 73.40 16.10, 73.40 15.95))', 4326),
        'DEMO_TEST',
        '{"is_demo": true, "restriction_reason": "Biodiversity protection and no-trawling zone."}'::jsonb
    ),
    (
        'DEMO_ZONE_BOMBAY_HIGH_BUFFER',
        'Offshore Platform Exclusion Sector (Demo / Test Baseline)',
        'OFFSHORE_RIG_BUFFER',
        'FORBIDDEN',
        extensions.ST_GeomFromText('POLYGON((71.20 19.30, 71.50 19.30, 71.50 19.60, 71.20 19.60, 71.20 19.30))', 4326),
        'DEMO_TEST',
        '{"is_demo": true, "exclusion_radius_nm": 5}'::jsonb
    )
ON CONFLICT (code) DO NOTHING;

-- ==============================================================================
-- 4. OBSERVATIONS TABLE (Normalized Multi-Agency Environmental Data)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
    dataset_identifier TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('OCEAN', 'WEATHER', 'PFZ', 'GEO_SAFETY', 'VESSEL_TRAFFIC', 'HAZARD')),
    variable_name TEXT NOT NULL,
    numeric_value NUMERIC(10, 4),
    unit TEXT,
    structured_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    location extensions.geometry(Point, 4326),
    coverage_area extensions.geometry(Geometry, 4326),
    observed_at TIMESTAMPTZ NOT NULL,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (status IN ('LIVE', 'INTEGRATED', 'DEMO_SNAPSHOT', 'CACHED', 'STALE', 'UNAVAILABLE', 'VERIFIED')),
    quality_level TEXT NOT NULL DEFAULT 'HIGH' CHECK (quality_level IN ('HIGH', 'MEDIUM', 'LOW', 'DEGRADED')),
    uncertainty_range JSONB,
    raw_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_observations_category ON public.observations(category);
CREATE INDEX IF NOT EXISTS idx_observations_var_time ON public.observations(variable_name, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_observations_source ON public.observations(source_id);
CREATE INDEX IF NOT EXISTS idx_observations_location ON public.observations USING GIST (location);

-- ==============================================================================
-- 5. ALERTS TABLE (Operational Marine & Cyclone Alerts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('CYCLONE_WARNING', 'HIGH_WAVE_SWELL', 'GALE_WIND', 'BORDER_PROXIMITY', 'RESTRICTED_ZONE_BREACH', 'PFZ_OPPORTUNITY', 'COMMUNICATION_DROPOUT')),
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'ADVISORY', 'WARNING', 'CRITICAL', 'EMERGENCY')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'EXPIRED')),
    location extensions.geometry(Geometry, 4326),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status_severity ON public.alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_alerts_mission ON public.alerts(mission_id);
CREATE INDEX IF NOT EXISTS idx_alerts_time_window ON public.alerts(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_alerts_location ON public.alerts USING GIST (location);
CREATE TRIGGER trg_alerts_updated_at
    BEFORE UPDATE ON public.alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. CONNECTIVITY EVENTS TABLE (Telemetry & Offline Transition Log)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.connectivity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    connectivity_state TEXT NOT NULL CHECK (connectivity_state IN ('CONNECTED', 'DEGRADED', 'OFFLINE', 'SAFETY_MESSAGE_RECEIVED')),
    network_bearer TEXT CHECK (network_bearer IN ('CELLULAR_4G_5G', 'CELLULAR_2G', 'NAVIC_RECEIVER', 'SATELLITE_MSG', 'BLUETOOTH_MESH', 'NONE')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    recovered_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_connectivity_profile ON public.connectivity_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_connectivity_mission ON public.connectivity_events(mission_id);
CREATE INDEX IF NOT EXISTS idx_connectivity_time ON public.connectivity_events(occurred_at DESC);

-- ==============================================================================
-- 7. DECISION RULES & RULE EVALUATIONS (Deterministic Constraint Foundation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.decision_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('SAFETY_OVERRIDE', 'VESSEL_CAPABILITY', 'METEOROLOGY', 'OCEANOGRAPHY', 'GEOSPATIAL_BOUNDARY', 'FISHERIES_UTILITY', 'DATA_INTEGRITY')),
    priority_order INT NOT NULL DEFAULT 100,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    version TEXT NOT NULL DEFAULT '1.0.0',
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decision_rules_category_priority ON public.decision_rules(category, priority_order ASC);
CREATE TRIGGER trg_decision_rules_updated_at
    BEFORE UPDATE ON public.decision_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Seed canonical baseline deterministic decision rules
INSERT INTO public.decision_rules (rule_code, name, category, priority_order, is_enabled, version, parameters, description)
VALUES
    (
        'RULE_CYCLONE_RED_ALERT',
        'Official IMD / INCOIS Cyclone Red Alert Override',
        'SAFETY_OVERRIDE',
        10,
        true,
        '1.0.0',
        '{"action": "AVOID", "mandatory": true}'::jsonb,
        'Strict safety override: If an active cyclone warning exists in sector, verdict is forced to AVOID regardless of fishing opportunity.'
    ),
    (
        'RULE_RESTRICTED_ZONE_BREACH',
        'Marine Protected Area or Defence Zone Geofence Breach',
        'GEOSPATIAL_BOUNDARY',
        20,
        true,
        '1.0.0',
        '{"action": "AVOID", "buffer_km": 1.0}'::jsonb,
        'Prohibits navigation or fishing trajectories intersecting forbidden maritime sanctuaries or defence sectors.'
    ),
    (
        'RULE_WAVE_HEIGHT_VESSEL_LIMIT',
        'Significant Wave Height Exceeds Vessel Capability Threshold',
        'VESSEL_CAPABILITY',
        30,
        true,
        '1.0.0',
        '{"unit": "meters", "default_threshold": 2.0}'::jsonb,
        'Evaluates forecast significant wave height against specific craft hull and length tolerance limits.'
    ),
    (
        'RULE_WIND_GUST_LIMIT',
        'Sustained Wind Speed or Gust Exceeds Safety Envelope',
        'METEOROLOGY',
        40,
        true,
        '1.0.0',
        '{"unit": "knots", "default_threshold": 22.0}'::jsonb,
        'Restricts voyage clearance when surface winds or convective gust fronts threaten vessel stability.'
    ),
    (
        'RULE_PFZ_HARVEST_WINDOW',
        'Potential Fishing Zone High Chlorophyll / SST Gradient Utility',
        'FISHERIES_UTILITY',
        80,
        true,
        '1.0.0',
        '{"min_confidence": 60}'::jsonb,
        'Scores economic opportunity of identified PFZ zones when all preceding safety constraints are satisfied.'
    )
ON CONFLICT (rule_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.decision_rule_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES public.decisions(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES public.decision_rules(id) ON DELETE RESTRICT,
    evaluation_result TEXT NOT NULL CHECK (evaluation_result IN ('PASSED', 'FAILED', 'WARNING', 'SKIPPED', 'INSUFFICIENT_DATA')),
    input_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    threshold_evaluated JSONB,
    reason TEXT NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rule_evals_decision ON public.decision_rule_evaluations(decision_id);
CREATE INDEX IF NOT EXISTS idx_rule_evals_rule ON public.decision_rule_evaluations(rule_id);

-- ==============================================================================
-- 8. REPLAY RECORDS TABLE (Audit & Decision Explainability Timeline)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.replay_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
    execution_run_id TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('ORCA_QUERY_EXECUTED', 'DECISION_EVALUATED', 'ALERT_TRIGGERED', 'ROUTE_WAYPOINT_REACHED', 'CONNECTIVITY_TRANSITION')),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    input_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_replay_mission ON public.replay_records(mission_id);
CREATE INDEX IF NOT EXISTS idx_replay_decision ON public.replay_records(decision_id);
CREATE INDEX IF NOT EXISTS idx_replay_time ON public.replay_records(recorded_at DESC);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.mission_waypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricted_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connectivity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_rule_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replay_records ENABLE ROW LEVEL SECURITY;

-- 9.1 Mission waypoints (Gated strictly by mission ownership)
CREATE POLICY "Users can view waypoints for their missions"
    ON public.mission_waypoints FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = mission_waypoints.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert waypoints for their missions"
    ON public.mission_waypoints FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = mission_waypoints.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update waypoints for their missions"
    ON public.mission_waypoints FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = mission_waypoints.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = mission_waypoints.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete waypoints for their missions"
    ON public.mission_waypoints FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = mission_waypoints.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

-- 9.2 Public / Reference Datasets (Read-only for users; server-side write only)
CREATE POLICY "Regions are viewable by all authenticated users and anon"
    ON public.regions FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Restricted zones are viewable by all authenticated users and anon"
    ON public.restricted_zones FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Observations are viewable by all authenticated users and anon"
    ON public.observations FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Decision rules are viewable by all authenticated users and anon"
    ON public.decision_rules FOR SELECT
    TO authenticated, anon
    USING (true);

-- 9.3 Alerts Policies (Mission-targeted vs broadcast alerts)
CREATE POLICY "Users can view alerts for their missions or broadcast alerts"
    ON public.alerts FOR SELECT
    TO authenticated, anon
    USING (
        mission_id IS NULL OR
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = alerts.mission_id
            AND public.missions.owner_id = auth.uid()
        ))
    );

CREATE POLICY "Users can acknowledge their alerts"
    ON public.alerts FOR UPDATE
    TO authenticated
    USING (
        mission_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = alerts.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        mission_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = alerts.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

-- 9.4 Connectivity Events (User & Mission ownership)
CREATE POLICY "Users can view their connectivity events"
    ON public.connectivity_events FOR SELECT
    TO authenticated
    USING (
        profile_id = auth.uid() OR
        (mission_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = connectivity_events.mission_id
            AND public.missions.owner_id = auth.uid()
        ))
    );

CREATE POLICY "Users can insert their connectivity events"
    ON public.connectivity_events FOR INSERT
    TO authenticated
    WITH CHECK (
        profile_id = auth.uid() OR
        (mission_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = connectivity_events.mission_id
            AND public.missions.owner_id = auth.uid()
        ))
    );

-- 9.5 Decision Rule Evaluations (Access via decision and mission ownership)
CREATE POLICY "Users can view rule evaluations for their decisions"
    ON public.decision_rule_evaluations FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.decisions
            JOIN public.missions ON public.missions.id = public.decisions.mission_id
            WHERE public.decisions.id = decision_rule_evaluations.decision_id
            AND public.missions.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert rule evaluations for their decisions"
    ON public.decision_rule_evaluations FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.decisions
            JOIN public.missions ON public.missions.id = public.decisions.mission_id
            WHERE public.decisions.id = decision_rule_evaluations.decision_id
            AND public.missions.owner_id = auth.uid()
        )
    );

-- 9.6 Replay Records (Access via mission ownership)
CREATE POLICY "Users can view replay records for their missions"
    ON public.replay_records FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = replay_records.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert replay records for their missions"
    ON public.replay_records FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.missions
            WHERE public.missions.id = replay_records.mission_id
            AND public.missions.owner_id = auth.uid()
        )
    );

-- ==============================================================================
-- 10. GRANTS
-- ==============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_waypoints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connectivity_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.replay_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decision_rule_evaluations TO authenticated;

GRANT SELECT ON public.regions TO authenticated, anon;
GRANT SELECT ON public.restricted_zones TO authenticated, anon;
GRANT SELECT ON public.observations TO authenticated, anon;
GRANT SELECT ON public.decision_rules TO authenticated, anon;
GRANT SELECT, UPDATE ON public.alerts TO authenticated;
GRANT SELECT ON public.alerts TO anon;
