# ORCA --- Marine EcOsystem Reasoning with Collaborative Agents

## SIH 2026 \| PS SIH26176 \| ISRO \| Software

> **Purpose:** This file is the single source of truth for the ORCA
> prototype. Any AI coding agent must read this file before changing the
> project. It is designed so the team can switch AI accounts/tools
> without losing project context.

------------------------------------------------------------------------

> **Version note:** Expanded with boundary guardian,
> incursion/trespass-safety handling, return-to-shore reasoning,
> connectivity-aware satellite/radio integration, decision replay and
> selected high-impact WOW capabilities.

## 1. Project Mission

Build a visually strong, technically credible prototype of **ORCA**, an
Agentic AI-powered conversational marine intelligence platform.

ORCA should not be positioned as "another chatbot" or "another
weather/PFZ map."

### Core promise

**ORCA converts scattered marine, weather, oceanographic and geospatial
information into an explainable, context-aware operational
recommendation.**

Simple version:

> **"Don't just tell me what is happening in the ocean. Tell me what it
> means for my mission, what I should do, and why."**

Primary demonstration persona: **small fishing vessel / fisher**.

------------------------------------------------------------------------

## 2. Official Problem Statement Understanding

### PS

**SIH26176 --- ORCA Marine EcOsystem Reasoning with Collaborative
Agents**

Organization: **Indian Space Research Organisation (ISRO)**\
Track: **Software**\
Theme: **Miscellaneous**

The problem asks for an Agentic AI conversational platform that can: -
understand natural-language marine questions; - decompose complex
requests into tasks; - coordinate specialized AI agents; - retrieve and
integrate satellite EO, GIS, weather, oceanographic and marine-advisory
information; - perform spatial, temporal and contextual reasoning; -
provide evidence-based recommendations; - support Indian regional
languages; - provide maps, charts, alerts and geospatial
visualization; - improve fishing safety; - provide geofencing
notifications; - assist route optimization and operational planning; -
expose the evidence/reasoning behind recommendations.

Example PS-style questions: - Where is the nearest Potential Fishing
Zone today? - Is it safe to venture into the sea tomorrow morning? -
What are tide, weather and sea conditions near my fishing location? -
Are there lightning/cyclone alerts? - Which regions have high
chlorophyll and favorable SST? - What is the safest route for a fishing
vessel? - Why has fish productivity declined? - Which zones should be
avoided because of hazards or geofencing restrictions?

------------------------------------------------------------------------

## 3. Core Problem

Marine information exists, but it is fragmented, technical, dynamic and
difficult to convert into an operational decision.

A user may need to combine: - PFZ information; - SST; - chlorophyll; -
waves; - wind; - tides; - weather; - cyclone/lightning alerts; - vessel
position; - maritime/geofence boundaries; - mission objective; - timing.

The real gap is therefore:

**DATA → UNDERSTANDING → CONTEXT → DECISION**

ORCA focuses on the missing decision layer.

------------------------------------------------------------------------

## 4. Positioning

### Do NOT say

> "We are replacing INCOIS/ISRO systems."

### Say

> "ORCA is a reasoning and decision-support layer that can bring outputs
> from existing marine information systems together and turn them into
> contextual, explainable actions."

Existing systems already provide valuable capabilities such as PFZ
advisories, ocean-state forecasts, multilingual dissemination, offline
navigation and boundary/emergency alerts.

Our differentiation is **cross-source correlation + contextual
reasoning + explainability + scenario planning + mission-aware
recommendations**.

------------------------------------------------------------------------

## 5. Target Users

### Primary

-   Fishermen / small fishing-vessel operators

### Secondary

-   Researchers
-   Coastal authorities
-   Disaster-management teams
-   Maritime operators
-   Fisheries departments
-   Marine/environmental monitoring teams

For the first prototype, optimize the UX for a fisher because this
produces the clearest demo.

------------------------------------------------------------------------

## 6. Product Personality

