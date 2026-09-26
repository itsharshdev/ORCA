# ORCA — PHASE-WISE IMPLEMENTATION PLAN V2
## SIH26176 — ORCA Marine EcOsystem Reasoning with Collaborative Agents
### National-Level Build Plan — Post Phase 8 / Phase 9 Ready

> **Status:** V2 supersedes the sequencing/execution instructions of the older `ORCA_PHASE_PLAN.md`.
>
> **Compatibility rule:** Nothing important from the previous phase plan is discarded. The original product vision, phase objectives, safety rules, data strategy, backend architecture, PWA/offline requirements, multi-dashboard scope, testing requirements, and phase gates are preserved and reorganized around the current real implementation.
>
> **Current verified project position:** Phase 0–8 engineering foundations are substantially complete; Phase 9 is the next active implementation phase.
>
> **Primary objective:** Build a genuinely functional, technically defensible, mission-aware marine decision-intelligence platform for SIH26176 — not a feature-count demo.

---

# 0. NORTH STAR

## 0.1 Official problem

Marine stakeholders already have access to large amounts of oceanographic, meteorological, fisheries, Earth Observation, geospatial and advisory information. The difficult problem is turning fragmented, technical, changing information into a context-aware operational answer.

ORCA therefore exists to provide:

> **Mission-aware marine decision intelligence that combines heterogeneous marine information, applies deterministic constraints, explains the resulting recommendation, and keeps the user aware of uncertainty, freshness and evidence.**

The product is **not**:
- a generic chatbot;
- a weather application;
- a PFZ application;
- a map;
- a dashboard full of charts;
- a collection of agents.

The product is:

> **MISSION → CONTEXT → DATA → CORRELATION → CONSTRAINTS → DECISION → EVIDENCE → ACTION → RE-EVALUATION**

---

# 1. NATIONAL-LEVEL PRODUCT PRINCIPLES

These replace "build more features" as the main strategy.

## 1.1 The mission is the unit of intelligence

A user does not normally ask:

> "Give me SST."

A user asks:

> "Can I go fishing tomorrow morning for five hours?"

Therefore ORCA must reason around:
- who is asking;
- role;
- vessel/assets;
- location;
- destination/zone;
- objective;
- departure time;
- return time;
- route;
- environmental conditions;
- hazards;
- restrictions;
- source freshness;
- uncertainty.

## 1.2 Evidence before confidence

Every important recommendation must be traceable.

A judge should be able to ask:

> "Where did this number come from?"

and ORCA should be able to answer:
- source;
- dataset;
- variable;
- value;
- unit;
- location;
- observed/issued time;
- retrieval time;
- validity;
- adapter;
- transformation;
- effect on decision.

## 1.3 Deterministic safety before optimization

Priority:

1. official severe warning/hazard;
2. restricted/geofence conflict;
3. vessel capability conflict;
4. physical ocean/weather risk;
5. temporal exposure/return-window conflict;
6. mission constraints;
7. opportunity/PFZ optimization;
8. safest feasible plan;
9. explanation.

A high fishing opportunity can never override a hard safety constraint.

## 1.4 The product must be honest

Never:
- call demo data live;
- claim an API was verified when it was not;
- invent API fields;
- fabricate observations;
- call an LLM decision a deterministic safety decision;
- claim universal AIS coverage;
- claim direct radio/satellite communication without actual implementation;
- claim guaranteed safety;
- claim production certification;
- use a made-up safety probability.

## 1.5 Visual quality is P0

UI is not decoration.

The interface must be:
- premium;
- calm;
- information-dense without clutter;
- mobile-first for field users;
- desktop/tablet capable for authorities;
- explicit about data state;
- understandable within seconds;
- consistent across roles.

---

# 2. COMPETITIVE THESIS

Do **not** compete with other teams by saying:

> "We have more agents."

Multi-agent marine systems are a natural implementation pattern for this problem.

ORCA should instead compete through:

### A. Mission-aware reasoning
The same marine data produces different recommendations for different missions/vessels/times.

### B. Evidence-first decisions
Every important claim can be inspected.

### C. Deterministic safety boundary
AI can interpret and orchestrate, but hard safety constraints are enforced by code.

### D. Spatial-temporal reasoning
A value is not enough. ORCA considers where and when it applies.

### E. What-If re-evaluation
Changing time, duration, zone, route or vessel constraints reruns the same decision pipeline.

### F. Decision replay / change intelligence
ORCA can explain why a decision changed from yesterday to today or from one scenario to another.

### G. Uncertainty awareness
Missing, stale or conflicting evidence can produce `INSUFFICIENT_DATA`.

### H. Connectivity awareness
GPS availability, Internet connectivity and data freshness are separate states.

### I. Multi-stakeholder views
One intelligence layer supports fishermen, authorities, disaster management, researchers and maritime operators.

### J. Reproducibility
A decision can be replayed from its mission context, evidence and rule evaluations.

---

# 3. FLAGSHIP NATIONAL DEMO

The project should be engineered around one exceptionally strong vertical slice.

## User

> "Can I go fishing tomorrow morning for five hours from Alibaug?"

ORCA should:

```text
Natural language
      ↓
Mission extraction
      ↓
Location / vessel / time
      ↓
Required data planning
      ↓
INCOIS ocean
      ↓
IMD weather / warnings
      ↓
PFZ / fisheries
      ↓
GIS restrictions / hazards
      ↓
Vessel capability
      ↓
Freshness / conflict checks
      ↓
Deterministic decision engine
      ↓
GO / CAUTION / AVOID / INSUFFICIENT_DATA
      ↓
Recommended feasible plan
      ↓
Evidence + Why
      ↓
Map
      ↓
What-If
      ↓
Decision replay
```

## Judge interaction

The strongest demo sequence:

1. Create/select vessel.
2. Ask natural-language mission question.
3. Show mission extraction.
4. Show specialist work.
5. Show real/validated source data.
6. Show map context.
7. Produce decision.
8. Open "Why?"
9. Inspect evidence.
10. Change departure time.
11. Re-run the SAME decision engine.
12. Show changed recommendation.
13. Switch to degraded connectivity.
14. Show honest freshness/data-quality behavior.
15. Show the same event from an authority/disaster/research perspective.

---

# 4. TARGET ARCHITECTURE

```text
                    USER
                     │
                     ▼
             React / PWA Interface
                     │
              ORCA API / BFF
                     │
       ┌─────────────┴─────────────┐
       │                           │
  Auth / Role                Mission Service
       │                           │
       └─────────────┬─────────────┘
                     ▼
              ORCA ORCHESTRATOR
                     │
             Mission Planner
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    Ocean         Weather        PFZ/Fisheries
    Agent          Agent            Agent
       │             │             │
       └─────────────┼─────────────┘
                     ▼
                Geo/Safety
                     │
                     ▼
          DATA ADAPTER / NORMALIZER
                     │
       ┌─────────────┼──────────────┐
       ▼             ▼              ▼
    INCOIS          IMD           MOSDAC/EO
       │             │              │
       └─────────────┼──────────────┘
                     ▼
       Freshness + Conflict + Quality
                     │
                     ▼
             Evidence Layer
                     │
                     ▼
        DETERMINISTIC DECISION ENGINE
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Decision      Rules        Data Quality
        │
        ▼
 Decision + Explanation + Evidence
        │
 ┌──────┼───────────┬─────────────┐
 ▼      ▼           ▼             ▼
Map   Timeline    Alerts       What-If
```

---

# 5. ARCHITECTURAL OWNERSHIP

## Frontend owns

- visual presentation;
- route/navigation;
- responsive layout;
- map rendering;
- local UI state;
- loading/error/empty states;
- dashboard-specific presentation;
- offline UX;
- user interaction.

## Backend owns

- authentication/authorization;
- missions;
- persistent data;
- external retrieval;
- normalization;
- provenance;
- evidence;
- orchestration;
- specialist processing;
- deterministic safety;
- geospatial calculations;
- alerts;
- replay;
- What-If;
- freshness/conflict handling.

Critical safety logic must not live only in React.

---

# 6. ROLE MODEL

## 6.1 Fisherman

Mobile-first:
- vessel;
- current conditions;
- mission planner;
- fishing opportunity;
- safe/feasible zone;
- route;
- hazards;
- restricted areas;
- decision;
- why;
- evidence;
- What-If;
- history;
- alerts;
- degraded/offline state;
- voice/regional-language interface where feasible.

## 6.2 Coastal / Maritime Authority

Desktop/tablet:
- regional operational map;
- active missions;
- vessels;
- restricted zones;
- geofence incidents;
- hazard overlays;
- alerts;
- incident timeline;
- decision inspection;
- evidence.

## 6.3 Disaster Management

Desktop:
- cyclone/severe weather;
- marine hazards;
- exposed coastal regions;
- vulnerable missions/assets;
- alert timeline;
- spatial impact;
- evidence freshness;
- affected areas.

## 6.4 Research / Marine Analyst

Desktop:
- SST;
- chlorophyll;
- waves;
- currents;
- weather;
- trends;
- anomalies;
- spatial comparisons;
- PFZ;
- provenance;
- data-quality inspection;
- replay.

## 6.5 Maritime Operator

Desktop/tablet:
- fleet;
- vessel capability;
- route;
- operating window;
- marine/weather conditions;
- hazards;
- route risk;
- evidence.

All roles consume the same intelligence layer.

---

# 7. DECISION STATES

Only:

```text
GO
CAUTION
AVOID
INSUFFICIENT_DATA
```

Never use an arbitrary number as "probability of safety."

Risk and confidence are separate.

### Confidence means

> How well can ORCA support the recommendation from available, fresh, relevant and non-conflicting evidence?

Example:

```text
Decision: CAUTION

Decision confidence: MODERATE

Evidence coverage:
4 / 5 required inputs fresh

Missing:
IMD marine warning feed
```

---

# 8. DATA STATUS MODEL

Every data-bearing response should expose a state.

Preferred:

```text
LIVE
INTEGRATED
CACHED
STALE
DEGRADED
DEMO_SNAPSHOT
UNAVAILABLE
```

Do not imply live awareness when:
- offline;
- cached;
- stale;
- demo.

UI must communicate source state at the point where the user sees the data.

---

