# ORCA SESSION STATE

## Current phase
PHASE 19 — ALERTS + DISASTER INTELLIGENCE (Completed & Verified)

## Status
PHASE 19 COMPLETED & SYSTEMATICALLY VERIFIED.
- **Previous Phases Audited (Phases 0–18)**: Audited against live repository source code, automated test suites, database migrations, and runtime verification. Phase 18 What-If Scenario Intelligence verified.
- **Phase 19 Alerts + Disaster Intelligence**:
  - Implemented typed, deterministic alert intelligence architecture tied strictly to:
    `OBSERVATION → EVIDENCE → RULE → DECISION/IMPACT → ALERT → ACKNOWLEDGEMENT → HISTORY`.
  - Core service `AlertService` (`server/services/alertService.ts`):
    - Deterministic evaluation engine consuming live multi-agency feeds (`INCOIS OSF`, `INCOIS PFZ`, `IMD WEATHER`, `ORCA GIS SAFETY ENGINE`, `VESSEL CAPABILITY`).
    - Deterministic fingerprinting (`source|alertType|affectedArea|ruleId|windowTag`) enabling automated refresh of active alerts on update instead of duplicate spam.
    - Deterministic severity assignment (`CRITICAL`, `WARNING`, `ADVISORY`, `INFO`) driven strictly by evaluated rules (e.g. DG Shipping wave limits, PostGIS security buffers), with LLMs completely prohibited from assigning severity or fabricating hazards.
    - Full lifecycle management: `ACTIVE` → `ACKNOWLEDGED` → `RESOLVED` / `EXPIRED` / `SUPPRESSED`.
    - Expiry evaluation honoring `validFrom` and `validUntil`.
    - Safety separation: `INCOIS PFZ` remains an ecological opportunity and is strictly forbidden from triggering safety hazard alerts.
    - IMD integration honesty: IMD weather remains truthfully tagged `ACCESS_PENDING / DEMO` with zero false claims.
  - REST API Endpoints (`server/routes/alerts.ts`):
    - `GET /api/v1/alerts`: Filter by status, severity, category, alertType, vesselId, missionId.
    - `GET /api/v1/alerts/:id`: 4-level progressive disclosure audit payload (Alert + Audited Evidence + Rule Evaluations + Workflow History).
    - `POST /api/v1/alerts/:id/acknowledge`: Operator acknowledgement with role-based validation.
    - `POST /api/v1/alerts/:id/resolve`: Incident resolution with required operator justification note.
    - `POST /api/v1/alerts/evaluate`: Internal deterministic alert re-evaluation engine.
  - Supabase Persistence & RLS (`supabase/migrations/20260927000002_phase19_alerts.sql`):
    - Added columns: `fingerprint`, `category`, `affected_area`, `affected_vessel_ids`, `affected_mission_ids`, `evidence_ids`, `rule_ids`, `dataset`, `resolved_at`, `resolved_by`, `resolution_note`, `provenance`, and `confidence`.
    - RLS policies enforcing public/operator read access and role-restricted acknowledgment and resolution mutations.
  - Role-Specific Frontend Experiences:
    - **Fisherman View** (`src/pages/AlertsPage.tsx`, `AlertCard.tsx`): Plain-language, prioritized, action-oriented directives with clear validity windows and no raw code clutter.
    - **Coastal Authority View** (`src/pages/authority/AuthorityDashboardPage.tsx`): Tactical boundary tracking, affected vessel IDs, multi-category filters, and 4-level audit traces.
    - **Disaster Management Workspace** (`src/pages/disaster/DisasterManagementPage.tsx`): Structured workspace (`ACTIVE HAZARDS → TACTICAL MAP → AFFECTED ASSETS → DETAIL → EVIDENCE → ACKNOWLEDGE/RESOLVE`).
    - **Progressive Disclosure Modal** (`src/components/alerts/AlertDetailModal.tsx`): Level 1 (What/Where/Severity/Validity/Action), Level 2 (Why/Driver/Provenance), Level 3 (Audited Evidence), Level 4 (Deterministic Rule Trace).
  - Quality Gates: Vitest 270/270 passed across 18 suites; Server typecheck passed (0 errors); Client typecheck passed (0 errors); ESLint passed (0 errors, 0 warnings); Production build passed; Real Chrome CDP verification passed (all 22 interactions, desktop + mobile 375x812, 0 console errors); Honesty audit passed.
- **Phase 18 What-If / Scenario Intelligence**:
  - Implemented real deterministic scenario re-evaluation pipeline via `ScenarioService` (`server/services/scenarioService.ts`):
    `BASELINE &rarr; Immutable Baseline Capture &rarr; Structured Scenario Delta &rarr; Specialist Re-evaluation (GIS, Vessel Limits, Oceanography, Meteorology, Assumptions) &rarr; Deterministic Decision Engine &rarr; Audited Evidence Aggregation &rarr; Structured Rule & Evidence Delta &rarr; Grounded Natural Language Difference Explanation &rarr; Actionable Scenario Advice`.
  - Strongly typed What-If domain contract (`src/types/contract.ts`, `server/schemas/apiSchemas.ts`):
    - `POST /api/v1/scenarios/evaluate` supporting natural-language scenario strings (*"What if I leave at 2 PM?"*, *"What if the trip is only 3 hours?"*, *"What if I use VESSEL-002?"*, *"What if I avoid this restricted area?"*, *"What if wave height increases to 2.5 metres?"*) or structured overrides.
    - Classifies scenarios into: `TIME_CHANGE`, `DURATION_CHANGE`, `VESSEL_CHANGE`, `ROUTE_CHANGE`, `ENVIRONMENTAL_ASSUMPTION`, `COMBINED_CHANGE`, and `CUSTOM`.
    - Returns structured delta badges, rule comparison (`newlyTriggeredRules`, `noLongerTriggeredRules`, `persistingRules`), evidence differences, and grounded rationale.
  - **Mandatory Safety Invariants Enforced**:
    - The LLM translates/explains scenario differences but **NEVER directly decides whether a scenario is safe**.
    - The deterministic `DecisionEngineService` remains the sole, unbypassable safety authority.
    - Opportunity (INCOIS PFZ) never overrides safety `AVOID`.
    - Hypothetical condition assumptions (e.g. wave = 2.5m) are strictly labeled `HYPOTHETICAL ASSUMPTION` with alert styling and isolated from verified observations.
    - Official IMD weather remains truthfully `ACCESS_PENDING / DEMO` with zero false live claims.
  - **Frontend Tidal Light What-If Experience**:
    - Added interactive `ScenarioComparisonCard` (`src/components/decision/ScenarioComparisonCard.tsx`) to Ask ORCA (`src/pages/AskOrcaPage.tsx`).
    - Side-by-side visual comparison: `CURRENT DECISION (BASELINE)` vs `WHAT-IF SCENARIO RESULT` with transition indicators (`GO &rarr; CAUTION`).
    - What Changed delta chips, grounded operational rationale for delta, progressive disclosure tabs for deterministic rule comparisons and audited evidence deltas.
- **Quality Gates & Automated Testing**:
  - Vitest: **250 / 250 passing tests** across 17 test files (including 20 dedicated Phase 18 scenario tests in `server/__tests__/phase18_scenarios.test.ts`).
  - Server Typecheck: `npm run server:typecheck` &rarr; 0 errors.
  - ESLint: `npm run lint` &rarr; 0 errors, 0 warnings.
  - Production Build: `npm run build` &rarr; Clean production build with PWA service worker precache.
  - Real Chrome CDP Browser Verification: Real Chrome browser automation verified `/ask`, baseline submission, 3 interactive scenarios (departure time shift, vessel change, hypothetical wave assumption), side-by-side card rendering, delta badges, progressive disclosure tabs, mobile 375x812 viewport (0px overflow, 30 active buttons), network request interception (`POST /scenarios/evaluate`), and 0 console errors.
- **Phase 9.2 External Blocker**:
  - Official IMD API institutional credentials remain pending. Truthfully tagged in evidence and UI as `ACCESS_PENDING / DEMO`. Zero fabricated live weather claims.


## Baseline
Observed stack:
- Backend: Fastify (`^5.12.5`), `@supabase/supabase-js` (`^2.116.0`), Zod (`^4.6.5`), `@fastify/cors` (`^11.3.0`), `dotenv` (`^18.0.0`)
- Database: Supabase PostgreSQL 17 (`hxhnerghnpdrijzyhmuw`), PostGIS 3.3.7, 16 domain tables with RLS enabled, persisted multi-agency observations in `public.observations` (`INCOIS_OSF`, `IMD_WEATHER`, `INCOIS_PFZ`, `ORCA_DEMO` with PostGIS geometry points)
- Testing: Vitest (`^5.0.1`), tsx (`^4.23.13`) — 133 passing tests across 11 suites (including 21 comprehensive vessel capability tests and 13 GIS safety tests)
- Frontend: React 19 (`^19.2.8`), TypeScript 6 (`~6.0.2`), Vite 8 (`^8.2.2`), React Router 7 (`^7.18.3`), Tailwind CSS 4 (`^4.3.3`), Leaflet (`^1.9.4`), Turf.js (`^7.4.0`), vite-plugin-pwa (`^1.3.0`)

