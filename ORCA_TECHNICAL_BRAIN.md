# ORCA SIH 2026 — FULL TECHNICAL BRAIN
Version: Build v1
Problem: SIH26176 — ORCA Marine EcOsystem Reasoning with Collaborative Agents
Product: ORCA — Marine Decision Intelligence
Tagline: From Marine Data to Mission-Ready Decisions

## 0. NON-NEGOTIABLE PRODUCT DEFINITION

ORCA is NOT a generic chatbot, a dashboard full of charts, or an "AI agent demo".

ORCA is a marine decision-intelligence layer:

MISSION → CONTEXT → DATA → SPECIALIST REASONING → NORMALIZATION → SAFETY/CONSTRAINTS → DECISION → EVIDENCE → ACTION/ALERT → REPLAY

The product's output is a decision that is:
- mission-aware
- evidence-backed
- uncertainty-aware
- spatially aware
- temporally aware
- constrained by deterministic safety rules
- explainable to the stakeholder
- honest about data freshness and availability

Current primary stakeholders/interfaces:
1. Fisherman
2. Coastal Authority
3. Disaster Management
4. Research / Marine Analyst
5. Maritime Operator (lighter implementation unless time allows)

The same intelligence/data layer must serve different role-specific dashboards. Do NOT duplicate decision logic per dashboard.

## 1. CURRENT REPOSITORY BASELINE

The uploaded baseline is a Vite + React + TypeScript application.

Observed baseline stack:
- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Tailwind CSS 4
- Leaflet + React Leaflet
- Turf.js
- lucide-react
- vite-plugin-pwa

Existing important areas:
- src/agents/
- src/decision/
- src/orchestration/
- src/context/
- src/pages/
- src/components/map/
- src/components/decision/
- src/components/agents/
- data/demo/
- existing deterministic decision engine and tests

The existing frontend is an asset, not disposable code.

RULE:
Before changing a file, inspect it. Never let an AI agent rewrite a working subsystem merely because it does not understand it.

## 2. TARGET ARCHITECTURE

Browser/PWA
    |
    | HTTPS REST / JSON
    v
ORCA API
    |
    +-- Auth / Role / Request validation
    |
    +-- Mission Service
    +-- Decision Service
    +-- Map/Geo Service
    +-- Alert Service
    +-- Evidence Service
    +-- Connectivity/Cache Service
    |
    v
ORCA Orchestrator
    |
    +-- Mission Planner
    +-- Oceanography Specialist
    +-- Meteorology Specialist
    +-- PFZ/Fisheries Specialist
    +-- Geo/Safety Specialist
    |
    v
Normalization + Data Quality + Evidence
    |
    v
Deterministic Decision Engine
    |
    +-- safety overrides
    +-- geofence constraints
    +-- vessel capability
    +-- weather/ocean thresholds
    +-- temporal return window
    +-- data quality gate
    +-- opportunity optimization
    |
    v
Decision + Evidence + Explanation
    |
    +-- Fisherman dashboard
    +-- Authority dashboard
    +-- Disaster dashboard
    +-- Research dashboard
    +-- Maritime dashboard

External data adapters sit behind a common interface.

## 3. FRONTEND/BACKEND OWNERSHIP

Frontend owns:
- visual presentation
- route/navigation
- responsive layouts
- map rendering
- local UI state
- dashboard-specific workflows
- loading/error/empty states
- offline UI
- mock fallback during development

Backend owns:
- APIs
- authentication/authorization
- persistent data
- external data retrieval
- normalization
- evidence/provenance
- orchestration
- specialist processing
- deterministic decision engine
- geospatial safety computation
- alerts
- history/replay
- what-if execution
- data freshness/conflict status

Do not put critical safety logic in React.

## 4. ROLE-AWARE DASHBOARDS

### Fisherman
Mobile-first:
- current marine conditions
- safe fishing recommendation
- PFZ
- route
- restricted/hazard zones
- alerts
- trip planner
- what-if
- vessel context
- evidence/freshness
- degraded/offline state
- voice/regional-language layer where feasible

### Coastal Authority
Desktop/tablet:
- regional situation map
- vessel activity
- restricted zones
- geofence conflicts
- incidents
- alerts
- hazard layers
- evidence
- decision history

### Disaster Management
Desktop:
- hazard monitoring
- cyclone/severe-weather context
- wave/weather/ocean exposure
- affected areas
- vulnerable zones/assets
- alert timeline
- spatial risk
- evidence and source freshness