# 9. UI QUALITY STANDARD

## 9.1 Current screenshot audit

The current dashboard already has a strong visual foundation:
- dark marine command-center aesthetic;
- interactive map;
- mission panel;
- marine observation panel;
- agent reasoning panel;
- assistant;
- responsive intent;
- strong information density.

However, the current screenshot exposes credibility problems that must be corrected.

### Problem: contradictory telemetry state

Example of the current contradiction:

```text
Top:
INCOIS TELEMETRY ACTIVE

Main data panel:
DEMO SNAPSHOT
Source: ORCA_DEMO
Standalone / Cache Mode
```

These must never coexist as if they describe the same state.

### Required solution

Top-level status must derive from actual backend/data state.

Example:

```text
DATA MODE
● LIVE

INCOIS OSF
12 observations
Retrieved 13:14 IST
```

or:

```text
DATA MODE
● DEMO SNAPSHOT

ORCA DEMO
Last snapshot 06:30 UTC
```

or:

```text
DATA MODE
◐ DEGRADED

INCOIS OSF unavailable
Last validated data: 27 min ago
```

## 9.2 Remove premature pseudo-confidence

The current dashboard shows a value such as:

```text
78.4% CONFIDENCE
```

This must not be presented as safety probability.

Until the real evidence/confidence architecture exists, show:

```text
Decision evaluation pending
```

or:

```text
Evidence coverage
4 / 5
```

Phase 14 will define explainable confidence.

## 9.3 Agent status integrity

Do not use:

```text
5 AGENTS SYNCED
```

as the primary intelligence proof while some agents are fixture-based.

Instead distinguish:

```text
LIVE DATA
SIMULATED ANALYSIS
NOT YET EVALUATED
```

The UI must never visually claim more implementation than exists.

## 9.4 Premium design principles

Use:
- deep navy/ocean foundation;
- restrained cyan/teal accents;
- strong semantic warning colors;
- readable typography;
- subtle glass layers;
- high contrast;
- map-first spatial storytelling;
- compact but meaningful information;
- meaningful animation only;
- excellent loading/error/empty states.

Avoid:
- generic purple AI gradients;
- excessive neon;
- fake radar animations;
- decorative 3D;
- card overload;
- unreadable tiny text;
- AI "magic" effects.

---

# 10. PHASE STATUS

## Completed

- Phase 0 — repository/foundation
- Phase 1 — visual/UI foundation
- Phase 2 — command center
- Phase 3 — backend/API foundation
- Phase 4 — Supabase/Auth/RLS
- Phase 5 — domain database model
- Phase 6 — adapter framework
- Phase 7 — demo normalization + ingestion
- Phase 8 — INCOIS oceanography integration

## Current

- **Phase 9 — IMD weather/marine integration**

## Upcoming

- Phase 10 — PFZ/fisheries integration
- Phase 11 — GIS safety
- Phase 12 — vessel capability
- Phase 13 — deterministic Decision Engine V2
- Phase 14 — evidence/confidence
- Phase 15 — orchestrator V2
- Phase 16 — LLM interaction layer
- Phase 17 — full `/orca/query`
- Phase 18 — What-If
- Phase 19 — alerts/disaster
- Phase 20 — role dashboards
- Phase 21 — offline/degraded
- Phase 22 — reliability/security/testing
- Phase 23 — final integration/demo hardening
- Phase 24 — release/handoff

Then national-level hardening tracks are added after the original plan rather than replacing it.

---

# 11. PHASE 0 — FOUNDATION

## Goal

Stable repository and engineering baseline.

## Requirements

- React + TypeScript + Vite;
- routing;
- Tailwind;
- Leaflet;
- Turf;
- PWA;
- deterministic demo data;
- no secrets;
- clean build.

## Gate

App starts and builds without major errors.

---

# 12. PHASE 1 — VISUAL DESIGN SYSTEM

## Goal

Premium marine intelligence interface.

## Deliverables

- design system;
- typography;
- colors;
- spacing;
- navigation;
- cards;
- buttons;
- status badges;
- responsive layout;
- mobile navigation;
- loading/error/empty states.

## Gate

Visual system is consistent across major screens.

---

# 13. PHASE 2 — COMMAND CENTER

## Goal

Main marine operational workspace.

Must show:
- location;
- vessel;
- mission;
- conditions;
- map;
- alerts;
- latest decision;
- Ask ORCA.

## Gate

User understands ORCA within seconds.

---

# 14. PHASE 3 — MAP / SPATIAL FOUNDATION

## Goal

Map becomes a reasoning surface.

Layers:
- vessel;
- PFZ;
- hazards;
- boundaries;
- observations;
- route;
- recommended area.

No fake safety claims.

## Gate

Map responds to selected mission/decision context.

---

# 15. PHASE 4 — API FOUNDATION

## Goal

Stable backend boundary.

Current implementation:
- Fastify;
- Zod;
- `/health`;
- `/me`;
- `/orca/query`;
- `/decisions/{id}`;
- predictable errors;
- Vitest.

## Gate

Frontend can consume backend contracts without owning backend logic.

---

# 16. PHASE 5 — DOMAIN DATA MODEL