ORCA should feel: - professional; - scientific; - calm; - trustworthy; -
operational; - modern; - Indian maritime; - visually impressive but not
"AI-generated gimmicky."

Avoid: - excessive gradients; - neon cyberpunk; - giant floating 3D
objects; - meaningless animations; - too many cards; - fake satellite
imagery; - fake precision.

------------------------------------------------------------------------

# 7. Core Product Flow

``` text
USER QUERY
   ↓
INTENT + CONTEXT PARSER
   ↓
TASK PLANNER / ORCHESTRATOR
   ↓
┌────────────┬────────────┬─────────────┬────────────┐
│ Ocean      │ Weather    │ PFZ/Fisheries│ Geo/Safety │
│ Agent      │ Agent      │ Agent        │ Agent      │
└────────────┴────────────┴─────────────┴────────────┘
   ↓
EVIDENCE + DATA QUALITY CHECK
   ↓
RISK / DECISION ENGINE
   ↓
ROUTE / SCENARIO ENGINE
   ↓
ORCA RESPONSE
   ↓
MAP + TIMELINE + SOURCES + EXPLANATION
```

Important: **The LLM should explain and orchestrate; deterministic
safety rules should control critical risk decisions.**

------------------------------------------------------------------------

# 8. MVP Features --- MUST BUILD

These are the features required for a convincing department-level
prototype.

## A. Conversational Marine Assistant

Natural-language input such as:

> "Can I go fishing tomorrow morning?"

ORCA extracts: - intent = fishing safety/planning; - location; -
date/time; - vessel profile; - mission.

Show a polished chat response.

## B. Marine Decision Card

A strong answer should end with:

-   GO / CAUTION / AVOID;
-   fishing potential;
-   marine risk;
-   recommended time;
-   recommended zone;
-   short explanation;
-   source/freshness information.

## C. Interactive Map

Map layers: - vessel/current position; - PFZ/demo fishing zones; -
hazard zones; - restricted/geofence zones; - recommended route; -
alternative route.

## D. Agent Activity Panel

Show believable execution:

``` text
Planner              ✓
Ocean Agent          ✓
Weather Agent        ✓
PFZ Agent            ✓
Geo/Safety Agent     ✓
Decision Engine      ✓
Evidence Check       ✓
```

Do not fake a 10-agent architecture. Use a small number of meaningful
agents.

## E. Evidence / Trust Panel

Every recommendation should show:

``` text
Source
Value
Timestamp / validity
Role in decision
```

Example:

> Wave forecast --- 1.8 m --- latest snapshot --- increases risk.

## F. Geofence Warning

Example:

> **CAUTION: Projected route approaches restricted boundary in 4.2 km.**

For the prototype, use deterministic geometry.

## G. Scenario / What-If

Buttons: - Leave earlier - Leave later - Move fishing zone - Change
route

Then recalculate the demo result.

## H. Data Freshness

Clearly show: - Live; - Recent; - Cached; - Demo snapshot.

Never present static demo data as live.

------------------------------------------------------------------------

# 9. WOW FEATURES --- BUILD ONLY IF MVP IS STABLE

Priority order:

### WOW 1 --- Mission-based trip planner

User says:

> "I have a 3 m boat, want to fish for 5 hours tomorrow and return
> before sunset."

ORCA creates a plan.

### WOW 2 --- What-if simulator

Change departure time/location and show recommendation change.

### WOW 3 --- Predictive geofence

Use position + heading + speed to estimate boundary approach.

### WOW 4 --- Decision evidence chain

Show exactly why GO/CAUTION/AVOID was selected.

### WOW 5 --- Change detection

"Compared with yesterday, wave risk increased and the PFZ shifted."

### WOW 6 --- Voice/local language

Speech-to-text + text-to-speech using browser capabilities.

### WOW 7 --- Offline/degraded mode

Show a clear connectivity state and cached-data behavior.

## WOW 8 --- Boundary Guardian / Incursion Intelligence

