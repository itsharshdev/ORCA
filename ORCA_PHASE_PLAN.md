# ORCA SIH 2026 — BUILD PHASE PLAN
24 phases. Execute sequentially. Do not skip foundations.

## Operating rule

One phase = one verifiable milestone.

For every phase:
1. inspect
2. plan
3. implement
4. test
5. run build/lint
6. manually verify
7. commit
8. update `ORCA_SESSION_STATE.md`
9. only then move on

If an external API/credential is unavailable, stop that integration and use an honest adapter/fallback. Never invent live data.

---

## PHASE 0 — Repository Freeze + Branch Strategy

Goal:
Create a safe technical workspace without destroying the leader's work.

Do:
- clone/copy baseline main
- create new GitHub repo if desired
- preserve original repo as upstream/reference
- create `build/orca-core`
- preserve `orca-fisherman-pwa`
- verify clean build

Recommended:
- final repo name: `ORCA-Marine-Decision-Intelligence`
- primary branch: `main`
- technical branch: `build/orca-core`
- integration branch: `integration/orca-platform`

Deliver:
- clean baseline
- branch map
- known-good commit/tag

Learn:
Why branch isolation matters and how merge/cherry-pick works.

---

## PHASE 1 — Codebase Audit

Goal:
Understand the actual code before adding backend.

Inspect:
- routes
- contexts
- services/data layer
- agents
- orchestrator
- decision engine
- maps
- mock/demo data
- PWA
- tests

Create:
- `ORCA_CODEBASE_AUDIT.md`

Do NOT refactor yet.

Deliver:
A file-by-file map of current architecture and technical debt.

Learn:
How the current prototype actually works instead of assuming the docs are accurate.

---

## PHASE 2 — Contract First

Goal:
Define the interface between leader's frontend and ORCA backend.

Create:
- `ORCA_API_CONTRACT.md`
- shared TypeScript domain types if appropriate

Define:
- mission
- vessel
- observations
- evidence
- agent result
- decision
- alert
- map layer
- connectivity
- role

Deliver:
Frontend can be pointed at mock API responses with no UI redesign.

Learn:
Why contracts prevent frontend/backend chaos.

---

## PHASE 3 — Backend Skeleton

Goal:
Create a real server-side API boundary.

Recommended stack:
- TypeScript
- Node.js
- Fastify or Express
- Zod for validation
- structured logging
- Vitest
- Supabase client

Endpoints initially:
- `/health`
- `/me`
- `/orca/query`
- `/decisions/{id}`

Deliver:
API starts locally, validates requests, returns typed responses.

Learn:
HTTP, REST, validation, service layers, environment variables.

---

## PHASE 4 — Supabase Project + Security Foundation

Goal:
Create the real persistence layer.

Setup:
- Supabase project
- PostgreSQL
- PostGIS if available/enabled
- Auth
- RLS
- migrations

Initial tables:
- profiles
- vessels
- missions
- decisions
- evidence
- data_sources

Deliver:
Authenticated user can persist a mission and retrieve only permitted records.

Learn:
PostgreSQL, RLS, migrations, auth, service-role security.

---

## PHASE 5 — Domain Database Model

Goal:
Expand storage only around actual ORCA workflows.

Add:
- mission_waypoints
- alerts
- regions
- restricted_zones
- observations
- connectivity_events
- decision_rules / rule evaluations
- replay records

Use spatial types where needed.

Deliver:
Database can represent an ORCA mission end-to-end.

Learn:
Relational modeling and why not every JSON object needs its own table.

---

## PHASE 6 — Data Adapter Framework

Goal:
Stop hard-coding external sources into agents.

Create interface:
`DataAdapter<TQuery, TResult>`

Every adapter reports:
- source
- dataset
- retrievedAt
- observedAt
- validUntil
- status
- quality
- payload/error

Deliver:
Demo fixtures can run through the same interface as future real APIs.

Learn:
Adapters, dependency inversion, testability.

---

## PHASE 7 — Demo Data Normalization

Goal:
Turn existing `data/demo` into a formal evidence-backed source.

Normalize:
- weather
- ocean
- PFZ
- hazards
- vessels
- boundaries
- regional Tamil Nadu data

Add:
- source metadata
- timestamps
- status
- units
- quality

Deliver:
No component directly guesses what demo data means.

Learn:
Data normalization and provenance.

---

## PHASE 8 — Oceanography Integration

Goal:
Integrate an official/validated ocean data source where technically possible.