### Research / Analyst
Desktop:
- SST/chlorophyll/ocean variables
- temporal trends
- spatial comparison
- anomalies
- PFZ/fisheries context
- evidence/provenance
- data-quality inspection
- historical/replay queries

### Maritime Operator
Desktop/tablet:
- route planning
- vessel constraints
- weather/ocean conditions
- operational windows
- hazards
- route risk
- decision evidence

## 5. DECISION STATES

Only:
- GO
- CAUTION
- AVOID
- INSUFFICIENT_DATA

Never expose an arbitrary percentage as "probability of safety".

Risk and confidence are separate concepts.

Confidence describes how well the system can support its recommendation from available, fresh, relevant, non-conflicting evidence.

A low-confidence CAUTION is valid.
An INSUFFICIENT_DATA result is better than fabricated certainty.

## 6. SAFETY ORDER

Deterministic priority:

1. Severe official hazard / warning
2. Restricted/geofence conflict
3. Vessel capability conflict
4. Weather/ocean physical risk
5. Temporal exposure / return-window conflict
6. Mission constraints
7. Fishing opportunity / PFZ optimization
8. Safest feasible plan
9. Human-readable explanation + evidence

A high fishing opportunity must NEVER override a hard safety constraint.

## 7. AGENT DESIGN

Current meaningful specialist set:
1. Mission Planner
2. Oceanography
3. Meteorology
4. PFZ/Fisheries
5. Geo/Safety

Orchestrator:
- Planner determines required context/tasks.
- Independent domain specialists run concurrently where dependencies permit.
- Results are normalized.
- Deterministic engine evaluates them.
- Evidence is attached to claims.
- Explanation is generated from structured decision output.

Do NOT add agents simply to claim "10 agents".

Future specialists can include:
- Route Optimization
- Vessel Capability
- Hazard Intelligence
- Satellite/EO
- Change Detection
- Disaster Exposure
- Fleet Intelligence
- Communication Gateway
- Reporting

These are future architecture unless actually implemented.

## 8. AI VS DETERMINISTIC LOGIC

LLM/AI is appropriate for:
- natural-language intent extraction
- mission interpretation
- task planning
- tool selection
- summarization
- explanation
- multilingual response
- converting structured results into understandable language

Deterministic code is mandatory for:
- geofence geometry
- distance calculations
- projected route conflicts
- hard safety thresholds
- vessel constraints
- return-window checks
- freshness checks
- conflict resolution
- state transitions
- safety overrides

Never ask an LLM "is this coordinate inside a restricted polygon?" and trust its answer.

## 9. SUPABASE TARGET

Use Supabase as the persistence/backend platform where practical:
- PostgreSQL
- PostGIS
- Auth
- Row Level Security
- Storage
- Edge Functions where useful
- Realtime only where it materially helps

Recommended logical tables:
- profiles
- vessels
- missions
- mission_waypoints
- decisions
- decision_rules
- evidence
- data_sources
- alerts
- alert_acknowledgements
- regions
- restricted_zones
- hazard_observations
- ocean_observations
- weather_observations
- pfz_observations
- vessel_positions (only if a validated source exists)
- connectivity_events
- decision_replays

Do not create all tables blindly. Build them phase-by-phase around real workflows.

RLS:
- user sees own fisherman data
- authorities see permitted operational regions
- disaster role sees disaster datasets
- researchers see permitted analytical data
- service-role operations are isolated from browser credentials

NEVER expose SUPABASE_SERVICE_ROLE_KEY in Vite/client code.

## 10. API PRINCIPLES

Frontend must call stable APIs, not internal database tables directly for core decisions.

Canonical endpoint family:
GET  /health
GET  /me
GET  /home
POST /orca/query
GET  /map
GET  /alerts
GET  /updates
POST /trips/plan
GET  /trips/{id}
POST /trips/{id}/what-if
GET  /decisions/{id}
GET  /decisions/{id}/evidence
GET  /decisions/history
GET  /vessel
GET  /connectivity

Role dashboards:
GET /authority/overview
GET /disaster/overview
GET /research/overview
GET /maritime/overview

These are target contracts, not permission to invent implementation. Validate each endpoint against the actual frontend before coding.

## 11. COMMON RESPONSE CONTRACT

Every data-bearing response should make status explicit.

Suggested:
{
  "status": "LIVE|INTEGRATED|DEMO_SNAPSHOT|CACHED|STALE|UNAVAILABLE",
  "retrievedAt": "...",
  "validUntil": "...",
  "source": "...",
  "dataset": "...",
  "quality": "...",
  "data": {}
}