Represent real ORCA workflows with:
- profiles;
- vessels;
- missions;
- mission waypoints;
- decisions;
- evidence;
- data sources;
- observations;
- alerts;
- regions;
- restricted zones;
- connectivity;
- replay/rules where justified.

Do not create every table prematurely.

---

# 17. PHASE 6 — DATA ADAPTER FRAMEWORK

Common interface:

```text
DataAdapter<TQuery, TResult>
```

Each adapter must:
- retrieve;
- timeout;
- validate;
- normalize;
- preserve provenance;
- return explicit status.

Adapters must not be coupled to UI.

---

# 18. PHASE 7 — DEMO NORMALIZATION + INGESTION

Completed architecture:

```text
Demo JSON
→ Demo Adapter
→ NormalizedObservationPayload
→ Validation
→ Ingestion Service
→ Supabase/PostGIS
→ Observation API
→ Dashboard
```

Required:
- idempotency;
- provenance;
- timestamps;
- units;
- quality;
- honest demo status.

---

# 19. PHASE 8 — INCOIS OCEANOGRAPHY

Completed direction:

```text
INCOIS
→ IncoisOsfAdapter
→ normalized observations
→ provenance
→ Supabase
→ API
→ UI
```

Target variables include where verified:
- significant wave height;
- wave period;
- swell;
- surface current;
- SST;
- wind.

INCOIS OSF officially provides ocean waves, winds, currents, water temperature and related forecast information, with forecast products for marine stakeholders. Use official machine-readable access where possible. Do not scrape a visualization merely because it exists.

## Phase 8 gate

Before claiming LIVE:
- actual retrieval must be reproducible;
- source response must be inspected;
- persisted row must correspond to actual retrieval;
- `isLive` must be truthful.

---

# 20. PHASE 9 — IMD WEATHER + MARINE WARNINGS

## Goal

Add authoritative meteorological context to ORCA.

## Priority

Prefer official IMD machine-readable APIs and marine-relevant products.

Potential sources:
- fishermen warning;
- coastal bulletin;
- sea area bulletin;
- port warning;
- current weather;
- nowcast;
- cyclone information;
- lightning/thunderstorm context.

Do not ingest every field.

## Required distinction

Store/represent:

```text
OBSERVATION
FORECAST
WARNING
BULLETIN
```

separately in metadata/semantics.

## Required timestamps

Preserve where available:
- observedAt;
- issuedAt;
- retrievedAt;
- validFrom;
- validUntil.

## Required behavior

Expired warnings must not be treated as active.

Stale forecasts must not appear current.

## UI

Show:

```text
INCOIS OSF      ● LIVE
IMD Marine      ● LIVE
Warning         NONE
Freshness       12 min
```

or the correct degraded/demo state.

## Gate

Real API parsing is verified or explicitly marked unverified.

No fabricated LIVE data.

---

# 21. PHASE 10 — PFZ / FISHERIES INTELLIGENCE

## Goal

Connect fishing opportunity with mission context.

PFZ is an **opportunity signal**, not a safety verdict.

Potential inputs:
- PFZ advisories;
- chlorophyll;
- SST;
- distance;
- direction;
- advisory validity;
- coastal sector;
- fishing context.

## Product behavior

ORCA should be able to answer:

> "Where is the nearest relevant fishing opportunity?"

and later:

> "Is that opportunity actually feasible for my vessel and mission?"

This distinction is crucial.

## Gate

PFZ cannot override safety.

---

# 22. PHASE 11 — DETERMINISTIC GIS SAFETY

## Goal

Turn spatial information into testable safety constraints.

Use PostGIS server-side.

Use Turf for frontend visualization/lightweight calculations.

Implement:
- point-in-polygon;
- distance;
- bearing;
- buffer;
- route/polygon intersection;
- hazard proximity;
- restricted-zone conflict;
- projected path;
- candidate safe zones.

## Critical rule

Do not ask an LLM whether a coordinate is inside a restricted polygon.

## Gate

GIS calculations are deterministic and unit-tested.

---

# 23. PHASE 12 — VESSEL CAPABILITY

## Goal

Make decisions mission- and vessel-specific.

Represent:
- vessel type;
- max safe wind where legitimately defined;
- max wave tolerance where legitimately defined;
- endurance;
- fuel;
- operating range;
- crew constraints;
- safety equipment/capabilities where available.

Do not invent universal thresholds.

Where thresholds are demo assumptions:
- label them;
- isolate them in rules/configuration;
- explain their status.

## Gate

Same environmental conditions can produce different results for different vessels for defensible reasons.

---

# 24. PHASE 13 — DETERMINISTIC DECISION ENGINE V2

## Goal

The core intelligence/safety layer.

Pipeline:

```text
Mission
+
Vessel
+
Ocean
+
Weather
+
PFZ
+
GIS
+
Warnings
+
Freshness
+
Conflicts
        ↓
Decision Engine
        ↓
GO / CAUTION / AVOID / INSUFFICIENT_DATA
```

Safety order:

1. severe warning;
2. geofence;
3. vessel capability;
4. physical conditions;
5. temporal return;
6. mission constraints;
7. opportunity.

## Rule output

Every rule should produce:

```text
ruleId
category
input
threshold/source
result
severity
reason
```