Continuously evaluate vessel position, heading and speed against
configured maritime, protected or operational boundaries. Distinguish
approaching a boundary, projected crossing, and actual entry into a
configured restricted/protected zone.

Use neutral operational language such as **boundary breach detected**,
**restricted-zone entry**, or **projected incursion** rather than making
a legal accusation of trespassing. Use deterministic GeoJSON geometry
for the prototype.

## WOW 9 --- Predictive Return-to-Shore Guardian

Check whether a planned mission can still satisfy its return constraint
as time, route and conditions change. This converts static safety
information into mission-aware guidance.

## WOW 10 --- Safe Corridor / Route Risk Envelope

Show a recommended route with a visual risk corridor. Prefer lower-risk
segments and avoid configured hazards/geofences. The prototype may use
deterministic route scoring rather than a full nautical routing engine.

## WOW 11 --- Cross-Source Conflict Detector

If sources disagree or a required source is stale, ORCA should surface
the conflict and reduce decision confidence instead of silently choosing
an answer.

## WOW 12 --- Decision Replay / Mission Audit

Save a compact decision record containing mission context, inputs, agent
outputs, evidence, decision, timestamp and scenario changes so the user
can replay why a recommendation was produced.

## WOW 13 --- Marine Change Radar

Compare two snapshots and highlight meaningful changes such as PFZ
movement, rising wave risk, changing wind, approaching hazards or
boundary-status changes. This is interpretation of existing
observations, not a new satellite model.

## WOW 14 --- Connectivity Bridge / Satellite-Safe Mode

Treat connectivity as a first-class system condition. The production
architecture can consume authorized emergency/advisory messages through
maritime satellite communication systems. For the prototype, simulate a
Connectivity Gateway with states: Connected, Degraded, Offline, and
Safety Message Received.

Potential production integrations include NavIC messaging, DAT-SG,
Nabhmitra or other authorized maritime communication systems. Do **not**
claim that ORCA implements satellite/radio hardware.

Conceptual flow:

``` text
Authorized marine source
        ↓
Connectivity Gateway
        ↓
Message validation
        ↓
Safety override
        ↓
ORCA alert + map + voice
```

## WOW 15 --- Mission Utility Score

For non-emergency planning, balance fishing opportunity with vessel
capability, fuel/time cost, weather/ocean risk, return window and
geofence constraints. Safety warnings always override optimization.

## WOW 16 --- Evidence Confidence / Data Quality Meter

Show confidence based on freshness, source availability, source
agreement, spatial relevance and completeness of required inputs rather
than an arbitrary AI percentage.

Example: **Decision confidence: Reduced --- ocean forecast is stale.**

Only implement these WOW capabilities when the core demo remains stable.

------------------------------------------------------------------------

# 10. Features NOT Worth Building Today

Do not spend prototype time on: - real satellite-data processing
pipeline; - custom ML model training; - full autonomous fleet
tracking; - real satellite/radio hardware implementation; - direct
unauthorized satellite communication; - blockchain; - complex user
management; - production-grade authentication; - full multi-tenant
backend; - custom nautical chart engine; - complicated 3D ocean globe; -
training an ocean LLM; - dozens of agents.

These can be future roadmap items.

------------------------------------------------------------------------

# 11. Critical Safety Principle

ORCA is decision support, not an autonomous authority.

For safety-critical output:

``` text
Official severe warning
       ↓
SAFETY OVERRIDE
       ↓
AVOID / RETURN / SEEK OFFICIAL ADVISORY
```

Do not allow a high fishing score to override a severe safety warning.

If data is missing or stale:

> "Reliable safety recommendation unavailable because the latest
> required data is unavailable."

This is a feature, not a weakness.

### Boundary / Trespass-Safety Principle

ORCA can detect and predict **configured boundary incursions** using
vessel position, heading and speed. For the prototype, calculate
distance to the boundary, estimate projected crossing, issue escalating
warnings, and offer a safe alternative route where possible.