For decisions:
{
  "decisionId": "...",
  "verdict": "GO|CAUTION|AVOID|INSUFFICIENT_DATA",
  "confidence": {},
  "primaryDriver": "...",
  "mission": {},
  "recommendedPlan": {},
  "ruleEvaluations": [],
  "evidence": [],
  "dataQuality": {},
  "generatedAt": "..."
}

Do not silently turn demo fixtures into LIVE.

## 12. EVIDENCE MODEL

Every important decision factor should be traceable.

Minimum evidence:
- source
- dataset
- observedAt
- validUntil if available
- retrievedAt
- variable
- value
- unit
- latitude/longitude or geometry
- spatial relevance
- temporal relevance
- status
- quality/confidence
- transformation/adapter name

Pipeline:
External source
→ adapter
→ common schema
→ validation
→ freshness check
→ conflict check
→ evidence record
→ decision engine

## 13. REAL DATA STRATEGY

Priority:
1. deterministic fixtures for tests
2. official machine-readable government/scientific sources
3. validated APIs/services
4. cached snapshots with timestamp/status
5. only then additional external sources

Preferred direction:
- INCOIS / official ocean and PFZ data services
- MOSDAC / official satellite-derived services
- official weather/ocean sources
- GeoJSON/geospatial boundary sources
- AIS only if access, licensing, coverage and deployment are actually validated

Do NOT scrape a public website merely because a chart is visible.
Do NOT claim live data until retrieval has been demonstrated.

If an API is difficult/unavailable:
LIVE → INTEGRATED → CACHED → DEMO_SNAPSHOT → INSUFFICIENT_DATA
is preferable to fabricated values.

## 14. GEOSPATIAL CORE

Use PostGIS server-side for persistent geospatial queries where practical.
Use Turf.js client-side for visualization/lightweight calculations.

Important operations:
- point in polygon
- line/polygon intersection
- buffer
- distance
- bearing
- route conflict
- hazard proximity
- restricted-zone conflict
- projected vessel path
- safe-zone candidates

All critical safety geometry should be deterministic and testable.

## 15. CONNECTIVITY / OFFLINE

States:
- CONNECTED
- DEGRADED
- OFFLINE
- SAFETY_MESSAGE_RECEIVED

GPS availability does NOT mean Internet availability.

Offline behavior:
- cache last known validated data
- show exact age/status
- allow local mission draft
- queue eligible non-critical operations
- store-and-forward when connection returns
- never imply live awareness while offline

Do not claim direct satellite/radio hardware communication unless actually implemented and validated.

## 16. RELIABILITY RULES

Every external data adapter must handle:
- timeout
- malformed payload
- missing values
- stale data
- source outage
- coordinate errors
- unit conversion errors
- duplicate observations
- conflicting sources

The system must degrade gracefully.

Bad:
"Weather API failed" → fake weather.

Good:
"Weather source unavailable. Last validated observation: 47 minutes old. Decision confidence reduced."

## 17. SECURITY

Secrets:
- never commit .env
- never put service-role keys in frontend
- browser gets only publishable/anon credentials where required
- server/Edge Functions hold privileged credentials
- validate all inputs
- rate-limit expensive endpoints
- log errors without leaking secrets
- RLS is mandatory for user-owned records

## 18. OBSERVABILITY

At minimum:
- request ID
- decision ID
- mission ID
- source retrieval status
- adapter latency
- agent status
- decision-rule results
- final verdict
- evidence count
- data quality
- error category

A judge should be able to see WHY ORCA reached a result.

## 19. TESTING

Required:
- unit tests for every safety rule
- geospatial tests
- freshness tests
- conflict tests
- decision-state tests
- API contract tests
- integration test: mission → agents → decision
- degraded-data tests
- offline/cache tests
- role authorization tests
- build/lint checks

Minimum safety scenarios:
- severe warning => cannot become GO
- restricted zone => cannot become GO
- vessel exceeds wave tolerance => cannot become GO
- stale required data => may become INSUFFICIENT_DATA
- conflicting sources => confidence/data quality changes
- safe mission with adequate evidence => can become GO
- what-if changes the same pipeline, not a parallel fake algorithm

## 20. DEMO PRINCIPLE

The national demo should prove one coherent chain.

Example:
Fisherman creates mission
→ ORCA asks/infers required context
→ agents retrieve/process domain data
→ evidence appears
→ deterministic engine checks safety
→ ORCA produces verdict
→ map explains location
→ user changes time in What-If
→ same engine re-evaluates
→ alert/dashboard reflects the new situation

