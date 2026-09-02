# ORCA --- PHASE-WISE IMPLEMENTATION PLAN

## SIH26176 --- ORCA Marine EcOsystem Reasoning with Collaborative Agents

> **Purpose:** This is the execution roadmap for building the ORCA
> prototype in Google Antigravity. Keep this file in the main repository
> and treat it as the phase contract.
>
> **Core principle:** The agents are not the product. Collaboration
> between agents is the mechanism; the explainable decision is the
> product.

------------------------------------------------------------------------

# 0. PROJECT NORTH STAR

## Core problem

Marine information already exists across satellite, ocean, weather,
fisheries, GIS and advisory systems, but it is fragmented, technical,
dynamic and difficult to turn into a practical decision.

ORCA adds a **context-aware marine decision intelligence layer**:

**Data → Understanding → Context → Decision**

## Main USP

**Context-Aware Marine Decision Intelligence**

ORCA should answer a practical question such as:

> "Can I go fishing tomorrow morning?"

and produce:

-   a decision: **GO / CAUTION / AVOID**
-   a recommended time/zone/route where appropriate
-   a visual map
-   supporting evidence
-   agent reasoning trace
-   confidence/data freshness
-   a **What-If** scenario showing how the decision changes when
    conditions change

## Main demo

**Ask → Analyze → Decide → Explain → What-If**

Example:

> "Can I go fishing tomorrow morning?"

Planner → Ocean Agent → Weather Agent → PFZ/Fisheries Agent → Geo/Safety
Agent → Deterministic Decision Engine → Decision Card → Map + Evidence +
Agent Trace → "Why?" → What-If simulation

------------------------------------------------------------------------

# 1. HARD PRODUCT RULES

These rules apply to every phase.

1.  Do not build a generic chatbot.
2.  Do not build a static dashboard and call it an agentic system.
3.  Do not make "10 agents" the main innovation claim.
4.  Do not replace or criticize existing ISRO/INCOIS systems.
5.  Position ORCA as a reasoning and decision-support layer that can
    combine existing information.
6.  LLM output may explain/orchestrate, but critical risk decisions must
    use deterministic rules.
7.  Official severe warnings must override optimization/recommendation.
8.  Never present mock/demo data as live data.
9.  Every demo observation should have source, timestamp,
    validity/status and units where relevant.
10. If critical data is stale/missing, show reduced confidence or
    unavailable recommendation.
11. Exact safety thresholds in the prototype are illustrative/demo rules
    unless sourced from an official advisory.
12. Primary demo must work without external APIs.
13. Free-first: no paid dependency is required for the internal
    prototype.
14. Mobile usability matters.
15. Visual quality is a P0 requirement, not a final decoration.
16. Do not add features just because they sound impressive.
17. Every feature must improve understanding, decision quality,
    explainability or demo impact.

------------------------------------------------------------------------

# 2. TARGET ARCHITECTURE

``` text
React + TypeScript + Vite PWA
        ↓
ORCA UI
(Chat / Map / Timeline / Alerts)
        ↓
Orchestrator
        ↓
Planner
 ┌──────┼────────┬──────────┐
 ↓      ↓        ↓          ↓
Ocean  Weather  PFZ       Geo/Safety
Agent  Agent    Agent     Agent
 └──────┴────────┴──────────┘
        ↓
Evidence / Data Layer
(source / timestamp / units / status)
        ↓
Deterministic Risk + Constraint Engine
        ↓
Recommendation
(GO / CAUTION / AVOID)
        ↓
Chat + Map + Evidence + Agent Trace
```

### Prototype stack

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Leaflet + OpenStreetMap
-   GeoJSON
-   Turf.js
-   vite-plugin-pwa
-   local JSON/GeoJSON demo data
-   localStorage
-   Browser Web Speech API for voice
-   optional Supabase later
-   optional FastAPI/PostgreSQL/PostGIS later
-   free deployment such as Vercel/Netlify/GitHub Pages

------------------------------------------------------------------------

# 3. PHASE 0 --- FOUNDATION & REPOSITORY SETUP

## Goal

Create a clean, stable project shell before building the visual
interface.

## Tasks

### 0.1 Read project control files

Before changing code, Antigravity must read:

1.  `ORCA_BRAIN_V1.md`
2.  `ORCA_TECHNICAL_APPROACH.md`
3.  `ORCA_RULES.md`
4.  `ORCA_SESSION_STATE.md`
5.  `ORCA_PHASE_PLAN.md`

These files are the project's source of truth.

### 0.2 Inspect the repository

Inspect:

-   `package.json`
-   `src/`
-   `src/main.*`
-   `src/App.*`
-   global CSS
-   Vite config
-   TypeScript config
-   public assets
-   existing routes/components
-   existing environment files

Do not rewrite working code blindly.

### 0.3 Create/confirm base stack

Install only what is needed:

-   Tailwind
-   Leaflet / React Leaflet
-   Turf.js
-   PWA plugin
-   icon library if needed

Avoid unnecessary packages.

### 0.4 Create project structure

Recommended structure:

``` text
src/
  components/
    ui/
    layout/
    map/
    decision/
    agents/
    evidence/
  pages/
  data/
  lib/
  hooks/
  types/
  config/
  App.tsx
  main.tsx

public/
  icons/
  assets/

data/
  demo/
    pfz.json
    weather.json
    ocean.json
    hazards.json
    boundaries.geojson
    vessels.json
```

## Definition of Done

-   App starts successfully.
-   No blank screen.
-   No major console errors.
-   Base routing/layout works.
-   Tailwind/styles work.
-   Map dependency can render.
-   Demo data folder exists.
-   No secrets committed.

------------------------------------------------------------------------

# 4. PHASE 1 --- VISUAL DESIGN SYSTEM

## Goal

Make ORCA visually exceptional before building complex functionality.

This phase is intentionally early.

## Design direction

ORCA should feel like a **premium marine intelligence command center**,
not a generic AI dashboard.

### Visual language

-   deep ocean/navy foundation
-   glass/soft translucent panels used carefully
-   strong contrast
-   clean typography
-   subtle cyan/blue marine accents
-   restrained gradients
-   radar/sonar-inspired details
-   clean map layers
-   high information density without clutter
-   smooth micro-interactions
-   premium desktop + mobile responsive layout

Avoid:

-   excessive neon
-   random 3D objects
-   childish ocean illustrations
-   generic purple AI gradients
-   excessive cards
-   fake "AI magic" animations
-   cluttered dashboards

## Stitch workflow

Use Google Stitch for:

1.  visual concept
2.  command center screen
3.  assistant screen
4.  map/decision screen
5.  trip planner screen
6.  decision details screen
7.  mobile version

Stitch is the **designer/prototyper**.

Antigravity is the **builder/integrator**.

## Definition of Done

The design has:

-   clear visual hierarchy
-   consistent spacing
-   consistent typography
-   consistent buttons/cards/badges
-   strong empty/loading/error states
-   responsive behavior
-   premium command-center feel

------------------------------------------------------------------------

# 5. PHASE 2 --- COMMAND CENTER

## Goal

Build the main ORCA home screen.

### Required layout

``` text
┌─────────────────────────────────────────────────────────┐
│ ORCA     Mission     Status              Profile        │
├───────────────────────┬─────────────────────────────────┤
│                       │                                 │
│ Ask ORCA              │       Interactive Map           │
│                       │                                 │
│ Recent decisions      │       PFZ / hazards / route     │
│                       │                                 │
├───────────────────────┴─────────────────────────────────┤
│ Decision │ Timeline │ Evidence │ Agent Trace            │
└─────────────────────────────────────────────────────────┘
```

### Required components

-   ORCA logo/identity
-   system/connectivity status
-   location
-   vessel/mission context
-   chat prompt
-   suggested questions
-   current marine conditions
-   alert summary
-   map preview
-   latest decision
-   recent decision history

## Definition of Done

A user immediately understands:

1.  where they are
2.  what marine conditions look like
3.  what ORCA recommends
4.  how to ask ORCA something

------------------------------------------------------------------------

# 6. PHASE 3 --- INTERACTIVE MARINE MAP

## Goal

Make the map a core reasoning surface, not decoration.

## Layers

-   user location
-   vessel
-   PFZ zones
-   weather/risk indicators
-   hazards
-   maritime/geofence boundaries
-   recommended route
-   safe/unsafe areas