Do not present this as a legal enforcement system. Prefer **boundary
guardian**, **restricted-zone warning**, **projected incursion**, or
**boundary breach**.

### Connectivity / Radio-Satellite Principle

Connectivity is a system condition, not an afterthought. ORCA should
degrade gracefully when terrestrial connectivity is unavailable.

Important distinction: - **NavIC messaging** provides one-way
short-message broadcast capability used for safety alerts. - **DAT-SG /
Nabhmitra / Sagarmitra** are authorized maritime communication systems
involving specific terminals and infrastructure.

ORCA's prototype integrates at the software architecture level only. It
must not pretend to implement the hardware or satellite link. A received
authorized emergency/advisory message can enter the same evidence and
safety pipeline as other inputs.

------------------------------------------------------------------------

# 12. Data Strategy for Prototype

## Production direction

Potential data families: - INCOIS PFZ; - INCOIS Ocean State Forecast; -
ISRO/MOSDAC Earth Observation products; - weather/marine forecasts; -
GIS boundary layers; - marine advisories.

## Prototype strategy

Use a **small, clearly labelled demo dataset** shaped like real marine
data.

Recommended:

``` text
data/
  demo/
    pfz.json
    weather.json
    ocean.json
    hazards.json
    boundaries.geojson
    vessels.json
```

Each record should have: - source; - timestamp; - validity; -
coordinates; - value; - unit; - confidence/data-status.

If live data is integrated, keep the same schema.

This lets the frontend work even when an external source is unavailable.

------------------------------------------------------------------------

# 13. ORCA Decision Logic

Prototype example:

``` text
1. Check official/severe hazards.
2. Check geofence/restricted-area conflicts.
3. Evaluate vessel suitability.
4. Evaluate weather + waves + wind.
5. Evaluate fishing potential.
6. Evaluate mission constraints.
7. Select safest feasible plan.
8. Explain the decision with evidence.
```

Example:

``` text
Fishing potential      HIGH
Weather                GOOD
Wave risk              MODERATE
Geofence               CLEAR
Vessel suitability     ACCEPTABLE
Mission constraint     SATISFIED

=> CAUTION
=> Recommended departure: 05:45
=> Recommended zone: Zone B
```

The exact thresholds must be treated as **prototype/demo rules**, not
official marine safety thresholds.

------------------------------------------------------------------------

# 14. Design Direction

## Visual theme

**"Scientific Maritime Intelligence Center"**

Use: - deep navy/blue base; - restrained cyan/teal accents; -
off-white/light surfaces where useful; - clear green/amber/red status
colors only for semantic status; - subtle grid/topographic/ocean contour
motifs; - clean data typography; - map as a first-class surface.

## UI structure

Desktop:

``` text
┌──────────────────────────────────────────────┐
│ ORCA | Mission | Status | Profile            │
├──────────────┬───────────────────────────────┤
│ Conversation │ Interactive Marine Map         │
│              │                               │
│              │                               │
├──────────────┴───────────────────────────────┤
│ Decision | Timeline | Evidence | Agent Trace │
└──────────────────────────────────────────────┘
```

Mobile: - bottom navigation; - Map; - Ask ORCA; - Alerts; - Trip; -
Profile.

------------------------------------------------------------------------

# 15. Prototype Pages

## Page 1 --- Landing / Command Center

Purpose: first impression.

## Page 2 --- ORCA Assistant

Main conversational interface.

## Page 3 --- Marine Map

Layers + vessel + PFZ + hazards + geofence.

## Page 4 --- Trip Planner

Mission + vessel + timing + recommendation.

## Page 5 --- Decision Details

Evidence chain + agent trace + confidence/data freshness.

## Page 6 --- Alerts

Marine warnings and geofence notifications.

## Page 7 --- Profile / Vessel

Boat details, language, preferences.

Do not build all pages fully if time is short. Pages 1--5 are enough.