## Gate

Same normalized input gives same result.

Severe hazard cannot become GO.

Restricted conflict cannot become GO.

Missing critical data can produce INSUFFICIENT_DATA.

---

# 25. PHASE 14 — EVIDENCE + CONFIDENCE

## Goal

Make the decision auditable.

Evidence must include:
- source;
- dataset;
- variable;
- value;
- unit;
- geometry;
- observed/issued time;
- validity;
- retrieval;
- spatial relevance;
- temporal relevance;
- quality;
- transformation.

## Confidence

Confidence is evidence support, not probability of safety.

Example:

```text
Decision: CAUTION
Confidence: HIGH

Evidence:
5/5 required inputs fresh
0 unresolved source conflicts
```

or:

```text
Decision: INSUFFICIENT_DATA
Confidence: LOW

Missing:
current marine warning
```

## Gate

A judge can trace every important decision factor.

---

# 26. PHASE 15 — ORCHESTRATOR V2

## Goal

Real agentic task decomposition.

Pipeline:

```text
Natural-language request
        ↓
Mission Planner
        ↓
Task plan
        ↓
Parallel specialist tasks
        ↓
Normalized results
        ↓
Evidence
        ↓
Deterministic engine
        ↓
Explanation
```

Agent states:
- queued;
- running;
- completed;
- failed;
- degraded.

Agents should execute actual tool/data work where implemented.

Do not show fake agent progress animations as evidence of computation.

---

# 27. PHASE 16 — LLM INTERACTION LAYER

LLM can:
- parse intent;
- extract mission;
- plan tool calls;
- summarize;
- explain;
- translate;
- answer follow-up questions.

LLM cannot:
- approve safety;
- override geofence;
- invent observations;
- invent evidence;
- modify deterministic verdict.

Use schema-validated outputs.

---

# 28. PHASE 17 — END-TO-END ORCA QUERY

Natural language:

> "Can I go fishing tomorrow morning for five hours?"

becomes:

```text
intent
→ mission
→ location
→ time
→ data plan
→ retrieval
→ normalization
→ evidence
→ decision
→ explanation
```

The response should contain:
- verdict;
- recommended plan;
- reasons;
- evidence;
- freshness;
- map context;
- next action.

## Gate

One real end-to-end mission works without hidden manual steps.

---

# 29. PHASE 18 — WHAT-IF / SCENARIO ENGINE

What-If must reuse the SAME pipeline.

Examples:
- change departure;
- change duration;
- change zone;
- change route;
- change vessel;
- change mission objective.

UI:

```text
CURRENT
05:45 / 5h
CAUTION

WHAT-IF
08:00 / 5h
AVOID

Changed drivers:
+ wind exposure
+ wave exposure
- return-window margin
```

## Gate

No separate fake scenario algorithm.

---

# 30. PHASE 19 — ALERT + DISASTER INTELLIGENCE

## Goal

Support authorities and disaster management.

Inputs:
- official severe weather;
- cyclone;
- wave conditions;
- coastal exposure;
- vulnerable missions;
- affected zones.

Functions:
- active alerts;
- acknowledgement;
- escalation state;
- affected area;
- affected missions;
- evidence;
- timeline.

## Gate

An alert can be traced back to source evidence.

---

# 31. PHASE 20 — MULTI-DASHBOARD PLATFORM

Build role-specific interfaces over the same intelligence layer.

## Fisherman

Mission-first mobile workflow.

## Authority

Situation-first operational workflow.

## Disaster

Hazard/exposure-first workflow.

## Research

Data/trend/provenance-first workflow.

## Maritime

Route/fleet/operational-window workflow.

Do not duplicate backend decisions.

## Strong platform demo

Show one event in two views:

```text
Fisherman:
"My trip is CAUTION."

Authority:
"3 missions are affected by this weather window."
```

Same underlying evidence.

That proves platform architecture.

---

# 32. PHASE 21 — OFFLINE / DEGRADED / CONNECTIVITY

States:

```text
CONNECTED
DEGRADED
OFFLINE
SAFETY_MESSAGE_RECEIVED
```

Important:

GPS ≠ Internet.

Offline behavior:
- cached validated observations;
- visible data age;
- local mission drafting;
- queued eligible operations;
- store-and-forward where appropriate;
- no false LIVE state.

Do not claim software-only radio/satellite communication.

---

# 33. PHASE 22 — RELIABILITY + SECURITY + TESTING

Required:

### Unit
- decision rules;
- GIS;
- freshness;
- conflicts;
- normalization.

### Integration
- mission → retrieval → evidence → decision.

### API
- validation;
- authorization;
- error contracts.

### Security
- RLS;
- secrets;
- CORS;
- input validation;
- rate limits.

### Failure
- timeout;
- malformed response;
- source outage;
- stale data;
- conflicting sources;
- offline;
- missing critical data.

Minimum safety tests:

```text
severe warning => never GO
restricted zone => never GO
vessel limit exceeded => never GO
critical stale data => can become INSUFFICIENT_DATA
conflict => quality/confidence changes
safe mission + adequate evidence => can become GO
```

---

# 34. PHASE 23 — FINAL INTEGRATION + DEMO HARDENING

