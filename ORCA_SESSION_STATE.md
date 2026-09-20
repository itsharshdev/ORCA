# ORCA SESSION STATE

## Current phase
PHASE 8 — Official Oceanography Data Integration (INCOIS) (Completed)

## Status
PHASE 8 COMPLETE — READY FOR PHASE 9 (Weather & Meteorology Adapter)

## Baseline
Observed stack:
- Backend: Fastify (`^5.12.5`), `@supabase/supabase-js` (`^2.116.0`), Zod (`^4.6.5`), `@fastify/cors` (`^11.3.0`), `dotenv` (`^18.0.0`)
- Database: Supabase PostgreSQL 17 (`hxhnerghnpdrijzyhmuw`), PostGIS 3.3.7, 15 domain tables with RLS enabled, 29 persisted normalized observations in `public.observations` (17 `ORCA_DEMO` + 12 `INCOIS_OSF` records with PostGIS geometry points)
- Testing: Vitest (`^5.0.1`), tsx (`^4.23.13`) — 72 passing tests across 7 suites
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

## Current Branch
`orca-core`

## Immediate Next Task
Begin **PHASE 9 — Weather & Meteorology Adapter** (Integrating IMD weather radar, high-resolution wind, gust, squall warnings, and cyclone advisory feeds).

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