------------------------------------------------------------------------

# 16. Recommended Demo Story

### Demo scenario

User: \> "I have a small fishing boat. Can I go fishing tomorrow
morning?"

ORCA: 1. detects intent; 2. asks/uses location; 3. invokes agents; 4.
checks weather/ocean/PFZ/geofence; 5. returns CAUTION/GO/AVOID; 6.
displays map; 7. shows recommended fishing zone; 8. shows recommended
departure; 9. explains evidence; 10. changes answer when "Leave at 10
AM" is selected.

Then show: \> "Why?"

ORCA exposes the evidence chain.

Finally: \> "What if I move 8 km north?"

The map and decision update.

This is the primary winning demo.

------------------------------------------------------------------------

# 17. USP

### Main USP

> **Context-aware Marine Decision Intelligence**

### Supporting USPs

1.  Cross-source marine reasoning.
2.  Mission- and vessel-aware recommendations.
3.  Explainable evidence chain.
4.  What-if marine scenario simulation.
5.  Predictive geofence intelligence.
6.  Connectivity-aware operation.
7.  Multilingual/voice-first access.
8.  Predictive boundary/incursion intelligence.
9.  Safety-aware connectivity integration.
10. Decision replay and change-aware reasoning.

Do not call "AI chatbot", "map", "weather API", "dashboard", "RAG" or
"multi-agent" alone a USP.

------------------------------------------------------------------------

# 18. Existing Ecosystem --- Position Carefully

Existing capabilities already include: - INCOIS PFZ advisories; - INCOIS
ocean-state forecasts; - multilingual marine advisories; - WebGIS/PFZ
visualization; - offline fisherman navigation applications; - NavIC
emergency messaging; - Nabhmitra satellite-assisted tracking/messaging
and DAT-SG/Sagarmitra maritime distress communication capabilities.

Therefore ORCA's claim should be:

> **Integration and reasoning layer over heterogeneous marine
> information --- not replacement of existing official services.**

------------------------------------------------------------------------

# 19. High-Impact System Capabilities

## Boundary Guardian

``` text
Vessel position + heading + speed
              ↓
      Geospatial engine
              ↓
 distance / projected crossing
              ↓
 warning + safe alternative
```

## Safety Escalation

``` text
Normal advisory → Caution → Projected incursion / rising risk
                         ↓
                  Critical warning
                         ↓
                   Safety override
                         ↓
             Return / avoid / official advisory
```

## Connectivity Gateway

``` text
Internet APIs ─────┐
Cached data ────────┼→ Evidence Layer → Safety Decision Engine
Satellite message ─┤
Authorized alerts ─┘
```

## Decision Replay

Reconstruct a recommendation from the mission context, evidence and rule
outcomes available at the time.

## Scenario Engine

Rerun the same decision pipeline after changing time, location, route,
duration or mission constraints.

These capabilities make ORCA a **decision system**, not simply an
interface around a language model.

# 20. Technical Architecture

``` text
React + TypeScript + Vite PWA
            │
            ▼
       ORCA UI Layer
  Chat / Map / Timeline / Alerts
            │
            ▼
     Orchestrator Layer
  Intent → Plan → Tool calls
            │
    ┌───────┼────────┐
    ▼       ▼        ▼
 Ocean    Weather    Geo/PFZ
 Agent     Agent     Agents
    └───────┼────────┘
            ▼
     Evidence Layer
            ▼
   Deterministic Risk Engine
            ▼
   Recommendation + Sources
```

Future backend:

``` text
FastAPI
PostgreSQL/PostGIS
Supabase Auth/Storage
External marine/weather data adapters
Agent orchestration
```

------------------------------------------------------------------------

# 21. Free-First Strategy

Prototype should work without paid APIs.

### Required

-   React/TypeScript/Vite;
-   Tailwind CSS;
-   Leaflet + OpenStreetMap;
-   browser localStorage;
-   static JSON/GeoJSON;
-   browser Speech APIs where supported.