## Interaction

User can:

-   zoom
-   pan
-   toggle layers
-   select PFZ
-   select hazard
-   inspect zone information
-   view recommendation on map

## Demo data

Use clearly labeled demo/cached snapshots.

Example:

``` json
{
  "source": "Demo PFZ snapshot",
  "observedAt": "2026-09-02T06:00:00Z",
  "validUntil": "2026-09-03T06:00:00Z",
  "zone": "PFZ-B",
  "coordinates": [],
  "confidence": 0.86
}
```

## Definition of Done

The map supports the main demo and visibly changes when the
recommendation changes.

------------------------------------------------------------------------

# 7. PHASE 4 --- AGENT ORCHESTRATION + TRACE

## Goal

Make the multi-agent architecture visible and understandable.

## Agents

Start with only meaningful agents:

### Planner Agent

Understands user intent and creates the analysis plan.

### Ocean Agent

Handles:

-   wave conditions
-   currents
-   SST
-   ocean state

### Weather Agent

Handles:

-   wind
-   precipitation
-   lightning/weather risk
-   forecast context

### PFZ/Fisheries Agent

Handles:

-   potential fishing zones
-   chlorophyll/fisheries indicators
-   zone suitability

### Geo/Safety Agent

Handles:

-   boundaries
-   geofences
-   hazards
-   route constraints

### Decision Engine

Not an LLM agent.

Combines normalized results using deterministic rules.

## Agent trace UI

Example:

``` text
✓ Planner
  Intent: Fishing trip assessment

✓ Weather Agent
  Wind acceptable
  Weather risk: Low

✓ Ocean Agent
  Wave risk: Moderate

✓ PFZ Agent
  Zone B: High opportunity

✓ Geo/Safety Agent
  No boundary conflict

→ Decision Engine
  Mission constraints satisfied

FINAL
CAUTION
```

## Definition of Done

The user can see what each agent did and why it contributed to the final
decision.

------------------------------------------------------------------------

# 8. PHASE 5 --- DECISION ENGINE

## Goal

Turn agent outputs into an explainable operational recommendation.

## Decision states

-   GO
-   CAUTION
-   AVOID

## Inputs

-   weather risk
-   ocean/wave risk
-   PFZ opportunity
-   geofence status
-   vessel suitability
-   mission duration
-   departure/return constraints
-   severe warnings

## Example demo logic

``` text
IF official severe warning = true
    → AVOID

ELSE IF boundary conflict = true
    → AVOID

ELSE IF high marine risk
    → CAUTION or AVOID

ELSE IF conditions acceptable
    AND mission constraints satisfied
    → GO or CAUTION

ELSE
    → CAUTION
```

Do not invent official safety thresholds.

## Output

``` text
Decision: CAUTION

Recommended departure: 05:45
Recommended zone: PFZ-B

Why:
- Fishing opportunity is high
- Weather is acceptable
- Wave risk is moderate
- No geofence conflict
- Return constraint is satisfied

Confidence: 82%
```

## Definition of Done

The same input always produces the same decision.

------------------------------------------------------------------------

# 9. PHASE 6 --- EVIDENCE + EXPLAINABILITY

## Goal

Answer the question:

> "Why did ORCA tell me this?"

## Evidence panel

Every important recommendation should expose:

-   source
-   timestamp
-   observation
-   relevance
-   agent that used it
-   effect on decision

Example:

``` text
Evidence

PFZ-B
Source: Demo PFZ snapshot
Updated: 06:00
Effect: + opportunity

Wave condition
Source: Demo ocean snapshot
Updated: 05:30
Effect: + risk

Boundary
Source: Demo GeoJSON
Status: clear
Effect: no restriction
```

## Definition of Done

A judge can inspect the recommendation instead of blindly trusting AI.

------------------------------------------------------------------------

# 10. PHASE 7 --- WHAT-IF SCENARIO SIMULATOR

## Goal

Create the strongest "reasoning" demo feature.

## Example

Initial:

``` text
Departure: 05:45
Duration: 5h
Decision: CAUTION
```

User changes:

``` text
Departure → 10:00
```

ORCA recomputes:

``` text
Wave risk increased
Return window reduced
Decision → AVOID
```

Or:

``` text
Departure → 05:45
Duration → 3h
Decision → GO
```

## UI

Show:

``` text
CURRENT PLAN          WHAT-IF

05:45                 10:00
5 hours               5 hours

CAUTION               AVOID
```

Highlight what changed.

## Definition of Done

Changing one mission variable visibly changes the recommendation and
explanation.

------------------------------------------------------------------------

# 11. PHASE 8 --- VOICE + MULTILINGUAL

## Goal

Improve accessibility and marine-user friendliness.

## Priority languages

-   English
-   Hindi
-   Marathi

## Features

-   speech-to-text
-   text-to-speech
-   language selector
-   voice input button
-   spoken decision summary

Example:

> "ORCA, can I go fishing tomorrow morning?"

ORCA responds in selected language.

## Rule

Voice is an interface layer, not the reasoning engine.

## Definition of Done

Voice can submit a supported query and read the result aloud.

------------------------------------------------------------------------

# 12. PHASE 9 --- PWA + OFFLINE / DEGRADED MODE

## Goal

Make the prototype credible for connectivity-constrained environments.

## Modes

### CONNECTED

Live/API data can be used.

### DEGRADED

Some sources unavailable; cached data is used.

### OFFLINE

Only locally cached/demo data is available.

## UI

Show:

``` text
● CONNECTED
```

or

``` text
◐ DEGRADED
Using cached marine data
```

or

``` text
○ OFFLINE
Limited recommendations
```

## Important

Do not claim radio hardware has been implemented.

Connectivity-aware architecture is the prototype feature.

Future integrations can include satellite/NAVIC/emergency communication
channels.

## Definition of Done

The app remains usable without a network for the primary demo flow.

------------------------------------------------------------------------

# 13. PHASE 10 --- FINAL POLISH + DEMO HARDENING

## Goal

Make the prototype presentation-ready.

## Visual polish

Check:

-   typography
-   spacing
-   animations
-   map styling
-   loading states
-   empty states
-   error states
-   mobile layout
-   buttons
-   icons
-   hover states
-   transitions
-   accessibility

## Functional hardening

Test:

1.  app launch
2.  main dashboard
3.  map
4.  chat
5.  main fishing question
6.  agent trace
7.  decision
8.  why/evidence
9.  what-if
10. voice
11. offline/degraded state
12. refresh/reload

## Demo safety

Use a known deterministic scenario.

Never depend on a live API for the critical 4-minute demonstration.

## Definition of Done

The entire demo can be completed from a clean browser session without
manual debugging.

------------------------------------------------------------------------

# 14. FEATURE PRIORITY

## P0 --- MUST WORK

1.  Premium Command Center
2.  Interactive map
3.  Conversational ORCA
4.  Agent trace
5.  GO/CAUTION/AVOID
6.  PFZ visualization
7.  weather/ocean conditions
8.  geofence
9.  evidence/why panel
10. What-If scenario

## P1 --- SHOULD WORK

11. voice
12. text-to-speech
13. English/Hindi/Marathi
14. data freshness
15. decision history
16. vessel profile
17. timeline
18. offline/degraded indicator
19. PWA installability

## P2 --- DO NOT BUILD FOR THE INTERNAL ROUND

-   real satellite processing pipeline
-   custom ML model
-   radio hardware
-   full production backend
-   complex authentication
-   many unnecessary agents
-   custom ocean simulation
-   full 3D globe
-   production-scale infrastructure

------------------------------------------------------------------------

# 15. DEMO SCRIPT FLOW

## Step 1 --- Start at Command Center

Show:

-   marine map
-   vessel
-   PFZ
-   conditions
-   alerts

## Step 2 --- Ask ORCA

> "Can I go fishing tomorrow morning for five hours?"

## Step 3 --- Show orchestration

Planner → Weather → Ocean → PFZ → Geo/Safety

## Step 4 --- Show decision

``` text
CAUTION
```

with:

-   recommended time
-   recommended zone
-   risk summary
-   confidence

## Step 5 --- Ask "Why?"

Open evidence panel.

## Step 6 --- Change scenario

> "What if I leave at 10 AM?"