Candidate direction:
INCOIS and/or official machine-readable ocean services.

Process:
1. verify access
2. inspect schema
3. test manually
4. write adapter
5. cache validated response
6. normalize
7. add evidence
8. test failure cases

If live access fails:
retain demo/cached mode with explicit status.

Deliver:
Ocean agent can consume normalized observations.

Learn:
API inspection, units, spatial/temporal metadata.

---

## PHASE 9 — Weather Integration

Goal:
Add validated weather/ocean-weather source.

Need:
- wind
- waves if available
- precipitation/storm indicators where available
- timestamp/freshness

Never fabricate wave values.

Deliver:
Weather specialist consumes adapter output.

Learn:
Forecast vs observation, freshness, missing data.

---

## PHASE 10 — PFZ / Fisheries Integration

Goal:
Create credible fishing-opportunity intelligence.

Need:
- PFZ observations/advisories where available
- spatial region
- valid time
- confidence/quality metadata

Important:
PFZ is an opportunity signal, NOT a safety signal.

Deliver:
PFZ can influence recommendation only after safety constraints.

Learn:
Why opportunity and safety must remain separate.

---

## PHASE 11 — Geo/Safety Data

Goal:
Create deterministic geospatial safety layer.

Implement:
- restricted polygons
- hazard zones
- proximity
- point-in-polygon
- route intersection
- buffer
- projected route checks

Use:
PostGIS server-side where persistent queries matter.
Turf.js for lightweight frontend operations.

Deliver:
A route can be deterministically evaluated against hazards/restrictions.

Learn:
GIS fundamentals.

---

## PHASE 12 — Vessel Capability Model

Goal:
Make decisions mission + vessel specific.

Model:
- vessel type
- max operating distance
- wave tolerance
- wind tolerance
- fuel/endurance assumptions
- crew/safety constraints

No invented universal maritime thresholds.

Thresholds must be:
- sourced
- configured
- documented as prototype assumptions if not authoritative

Deliver:
Same marine conditions can produce different decisions for different vessels.

Learn:
Constraint modeling.

---

## PHASE 13 — Deterministic Decision Engine V2

Goal:
Move decision authority to backend.

States:
GO
CAUTION
AVOID
INSUFFICIENT_DATA

Implement:
- safety overrides
- geofence rules
- vessel rules
- weather/ocean rules
- temporal return window
- data quality gate
- opportunity optimization

Deliver:
Given the same input, the engine produces the same result.

Learn:
Rule engines, precedence, deterministic systems.

---

## PHASE 14 — Evidence + Confidence System

Goal:
Make every decision auditable.

Implement:
- evidence records
- source provenance
- freshness
- spatial relevance
- temporal relevance
- conflicts
- quality

Confidence must be explainable.

Do NOT use:
"78% safe"

Prefer:
"Decision confidence: moderate because 4/5 required sources are fresh."

Deliver:
Decision details can show why ORCA believes something.

Learn:
Evidence chains and uncertainty.

---

## PHASE 15 — Agent Orchestrator V2

Goal:
Create real multi-agent workflow.

Flow:
Mission Planner
→ parallel domain specialists
→ normalized outputs
→ evidence
→ deterministic engine
→ explanation

Track:
- queued
- running
- completed
- failed
- degraded

Do not make agents merely call each other to create animation.

Deliver:
A real mission creates a traceable reasoning run.

Learn:
Concurrency, orchestration, dependency graphs.

---

## PHASE 16 — LLM Layer

Goal:
Use AI only where it adds genuine value.

Implement one controlled LLM interface for:
- intent extraction
- mission parsing
- query planning
- explanation

LLM output must be schema-validated.

LLM must NOT directly:
- approve safety
- override geofence
- create fake evidence
- invent observations

Deliver:
Natural language → structured mission/query → deterministic execution.

Learn:
Structured LLM output and tool-calling boundaries.

---

## PHASE 17 — `/orca/query` End-to-End

Goal:
Make Ask ORCA actually useful.

Example:
"I want to fish tomorrow morning for 6 hours from Rameswaram."

Pipeline:
intent
→ mission
→ location
→ time
→ planner
→ ocean/weather/PFZ/geo
→ evidence
→ decision
→ response

Deliver:
One complete real vertical slice.

Learn:
End-to-end system integration.

---

## PHASE 18 — What-If / Scenario Engine

Goal:
Reuse the SAME decision pipeline.

Inputs may change:
- time
- location
- route
- duration
- mission
- vessel constraints