### Optional

-   Supabase free tier;
-   Open-Meteo for non-critical demo weather/marine data;
-   Gemini/other LLM only where a free/available quota exists.

Never make the demo depend on a single paid API.

------------------------------------------------------------------------

# 22. Account-Switch / Continuity Strategy

The project must be recoverable by a new AI account.

Every coding agent must read: 1. `ORCA_BRAIN_V1.md` 2. `ORCA_RULES.md`
3. `ORCA_SESSION_STATE.md` 4. `ORCA_TECHNICAL_APPROACH.md`

After each major phase, update `ORCA_SESSION_STATE.md`.

The repository itself is the source of truth. Chat history is not.

------------------------------------------------------------------------

# 23. Phase Plan

## Phase 0 --- Project setup

-   create repo/branch;
-   create Brain/Rules/State files;
-   initialize Vite React TypeScript;
-   install UI/map/PWA dependencies;
-   confirm build.

## Phase 1 --- Design system + UI shell

-   create Stitch design;
-   define DESIGN.md;
-   implement global theme;
-   build navbar/sidebar/mobile nav;
-   build reusable cards/buttons/status components;
-   build responsive layout.

## Phase 2 --- Core Command Center

-   dashboard;
-   marine map;
-   sample vessel;
-   PFZ zones;
-   hazards;
-   geofence;
-   decision card.

## Phase 3 --- ORCA conversational flow

-   chat UI;
-   intent chips;
-   sample queries;
-   response renderer;
-   agent activity panel.

## Phase 4 --- Decision engine

-   structured demo data;
-   risk calculation;
-   safety override;
-   recommendation generation;
-   evidence chain.

## Phase 5 --- Scenario simulator

-   change time;
-   change zone;
-   change route;
-   update recommendation/map/timeline.

## Phase 6 --- WOW polish

-   voice;
-   multilingual demo;
-   predictive geofence;
-   animations;
-   loading states;
-   data freshness;
-   error/empty states.

## Phase 7 --- PWA + reliability

-   installable PWA;
-   offline cached shell;
-   demo mode;
-   localStorage;
-   graceful API failure.

## Phase 8 --- Demo hardening

-   remove broken features;
-   verify every click;
-   seed stable demo scenario;
-   test mobile;
-   test presentation laptop;
-   prepare one-click demo flow.

## Phase 9 --- Future/backend direction

Only after the internal prototype is stable: - Supabase; - FastAPI; -
real data adapters; - authentication; - persistent decision history; -
production agent orchestration.

------------------------------------------------------------------------

# 24. Definition of Done for Internal Round

A judge should be able to: 1. open the app; 2. understand ORCA in under
10 seconds; 3. ask a marine question; 4. see agent coordination; 5. see
a map; 6. receive a decision; 7. see why the decision happened; 8.
change a scenario; 9. see the recommendation change; 10. understand what
data is live/demo/cached.

If any of these fail, fix reliability before adding another feature.

------------------------------------------------------------------------

# 25. AI Coding Agent Instructions

Never: - rewrite the project blindly; - replace working architecture
without reason; - introduce unnecessary dependencies; - invent APIs; -
present mock data as live; - hardcode secret keys; - delete existing
working features; - create fake agent logic that claims real data
access.

Always: - read the brain and rules first; - inspect existing files
before modifying; - keep components modular; - keep demo data
deterministic; - maintain responsive design; - run/build/test after
major changes; - update session state; - prioritize the primary demo
path.

------------------------------------------------------------------------

# 26. Current Priority

**Priority order for the prototype:**

1.  Visual quality
2.  Working demo flow
3.  Core marine decision
4.  Map/geofence
5.  Evidence/agent trace
6.  What-if scenario
7.  Voice/language
8.  PWA/offline
9.  Backend
10. Production data integration

A beautiful broken prototype loses. A boring but functional prototype
also loses. Target: **polished + believable + working + technically
defensible.**