## Product hardening

Test from clean browser:

1. login;
2. profile;
3. vessel;
4. mission;
5. natural-language question;
6. data retrieval;
7. agent trace;
8. decision;
9. Why/evidence;
10. map;
11. What-If;
12. history/replay;
13. alert;
14. degraded mode;
15. mobile;
16. reload.

## Demo hardening

Critical presentation path must not depend on an external API being online at presentation time.

Use:
- validated snapshots;
- deterministic fallback;
- visible source status.

Never silently fall back to fake LIVE.

---

# 35. PHASE 24 — RELEASE / HANDOFF

Deliver:
- working deployment;
- environment documentation;
- database migrations;
- test report;
- architecture docs;
- API docs;
- demo scenario;
- known limitations;
- team roles;
- backup build;
- final branch/tag.

Before submission:
- commit;
- push;
- clean build;
- clean test;
- verify deployment;
- verify mobile;
- verify all claimed LIVE sources;
- verify no secrets;
- verify demo fallback.

---

# 36. NATIONAL DIFFERENTIATOR TRACK A — MISSION GRAPH

## Purpose

Represent the current mission as a connected context object.

Example:

```text
Mission
├── User
├── Vessel
├── Origin
├── Destination
├── Time window
├── Route
├── Objective
├── Ocean evidence
├── Weather evidence
├── PFZ evidence
├── GIS constraints
├── Alerts
└── Decision
```

This is NOT GraphRAG.

It is structured mission context.

Use relational/PostGIS structures unless a graph database becomes genuinely justified.

---

# 37. NATIONAL DIFFERENTIATOR TRACK B — CHANGE INTELLIGENCE

Build:

> **"What changed?"**

Compare:
- previous decision;
- current decision;
- previous evidence;
- current evidence;
- changed spatial conditions;
- changed warnings;
- changed forecast window.

Output:

```text
DECISION CHANGED

Previous:
GO

Current:
CAUTION

Drivers:
Wave height +0.7 m
Wind +6 kt
New coastal warning
PFZ unchanged
```

This is one of ORCA's strongest potential features.

---

# 38. NATIONAL DIFFERENTIATOR TRACK C — DECISION REPLAY

Store enough information to reproduce a historical decision.

Replay should show:

```text
MISSION
↓
DATA SNAPSHOT
↓
EVIDENCE
↓
RULE EVALUATIONS
↓
VERDICT
```

This is useful for:
- research;
- authority review;
- debugging;
- judge demonstration;
- accountability.

---

# 39. NATIONAL DIFFERENTIATOR TRACK D — SOURCE CONFLICT INTELLIGENCE

Sources can disagree.

ORCA should not silently average them.

Example:

```text
INCOIS:
wave = 1.2 m

Source B:
wave = 2.0 m

Conflict detected.
```

Then:

```text
Decision:
CAUTION

Reason:
Material source conflict in wave forecast.
```

This is more credible than pretending all sources agree.

---

# 40. NATIONAL DIFFERENTIATOR TRACK E — PREDICTIVE SPATIAL SAFETY

Eventually evaluate:

```text
current vessel position
+
planned route
+
future time
+
hazard movement
+
restricted boundaries
```

to determine whether a route is projected to enter a risk area.

This is stronger than a static geofence.

Still deterministic.

---

# 41. NATIONAL DIFFERENTIATOR TRACK F — MISSION-SPECIFIC ALTERNATIVES

ORCA should not stop at:

> AVOID.

When safe alternatives exist:

```text
Current plan:
AVOID

Alternative:
Departure 07:00
Zone C
Duration 3h

Result:
CAUTION
```

Every alternative must be evaluated by the same engine.

---

# 42. NATIONAL DIFFERENTIATOR TRACK G — ROLE TRANSLATION

Same event:

```text
Storm approaching coastal sector
```

Fisherman:

> "Your planned trip overlaps the affected window."

Authority:

> "7 active missions fall inside the projected exposure area."

Disaster manager:

> "Two coastal sectors show elevated exposure."

Researcher:

> "Wave anomaly increased 31% over the previous forecast cycle."

Same intelligence layer.

Different operational presentation.

---

# 43. NATIONAL DIFFERENTIATOR TRACK H — KNOWLEDGE/RAG

RAG is optional, not the core.

Good future RAG sources:
- regulations;
- advisories;
- SOPs;
- manuals;
- policy documents;
- marine guidance;
- historical reports.

RAG must not replace structured retrieval for:
- wave;
- wind;
- SST;
- chlorophyll;
- coordinates;
- geofences.

RAG cannot override deterministic safety.

GraphRAG is not required unless a large interconnected document corpus actually justifies it.

---

# 44. NATIONAL DIFFERENTIATOR TRACK I — MULTILINGUAL FIELD UX

Priority:
- English;
- Hindi;
- Marathi;
- then additional coastal languages where feasible.

Language changes:
- query interface;
- explanations;
- alert summaries;
- voice.

It must not change underlying decision logic.

---

# 45. NATIONAL DIFFERENTIATOR TRACK J — CONNECTIVITY-AWARE DECISION QUALITY

A decision should incorporate data availability.

Example:

```text
CONNECTED
5/5 required evidence fresh
→ CAUTION

DEGRADED
3/5 fresh
→ CAUTION / reduced confidence

OFFLINE
critical warning feed unavailable
→ INSUFFICIENT_DATA
```

Do not pretend degraded data is equivalent to live data.

---

# 46. PHASE GATES

Do not advance if the following are broken.

| Gate | Required |
|---|---|
| 0 | App/build baseline |
| 1 | Visual system |
| 2 | Command Center |
| 3 | Map |
| 4 | API |
| 5 | Database |
| 6 | Adapter abstraction |
| 7 | Persisted demo pipeline |
| 8 | Verified INCOIS integration or honest unverified state |
| 9 | IMD integration |
| 10 | PFZ data |
| 11 | Deterministic GIS |
| 12 | Vessel constraints |
| 13 | Deterministic decision engine |
| 14 | Evidence/confidence |
| 15 | Real orchestrator |
| 16 | Controlled LLM |
| 17 | End-to-end query |
| 18 | Real What-If |
| 19 | Alerts |
| 20 | Role dashboards |
| 21 | Honest offline |
| 22 | Reliability/security |
| 23 | Clean demo |
| 24 | Release |

---

# 47. TIME-CRITICAL PRIORITY

If time becomes limited, prioritize:

## P0

1. real data adapters;
2. mission model;
3. evidence;
4. deterministic safety;
5. GIS;
6. vessel constraints;
7. end-to-end query;
8. What-If;
9. excellent fisherman UX;
10. one strong authority/disaster view;
11. reliability;
12. demo hardening.

## P1

- multilingual;
- voice;
- replay;
- source conflicts;
- predictive route safety;
- richer research dashboard.

## P2

- advanced RAG;
- GraphRAG;
- extra specialist agents;
- advanced AIS;
- experimental communication integrations;
- nonessential visual effects.

Never sacrifice:
- safety;
- provenance;
- data honesty;
- deterministic reproducibility;
- security;
- working demo.

for decorative features.

---

# 48. DEFINITION OF DONE — FEATURE

A feature is not complete because a page renders.

Done means:

- code exists;
- API contract works;
- validation exists;
- errors are handled;
- source status is visible;
- provenance exists;
- tests cover critical logic;
- build passes;
- no secret leakage;
- frontend works;
- fallback works;
- manual demo works;
- known limitations are documented.

---

# 49. DEFINITION OF DONE — NATIONAL DEMO

A judge should be able to:

1. understand ORCA within seconds;
2. select a role;
3. define a mission;
4. ask naturally;
5. see the relevant data sources;
6. see specialist processing;
7. see the decision;
8. inspect evidence;
9. inspect the map;
10. change the scenario;
11. see the SAME engine recompute;
12. inspect why the result changed;
13. observe degraded-data behavior;
14. see the same event from another stakeholder perspective.

---

# 50. DEMO STORY

## Scene 1 — Mission

> "I want to go fishing tomorrow morning from Alibaug for five hours."

## Scene 2 — ORCA understands

```text
Mission
Fishing
Alibaug
05:45
5 hours
Vessel: Matsya Sagar 1
```

## Scene 3 — Data

```text
INCOIS OSF
IMD
PFZ
GIS
Vessel profile
```

## Scene 4 — Reasoning

Specialists retrieve relevant evidence.

## Scene 5 — Decision

```text
CAUTION
```

## Scene 6 — Why

Show actual evidence.

## Scene 7 — What-If

> "What if I leave at 08:00?"

Re-run the same pipeline.

## Scene 8 — Change explanation

```text
Wind exposure ↑
Wave exposure ↑
Return margin ↓

Decision:
CAUTION → AVOID
```

## Scene 9 — Connectivity

Switch to degraded mode.

```text
IMD:
last validated data 41 min old

Freshness requirement exceeded.

Decision:
INSUFFICIENT_DATA
```

## Scene 10 — Platform

Switch to Authority:

```text
3 missions affected
1 restricted-zone conflict
2 weather-exposure warnings
```

This demonstrates the platform rather than five unrelated screens.

---

# 51. ENGINEERING WORKFLOW FOR EVERY PHASE

Before implementation:

1. inspect actual repository;
2. inspect current docs;
3. identify current behavior;
4. state assumptions;
5. inspect API/source availability;
6. plan minimal changes.

Implement:

7. one verifiable milestone;
8. preserve existing behavior;
9. use adapters;
10. add tests.

Verify:

11. unit tests;
12. typecheck;
13. lint;
14. production build;
15. manual API verification;
16. database verification;
17. browser verification;
18. mobile verification where relevant.

Close:

19. inspect diff;
20. commit;
21. update `ORCA_SESSION_STATE.md`;
22. record limitations;
23. record next phase.

---

# 52. ANTIGRAVITY RULES

Every coding agent must:

- inspect before editing;
- never invent APIs;
- never invent environment variables;
- never fabricate live data;
- never move secrets to frontend;
- preserve working behavior;
- avoid giant rewrites;
- use existing adapters;
- keep safety deterministic;
- run tests/build/lint;
- report actual verification;
- report remaining mocks;
- update session state;
- stop when required credentials/API/document are unavailable.

---