Never create a separate fake what-if algorithm.

Deliver:
User changes scenario and ORCA recomputes decision + evidence.

Learn:
Scenario simulation and reproducibility.

---

## PHASE 19 — Alerts + Disaster Intelligence

Goal:
Build the disaster/authority value.

Implement:
- hazard ingestion
- alert generation
- severity
- spatial scope
- validity
- acknowledgement
- timeline

Disaster dashboard:
- hazard map
- affected area
- active alerts
- source/evidence
- temporal evolution

Deliver:
A hazard can flow from source → normalized observation → alert → stakeholder dashboard.

Learn:
Event-driven thinking and alert lifecycle.

---

## PHASE 20 — Multi-Dashboard Integration

Goal:
Integrate role-specific views.

Build/finish:
1. Fisherman
2. Authority
3. Disaster
4. Research

Maritime operator:
- integrate if time allows.

Do not duplicate backend decision logic.

Deliver:
Same ORCA intelligence can be viewed according to role/mission.

Learn:
Role-based product architecture.

---

## PHASE 21 — Offline / Degraded Mode

Goal:
Make ORCA realistic for field conditions.

Implement:
- cached observations
- age indicator
- stale warning
- offline mission draft
- queued writes where safe
- reconnect synchronization

Test:
Internet unavailable.
API timeout.
One source unavailable.
Multiple sources unavailable.

Deliver:
ORCA degrades honestly instead of displaying fake live data.

Learn:
Offline-first design and failure handling.

---

## PHASE 22 — Reliability / Security / Testing

Goal:
Turn prototype into engineering-grade demonstration.

Test:
- unit
- integration
- API
- geospatial
- RLS
- stale data
- conflicting data
- malformed API
- timeout
- offline
- safety overrides

Security:
- secrets
- CORS
- input validation
- RLS
- rate limits where needed

Deliver:
Known failure modes are demonstrated and handled.

Learn:
Reliability engineering.

---

## PHASE 23 — Final Integration + Demo Hardening

Goal:
Freeze a judge-ready build.

Checklist:
- all dashboards load
- no broken routes
- no blank map
- no console-critical errors
- mobile fisherman flow works
- authority/disaster flow works
- evidence works
- what-if works
- degraded state works
- data labels are honest
- live integrations are actually live
- demo snapshots are labelled
- build/lint/tests pass

Create:
- `ORCA_DEMO_RUNBOOK.md`
- final architecture diagram
- final known limitations

Deliver:
A reproducible 5–8 minute demo.

---

## PHASE 24 — Final Release + Handoff

Goal:
Make the project survivable across accounts and people.

Create/update:
- `ORCA_SESSION_STATE.md`
- `ORCA_HANDOFF.md`
- `ORCA_RELEASE_NOTES.md`
- final Git tag

Push:
- main
- integration branch
- required build branch

Deployment:
- frontend
- backend/API
- Supabase migrations
- environment configuration

Verify:
fresh machine/account can clone and run the project.

Deliver:
The project can survive switching Google/Antigravity accounts.

---

# PHASE GATES

Do not move forward if:

Phase 0: branch safety not established.
Phase 2: API contract unclear.
Phase 4: secrets/RLS unsafe.
Phase 6: adapters are coupled to UI.
Phase 11: geospatial safety is nondeterministic.
Phase 13: safety rules are LLM-controlled.
Phase 14: evidence cannot be traced.
Phase 17: end-to-end query doesn't work.
Phase 20: dashboards duplicate business logic.
Phase 22: failures are untested.
Phase 23: demo depends on hidden manual fixes.

# PRIORITY UNDER TIME PRESSURE

If time collapses, prioritize:

P0:
0,1,2,3,4,6,7,11,12,13,14,15,17,18,20,22,23

P1:
8,9,10,19,21

P2:
16,24 polish

Never sacrifice:
- deterministic safety
- evidence
- data status
- reproducibility
- security
for extra UI features.

# USER GUIDANCE MODE

The user will ask:
"Guide me through Phase X."

Response/workflow should be:
1. explain what Phase X means in simple language
2. explain why it exists
3. tell user what to install/setup
4. identify required keys/accounts
5. give exact commands
6. give one Antigravity prompt
7. tell user what AI is allowed to modify
8. tell user what NOT to modify
9. user runs it
10. inspect result/errors
11. verify checklist
12. update handoff/state
13. move to next phase

Never dump 10 phases of implementation at once when the user asks to execute one phase.