Show:

``` text
Wave risk ↑
Return window ↓
Decision changes
```

## Step 7 --- Finish

One sentence:

> "ORCA does not replace marine information systems; it turns
> distributed marine intelligence into an explainable operational
> decision."

------------------------------------------------------------------------

# 16. STITCH → ANTIGRAVITY WORKFLOW

## Stitch

Use Stitch for:

-   screen concepts
-   visual hierarchy
-   component styling
-   responsive layouts
-   design system exploration

## Antigravity

Use Antigravity for:

-   repository setup
-   React implementation
-   data model
-   components
-   map
-   agent simulation
-   decision engine
-   PWA
-   testing
-   final integration

## Important

Do not repeatedly regenerate the entire app in Stitch.

Design in Stitch → export/reference design → implement in Antigravity →
iterate in code.

------------------------------------------------------------------------

# 17. ANTIGRAVITY WORK METHOD

For every phase:

### Step A --- Read

Read all ORCA control files.

### Step B --- Inspect

Inspect the current repository before editing.

### Step C --- Plan

List exact files that will change.

### Step D --- Implement

Implement only the requested phase.

### Step E --- Verify

Run:

-   build
-   lint/type checks if available
-   main user flow
-   console error check

### Step F --- Update

Update `ORCA_SESSION_STATE.md`.

### Step G --- Stop

Do not automatically jump into the next phase.

The user explicitly decides when to advance.

------------------------------------------------------------------------

# 18. PHASE GATES

Do not move forward until the current gate is stable.

  Gate       Required result
  ---------- ------------------------------
  Phase 0    Project runs
  Phase 1    Visual system established
  Phase 2    Command Center works
  Phase 3    Map works
  Phase 4    Agent trace works
  Phase 5    Deterministic decision works
  Phase 6    Evidence works
  Phase 7    What-If works
  Phase 8    Voice/language works
  Phase 9    Offline/degraded mode works
  Phase 10   Demo is stable

If time becomes limited, stop at the highest stable phase rather than
creating half-working features.

------------------------------------------------------------------------

# 19. CURRENT STARTING POINT

Current project state:

**PHASE 0 --- FOUNDATION**

Immediate order:

1.  Put this file in the main repo as `ORCA_PHASE_PLAN.md`.
2.  Put the other ORCA control files in the repo.
3.  Open the repo in Antigravity.
4.  Read all five control files.
5.  Inspect the existing repository.
6.  Create/repair the React + TypeScript + Vite shell.
7.  Confirm the app builds.
8.  Only then start the Stitch visual-design phase.
9.  Build the Command Center before advanced functionality.
10. Continue phase-by-phase.

------------------------------------------------------------------------

# 20. SOURCE-OF-TRUTH FILES

The repository should contain:

``` text
ORCA_BRAIN_V1.md
ORCA_TECHNICAL_APPROACH.md
ORCA_RULES.md
ORCA_SESSION_STATE.md
ORCA_PHASE_PLAN.md
```

### Responsibility of each file

  -----------------------------------------------------------------------
  File                                Purpose
  ----------------------------------- -----------------------------------
  `ORCA_BRAIN_V1.md`                  Product vision and overall project
                                      context

  `ORCA_TECHNICAL_APPROACH.md`        Architecture and technical/PPT
                                      explanation

  `ORCA_RULES.md`                     Rules Antigravity must follow

  `ORCA_SESSION_STATE.md`             Current progress and handoff state

  `ORCA_PHASE_PLAN.md`                Step-by-step implementation roadmap
  -----------------------------------------------------------------------

These files together are the persistent ORCA project memory.

------------------------------------------------------------------------

# 21. FINAL SUCCESS CRITERIA

ORCA is successful for the internal round when a judge can:

1.  understand the problem within seconds
2.  see a premium marine interface
3.  ask a natural-language marine question
4.  see multiple specialized agents collaborate
5.  see the map update
6.  receive GO/CAUTION/AVOID
7.  inspect the evidence
8.  ask/change a scenario
9.  see the recommendation change
10. understand that ORCA is a reasoning layer over existing marine
    information

The strongest statement is:

> **"ORCA turns fragmented marine data into contextual, explainable
> decisions."**