# 53. SOURCE-OF-TRUTH ORDER

When documents disagree:

1. Official SIH problem statement / official requirement;
2. `ORCA_ULTIMATE_TEAM_BRAIN_SIH2026.md`;
3. `ORCA_TECHNICAL_BRAIN.md`;
4. this `ORCA_PHASE_PLAN_V2.md`;
5. API/data contracts;
6. current source code;
7. AI-generated suggestions.

The old phase plan is preserved historically but is superseded for execution by V2.

---

# 54. TEAM COLLABORATION

Branches remain separate where useful.

Recommended:

```text
main
│
├── orca-fisherman-pwa
│
├── orca-core
│
└── integration/orca-platform
```

Do not overwrite the leader's UI branch.

Integration checkpoint:

1. fetch;
2. inspect diff;
3. merge/cherry-pick deliberately;
4. resolve conflicts;
5. run tests;
6. run build;
7. test fisherman flow;
8. tag known-good integration.

---

# 55. DOCUMENT CONTROL

Repository control files:

```text
ORCA_ULTIMATE_TEAM_BRAIN_SIH2026.md
ORCA_TECHNICAL_BRAIN.md
ORCA_API_CONTRACT.md
ORCA_DATA_SUPABASE_BRAIN.md
ORCA_RULES.md
ORCA_SESSION_STATE.md
ORCA_PHASE_PLAN_V2.md
ORCA_HANDOFF.md
ORCA_PHASE_69_UI_HANDOFF.md
```

Responsibilities:

- Ultimate Brain — product/team master context.
- Technical Brain — architecture.
- API Contract — interface contract.
- Data/Supabase Brain — persistence/data strategy.
- Rules — non-negotiable engineering rules.
- Session State — current progress.
- Phase Plan V2 — execution roadmap.
- Handoff — collaboration continuity.
- UI Handoff — UI integration contract.

---

# 56. FINAL PRODUCT DEFINITION

ORCA should feel like:

> **A marine operational intelligence platform where a user gives a mission, ORCA gathers the relevant marine context, specialized components reason over it, deterministic constraints control critical decisions, and the system returns an evidence-backed recommendation with spatial, temporal and uncertainty-aware explanation.**

Not:

> "An AI chatbot with a map."

---

# 57. FINAL POSITIONING

### Problem

> Marine information is abundant but fragmented.

### ORCA

> ORCA contextualizes that information around a real mission.

### Intelligence

> Specialist agents retrieve and analyze domain-specific information.

### Trust

> Evidence, provenance, freshness and conflicts remain visible.

### Safety

> Deterministic constraints control critical decisions.

### Differentiation

> What-If, decision replay, change intelligence and predictive spatial reasoning turn static information into operational intelligence.

### Resilience

> Connectivity and data freshness are treated as system conditions.

### Scale

> One intelligence layer supports multiple maritime stakeholders.

---

# 58. FINAL PITCH LINE

> **"ORCA does not create another source of marine information. It connects the information that already exists, understands the user's mission, and turns it into an explainable, evidence-backed operational decision."**

---

# 59. IMPORTANT IMPLEMENTATION NOTE

This plan deliberately does not promise that every advanced differentiator will be completed.

The winning strategy is:

> **Fewer fake capabilities, more complete real vertical slices.**

A smaller number of genuinely working mechanisms is stronger than a huge dashboard full of simulated features.

The national-level target is therefore:

```text
REAL DATA
+
REAL MISSION
+
REAL EVIDENCE
+
REAL DETERMINISTIC CONSTRAINTS
+
REAL WHAT-IF
+
REAL MULTI-ROLE CONTEXT
+
HONEST DEGRADATION
+
EXCELLENT UX
```

---

# 60. PHASE 9 IMMEDIATE MISSION

When Phase 9 begins, implement official IMD integration.

Required sequence:

```text
Inspect
→ verify official source
→ implement adapter
→ validate
→ normalize
→ persist
→ expose API
→ connect UI
→ fix source-status truthfulness
→ test
→ manually verify
→ update session state
→ commit
```

Do not implement Phase 10 early.

Do not add generic weather APIs merely for feature count.

Do not claim LIVE without real retrieval.

---

# 61. PHASE 9 ACCEPTANCE TEST

Phase 9 is complete only if:

- IMD adapter exists;
- official source is documented;
- marine-relevant data is retrieved or its limitation is explicitly documented;
- observation/forecast/warning/bulletin semantics are preserved;
- timestamps/validity are preserved;
- normalized records reach Supabase;
- API exposes them;
- dashboard renders them;
- source state is truthful;
- demo fallback still works;
- tests pass;
- typecheck passes;
- lint passes;
- build passes;
- no secrets leak;
- manual browser verification is performed;
- session state contains a developer walkthrough;
- exact remaining gap to Phase 10 is documented.

---

# 62. THE STANDARD FOR "WINNING"

There is no honest way to guarantee selection or victory.

The engineering target is instead:

> Build something that is difficult to dismiss because the problem is real, the data is traceable, the reasoning is reproducible, the safety boundary is explicit, the UI is excellent, and the system demonstrates a complete mission from question to decision to evidence to re-evaluation.

That is the standard this V2 plan is designed to enforce.
