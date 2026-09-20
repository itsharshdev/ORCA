# ORCA SESSION STATE

## Current phase
PHASE 5 — Domain Database Model (Completed)

## Status
PHASE 5 COMPLETE — READY FOR PHASE 6 (Data Adapter Framework)

## Baseline
Observed stack:
- Backend: Fastify (`^5.12.5`), `@supabase/supabase-js` (`^2.99.3`), Zod (`^4.6.5`), `@fastify/cors` (`^11.3.0`), `dotenv` (`^18.0.0`)
- Database: Supabase PostgreSQL 17 (`hxhnerghnpdrijzyhmuw`), PostGIS 3.3.7, 15 domain tables with RLS enabled
- Testing: Vitest (`^5.0.1`), tsx (`^4.23.13`) — 36 passing tests across 4 suites
- Frontend: React 19 (`^19.2.8`), TypeScript 6 (`~6.0.2`), Vite 8 (`^8.2.2`), React Router 7 (`^7.18.3`), Tailwind CSS 4 (`^4.3.3`), Leaflet (`^1.9.4`), Turf.js (`^7.4.0`), vite-plugin-pwa (`^1.3.0`)

Existing important systems:
- Phase 1 Codebase Audit: [ORCA_CODEBASE_AUDIT.md](file:///d:/Projects/ORCA/ORCA_CODEBASE_AUDIT.md)
- Phase 2 Canonical API Contract: [ORCA_API_CONTRACT.md](file:///d:/Projects/ORCA/ORCA_API_CONTRACT.md)
- Phase 2 Shared Domain Types: [src/types/contract.ts](file:///d:/Projects/ORCA/src/types/contract.ts)
- Phase 3 Backend Server: Fastify application in `server/`, typed routes (`/health`, `/me`, `/orca/query`, `/decisions/:id`), Zod request validation, predictable error envelopes.
- Phase 4 Supabase Foundation: Version-controlled migrations in `supabase/migrations/` (`profiles`, `vessels`, `data_sources`, `missions`, `decisions`, `evidence`), PostGIS spatial indexes, strict Row-Level Security (RLS) policies, grants, Supabase Auth integration, and authenticated mission persistence vertical slice.
- Phase 5 Domain Database Model: Expanded domain schema covering mission waypoints, regions, restricted zones, normalized multi-agency observations, operational alerts, connectivity telemetry events, deterministic decision rules & evaluations, and explainable replay timeline records (`supabase/migrations/20260920000003_phase5_domain_model.sql`).

## Current Branch
`orca-core`

## Immediate Next Task
Begin **PHASE 6 — Data Adapter Framework** (Unified ingestor interface, rate limiting, cache TTLs, error boundaries, and telemetry for INCOIS, IMD, and MOSDAC data pipelines).

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