Then show the same underlying event from:
- Fisherman
- Authority
- Disaster
or Research perspective.

That proves "platform", not "five unrelated pages".

## 21. AI AGENT RULEBOOK

Any coding AI must:
1. inspect existing files before editing
2. state assumptions
3. never invent external API fields
4. never invent live data
5. never move secrets into frontend
6. preserve existing working behavior
7. make small commits
8. run lint/build/tests after changes
9. report changed files
10. report what was actually verified
11. report what remains mocked
12. stop when a required credential/API/document is missing instead of hallucinating it
13. never delete code just to simplify a task
14. use adapters instead of coupling UI to external APIs
15. keep safety logic deterministic
16. update the relevant handoff/state file after a completed phase

## 22. DEFINITION OF DONE

A feature is not "done" because the page renders.

Done means:
- code exists
- API contract works
- errors are handled
- data status is visible
- tests cover critical logic
- build passes
- no secret leakage
- source provenance exists where relevant
- frontend integration works
- fallback behavior works
- the feature has been manually demonstrated

## 23. COMPETITIVE PRINCIPLE

Do not compete by saying:
"we have more agents."

Compete through:
- mission-aware reasoning
- evidence-backed decisions
- deterministic safety
- geospatial/temporal reasoning
- scenario simulation
- uncertainty awareness
- multiple stakeholder views
- real data integration where validated
- graceful degraded operation
- reproducible decision history

The technical credibility of ORCA is more important than visual quantity.

## 24. WHAT WE WILL NOT FAKE

Never claim:
- live INCOIS/MOSDAC unless verified
- universal AIS coverage
- real satellite communication
- direct radio control
- guaranteed safety
- 100% accuracy
- autonomous vessel control
- production certification
- emergency service replacement
- a specific dataset is available when it has not been tested
- an agent is implemented when it is only a planned module

## 25. SOURCE OF TRUTH ORDER

When documents disagree:

1. Official SIH problem statement / official requirement
2. ORCA Ultimate Product Brain
3. ORCA Technical Brain (this file)
4. Phase Plan
5. API/Data contracts
6. current source code
7. AI-generated suggestions

Code can be wrong.
AI can be wrong.
The docs are constraints, not excuses to avoid checking code.

## 26. CURRENT REPO STRATEGY

Keep:
- existing `main`
- leader's `orca-fisherman-pwa` branch as a recoverable UI branch
- a dedicated technical build branch

Recommended technical branch:
`build/orca-core`

Recommended integration branch:
`integration/orca-platform`

Recommended final:
`main`

Do not work directly on main.

## 27. ACCOUNT SWITCHING

The Google/Antigravity account is NOT the project's source of truth.

The repository + MD files are.

Every completed phase should leave:
- code
- commit
- phase status
- changed-file list
- environment requirements
- known limitations
- next phase

Therefore switching Google accounts should not lose project context.

## 28. HANDOFF CADENCE

Do not create a giant handoff after every tiny edit.

Create/update:
- `ORCA_SESSION_STATE.md` after every completed phase
- `ORCA_HANDOFF.md` whenever another person/AI needs to continue
- `ORCA_PHASE_PLAN.md` when phase status changes
- `ORCA_TECHNICAL_BRAIN.md` only when architecture/decisions materially change

Before switching accounts:
1. commit
2. push
3. update session state
4. update handoff
5. record exact next command/phase
6. record env vars required
7. record unverified integrations

## 29. TEAM INTEGRATION

Leader's UI should NOT be merged continuously after every frontend change.

Recommended:
- Phase 0: freeze baseline
- Phase 1–3: agree API/data contracts
- Phase 4+: backend develops against contracts
- Leader can continue UI using mock adapters
- First meaningful merge after contracts stabilize
- Later merges at deliberate integration checkpoints

Preferred git method:
- fetch leader branch
- inspect diff
- merge/cherry-pick selected commits
- resolve conflicts intentionally
- run build
- test fisherman dashboard
- tag a known-good integration commit

Do not overwrite leader's branch.

## 30. FINAL TARGET

The final ORCA should feel like:

"A marine operational intelligence platform where the user gives a mission, ORCA gathers the relevant marine context, specialized agents reason over it, deterministic safety logic constrains it, and the system returns an evidence-backed decision with spatial and temporal explanation."

Not:

"An AI chatbot with a map."
