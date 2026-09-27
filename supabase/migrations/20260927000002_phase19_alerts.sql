-- ==============================================================================
-- ORCA SIH 2026 — Phase 19: Alerts + Disaster Intelligence
-- Migration: 20260927000002_phase19_alerts.sql
-- ==============================================================================

-- 1. Extend alerts table with Phase 19 attributes if not present
ALTER TABLE IF EXISTS public.alerts
    ADD COLUMN IF NOT EXISTS fingerprint TEXT,
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'WEATHER_MARINE',
    ADD COLUMN IF NOT EXISTS action_recommendation TEXT,
    ADD COLUMN IF NOT EXISTS affected_area JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS affected_vessel_ids TEXT[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS affected_mission_ids TEXT[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS evidence_ids TEXT[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS rule_ids TEXT[] DEFAULT '{}'::text[],
    ADD COLUMN IF NOT EXISTS dataset TEXT,
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS resolution_note TEXT,
    ADD COLUMN IF NOT EXISTS provenance JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS confidence JSONB DEFAULT '{}'::jsonb;

-- 2. Update status check constraint if possible
DO $$
BEGIN
    ALTER TABLE public.alerts DROP CONSTRAINT IF EXISTS alerts_status_check;
    ALTER TABLE public.alerts ADD CONSTRAINT alerts_status_check
        CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'EXPIRED', 'SUPPRESSED'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 3. Indexes for fast retrieval, deduplication, and lifecycle filtering
CREATE INDEX IF NOT EXISTS idx_alerts_fingerprint ON public.alerts(fingerprint);
CREATE INDEX IF NOT EXISTS idx_alerts_status_valid_until ON public.alerts(status, valid_until);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at_desc ON public.alerts(created_at DESC);

-- 4. RLS update: allow authorized staff / operators to acknowledge/resolve alerts
DROP POLICY IF EXISTS "Users can acknowledge their alerts" ON public.alerts;

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

CREATE POLICY "Authenticated users can acknowledge or resolve alerts"
    ON public.alerts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