Existing important systems:
- Phase 1 Codebase Audit: [ORCA_CODEBASE_AUDIT.md](file:///d:/Projects/ORCA/ORCA_CODEBASE_AUDIT.md)
- Phase 2 Canonical API Contract: [ORCA_API_CONTRACT.md](file:///d:/Projects/ORCA/ORCA_API_CONTRACT.md)
- Phase 2 Shared Domain Types: [src/types/contract.ts](file:///d:/Projects/ORCA/src/types/contract.ts)
- Phase 3 Backend Server: Fastify application in `server/`, typed routes (`/health`, `/me`, `/orca/query`, `/decisions/:id`), Zod request validation, predictable error envelopes.
- Phase 4 Supabase Foundation: Version-controlled migrations in `supabase/migrations/` (`profiles`, `vessels`, `data_sources`, `missions`, `decisions`, `evidence`), PostGIS spatial indexes, strict Row-Level Security (RLS) policies, grants, Supabase Auth integration, and authenticated mission persistence vertical slice.
- Phase 5 Domain Database Model: Expanded domain schema covering mission waypoints, regions, restricted zones, normalized multi-agency observations, operational alerts, connectivity telemetry events, deterministic decision rules & evaluations, and explainable replay timeline records (`supabase/migrations/20260920000003_phase5_domain_model.sql`).
- Phase 6 Data Adapter Framework: Source-agnostic `DataAdapter<TQuery, TResult>` abstraction, `DemoDataAdapter` consuming local datasets, global `adapterRegistry`, timeout error boundary wrapper, and `/adapters` inspection endpoints.
- Phase 6.9 Collaboration Handoff: [ORCA_PHASE_69_UI_HANDOFF.md](file:///d:/Projects/ORCA/ORCA_PHASE_69_UI_HANDOFF.md)
- Phase 7 Ingestion Pipeline: `IngestionService` (`server/services/ingestionService.ts`), idempotent deduplication, `POST /api/v1/ingestion/demo`, `GET /api/v1/observations` with filtering & pagination.
- Phase 8 INCOIS OSF Integration: `IncoisOsfAdapter` (`server/adapters/incoisOsfAdapter.ts`), ERDDAP REST TableDAP parser, `POST /api/v1/ingestion/incois`, unit conversions, live/demo status integrity, and upgraded `PersistedObservationPanel` HUD.
- Phase 9 & 9.1 IMD Weather & Marine Warnings: `ImdWeatherAdapter` (`server/adapters/imdWeatherAdapter.ts`) aligned with official IMD endpoints (`/api/v1/coastalbulletin`, `/api/v1/current_wx`), API key header support (`IMD_API_KEY`), Zod validation for direct array and composite payloads, `POST /api/v1/ingestion/imd`, warning validity handling (STALE/DEGRADED for expired alerts), and truthful UI metrics.
- Phase 9.2 IMD Live Access Verification (OPEN): Audited official IMD API reference portal (`https://api.imd.gov.in/public/api_reference.html`), verified dual-header API gateway authentication (`X-Api-Key` + `Authorization: Bearer <JWT>`), tested live upstream responses, confirmed zero false live claims and graceful fallback behavior. Remains open pending provision of institutional credentials.
- Phase 10 Live INCOIS PFZ / Fisheries Intelligence: Discovered and integrated official INCOIS GeoServer WFS endpoints (`PFZ_Automation:pfzlines`, `PFZ_LandingCentres:LandingCenters_29Apr2024`), implemented `IncoisPfzAdapter`, normalized multi-line geometries, calculated mission-aware distance/bearing/direction/relevance, added `GET /api/v1/pfz` & `POST /api/v1/ingestion/pfz`, enforced strict safety separation, built `PfzOpportunityPanel` HUD, and verified live 27-feature response & persistence.
- Phase 11 Deterministic GIS Safety Layer & UI Clarity: Built `GisSafetyService` (`server/services/gisSafetyService.ts`) with point-in-polygon, route line intersection, configurable safety buffers (1.0 km violation / 2.5 km caution), projected track calculations, and strict Safety Precedence Engine (`PFZ = OPPORTUNITY`, `GIS SAFETY = CONSTRAINT`). Exposed `POST /api/v1/gis/evaluate-route` and `GET /api/v1/gis/restricted-zones`. Replaced confusing global "DEMO SNAPSHOT" badge with truthful `DataSourceStatusBar` (INCOIS PFZ LIVE, INCOIS OSF LIVE, IMD WEATHER DEMO/PENDING, GIS SAFETY DETERMINISTIC), created fisherman-first `TripSafetyHUD`, and enhanced map cartography popups to strictly distinguish Opportunities from Constraints.
- Phase 12+ Frontend Master Redesign: Replaced active React routing and layout with the Stitch **TIDAL LIGHT** design system across all pages and workspaces.

## Current Branch
`orca-core`

## Immediate Next Task
Await user manual review and git commit/push. (Phase 9.2 remains OPEN for IMD credentials).



---

## Developer Learning Notes — Phase 2

### 1. What an API Contract Is
An API contract is a formal agreement between two software systems (here: the React frontend and the Fastify backend) that defines the exact structure of data exchanged: endpoint URLs, HTTP methods, request parameters, JSON response fields, data types, and error codes. Just like a legal contract, neither side can unilaterally change field names or types without breaking the system.

### 2. Request vs Response
- **Request:** The message sent by the client (frontend) to the server asking for an action or data (e.g. `POST /api/v1/orca/query` carrying `{ queryText: "Can I fish tomorrow?", vesselId: "VESSEL-001" }`).
- **Response:** The message returned by the server containing an HTTP status code (e.g. `200 OK`, `422 Unprocessable Entity`), headers, and the payload (e.g. `{ decision: { verdict: "CAUTION", confidence: 78.4 } }`).

### 3. Why Frontend/Backend Separation Matters in ORCA
1. **Safety Integrity:** Critical safety decisions must never execute inside the user's browser where code could be tampered with or corrupted by device lag.
2. **Heavy Data Ingestion:** Satellite rasters (SST/Chlorophyll from MOSDAC/INCOIS) and radar feeds are multi-megabyte streams that the backend must download, clip, and normalize before serving lightweight summaries to fishermen on low-bandwidth 2G/4G coastal links.
3. **UI Flexibility:** The frontend can be swapped, tested, or ported to mobile (PWA, Android) without rewriting the core multi-agent reasoning or database layer.

### 4. What a Schema / Type Does
A TypeScript interface or JSON schema acts as a strict blueprint. It tells the compiler and runtime:
- Which fields are **required** (e.g. `verdict: "GO" | "CAUTION" | "AVOID" | "INSUFFICIENT_DATA"`).
- Which fields are **optional or nullable** (e.g. `targetZoneId?: string | null`).
- The exact **data type and unit** (e.g. `waveHeightMeters: number`).
This eliminates "magic undefined values" and runtime crashes.

### 5. How `/orca/query` Flows Through the Architecture
```
Operator Query (Text or Form Parameters)
   ↓
API Route (POST /api/v1/orca/query)
   ↓
Mission Planner Agent (Extracts duration, departure time, craft limits)
   ↓
Parallel Specialist Agents (Fetch normalized Ocean, Weather, PFZ, Geo data)
   ↓
Evidence Extractor (Builds structured provenance records)
   ↓
Deterministic Decision Engine (Evaluates safety rules: overrides > physical limits > PFZ utility)
   ↓
Response Formatter (Emits Verdict + Confidence Score + Agent Trace + Map Context)
   ↓
Frontend Displays Result (Updates DecisionCard, Map Canvas, and ReasoningChain without reload)
```

### 6. Three Likely Failure / Debugging Situations
1. **Missing Data Stream / Timeout (`INSUFFICIENT_DATA`):** An external agency feed (e.g. IMD radar) is offline. The system must not crash or pretend it is safe; it must cleanly return `verdict: "INSUFFICIENT_DATA"` and advise the fisherman to stay ashore.
2. **Type/Field Name Mismatch (`400 Bad Request`):** The frontend sends `wave_height` (snake_case) while the backend expects `waveHeightMeters` (camelCase with units). The strict contract catches this during validation.
3. **Safety Override Conflict:** A high-value Potential Fishing Zone (PFZ) is detected, but wind gusts exceed 25 kts. A junior developer might wonder why the verdict is `AVOID`. The deterministic rule hierarchy guarantees that safety overrides opportunity every time.

### 7. Five Questions a Developer Should Be Able to Answer
1. *What are the four immutable decision states in ORCA?* (`GO`, `CAUTION`, `AVOID`, `INSUFFICIENT_DATA`).
2. *Can a high PFZ fishing opportunity score override an official cyclone warning or high wave swell?* (No, safety rules have strict priority).
3. *Why does ORCA attach a `provenance` object to every observation and evidence item?* (To ensure zero-hallucination explainability and show the source agency, timestamp, and verification status).
4. *How does the frontend switch from mock data to the real backend without modifying UI components?* (By calling the unified `OrcaApiClient` interface, which is implemented first by `MockOrcaApiClient` and later by `HttpOrcaApiClient`).
5. *Why is `node_modules` not required during Phase 2?* (Because Phase 2 defines type and API contracts statically; implementation and runtime execution happen in subsequent phases).

---

## Developer Walkthrough — Phase 3

### 1. What Node.js is doing here
Node.js is the server-side JavaScript runtime that executes our TypeScript backend outside the browser. It listens on a network port (`3001`), handles asynchronous I/O (network requests, future database queries, file reading), and orchestrates backend services without blocking execution.

### 2. What Fastify is doing
Fastify is a high-performance, low-overhead HTTP web framework for Node.js. It manages the HTTP server lifecycle, routes incoming URLs to handler functions, parses JSON request bodies, provides plugin architecture (CORS, logging), executes lifecycle hooks, and serializes JSON responses with low CPU overhead.

### 3. What an API route is
An API route is a binding between an HTTP method (`GET`, `POST`), a URL path pattern (e.g. `/api/v1/orca/query` or `/decisions/:id`), and an asynchronous handler function. When a client sends an HTTP request matching that method and path, Fastify dispatches the request and reply objects to that route's handler.

### 4. How a request reaches `/orca/query`
1. A client (React PWA, curl, or mobile app) sends `POST http://localhost:3001/api/v1/orca/query` with JSON body and headers.
2. Fastify's TCP socket accepts the connection, parses HTTP headers, and matches the route table.
3. Fastify executes pre-handler plugins (CORS headers, logger context).
4. The route handler receives `request.body` and invokes the Zod validation parser (`queryRequestSchema.safeParse(request.body)`).
5. If valid, the handler invokes domain logic / skeleton response builder and returns HTTP `200` with the canonical contract envelope.

### 5. What validation does
Validation acts as a strict firewall between untrusted network input and backend logic. Using Zod schemas (`queryRequestSchema`), it:
- Enforces presence of mandatory fields (e.g., `queryText`, `targetZoneId`, `departureTime`).
- Rejects unexpected types (e.g. strings where numbers are required, or malformed ISO timestamps).
- Validates constrained enums (`vesselType: "FRP_BOAT" | "TRAWLER" | ...`).
- If validation fails, halts processing immediately and returns HTTP `400` with structured `VALIDATION_ERROR` details before any agent or database is touched.

### 6. What happens when something fails
- **Malformed Input / Zod Validation Error:** Handled by route or global error handler, returns HTTP `400 Bad Request` with `error.code: "VALIDATION_ERROR"` and an array of field-level failure issues.
- **Resource Not Found (e.g. unknown decision ID):** Returns HTTP `404 Not Found` with `error.code: "DECISION_NOT_FOUND"`.
- **Unknown Route:** Fastify `setNotFoundHandler` catches unmatched URLs, returning HTTP `404 Not Found` with `error.code: "NOT_FOUND"`.
- **Unhandled Server Exception:** Fastify `setErrorHandler` intercepts the error, logs the stack trace to structured Pino logs, and sends a safe HTTP `500 Internal Server Error` with `error.code: "INTERNAL_SERVER_ERROR"` without leaking sensitive stack traces in production.

### 7. Three practical debugging checks
1. **Health Check:** Run `curl -i http://localhost:3001/health` (or `/api/v1/health`) to confirm the server is running, listening, and returning HTTP 200 with status `"healthy"`.
2. **Schema Rejection Test:** Run `curl -X POST http://localhost:3001/api/v1/orca/query -H "Content-Type: application/json" -d "{}"` to confirm that malformed payloads are rejected with HTTP 400 and structured error details.
3. **Structured Logs Inspection:** Check the console output for Fastify Pino JSON logs (or formatted logs in dev mode) to inspect `reqId`, method, URL, status code, and response time (`responseTime`).

### 8. Five short viva/cross-question questions
1. *Why use Fastify instead of Express for the ORCA backend?*
   Fastify has significantly lower overhead, built-in schema-based serialization, native async/await support, first-class TypeScript support, and high throughput critical for multi-agent coastal advisory workloads.
2. *How is schema validation decoupled from business logic in this skeleton?*
   Zod schemas in `server/schemas/apiSchemas.ts` parse and validate raw request payloads before domain or agent code is executed.
3. *Why do all error responses adhere to a standard error envelope?*
   To provide predictable error handling for the frontend client so UI error boundaries can cleanly display `message` and inspect `code`/`details` without unexpected format crashes.
4. *How are routes registered with both `/api/v1/...` and top-level prefixes?*
   Routes are registered modularly as Fastify plugins with an optional `prefix: '/api/v1'` as well as root bindings to support both versioned and direct contract specifications.
5. *Why is CORS configured deliberately rather than using wildcard defaults?*
   To restrict origins in production, permit safe local development (`localhost:5173`, `localhost:3000`), allow essential HTTP methods (`GET`, `POST`, `OPTIONS`), and prevent unauthorized cross-origin access.

---

## Developer Walkthrough — Phase 4

### 1. Supabase Architecture
Supabase is an open-source Firebase alternative built around PostgreSQL. In ORCA, it provides managed PostgreSQL 17 with PostGIS spatial extensions, authentication (GoTrue), database-level Row Level Security (RLS), and RESTful APIs via PostgREST.

### 2. PostgreSQL
PostgreSQL is the enterprise-grade ACID-compliant relational database powering ORCA. It enforces foreign key relationships (e.g. `vessels` cascade from `profiles`, `decisions` cascade from `missions`), check constraints (e.g. verdicts restricted to `GO | CAUTION | AVOID | INSUFFICIENT_DATA`), and spatial data types.

### 3. Migrations
Database migrations in `supabase/migrations/` (`20260920000001_phase4_initial_schema.sql`, etc.) are the version-controlled source of truth for the ORCA database schema. They ensure reproducible deployments across local development, CI/CD, staging, and production without manual dashboard clicks.

### 4. `auth.users` vs `profiles`
- `auth.users`: Supabase's internal auth engine table that securely stores login credentials, encrypted password hashes, emails, phone numbers, and auth metadata.
- `public.profiles`: ORCA application domain table linked 1-to-1 (`id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`) storing user display names, operational roles (`fisherman`, `fleet_operator`, `admin`), assigned harbor IDs, and preferences.

### 5. Authentication, Session & JWT Flow
1. Fisherman logs in with credentials via Supabase Auth.
2. Supabase Auth signs and issues an asymmetric JSON Web Token (JWT) access token containing the user's UUID in the `sub` claim.
3. Client passes this token in the HTTP `Authorization: Bearer <token>` header on every backend API request.
4. Server verifies token authenticity and claims.

### 6. How Fastify Identifies the User
Fastify's `requireAuth` and `optionalAuth` preHandler hooks extract the Bearer token from the incoming HTTP request, invoke `supabase.auth.getUser(token)`, and attach the verified identity (`{ id, email, role, displayName }`) to `request.user`.

### 7. Row Level Security (RLS)
RLS is an engine-level PostgreSQL security mechanism. When enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`), PostgreSQL enforces policy expressions on every SQL query, preventing clients from accessing rows they do not own even if they query `SELECT * FROM missions;`.

### 8. Grants vs RLS
- **Grants:** Coarse-grained table-level permissions (e.g. `GRANT SELECT, INSERT ON missions TO authenticated;`).
- **RLS Policies:** Fine-grained row-level filter predicates (e.g. `USING (auth.uid() = owner_id)`).
Both layers are mandatory: grants permit the action, and RLS restricts *which exact rows* can be acted upon.

### 9. `auth.uid()`
A built-in PostgreSQL function provided by Supabase that extracts the authenticated user's UUID from the JWT context claims (`request.jwt.claim.sub`). It allows SQL policies to directly compare row ownership against the active caller.

### 10. Publishable Key vs Secret Key
- `SUPABASE_PUBLISHABLE_KEY` (or anon key): Publicly shareable; safe for clients because all operations are constrained by RLS policies.
- `SUPABASE_SECRET_KEY` (or service_role key): Backend server-only key that bypasses RLS for system operations. Never exposed to browser or frontend bundles.

### 11. PostGIS Role in ORCA
PostGIS provides spatial geometries (`Point`, `Polygon`), spatial indexing (`GIST`), and geodesic calculations on the WGS 84 ellipsoid (`EPSG:4326`). ORCA uses it to store vessel coordinates, harbor locations, Potential Fishing Zones (PFZ), and compute proximity to restricted marine zones.

### 12. Mission Persistence Vertical Slice
1. Client sends `POST /api/v1/missions` with Bearer JWT token and mission payload.
2. Fastify validates payload using Zod `createMissionSchema`.
3. Handler attaches `owner_id = request.user.id` and inserts record into PostgreSQL `missions` table with spatial coordinates.
4. Returns HTTP 201 with persisted database record.

### 13. Cross-User Denial (Tenant Isolation)
When User B attempts `GET /api/v1/missions/:id` for User A's mission, the query filters by `owner_id = userB.id` (and PostgreSQL RLS evaluates `auth.uid() = owner_id`). The query matches 0 rows, returning HTTP 404 without leaking data presence or metadata.

### 14. Three Realistic Debugging Scenarios
1. **HTTP 401 Unauthorized:** Occurs when JWT token is expired, missing the `Bearer` prefix, or signed by a different Supabase project. Debug by inspecting token expiration (`exp` claim) and `Authorization` header.
2. **Empty Array on `GET /missions`:** Occurs when querying with an anon key or mismatched `owner_id`. Debug by verifying `request.user.id` matches the `owner_id` column in PostgreSQL.
3. **HTTP 400 Validation Error on Mission Post:** Occurs when coordinates exceed valid lat/lon bounds or required fields are omitted. Debug by inspecting the structured `details` array in the error response.

### 15. Five Judge/Viva Questions with Concise Answers
1. *Why execute RLS in PostgreSQL rather than filtering in Node.js application code?*
   Database-level RLS provides defense-in-depth: even if an application route has a logic bug or a new endpoint is added, the database engine guarantees that unauthorized rows are never read or mutated.
2. *Why use PostGIS for marine spatial calculations instead of basic Euclidean distance formulas?*
   Euclidean distance assumes a flat plane, causing significant distortion over coastal distances; PostGIS computes true geodesic distances on the Earth's ellipsoidal geometry and accelerates spatial queries with GIST bounding-box indexing.
3. *How does ORCA guarantee that private mission data is never exposed across fishermen?*
   Through strict ownership-based RLS policies (`auth.uid() = owner_id`) combined with API authentication middleware.
4. *How are secret credentials protected from frontend bundling?*
   Secrets are strictly loaded on the Node.js server via `process.env` and never prefixed with `VITE_` or included in frontend client bundles (verified by build artifact auditing).
5. *Why is `public.profiles` decoupled from `auth.users`?*
   `auth.users` is managed internally by the GoTrue auth engine and should not contain application-specific relational schema; `public.profiles` enables custom roles, foreign keys, and application-specific metadata while maintaining strict referential integrity.

---

## Developer Walkthrough — Phase 5

### 1. Relational Domain Modeling
Relational domain modeling structures data into dedicated, normalized tables with foreign keys and check constraints. In ORCA, this accurately models the end-to-end maritime operational lifecycle (missions, waypoints, observations, alerts, rules, and replays) while enforcing ACID data integrity and preventing data anomalies.

### 2. Why `mission_waypoints` is Separate from `missions`
A mission consists of an ordered sequence of geographic navigation vertices (`ORIGIN`, `TRANSIT`, `FISHING_SPOT`, `DESTINATION`). Storing waypoints in a child table with `(mission_id, sequence_order)` unique constraints enables individual vertex spatial indexing, granular ETA/ETD tracking, and dynamic waypoint manipulation without mutating parent mission metadata.

### 3. Why `observations` are Separate from `decisions`
Observations represent continuous environmental feeds (wave heights, wind vectors, SST gradients) ingested over time from satellite and radar sources independently of user queries. Decisions are point-in-time analytical outputs evaluated specifically for a single user mission.

### 4. Observation vs Evidence
- **Observation:** Ambient, source-agnostic environmental reading ingested from an agency (e.g. INCOIS OSF wave height: 1.8m).
- **Evidence:** An observation specifically selected, evaluated, and attached to a decision run to substantiate a safety verdict with provenance metadata.

### 5. Region vs Restricted Zone
- **Region:** A broad administrative or operational marine area (e.g. Maharashtra Coastal Sector, Tamil Nadu Fishing Zone).
- **Restricted Zone:** A legally enforced spatial boundary carrying safety/regulatory prohibitions (e.g. Marine Protected Area, Navy defence corridor, offshore platform buffer) with a severity level (`FORBIDDEN`, `WARNING`) that triggers avoidance rules.

### 6. Alert Lifecycle
Alerts track operational hazards across lifecycle states: `ACTIVE` -> `ACKNOWLEDGED` (by operator or fisherman) -> `RESOLVED` or `EXPIRED`. They can be broadcast across a whole geographic sector or targeted to a specific mission.

### 7. Connectivity Events
The `connectivity_events` table logs telemetry state transitions (`CONNECTED`, `DEGRADED`, `OFFLINE`, `SAFETY_MESSAGE_RECEIVED`) and network bearers (`CELLULAR_4G_5G`, `NAVIC_RECEIVER`, `SATELLITE_MSG`). This allows ORCA to track when a vessel enters deep sea and transitions from 4G to satellite-only broadcast mode.

### 8. Decision Rules vs Rule Evaluations
- **`decision_rules`:** The catalog of deterministic constraint definitions (e.g., cyclone override, craft wave limit, wind gust limit) with priority order and versioning.
- **`decision_rule_evaluations`:** The execution audit record storing the exact result (`PASSED`, `FAILED`, `WARNING`), input values, and rationale for each rule evaluated during a decision run.

### 9. Why Replay Records Matter
Replay records store immutable snapshots of query inputs, agent outputs, and decision states. They provide full explainability and post-incident reconstruction, allowing coast guards or investigators to see what information ORCA had when an advisory was issued.

### 10. PostGIS Geometry Basics
PostGIS stores spatial geometries on the WGS 84 ellipsoid (`SRID=4326`). Spatial primitives (`Point`, `Polygon`, `MultiPolygon`) enable precise spatial calculations without flat-plane distortion.

### 11. Foreign Keys
Foreign keys establish referential integrity between tables:
- `ON DELETE CASCADE`: Used on child records (`mission_waypoints`, `connectivity_events`, `replay_records`) so deleting a mission cleanly cleans up its dependencies.
- `ON DELETE SET NULL`: Used on reference links (`source_id` on observations/alerts) to preserve historical data even if a data source record is archived.

### 12. Indexes
B-Tree indexes on high-frequency filter columns (`mission_id`, `category`, `status`, `observed_at`) transform expensive linear table scans into logarithmic O(log N) searches.

### 13. Spatial Indexes
GiST (Generalized Search Tree) indexes on PostGIS geometry columns build 2D R-Tree bounding box indexes, accelerating geographic searches (`ST_DWithin`, `ST_Intersects`, `ST_Contains`) across coastal datasets.

### 14. Row Level Security (RLS) for Phase 5 Tables
- **Private User Data (`mission_waypoints`, `connectivity_events`, `replay_records`, `rule_evaluations`):** Gated by mission/profile ownership (`auth.uid() = owner_id`).
- **Public / Reference Data (`regions`, `restricted_zones`, `observations`, `decision_rules`):** Read-only for authenticated and anonymous users; write operations restricted to backend service roles.

### 15. Three Realistic Debugging Scenarios
1. **Duplicate Sequence Violation on Waypoints:** Inserting two waypoints with the same `sequence_order` on a mission triggers `uq_mission_waypoint_seq`. Debug by calculating sequence numbers sequentially.
2. **Missing Waypoints in API Query:** Querying waypoints without the parent mission owner's JWT token returns an empty set due to RLS policy filtering.
3. **Spatial Query Failure on Invalid Coordinates:** Inserting latitudes outside `[-90, 90]` or longitudes outside `[-180, 180]` is caught by database `CHECK` constraints.

### 16. Five Judge/Viva Questions with Concise Answers
1. *Why normalize multi-agency observations into a single `observations` table rather than separate tables for ocean, weather, and PFZ?*
   A unified schema with indexed `category` and `variable_name` columns enables source-agnostic data adapters, uniform time-window filtering, and streamlined querying across diverse marine feeds.
2. *How does the database prevent orphaned waypoints when a mission is deleted?*
   The `FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE` constraint automatically purges all child waypoints upon parent mission deletion.
3. *Why store decision rules in the database instead of hardcoding them in code?*
   Database-driven rules enable versioning, auditability, dynamic regional threshold adjustments, and priority-order re-ranking without requiring server redeployment.
4. *How does ORCA handle spatial containment queries on restricted marine zones?*
   Using PostGIS GiST spatial indexing on polygon boundaries, allowing sub-millisecond bounding box filtering before exact geometric intersection evaluation.
5. *What role does `connectivity_events` play in ORCA's offline architecture?*
   It logs field bearer transitions (cellular vs NAVIC satellite), providing the data foundation for Phase 21 adaptive message delivery and offline sync.

---

## Developer Walkthrough — Phase 6

### 1. What an Adapter Is
An adapter is a structural design pattern that wraps an external or heterogeneous data source (such as INCOIS NetCDF, IMD weather feeds, or MOSDAC rasters), converting its specific formats, units, and protocols into a unified interface (`DataAdapter<TQuery, TResult>`).

### 2. Why React Should Not Call External Marine APIs Directly
- **Secret Protection:** Prevents exposing API tokens and service keys inside browser JavaScript bundles.
- **Bandwidth Efficiency:** Coastal fishermen operate on weak 2G/4G connections; client-side fetching of raw multi-megabyte satellite grids causes severe latency and UI freezing.
- **Caching & Rate Limiting:** Centralizes upstream requests through backend cache TTLs, avoiding rate-limit quota exhaustion.
- **Safety Integrity:** Raw feeds must be validated and sanitized before reaching the safety decision engine.

### 3. Why Normalization Matters
External agencies use divergent naming conventions and units (e.g. wave height in meters vs feet, wind in km/h vs knots vs m/s). Normalization standardizes these into uniform ORCA observations (`category`, `variableName`, `numericValue`, standard SI/marine units) so downstream decision rules evaluate consistent data types.

### 4. Raw vs Normalized Data
- **Raw Data (`payload`):** Unmodified source response with native schema and agency-specific structures.
- **Normalized Data (`normalizedObservations`):** Structured array of standardized observations adhering to the ORCA domain schema.

### 5. Provenance
Every adapter response includes strict provenance metadata: source agency name (`ORCA_DEMO`, `INCOIS_OSF`), dataset identifier, observed timestamp, retrieved timestamp, validity window, and verification status.

### 6. Retrieval vs Observation Time
- `observedAt`: When the physical ocean buoy, satellite, or radar recorded the environmental reading.
- `retrievedAt`: When the ORCA backend adapter executed the fetch request.

### 7. Validity (`validUntil`)
The expiration timestamp after which the forecast or advisory data is scientifically stale and should trigger `INSUFFICIENT_DATA` or warning states.

### 8. Adapter Failure States
The framework defines explicit non-crashing failure states:
- `READY`: Operating normally with valid data.
- `DEGRADED`: Partial data or elevated latency.
- `UNAVAILABLE`: Source unreachable or offline.
- `INVALID_RESPONSE`: Upstream payload failed schema validation.
- `TIMEOUT`: Fetch exceeded maximum execution duration.
- `RATE_LIMITED`: Upstream API rejected request due to quota.

### 9. Registry / Factory Concept
The `adapterRegistry` acts as a centralized catalog mapping `(source, dataset)` keys to concrete adapter instances. Callers retrieve adapters via `adapterRegistry.get("ORCA_DEMO", "demo_marine_conditions")` without tight coupling to concrete implementation classes.

### 10. One Debugging Example
If an external agency feed is slow or unreachable, `withTimeout` intercepts the promise and returns a structured `AdapterResponse` with `status: "TIMEOUT"` and `error: { code: "ADAPTER_TIMEOUT" }`, allowing the server and Decision Engine to gracefully degrade rather than crashing with an unhandled 500 error.

### 11. Judge / Viva Question — Adapters
*Why use a Data Adapter Framework rather than fetching feeds inside the Decision Engine?*
The adapter framework enforces a clean separation of concerns: data fetching, parsing, and error boundaries remain isolated from pure safety reasoning logic. This allows unit testing decision rules with deterministic mocks and swapping data providers without rewriting safety algorithms.

### 12. Judge / Viva Question — Real vs Simulated Data
*How does ORCA ensure demo/simulated datasets are never falsely claimed as live satellite data?*
The adapter contract explicitly mandates `isLive: false`, `status: "DEMO_SNAPSHOT"`, and clear simulation disclaimers in all response metadata. The `/adapters` inventory endpoint explicitly exposes the `isLive` boolean for full transparency.

### 14. How Phase 8 Will Plug Into This Framework
In Phase 8, `IncoisOsfAdapter` will implement `DataAdapter`, fetch live INCOIS REST/OPeNDAP endpoints, parse ocean wave grids, and register via `adapterRegistry.register(new IncoisOsfAdapter())` without altering any existing API routes or UI components.

---

## Developer Walkthrough — Phase 7: Demo Data Normalization & Ingestion Pipeline

### 1. What Normalization Is
Normalization is the process of converting unstructured, inconsistent, or agency-specific raw data payloads (e.g., INCOIS JSON, IMD radar formats, or local demo files) into uniform, strongly-typed `NormalizedObservationPayload` records with standard SI/marine units (`m`, `knots`, `degC`, `mg/m3`).

### 2. What Ingestion Is
Ingestion is the automated backend process that executes adapters, transforms raw payloads into normalized observations, validates their schema, looks up provenance IDs, and writes them into the PostgreSQL `observations` table with spatial geometry columns (`geometry(Point, 4326)`).

### 3. Provenance and the `data_sources` Table
Provenance answers: *"Where did this exact number come from?"*
Every observation row in `observations` contains a foreign key `source_id` referencing `data_sources(id)` (e.g. `ORCA_DEMO` with `status: 'SIMULATED'`). This ensures every downstream decision is 100% traceable to an identifiable upstream feed.

### 4. Observation vs Raw Data
- **Raw Data:** The full, unparsed JSON payload returned by an external API or demo file (`weather.json`, `ocean.json`), stored inside adapter responses for debugging.
- **Observation:** A single atomic, normalized environmental variable record (`significant_wave_height = 1.4 m`, `air_temperature = 29.4 °C`) stored as an individual row in PostgreSQL with spatial coordinates and timestamps.

### 5. Source Metadata
Source metadata (`raw_metadata` JSONB column) preserves domain-specific auxiliary context such as `sensorType: "BUOY_SIMULATION"`, `periodSeconds: 6.8`, `sstAnomaly: -0.4`, or `directionCompass: "WSW"` without polluting the core relational schema.

### 6. Timestamps
- `observed_at`: The timestamp when the physical reading was recorded or model generated.
- `retrieved_at`: The timestamp when ORCA ingested the reading.
- `valid_until`: The expiration timestamp after which the data must be treated as stale or expired.

### 7. Idempotency & Deduplication
If an ingestion pipeline runs repeatedly (e.g. cron schedule every 15 minutes or manual retry), it must never blindly insert duplicate rows.
Phase 7 achieves deterministic idempotency through unique indexing:
`uq_observations_dedup (dataset_identifier, category, variable_name, observed_at, dedup_key)`
Running ingestion multiple times updates the existing record rather than creating duplicate rows.

### 8. Database Persistence in Supabase PostGIS
Observations are stored in the `public.observations` table. Geographic coordinates are converted to PostGIS points (`SRID=4326;POINT(lon lat)`) enabling high-speed spatial queries (`ST_DWithin`, `ST_Intersects`, bounding box filters) for vessel radius queries.

### 9. The Read API (`GET /api/v1/observations`)
The read API allows frontend dashboards, agent workers, and external consumers to query normalized observations with filters (`category`, `region`, `variableName`, `status`) and pagination (`limit`, `offset`) without ever having to parse raw vendor files.

### 10. Frontend Service Layer
Following `ORCA_PHASE_69_UI_HANDOFF.md`, UI components never call `fetch()` directly. They invoke `observationService.fetchObservations({ region: 'maharashtra' })`, keeping network endpoints, base URLs, and error handling decoupled from React presentation components.

### 11. One Debugging Scenario
*Scenario:* An observation displays `status: 'DEMO_SNAPSHOT'` on the Command Center UI, but the operator expects live telemetry.
*Debugging Step:* Inspect the `observations.status` and `isLive` fields in Supabase. Because Phase 7 operates with the `ORCA_DEMO` adapter, the status is deliberately and honestly set to `DEMO_SNAPSHOT`. The UI's `PersistedObservationPanel` renders an amber warning pill, preventing any false live data claims.

### 12. One Judge / Viva Question
*Question:* "Why persist normalized observations into a PostgreSQL database rather than streaming them directly from the adapter to the React UI?"
*Answer:* Persisting normalized observations enables:
1. Historical time-series analysis and replay audits.
2. Fast PostGIS geospatial indexing across thousands of buoy and satellite coordinates.
3. Multi-agent correlation where multiple agents (Weather, Ocean, Navigation) query the same snapshot without redundant external API requests.
4. Offline resilience and caching for low-bandwidth maritime users.

### 13. Why Demo Data is Still Useful
Demo data provides deterministic, repeatable test baselines for extreme weather events (cyclone alerts, gale winds, high wave swells) that cannot be triggered on demand in the real ocean. This allows full verification of the safety decision engine under critical failure modes.

### 14. Why This Makes Live INCOIS Integration Easier in Phase 8
Because the `IngestionService` and database schema operate against the abstract `DataAdapter` and `NormalizedObservationPayload` interfaces, Phase 8 only needs to write the `IncoisOsfAdapter`. The entire persistence, deduplication, PostGIS geometry creation, read API, and UI display pipeline already exist and will work without modifications!

---

## Developer Walkthrough — Phase 8: Official Oceanography Data Integration (INCOIS)

### 1. What an External API / Data Source Is
An external data source (e.g. INCOIS ERDDAP, IMD Weather, MOSDAC Satellite) is a remote server hosted by an official government or scientific institution that provides oceanographic and meteorological observation feeds via REST HTTP endpoints or OpenDAP protocols.

### 2. Why an Adapter Abstraction Is Useful
The `DataAdapter` abstraction decouples the messy reality of external APIs (unstable networks, varying JSON keys, differing unit systems) from the core ORCA backend and decision engine. If INCOIS changes their ERDDAP URL structure or response keys tomorrow, only `IncoisOsfAdapter.ts` needs an update; all downstream database tables, API routes, and React components remain untouched.

### 3. HTTP Request / Response Lifecycle
```
Client / Scheduler
  ↓ POST /api/v1/ingestion/incois
Fastify Route
  ↓ IngestionService.ingestIncoisData()
IncoisOsfAdapter.fetch()
  ↓ HTTP GET https://erddap.incois.gov.in/erddap/tabledap/incois_osf_coastal.json?...
INCOIS ERDDAP Server
  ↓ HTTP 200 JSON TableDAP
Zod Schema Validation & Unit Conversion (m/s -> knots)
  ↓ NormalizedObservationPayload[]
Supabase PostGIS public.observations (Idempotent Upsert)
  ↓ HTTP 200 Success Response
React UI updates via GET /api/v1/observations
```

### 4. JSON Validation with Zod
Before raw external data is processed, it passes through strict Zod schemas (`incoisErddapTableSchema`). If INCOIS returns an HTML error page, 500 stack trace, or altered column structure, Zod catches it immediately and emits `status: 'INVALID_RESPONSE'`, protecting the database from malformed data.

### 5. Normalization
Raw INCOIS fields like `significant_wave_height = 1.45` and `surface_current_speed = 0.5 m/s` are normalized into standard SI/marine units (`1.45 m` for wave height, `0.97 knots` for current velocity) with standard enum categories (`OCEAN`, `WEATHER`).

### 6. Provenance
Every observation record permanently retains:
- `source`: `INCOIS_OSF`
- `dataset_identifier`: `ocean_state_forecast`
- `agency`: `INCOIS`
- `model`: `INCOIS_WAVEWATCH_III`
- Spatial grid coordinates: `sourceGrid: { lat: 18.9, lon: 72.8 }`

### 7. `observedAt` vs `retrievedAt` vs `validUntil`
- `observedAt`: When the INCOIS numerical model forecast was issued (e.g. `2026-09-20T06:00:00Z`).
- `retrievedAt`: When ORCA's adapter executed the network fetch (e.g. `2026-09-20T06:15:22Z`).
- `validUntil`: When the forecast window expires (typically 24 hours after issuance).

### 8. Timeout & Error Handling
External government servers can be slow or offline. The `withTimeout` wrapper enforces a 6000ms deadline. If exceeded, it returns `status: 'TIMEOUT'` with `isLive: false` without crashing the Node.js Fastify process.

### 9. LIVE vs DEMO Integrity
- When real HTTP communication with INCOIS succeeds: `status = 'LIVE'`, `isLive = true`, rendered with a pulsing green pill in the UI.
- When INCOIS is unreachable: `status = 'DEMO_SNAPSHOT'`, `isLive = false`, rendered with an amber pill.
- **Strict Rule:** Never pretend demo data is live telemetry.

### 10. Ingestion into PostgreSQL PostGIS
Ingested coordinates are transformed to PostGIS geometry points (`SRID=4326;POINT(lon lat)`), indexed with spatial GIST indexes, and deduplicated using the `uq_observations_dedup` unique constraint.

### 11. Why Frontend Should NOT Call INCOIS Directly
1. **CORS Restrictions:** INCOIS servers do not permit arbitrary browser CORS requests.
2. **Network Bandwidth:** Gridded payloads are heavy; backend transforms them into minimal lightweight records.
3. **Database Caching:** Persisting once allows hundreds of coastal fishermen and coastal authorities to query the same snapshot without hammering the INCOIS servers.

### 12. How to Debug an External Data Pipeline
1. Check `GET /api/v1/adapters` to inspect adapter health and latency.
2. Trigger `POST /api/v1/ingestion/incois` with curl/Postman to view the raw ingestion response and error array.
3. Query `SELECT count(*), dataset_identifier, status FROM public.observations GROUP BY dataset_identifier, status;` to confirm database writes.
4. Check browser Network tab for `GET /api/v1/observations?category=OCEAN`.

---

## Developer Walkthrough — Phase 9: Weather & Marine Warning Integration (IMD)

### 1. What Official Weather APIs Are
Official weather APIs (e.g. India Meteorological Department, WMO Global Telecommunication System) are national and international networks providing standardized surface observations, radar nowcasts, and severe weather warning bulletins.

### 2. HTTP Request / Response Lifecycle for IMD Integration
```
Client / Scheduler
  ↓ POST /api/v1/ingestion/imd
Fastify Route
  ↓ IngestionService.ingestImdData()
ImdWeatherAdapter.fetch()
  ↓ HTTP GET https://api.imd.gov.in/api/v1/coastalbulletin (or /api/v1/current_wx?id=...)
IMD API Management Portal
  ↓ HTTP 200 JSON Payload (or 401/403/Network Error gracefully caught)
Zod Schema Validation (imdWeatherPayloadSchema)
  ↓ Unit Normalization (km/h -> knots, rainfall mm, temp °C)
  ↓ Warning Validity Calculation (isWarningActive, isExpired)
Supabase PostGIS public.observations (Idempotent Upsert)
  ↓ HTTP 200 Success Response
React UI updates via GET /api/v1/observations
```

### 3. JSON Validation with Zod
External payloads are strictly validated against `imdStationWeatherSchema` and `imdMarineWarningSchema`. If an unexpected payload arrives, Zod detects schema mismatches and safely returns `INVALID_RESPONSE` with detailed diagnostic paths, preventing corrupted data from entering Supabase.

### 4. Normalization
- **Wind Speed:** Converted from raw km/h or m/s to maritime standard knots (`1 km/h = 0.539957 knots`).
- **Temperature:** Stored in `degC`.
- **Humidity:** Stored in `%`.
- **Visibility:** Stored in `km`.
- **Rainfall:** Stored in `mm`.
- **Marine Warnings:** Structured with severity enum (`GREEN`, `YELLOW`, `ORANGE`, `RED`).

### 5. Observation vs Forecast vs Warning vs Bulletin
- **Observation:** Ground-truth measurement recorded at an automated coastal weather station (AWS) or coastal observatory at a specific timestamp (`observedAt`).
- **Forecast:** Numerical weather prediction covering future hours.
- **Warning:** A threshold-triggered hazard alert (e.g., squall alert with wind > 35 knots, cyclone alert, rough sea warning).
- **Bulletin:** Official narrative advisory containing sea condition descriptions and explicit instructions for fishermen and port authorities.

### 6. Timestamps: `observedAt` vs `issuedAt` vs `retrievedAt` vs `validFrom` vs `validUntil`
- `observedAt`: When the physical atmosphere reading was sampled.
- `issuedAt`: When IMD meteorologists officially signed and published the bulletin.
- `retrievedAt`: When ORCA's backend retrieved the data.
- `validFrom`: When the advisory or warning condition begins.
- `validUntil`: When the warning condition expires.

### 7. Warning Expiration & Status Integrity
An expired warning must NEVER be treated as active.
The adapter compares `validUntil` with current time:
- If `validUntil < now`: `isExpired = true`, `isWarningActive = false`, `status = 'STALE'`, and `qualityLevel = 'DEGRADED'`.
- If `validUntil >= now` and `warningLevel != 'GREEN'`: `isWarningActive = true`, `status = 'LIVE'`.

### 8. Provenance
Every observation record retains:
- `source`: `IMD_WEATHER`
- `dataset_identifier`: `coastal_marine_weather`
- `agency`: `IMD`
- `stationName` / `bulletinId`
- Spatial coordinates of coastal station

### 9. Timeout & Error Handling
An enforced timeout (default 6000ms) with `AbortController` ensures network stalls or DNS resolution failures on external endpoints gracefully return `status: 'TIMEOUT'` or `'UNAVAILABLE'` without crashing the Fastify process.

### 10. Fallback Mechanics: LIVE vs DEMO Honesty
If IMD endpoints are offline or firewalled, the system:
1. Marks `isLive: false`
2. Engages verified demo snapshot fallback if `allowFallback: true`
3. Returns explicit notice in `errors` array
4. Renders amber `DEMO SNAPSHOT` pill on the UI rather than falsely claiming live connectivity.

### 11. Why Server-Side Execution Is Mandatory
1. **API Keys & Credentials:** IMD API keys or server tokens must never be exposed in client bundles.
2. **CORS:** Official government portals do not enable browser Cross-Origin Resource Sharing.
3. **Bandwidth Optimization:** Minimizes mobile network consumption for fishermen.

### 12. How to Debug an External Meteorological Pipeline
1. Check adapter health: `GET /api/v1/adapters`.
2. Trigger manual ingestion: `curl -X POST http://localhost:3000/api/v1/ingestion/imd -H "Content-Type: application/json" -d '{"region":"maharashtra","allowFallback":true}'`.
3. Inspect database: `SELECT * FROM observations WHERE category = 'WEATHER' OR category = 'HAZARD' ORDER BY observed_at DESC LIMIT 10;`.
4. Open `/dashboard` and verify `PersistedObservationPanel` displays both INCOIS oceanography and IMD weather observations.

---

## Developer Learning Notes — Phase 10: Live INCOIS PFZ & Fisheries Intelligence

### 1. What Potential Fishing Zones (PFZ) Are
PFZ advisories are operational marine forecasts generated by INCOIS based on satellite-derived **Sea Surface Temperature (SST)** gradients (NOAA-AVHRR, MODIS) and **Ocean Colour / Chlorophyll-a** concentrations (OCEANSAT). Oceanographic thermal fronts, meandering currents, rings, and upwelling zones concentrate phytoplankton and baitfish, producing pelagic fish aggregation boundaries.

### 2. Live INCOIS PFZ Architecture & Endpoints
Through deep inspection of the official INCOIS Geoportal (`https://incois.gov.in/geoportal/MFASPFZ/index.html`) and GeoServer network requests, the official live machine-readable endpoints were discovered:
- **PFZ Lines WFS Service:**
  `GET https://incois.gov.in/geoserver/PFZ_Automation/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=PFZ_Automation:pfzlines&outputFormat=application/json`
  - Returns `FeatureCollection` of `MultiLineString` vectors across all coastal sectors.
  - Properties contain: `State_Name`, `Julian_day`, `Year`, `UID`, `Length`.
- **Landing Centres WFS Service:**
  `GET https://incois.gov.in/geoserver/PFZ_LandingCentres/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PFZ_LandingCentres:LandingCenters_29Apr2024&outputFormat=application/json`
- **Sectors WFS Service:**
  `GET https://incois.gov.in/geoserver/PFZ_Sectors/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=PFZ_Sectors:sector_new&outputFormat=application/json`

### 3. Julian Day to Calendar Date Normalization
INCOIS transmits the advisory date as an integer year (e.g. `2026`) and string Julian day of the year (e.g. `"268"`).
The adapter deterministically maps this:
```typescript
function julianDayToIsoDate(year: number, dayOfYear: number): string {
  const date = new Date(Date.UTC(year, 0, 1));
  date.setUTCDate(dayOfYear);
  return date.toISOString().split('T')[0];
}
// Day 268 of 2026 = 2026-09-25
```

### 4. Mission-Aware Calculations
Given a vessel departure or operational waypoint `(lat, lon)`:
1. **Haversine Distance:** Calculates exact distance in kilometers and nautical miles to the midpoint of the PFZ front.
2. **Initial Bearing & Heading:** Determines the compass bearing (0–360°) and 8-point cardinal direction (`N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`).
3. **Spatial Relevance Index:** Computes a normalized 0–100 proximity score (`Math.max(10, Math.min(100, Math.round(100 - distanceKm * 0.5)))`).

### 5. Strict Safety Separation Guarantee
PFZ intelligence is **pure opportunity data**, NOT safety clearance.
- **Rule:** A high PFZ score or close aggregation front must NEVER independently emit `GO` or `SAFE`.
- The UI and API contract explicitly enforce `isSafetyClearance: false` and include a mandatory prompt to verify IMD Marine Warnings and wave conditions.

### 6. Verification Commands
```bash
# Test full suite including Phase 10
npm test -- --run

# Test PFZ API endpoint
curl http://localhost:3000/api/v1/pfz?latitude=18.92&longitude=72.83&region=maharashtra

# Test PFZ Ingestion endpoint
curl -X POST http://localhost:3000/api/v1/ingestion/pfz -H "Content-Type: application/json" -d '{"region":"maharashtra","allowFallback":true}'
```

---

## Developer Learning Notes — Phase 11

### 1. The Core Architectural Precedence Principle
- **PFZ = OPPORTUNITY:** Identifies biological pelagic aggregations derived from satellite SST and chlorophyll gradients.
- **GIS SAFETY = CONSTRAINT:** Evaluates authoritative legal boundaries (MPAs, Naval defence zones, rig buffers) and dynamic hazard envelopes.
- **Fundamental Invariant:** An opportunity signal can **NEVER** override a safety constraint. If a route to a high-value PFZ breaches or approaches within the safety buffer of a forbidden restricted zone, the system strictly outputs `verdict: "AVOID"`, `safetyClearance: false`, and `status: "RESTRICTED"`.

### 2. Spatial Calculations: Server-Authoritative PostGIS + Turf.js
1. **Point-in-Polygon (`turf.booleanPointInPolygon` / `ST_Contains`):** Checks if the vessel location or any waypoint falls within a restricted zone or active hazard polygon.
2. **LineString Intersection (`turf.lineIntersect` / `ST_Intersects`):** Detects if the planned trajectory cuts through polygon perimeters.
3. **Safety Buffers & Proximity (`turf.pointToLineDistance` / `ST_DWithin`):**
   - **Hard Violation Buffer (e.g. 1.0 km):** Triggers `RESTRICTED` and `AVOID`.
   - **Navigational Caution Buffer (e.g. 2.5 km):** Triggers `CAUTION` and requires vigilant monitoring.
4. **Projected Route Checks (`turf.destination`):** Extrapolates current speed, heading, and mission duration into future dead-reckoning vectors to flag incursion risks before departure.

### 3. Truthful Granular Data Source Architecture
The confusing monolithic "DEMO SNAPSHOT" badge was eliminated and replaced by individual, verifiable source badges:
- `INCOIS PFZ` → `● LIVE (WFS)` (Verified live upstream GeoServer)
- `INCOIS OSF` → `● LIVE (OSF)` (Verified live ERDDAP wave forecast)
- `IMD MARINE` → `● DEMO (ACCESS PENDING)` (Phase 9.2 credential dependency)
- `GIS SAFETY` → `● DETERMINISTIC` (PostGIS spatial geofence)

---

## Developer Learning Notes — Frontend & Backend Full Integration Milestone

### 1. Architectural Boundaries & System Ownership
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ORCA FRONTEND (Client PWA)                         │
│  - Presentation & HUD visual rendering                                      │
│  - Map rendering & layer state (Leaflet / Canvas / Turf fallback)           │
│  - Reactive UI state, responsive layout & role switching                     │
│  - Form capturing & trip planning (departure time, duration, activity)      │
│  - Typed service clients (pfzService, gisSafetyService, orcaQueryService)    │
│  - Offline UI shell & zero-downtime graceful fallback                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP REST & Schema Contracts
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                        ORCA BACKEND (Fastify Server)                        │
│  - Authentication (/api/v1/me, Supabase JWT verification)                   │
│  - Persistent storage (Missions, Waypoints, Observations, Decisions)        │
│  - Live external data ingestion & validation (INCOIS WFS, ERDDAP, IMD)      │
│  - Deterministic Safety Decision Engine (GO / CAUTION / AVOID / INSUF_DATA) │
│  - Deterministic GIS Spatial Calculations (PostGIS + Turf.js)               │
│  - Multi-Agent Orchestration & Structured Evidence Extraction               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. End-to-End Typed Service Inventory
1. **`orcaQueryService.queryOrca` (`POST /api/v1/orca/query`)**:
   - Dispatches operator inquiry and structured mission parameters to the multi-agent orchestration pipeline.
   - Maps backend `OrcaQueryResponse` directly into frontend `OrchestrationPackage` reactive state.
2. **`gisSafetyService.evaluateRoute` (`POST /api/v1/gis/evaluate-route`)**:
   - Server-authoritative spatial calculation checking point-in-polygon, route intersections, and 1.0 km / 2.5 km safety buffers against naval and sanctuary boundaries.
3. **`pfzService.fetchPfz` (`GET /api/v1/pfz`)**:
   - Retrieves live INCOIS GeoServer WFS PFZ advisories, calculating distance, bearing, and compass direction from the operator's harbor.
4. **`missionService.createMission` & `fetchMissions` (`POST & GET /api/v1/missions`)**:
   - Persists planned trips and ordered waypoints to `public.missions` and `public.mission_waypoints` in Supabase PostgreSQL/PostGIS.
5. **`decisionService.fetchDecisionById` (`GET /api/v1/decisions/:id`)**:
   - Fetches complete audited decision logs, rule breakdown, and evidence provenance chains for transparency and decision replay.
6. **`adapterService.fetchAdapters` (`GET /api/v1/adapters`)**:
   - Returns live registry status and latency benchmarks for all registered data adapters.
7. **`authService.fetchMe` (`GET /api/v1/me`)**:
   - Returns authenticated user session, assigned vessels, and role permissions.

### 3. Verification & Quality Gates
- **Vitest Test Suite:** 133 passing tests across 11 test suites (including Domain Model, Multi-Agent Ingestion, IMD, INCOIS, GIS Safety, Vessel Capability, API, and Auth).
- **TypeScript Server Check:** `tsc -p tsconfig.server.json --noEmit` clean with 0 errors.
- **ESLint:** Clean with 0 errors across all files.
- **Production Build:** `tsc -b && vite build` generates clean production PWA distribution bundle with ServiceWorker caching.

---

## Developer Learning Notes — Phase 12: Vessel Capability Model

### 1. Goal & Product Thesis
Marine safety is inherently vessel-specific. A 2.2m significant wave height or a 30 NM voyage represents an acceptable operational condition for a 15-meter mechanized trawler, but a hazardous condition for a 5.5-meter non-motorized canoe. Phase 12 establishes this vessel-specific constraint evaluation layer deterministically before Decision Engine V2 (Phase 13).

### 2. Critical Threshold Provenance Rule
No universal maritime threshold is invented or falsely claimed as official statutory policy:
- `OFFICIAL_SOURCED`: Formal statutory standards (e.g., DG Shipping Merchant Shipping Manning Rules, Mercantile Marine Department circulars).
- `VESSEL_SPECIFIC`: Vessel-specific builder plates, class survey stability certificates, tank capacities, and engine fuel consumption curves.
- `PROTOTYPE_ASSUMPTION`: Explicit prototype heuristic models calibrated for regional fishing crafts, clearly labeled with provenance metadata.
- `UNKNOWN`: Missing or unsupplied environmental observations or vessel parameters.

### 3. Evaluated Constraint Dimensions
1. **`RANGE`**: Total round-trip mission distance vs vessel operating range (`operating_range_nm`).
2. **`DISTANCE_FROM_PORT`**: Maximum offshore distance vs harbor distance limit (`max_operating_distance_nm`).
3. **`ENDURANCE`**: Voyage duration vs maximum hours on full fuel/supplies (`endurance_hours`).
4. **`FUEL`**: Calculated burn rate + 20% regulatory reserve vs bunker capacity (`fuel_capacity_liters`).
5. **`WAVE`**: Significant wave height (Hs) vs vessel seaworthiness limit (`max_safe_wave_meters`).
6. **`WIND`**: Sustained wind speed vs stability limit (`max_safe_wind_knots`).
7. **`CREW`**: Planned crew vs certified minimum/maximum manning bounds (`min_crew`, `max_crew`).
8. **`SAFETY_EQUIPMENT`**: Voyage mandatory equipment vs verified onboard inventory (`safety_equipment`).
9. **`CERTIFICATION`**: Operational status certificate (`capability_profile_status`).

### 4. Fastify Endpoints & Service Contracts
- `GET /api/v1/vessels/:id/capability`: Retrieves full capability profile with threshold provenance.
- `PATCH /api/v1/vessels/:id/capability`: Updates vessel parameters with validation.
- `POST /api/v1/vessels/evaluate-capability`: Deterministically evaluates mission context against vessel capability profile.
- `POST /api/v1/vessels/:id/evaluate-capability`: Evaluates specific vessel by ID.

---

## Developer Learning Notes — Phase 13: Deterministic Decision Engine V2

### 1. Architectural Philosophy
In real-world marine operations, an LLM or frontend heuristic must never decide whether a vessel is cleared to sail. The decision must be reproducible, mathematically rigorous, and auditable. Phase 13 consolidates all operational decision authority into a single backend service: `DecisionEngineService`.

### 2. Strict 8-Stage Precedence Hierarchy
When evaluating any voyage, the engine applies rules in order of strict safety precedence:
1. **Precedence Level 1 — Severe Meteorological Warnings & Cyclones**:
   - RED / CRITICAL / ORANGE alert active &rarr; `AVOID` (Blocking safety override).
   - Expired alerts filtered out per temporal TTL policy (`NOT_APPLICABLE`).
2. **Precedence Level 2 — Deterministic GIS Safety Boundaries**:
   - Spatial intersection or incursion into restricted military/naval zone or sanctuary buffer &rarr; `AVOID` (Blocking spatial constraint).
   - Proximity within caution buffer (2.5 km) &rarr; `CAUTION`.
3. **Precedence Level 3 — Vessel Seaworthiness & Physical Capability**:
   - Significant wave height (Hs) > `maxWaveToleranceMeters` &rarr; `AVOID`.
   - Sustained wind speed > `maxWindToleranceKnots` &rarr; `AVOID`.
   - Planned voyage distance > `operatingRangeNm` &rarr; `AVOID`.
   - Offshore distance > `maxOperatingDistanceNm` &rarr; `AVOID`.
   - Operating margin (85% of limit) &rarr; `CAUTION`.
4. **Precedence Level 4 — Data Freshness & Quality Gate**:
   - Critical observations missing (wave/wind unsupplied) &rarr; `INSUFFICIENT_DATA`.
   - Stale observations (> 24 hrs old) &rarr; `CAUTION` with data quality warning.
5. **Precedence Level 5 — Physical Oceanographic & Meteorological Constraints**:
   - Elevated ocean swell (Hs &ge; 2.0m) or wind (&ge; 18 kts) &rarr; `CAUTION`.
6. **Precedence Level 6 — Temporal Return Window & Daylight Constraints**:
   - Return past sunset/twilight &rarr; `CAUTION` (visual navigation / bar crossing hazard).
   - Forecast validity window expires before expected return time &rarr; `CAUTION`.
7. **Precedence Level 7 — Mission Parameters**:
   - Mission duration / routing feasibility checks.
8. **Precedence Level 8 — Potential Fishing Zone (PFZ) Opportunity Enhancement**:
   - PFZ thermal fronts and chlorophyll gradients enrich the recommendation but **CANNOT** override safety blocks. If an active hazard exists, PFZ is tagged `RULE_08_PFZ_OPPORTUNITY_BLOCKED` (`NOT_APPLICABLE`).

### 3. Canonical Decision Object Format
```json
{
  "decisionId": "DEC-20260927-001",
  "state": "GO",
  "verdict": "GO",
  "summary": "FAVORABLE (GO): Optimal navigation corridor and fishing conditions.",
  "explanation": "All safety checks passed. Marine conditions are calm and within configured vessel seaworthiness limits.",
  "primaryDriver": "All safety constraints verified and favorable ocean conditions",
  "evaluatedAt": "2026-09-27T08:35:00.000Z",
  "recommendedDeparture": "05:45 IST",
  "recommendedReturn": "09:45 IST",
  "rules": [
    {
      "ruleId": "RULE_01_SEVERE_WARNING_CLEAR",
      "ruleName": "Official Severe Warning Audit",
      "category": "WARNING",
      "result": "PASS",
      "severity": "INFO",
      "reason": "No severe meteorological warnings active.",
      "thresholdSource": "OFFICIAL_SOURCED"
    }
  ],
  "blockingFactors": [],
  "cautionFactors": [],
  "opportunityFactors": ["High pelagic fish aggregation front verified by INCOIS PFZ advisory at PFZ-MUM-01."],
  "dataStatus": {
    "status": "LIVE",
    "requiredSourcesCount": 5,
    "availableSourcesCount": 5,
    "staleSourcesCount": 0,
    "hasConflicts": false
  },
  "provenance": {
    "engine": "decision-engine-v2",
    "version": "2.0.0",
    "evaluatedAt": "2026-09-27T08:35:00.000Z",
    "rulesEvaluatedCount": 6,
    "precedenceEnforced": [
      "1. Severe Warnings",
      "2. GIS Geofences",
      "3. Vessel Seaworthiness",
      "4. Data Freshness Gate",
      "5. Physical Ocean State",
      "6. Temporal Return Window",
      "7. Mission Constraints",
      "8. PFZ Opportunity Enhancement"
    ]
  }
}
```

### 4. API Endpoints
- `POST /api/v1/decisions/evaluate`: Primary deterministic evaluation endpoint.
- `GET /api/v1/decisions/:id`: Fetches persisted decision log by ID.
- `POST /api/v1/orca/query`: Synthesizes multi-agent context and runs `DecisionEngineService`.

### 5. Determinism Assertion
The engine guarantees mathematical determinism:
$$\text{Engine}(\text{Request}) \equiv \text{Engine}(\text{Request})$$
Same normalized inputs yield identical verdicts, identical rule evaluations, and identical blocking/caution factors with zero stochastic drift or LLM hallucination.

---

## Developer Walkthrough — Phase 14: Evidence & Explainable Confidence System

### 1. The Core Problem Phase 14 Solves
In high-stakes maritime navigation and coastal fisheries safety, a system cannot simply return a verdict like `CAUTION` or `AVOID` without providing a fully auditable chain of evidence. If a boat capsizes or an authority inquires why a mission was barred, the system must answer:
- **What data did you use?** (Exact variables, values, and units).
- **Where did it come from?** (Data source, institutional registry, sensor feed).
- **When was it observed and retrieved?** (Explicit timestamps, not just "live").
- **Is it still valid?** (Freshness TTL state: `FRESH`, `AGING`, `STALE`, `EXPIRED`, `DEMO`, `ACCESS_PENDING`).
- **How relevant is it spatially and temporally?** (Distance in km to mission corridor, validity window relative to departure and return).
- **Was there a source conflict?** (e.g., INCOIS buoy wave = 1.2m vs Coastal Radar = 2.4m, structured resolution policies).
- **Which deterministic rule evaluated it?** (Direct linkage `rule.evidenceRef` $\leftrightarrow$ `evidence.ruleIds`).
- **What was its impact on the decision?** (`POSITIVE`, `NEUTRAL`, `CAUTION`, `CRITICAL_BLOCKER`).

### 2. Elimination of Fake Probabilities
ORCA strictly rejects fabricated safety percentages (such as "87% safe" or "94.2% confidence"):
- Probabilistic percentages in safety-critical marine environments without calibrated scientific models mislead fishermen and create false senses of security.
- Confidence is strictly categorized as **`HIGH`**, **`MODERATE`**, or **`LOW`**, backed by explicit, human-readable evidence reasons:
  - **`HIGH`**: All 5 core marine data streams (Safety, GIS, Vessel, Ocean, Weather) verified within TTL, 0 active source conflicts, deterministic safety margins satisfied.
  - **`MODERATE`**: Data aging past standard TTL, evaluation against prototype demo snapshots, or resolved non-critical observation variance.
  - **`LOW`**: Missing critical required evidence (wave height, surface wind, GIS geofence verification), unresolved multi-source conflicts, or `INSUFFICIENT_DATA` state.

### 3. Canonical Evidence Data Model
Every piece of evidence is captured as an `AuditedEvidenceItem`:
```typescript
export interface AuditedEvidenceItem {
  evidenceId: string;                     // e.g. "EVID-OCEAN-WAVE-01"
  category: EvidenceCategory;            // "SAFETY" | "GIS" | "VESSEL" | "OCEAN" | "WEATHER" | "MISSION" | "OPPORTUNITY"
  source: string;                        // e.g. "INCOIS_OCEAN_STATE_FORECAST"
  dataset: string;                       // e.g. "OSF_ARABIAN_SEA_TABLEDAP"
  variable: string;                      // e.g. "significantWaveHeight"
  value: string | number | boolean | string[] | Record<string, unknown>; // e.g. 1.4
  unit?: string | null;                  // e.g. "m"
  geometry?: { type: string; coordinates: unknown } | null;
  observedAt: string;                    // ISO 8601 UTC
  issuedAt?: string | null;              // ISO 8601 UTC
  validUntil?: string | null;            // ISO 8601 UTC
  retrievedAt: string;                   // ISO 8601 UTC
  spatialRelevance: SpatialRelevanceLevel; // "HIGH" (<=25km) | "MEDIUM" (<=75km) | "LOW" (>75km) | "NOT_APPLICABLE"
  spatialDistanceKm?: number | null;     // e.g. 18.5
  temporalRelevance: TemporalRelevanceLevel; // "CURRENT" | "VALID_FOR_MISSION" | "PARTIALLY_VALID" | "EXPIRED" | "UNKNOWN"
  quality: DataQualityGrade;             // "GOOD" | "DEGRADED" | "POOR" | "UNKNOWN"
  status: FreshnessState;                // "FRESH" | "AGING" | "STALE" | "EXPIRED" | "UNAVAILABLE" | "DEMO" | "ACCESS_PENDING"
  transformation?: string | null;        // e.g. "Turf.js 2.5 km caution buffer calculation"
  ruleIds: string[];                     // e.g. ["RULE_05_PHYSICAL_WAVE_PASS"]
  decisionImpact: EvidenceDecisionImpact; // "POSITIVE" | "NEUTRAL" | "CAUTION" | "CRITICAL_BLOCKER"
  notes?: string;
}
```

### 4. Seven Operational Evidence Categories
To avoid overwhelming operators while maintaining complete auditability, evidence is grouped into 7 canonical categories:
1. **Safety**: Official IMD Coastal Warnings & Cyclonic Hazards.
2. **GIS**: PostGIS Hydrographic Restricted Zones, Naval Anchorage, & MPA Geofences.
3. **Vessel**: Registered Builder Limits (Wave tolerance, wind limit, fuel endurance, crew capacity).
4. **Ocean**: INCOIS OSF Significant Wave Height ($H_s$), Swell Period, & Surface Current.
5. **Weather**: IMD Atmospheric Weather (Surface Wind Velocity, Wind Gusts, Visibility).
6. **Mission**: Voyage Departure, Duration Window, & Sunset Navigation Restrictions.
7. **Opportunity**: INCOIS PFZ Thermal-Chlorophyll Fronts (Favorable fishing corridors).

### 5. Multi-Level Progressive Disclosure

---

## Developer Learning Notes — Phase 15: Real Agentic Orchestration & Specialist Coordination

### 1. What "Agentic Orchestration" Means in ORCA
In mission-critical maritime systems, "agents" are not conversational chatbots that hallucinate safety advice. Instead, they are typed, server-authoritative specialist task executors that:
1. Normalize operator intent and contextual voyage constraints.
2. Formulate explicit data queries against specialized domain models.
3. Coordinate parallel background execution across distinct hydrological and meteorological data streams.
4. Transform domain observations into normalized evidence records.
5. Hand off normalized evidence to a deterministic safety engine that has absolute authority over the decision.

### 2. The 6 Logical Specialists
1. **Mission Planner (`MISSION_PLANNER`)**: Parses natural language requests (e.g. "Can I go fishing tomorrow at 6 AM for 5 hours?"), maps vessel identification, waypoints, activity type, departure window, and daylight constraints.
2. **Oceanography (`OCEANOGRAPHY`)**: Fetches INCOIS OSF wave heights, swell periods, surface currents, and sea surface temperature (SST).
3. **Meteorology (`METEOROLOGY`)**: Fetches IMD coastal weather bulletins, wind speed, gust factors, and visibility.
4. **PFZ / Fisheries Opportunity (`PFZ_FISHERIES`)**: Integrates official INCOIS PFZ WFS lines and landing centers. Strictly provides **economic/operational opportunity** and cannot override safety barriers.
5. **Geo / Safety (`GEO_SAFETY`)**: Audits route vectors against PostGIS hydrographic restricted zones, naval security perimeters, and marine protected areas.
6. **Vessel Capability (`VESSEL_CAPABILITY`)**: Audits environmental wave and wind parameters against registered builder thresholds for the active craft.

### 3. Explicit Task Dependency Graph & Parallelism
To minimize response latency without compromising safety, ORCA uses an explicit dependency graph:
```
           [Mission Context Normalized]
                         ↓
    ┌────────────┬───────────────┬────────────┐
    ↓            ↓               ↓            ↓
[Oceanography] [Meteorology]   [PFZ]     [Geo / Safety]  (Stage 1: Parallel Execution)
    └────────────┬───────────────┘
                 ↓
       [Vessel Capability]                               (Stage 2: Dependent on Wave & Wind)
                 ↓
      [Audited Evidence Aggregated]
                 ↓
  [Deterministic Decision Engine V2]                     (Stage 3: Authoritative Verdict)
                 ↓
     [Orchestrated Decision Result]
```

### 4. Specialist Failure Isolation Policy
- If an opportunity feed (e.g. INCOIS PFZ) or non-critical feed (e.g. IMD pending credentials) fails or degrades, the orchestrator tags the specialist as `DEGRADED` or `UNAVAILABLE`, records the degradation in the trace, and allows the deterministic engine to evaluate safety on the remaining streams.
- If a **critical safety stream** is missing (e.g. wave height when exceeding coastal limits), the Decision Engine returns `INSUFFICIENT_DATA`, ensuring safety is never compromised.

---

## Developer Learning Notes — Phase 16: LLM Intelligence + Natural Language Reasoning Layer

### 1. Architectural Philosophy: The Separation of Intelligence and Safety Authority
In ORCA, the Large Language Model (LLM) is treated as an **untrusted, high-capability natural language translation and synthesis engine**.
It operates strictly on the outer perimeter of the system:
1. **Inbound Translation**: The LLM translates unstructured, conversational human language (*"Can I take my small boat out near Mumbai tomorrow afternoon?"*) into a strictly typed, Zod-validated `LlmStructuredIntent`.
2. **Deterministic Processing**: The structured intent is executed by the server-authoritative `OrchestrationService`, coordinating the 6 specialist modules and gathering verified evidence evaluated by the immutable `DecisionEngineService`.
3. **Outbound Synthesis**: The LLM consumes the deterministic verdict (`GO`, `CAUTION`, `AVOID`, `INSUFFICIENT_DATA`) and structured `AuditedEvidenceItem` records to synthesize a conversational, grounded explanation tailored to the operator's role (Fisherman, Port Authority, Maritime Operator).

```
 USER
  ↓ (Natural Language Input)
 [LLM Provider / NLP Parser] (Intent Extraction)
  ↓ (Zod-Validated LlmStructuredIntent)
 [OrchestrationService] (Task Coordinator)
  ↓ (Parallel Specialist Execution)
 [6 Logical Specialists + Data Adapters]
  ↓ (Audited Evidence Items)
 [DecisionEngineService] (Deterministic Safety Authority)
  ↓ (Immutable Final Decision: GO / CAUTION / AVOID)
 [LLM Provider / Explanation Synthesizer] (Grounding on Evidence)
  ↓ (Grounded Natural Language Summary & Advisories)
 USER
```

### 2. The Clean LLM Provider Abstraction
To avoid vendor lock-in and ensure the system operates reliably offline or without API keys, ORCA defines an `LLMProvider` interface (`server/llm/llmProvider.ts`):
- `generateStructuredIntent(input)`: Parses unstructured natural language into typed `LlmStructuredIntent`.
- `generateExplanation(input)`: Transforms deterministic decision records and evidence items into human-readable narratives.
- `generateClarification(input)`: Identifies missing voyage parameters and produces concise clarification questions with quick-select options.

Three providers are implemented:
1. `GeminiLlmProvider`: Native Google Gemini Flash driver with structured JSON output constraints.
2. `OpenAiLlmProvider`: OpenAI / compatible API driver with strict response format schemas.
3. `FallbackLlmProvider`: A deterministic, zero-credential NLP parser and explanation synthesizer using regex entity extraction and rule-grounded templating.

### 3. Strict Zod-Validated Structured Intent
User queries are normalized through `structuredIntentZodSchema` (`server/llm/llmTypes.ts`):
- `activity`: `FISHING` | `SURVEY` | `PATROL` | `TRANSIT` | `UNKNOWN`
- `questionType`: `FEASIBILITY` | `SAFETY` | `OPPORTUNITY` | `EXPLANATION` | `ROUTE` | `CONDITIONS` | `ALERT` | `WHAT_IF` | `GENERAL_INFORMATION` | `UNKNOWN`
- `departureWindow`: ISO string or temporal descriptor (`"today"`, `"tomorrow"`, `"morning"`, `"afternoon"`).
- `durationHours`: Voyage duration number.
- `vesselType` & `vesselName`: Active vessel identification.
- `location`: Extracted geographic coordinates and named location.
- `constraints`: Max wave height, max wind speed, night navigation limitations.

### 4. Server-Authoritative Conversational Memory
Follow-up questions in natural language frequently omit previously stated parameters (e.g., Turn 1: *"Can I fish tomorrow morning near Mumbai?"* &rarr; Turn 2: *"What about the afternoon?"*).
- ORCA maintains an in-memory, LRU-managed `ServerConversationContext` cache with a 24-hour TTL keyed by `conversationId`.
- In Turn 2, `LlmService.resolveContext()` merges the prior turn's location, vessel, activity, and duration with the new departure window (`afternoon`), returning explicit `inheritedContext` metadata to the client.

### 5. Controlled Tool Boundary
The LLM is strictly isolated from raw SQL, database credentials, and service-role keys. When LLM reasoning requires domain information, it interacts solely through allowlisted server methods:
- `getOceanConditions(location, time)`
- `getWeatherConditions(location, time)`
- `getPFZOpportunity(location, maxDistanceKm)`
- `evaluateGISSafety(routeOrPoint)`
- `evaluateVesselCapability(vesselId, waveHeight, windSpeed)`
- `evaluateDecision(missionContext)`

### 6. Zero-Tolerance Safety Rules for LLM Output
1. **Deterministic Precedence**: The LLM **cannot** alter `verdict`, `ruleResults`, `thresholds`, `sources`, or `timestamps`.
2. **No Hallucinated Citations**: Every fact in the natural language summary must map to an existing `AuditedEvidenceItem`.
3. **No Safety Override**: If deterministic rules return `AVOID` due to a naval restricted zone or excessive wave height, the LLM explanation is constrained to highlight the blocker and cannot suggest proceeding.
4. **Honest Credential Reporting**: If IMD credentials remain pending, the LLM must honestly report weather data status as `ACCESS_PENDING / DEMO` rather than fabricating live observations.

---

## Developer Learning Notes — Phase 17: End-to-End ORCA Query Intelligence + Production Integration

### 1. The Production Intelligence Pipeline Architecture
In Phase 17, `POST /api/v1/orca/query` is elevated into a complete production-grade query pipeline that connects every subsystem in ORCA without bypassing safety:
```
 USER QUESTION ("Can I fish near Mumbai tomorrow for 5 hours?")
  ↓
 [LLM / Fallback Intent Extraction]
  ↓ (Extracts Activity: FISHING, Region: maharashtra, Duration: 5h, Time: 06:00 IST)
 [Structured Mission Context]
  ↓
 [OrchestrationService Dispatch]
  ↓ (Parallel Specialist Execution)
 ┌───────────────┬────────────────┬──────────────┬───────────────┐
 │ Oceanography  │  Meteorology   │ PFZ Fisheries│  GIS Safety   │
 │ (INCOIS OSF)  │ (IMD Weather)  │ (INCOIS WFS) │ (PostGIS 3.3) │
 └───────┬───────┴────────┬───────┴──────┬───────┴───────┬───────┘
         │                │              │               │
         └────────┬───────┘              │               │
                  ↓                      │               │
         [Vessel Capability Engine]      │               │
                  ↓                      ↓               ↓
         [Audited Evidence Collection: 7 Domain Streams]
                  ↓
         [Deterministic Decision Engine V2] (8-Stage Precedence)
                  ↓
         [Immutable Final Verdict: GO / CAUTION / AVOID / INSUFFICIENT_DATA]
                  ↓
         [Grounded Explanation Synthesizer (Citing Audited Evidence IDs)]
                  ↓
         [Actionable User Response (Tidal Light UI & API Contract)]
```

### 2. Handling the 8 Canonical Query Types
The pipeline recognizes and answers 8 distinct query classes:
1. **`FEASIBILITY`** (*"Can I go fishing today near Mumbai?"*): Evaluates whole-mission executable feasibility with clear departure/return windows.
2. **`SAFETY`** (*"Is this route safe?"*): Direct audit of hydrographic geofences, naval security boundaries, and wave height builder envelopes.
3. **`CONDITIONS`** (*"What are the sea conditions?"*): Summarizes wave height ($H_s$), swell periods, sea surface temperature, current velocities, and wind speed.
4. **`OPPORTUNITY`** (*"Is there a fishing opportunity near Mumbai?"*): Surfaces nearest high-density PFZ zones with bearing and distance while strictly evaluating whether route safety allows reaching them.
5. **`EXPLANATION`** (*"Why should I avoid this route?"*): Provides a multi-factor explanation of the primary decisive rule driver.
6. **`ALERT`** (*"Are there any warnings affecting my trip?"*): Checks coastal weather bulletins, squall advisories, and naval exercise closures.
7. **`GENERAL_INFORMATION`** (*"What is ORCA and marine status?"*): Explains system capabilities and current operational state.
8. **`UNKNOWN / AMBIGUOUS`** (*"hello"*, empty or missing parameters): Asks structured clarification questions with one-click options rather than guessing.

### 3. Absolute Safety Precedence Invariants
- **PFZ Opportunity Invariant**: High fish concentration (`INCOIS PFZ`) can NEVER convert a safety `AVOID` (e.g., naval anchorage buffer breach or 2.8m wave height) into a `GO`. Safety strictly blocks opportunity.
- **Vessel Seaworthiness Invariant**: If wave or wind forecasts exceed registered builder tolerances for a motorized fiberglass boat (e.g., > 1.8m wave), the verdict is `AVOID`, regardless of user phrasing.
- **Missing Critical Data Invariant**: If critical ocean state forecast feeds are missing or unverified, the engine outputs `INSUFFICIENT_DATA` rather than guessing a clearance.

### 4. Consolidated Production Response Contract
The endpoint returns `Phase17OrcaQueryResponse` providing a unified contract:
- `queryId`, `conversationId`, `turnId`
- `shortAnswer`, `primaryDriver`, `actionableAdvice`
- `intelligenceMode` (`DETERMINISTIC_FALLBACK` | `GEMINI` | `OPENAI`)
- `sourceStatus` (OSF: `LIVE`, PFZ: `LIVE`, GIS: `DETERMINISTIC`, IMD: `ACCESS_PENDING / DEMO`)
- `decision` (Immutable verdict, rule evaluations, confidence score, departure/return cutoffs)
- `evidence` (Audited, traceable observations with variable, unit, quality, and rule links)
- `orchestrationResult` (Specialist traces, dependency graph, execution timings)

---

## Developer Learning Notes — Phase 18: What-If / Scenario Intelligence

### 1. The What-If Architecture: Re-evaluation vs Simulation
A common mistake in AI assistants is having the LLM "simulate" what happens in a scenario (*e.g.*, hallucinating whether a 2 PM departure is safe). In ORCA:
- **The LLM does NOT decide safety.**
- The LLM's only role in What-If is extracting structured modifications (*e.g.*, `departureTime: '14:00'`, `vesselId: 'VESSEL-002'`, `assumptions: { waveHeightMeters: 2.5 }`).
- The modified hypothetical mission is passed directly into `DecisionEngineService` and specialist engines (GIS rerouting, vessel capability curves, oceanography envelopes).
- The baseline decision and scenario decision are compared mathematically down to the individual rule and evidence records.

```
 BASELINE MISSION & DECISION (Immutable Snapshot)
                 ↓
 [What-If Natural Language / Structured Inputs]
                 ↓
 [Structured Scenario Delta Formulation]
                 ↓
 [Specialist Re-Evaluation & GIS / Vessel / Weather Dispatch]
                 ↓
 [Deterministic Decision Engine Re-Evaluation]
                 ↓
 [Audited Evidence & Rule Delta Computation]
   • newlyTriggeredRules
   • noLongerTriggeredRules
   • persistingRules
   • changedEvidence & newEvidence
                 ↓
 [Grounded Verdict Change Reason & Actionable Advice]
                 ↓
 [Tidal Light Side-by-Side Comparison UI & API Envelope]
```

### 2. Supported Scenario Categories
1. **Time Shift (`TIME_CHANGE`)**: *"What if I leave at 2 PM instead of 6 AM?"* &rarr; Re-evaluates afternoon wave chop and sunset return limits.
2. **Duration Modification (`DURATION_CHANGE`)**: *"What if the trip is only 3 hours?"* &rarr; Re-evaluates reduced exposure window.
3. **Vessel Substitution (`VESSEL_CHANGE`)**: *"What if I use VESSEL-002 (Samudra Sevak trawler)?"* &rarr; Re-evaluates engine power, wave tolerance (2.5m vs 1.8m), and range.
4. **Route / Corridor Modification (`ROUTE_CHANGE`)**: *"What if I avoid this restricted area?"* &rarr; Re-evaluates waypoint corridors to bypass naval exclusion polygons.
5. **Hypothetical Condition Assumption (`ENVIRONMENTAL_ASSUMPTION`)**: *"What if wave height increases to 2.5 metres?"* &rarr; Evaluates hypothetical condition change, strictly tagging evidence items with `HYPOTHETICAL ASSUMPTION` to ensure prototype assumptions are never confused with live observed sensor telemetry.
6. **Combined Scenarios (`COMBINED_CHANGE`)**: *"What if I leave at 2 PM and use VESSEL-002?"* &rarr; Evaluates multi-parameter interactions.

### 3. Progressive Disclosure UI Pattern
The frontend `ScenarioComparisonCard` organizes scenario insights hierarchically:
- **Top Level**: Side-by-side verdict cards (`CURRENT DECISION` vs `WHAT-IF SCENARIO`) with transition indicators.
- **Delta Badges**: Visual chips highlighting each modified parameter (*e.g.*, `Departure: 05:45 IST → 14:00 IST`).
- **Grounded Reason & Advice**: Deterministic explanation of why the verdict shifted and concrete action steps.
- **Deep Technical Audit (Tabs)**:
  - *Rule Comparison Tab*: Newly triggered rules, resolved rules, and persisting invariant rules.
  - *Evidence Delta Tab*: Modified evidence values with status indicators (`LIVE`, `DEMO`, `ACCESS_PENDING`, `HYPOTHETICAL`).

### 4. Zero-Leakage Data & Safety Invariants
- **No Direct LLM Safety Override**: LLM explanations are constrained to explain deterministic rule outputs.
- **Opportunity Subordination**: High PFZ opportunity cannot turn an `AVOID` into a `GO`.
- **Hypothetical Isolation**: Hypothetical assumptions are marked `isHypotheticalAssumption: true` and cannot be persisted into the real observation ledger.
- **Truthful Feed Attribution**: IMD bulletins remain `ACCESS_PENDING / DEMO` until verified production keys are supplied.

---

## Developer Learning Notes — Phase 19: Alerts + Disaster Intelligence (Undergraduate Walkthrough)

### 1. The Core Philosophy: Alerts as Deterministic Legal & Safety Records
In typical commercial web software, notifications and "alerts" are ephemeral messages published to a queue whenever an event occurs. In a maritime and coastal disaster decision-support system, an alert is a **legally defensible, safety-critical instrument**. It dictates whether an artisanal fisherman departs into life-threatening ocean swell, whether a port captain halts harbour traffic, or whether a disaster manager mobilises evacuation teams.

Therefore, ORCA alerts follow an unbroken, auditable chain of custody:

```
  [MULTI-AGENCY SENSOR / MODEL TELEMETRY]
        (INCOIS OSF, PostGIS Polygons, Vessel Limits, IMD)
                       ↓
         [AUDITED EVIDENCE NORMALISATION]
       (Quality, Spatial Distance, Freshness)
                       ↓
         [DETERMINISTIC RULE EVALUATION]
       (DG Shipping Envelopes, Buffer Zones)
                       ↓
           [DECISION ENGINE VERDICT]
           (AVOID, CAUTION, GO, BLOCKED)
                       ↓
        [DETERMINISTIC ALERT GENERATION]
     (Severity: CRITICAL, WARNING, ADVISORY)
                       ↓
      [OPERATOR ACKNOWLEDGEMENT / WORKFLOW]
  (Audited Operator ID, Timestamp, Role, Note)
                       ↓
     [INCIDENT RESOLUTION / AUDIT ARCHIVE]
```

### 2. The Golden Safety Rule: Why LLMs Must Never Fabricate or Classify Alerts
A critical failure mode in "AI for Disaster Management" systems is prompting an LLM with free-form weather text and asking: *"Is there an alert? What severity should it be?"*

In ORCA, this is strictly forbidden:
- **LLMs never assign severity**: Severity (`CRITICAL`, `WARNING`, `ADVISORY`, `INFO`) is computed exclusively by deterministic rules comparing verified numbers (e.g. `waveHeight >= 2.0m` or `distanceToGeofence <= 1000m`).
- **LLMs never fabricate hazards**: An alert cannot exist without backing `evidenceIds` referencing persisted observations and `ruleIds` referencing deterministic code.
- **Opportunity separation**: High potential fishing zones (`INCOIS PFZ`) represent economic opportunities. They are strictly prohibited from generating safety alerts.
- **Role of LLM**: The LLM may only summarize already verified, deterministic alert contracts in conversational natural language.

### 3. Alert Deduplication & Fingerprinting
Sensor feeds arrive continuously (e.g. hourly OSF runs, periodic radar sweeps). Without deduplication, operators experience alert fatigue and system spam.
ORCA generates a deterministic fingerprint:

$$\text{Fingerprint} = \text{Hash}\Big(\text{source} \,\|\, \text{alertType} \,\|\, \text{affectedArea} \,\|\, \text{ruleId} \,\|\, \text{windowTag}\Big)$$

When a new hazard observation arrives:
1. If an existing `ACTIVE` alert shares the fingerprint, ORCA **refreshes** the validity window, observed values, and timestamps *in place* rather than generating duplicate alert records.
2. If the condition clears, the alert transitions to `RESOLVED` or `EXPIRED`.

### 4. 4-Level Progressive Disclosure Architecture
Operators under acute operational pressure require instant clarity, while accident investigators require mathematical audit trails. The UI implements 4 levels of disclosure:

- **Level 1 (What & Action)**:
  - *What happened*: Plain headline and hazard category.
  - *Where*: Affected geographical sector and radial/buffer perimeter.
  - *Deterministic Severity*: High-contrast badge (`CRITICAL`, `WARNING`, `ADVISORY`, `INFO`).
  - *Validity Window*: Exact `validFrom` and `validUntil` timestamps.
  - *Mandatory Action*: Non-autonomous, actionable directive (*"Artisanal motorized crafts hold departure"*).
- **Level 2 (Why & Provenance)**:
  - *Operational Rationale*: Deterministic impact analysis explaining the physics or boundary breach.
  - *Deterministic Confidence*: Percentage score, confidence level, and mathematical explanation.
  - *Source Provenance*: Sponsoring agency (e.g., INCOIS, DG Shipping, PostGIS) and data reliability model.
- **Level 3 (Audited Evidence)**:
  - Multi-agency evidence items linked to the alert.
  - Observed variables, numerical values, measurement units, observation timestamps, and freshness tags (`FRESH`, `ACCESS_PENDING`, `DEMO`).
- **Level 4 (Deterministic Rule Trace)**:
  - Evaluated rule IDs (`RULE_01_CYCLONE_WIND_GALE`, `RULE_02_GEO_PROXIMITY_BUFFER`, `RULE_03_VESSEL_WAVE_LIMIT`).
  - Rule evaluation results (`FAIL`, `CAUTION`, `PASS`).
  - Threshold values and institutional threshold authorities (e.g., DG Shipping Class IV, IMD Standard Beaufort Scale).

### 5. Institutional Role Workspaces
1. **Fisherman Perspective (`/alerts`)**:
   - High visual clarity, uncluttered by institutional jargon or raw code errors.
   - Immediate answer to: *"Can I safely navigate right now, and when must I return?"*
2. **Coastal Authority Perspective (`/authority`)**:
   - Institutional oversight across fleets.
   - Displays affected vessel IDs, maritime safety zone incursion perimeter violations, and single-click operator acknowledgement.
3. **Disaster Management Perspective (`/disaster`)**:
   - Structured tactical workspace for NDRF / SDMA coordinators:
     `ACTIVE HAZARDS → SPATIAL MAP PERIMETER → EXPOSED CRAFTS IN SECTOR → AUDIT DESK → ACKNOWLEDGE / RESOLVE`.
   - Real-time tally of active hazards and exposed crafts in exclusion zones.

### 6. Fastify REST Endpoints & Supabase RLS
- `GET /api/v1/alerts`: Returns alerts filtered by `status`, `severity`, `category`, `alertType`, `vesselId`, `missionId`.
- `GET /api/v1/alerts/:id`: Returns comprehensive 4-level progressive disclosure payload.
- `POST /api/v1/alerts/:id/acknowledge`: Records operator ID, role, and timestamp; transitions state to `ACKNOWLEDGED`.
- `POST /api/v1/alerts/:id/resolve`: Records resolution note and operator credentials; transitions state to `RESOLVED`.
- `POST /api/v1/alerts/evaluate`: Internal deterministic alert generation engine.
- **Row-Level Security (RLS)**: Enforces public/operator read isolation on `public.alerts`, restricting update and delete mutations to authorized operator roles.

### 7. IMD Integration Honesty Invariant
Official IMD API gateway credentials remain pending administrative clearance. In strict accordance with the honesty directive:
- IMD radar and warning items are explicitly tagged `ACCESS_PENDING / DEMO`.
- Zero fake cyclone alerts or fabricated real-time weather warnings are presented.
- Live alerts rely strictly on verified `INCOIS OSF`, `INCOIS PFZ`, and deterministic `PostGIS` GIS boundaries.

### 8. Quality Gates & Verification Summary
- **Unit & Integration Tests**: 270/270 tests passed across 18 test files (including 20 dedicated Phase 19 tests in `server/__tests__/phase19_alerts.test.ts`).
- **Real Browser CDP Automation**: Real Chrome headless browser verified 22 mandatory interactions:
  - Active alert rendering and severity badges
  - 4-level progressive disclosure modal navigation
  - Acknowledge workflow mutation & Fastify persistence
  - Resolve workflow mutation with operator justification note & Fastify persistence
  - Filter empty state handling
  - Disaster Management tactical map and exposed asset tables
  - Role-specific Fisherman vs Authority presentation
  - Mobile viewport (375 × 812) verification with zero horizontal overflow
  - Intercepted network metrics (24 GET `/alerts`, 2 POST `/acknowledge`, 2 POST `/resolve`) and 0 console errors
- **Honesty Audit**: Zero instances of prohibited claims (`"guaranteed safe"`, `"100% accurate"`, `"zero hallucinations"`, `"autonomous emergency response"`).



