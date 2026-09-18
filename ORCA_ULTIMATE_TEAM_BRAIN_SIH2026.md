# ORCA --- ULTIMATE TEAM BRAIN

## SIH 2026 --- SIH26176 --- ORCA Marine EcOsystem Reasoning with Collaborative Agents

> **Purpose:** Master handoff for the entire ORCA team. Use this
> document as the single conceptual reference for the national-level
> PPT, prototype, demo, research, architecture and judge Q&A.
>
> **Rule:** Understand first, rewrite naturally in the PPT. Do not
> blindly copy paragraphs.
>
> **Reality rule:** Never claim an integration, live feed, hardware
> link, scientific threshold, model, or deployment that has not actually
> been implemented and validated.

------------------------------------------------------------------------

# 1. NORTH STAR

## One-line product definition

> **ORCA is a context-aware marine decision-intelligence platform that
> combines heterogeneous ocean, weather, satellite, fisheries,
> geospatial and operational information and converts it into
> explainable, mission-specific decisions.**

## Strongest positioning sentence

> **Existing systems provide marine information. ORCA's role is to
> understand what that information means for a particular mission.**

## Core problem

Marine information already exists across satellite, ocean, weather,
fisheries, GIS and advisory systems. The challenge is that these sources
are specialised, distributed, dynamic, spatial and technical. A user
still has to interpret and correlate them with:

-   vessel capability
-   location
-   route
-   departure time
-   mission duration
-   return constraint
-   safety conditions
-   boundaries
-   fishing opportunity
-   data freshness
-   connectivity

The actual gap is therefore not simply "lack of data."

> **The gap is the interpretation and decision layer between available
> marine information and an operational action.**

## Core loop

``` text
REAL DATA
   ↓
UNDERSTAND
   ↓
ADD USER + MISSION CONTEXT
   ↓
CORRELATE
   ↓
REASON
   ↓
APPLY SAFETY / OPERATIONAL CONSTRAINTS
   ↓
DECIDE
   ↓
EXPLAIN WITH EVIDENCE
   ↓
ACT / ALERT / WHAT-IF
```

## Product principle

> **The agents are not the product. Collaboration between agents is the
> mechanism; the explainable decision is the product.**

------------------------------------------------------------------------

# 2. WHAT ORCA IS NOT

Do not position ORCA as:

-   another weather app
-   another PFZ map
-   another vessel tracker
-   another generic chatbot
-   another static dashboard
-   a replacement for INCOIS
-   a replacement for ISRO systems
-   a replacement for Coast Guard surveillance
-   a guaranteed safety system
-   a direct satellite/radio implementation unless actually integrated

ORCA is:

> **A marine decision-intelligence / reasoning layer over existing and
> authorised marine information.**

------------------------------------------------------------------------

# 3. PRIMARY USER QUESTIONS

## Fisher / small vessel

> "Can I go tomorrow morning?"

> "Where should I go?"

> "How long can I remain out?"

> "When should I return if conditions change?"

> "Am I approaching a restricted boundary?"

## Maritime operator

> "Can this mission be completed within the required operational
> window?"

## Authorised authority

> "Which vessel or area requires attention first, and why?"

## Disaster management

> "What is exposed to the evolving hazard?"

## Researcher

> "What changed across space and time, and what evidence supports it?"

## Environmental analyst

> "Which marine indicators changed meaningfully together?"

Do not claim causality unless scientifically supported.

------------------------------------------------------------------------

# 4. USER VALUE

  ------------------------------------------------------------------------------
  User                    Main question           ORCA value
  ----------------------- ----------------------- ------------------------------
  Fisher                  Can I go, where, when   Mission plan, safety context,
                          and for how long?       PFZ, route, return window,
                                                  offline support

  Maritime operator       Can this mission be     Route/ETA/vessel/environment
                          executed within         correlation
                          constraints?            

  Authority               What needs attention?   Risk prioritisation,
                                                  hazard-vessel correlation,
                                                  projected boundary conflicts

  Disaster management     What is exposed?        Hazard + vessel/asset/coastal
                                                  exposure

  Researcher              What does the data      Natural-language analysis,
                          show?                   maps, comparisons, evidence

  Environmental analyst   What changed?           Change radar and
                                                  multi-variable interpretation
  ------------------------------------------------------------------------------

------------------------------------------------------------------------

# 5. EXISTING ECOSYSTEM --- IMPORTANT COMPETITIVE REALITY

Existing systems already provide valuable capabilities.

Examples include:

-   INCOIS Ocean State Forecast
-   INCOIS Potential Fishing Zone advisories
-   INCOIS Small Vessel Advisory and Forecast Services
-   marine hazard services
-   INCOIS WebGIS
-   ISRO maritime satellite communication systems
-   DAT-SG
-   Nabhmitra
-   NavIC-related messaging
-   vessel tracking / AIS ecosystems
-   commercial marine weather and route products
-   scientific ocean-data platforms

Therefore, do **not** say:

> "No one provides this."

Instead say:

> **"Existing systems solve individual marine information and
> operational domains. ORCA connects relevant outputs around the user's
> operational question."**

## Existing capability → ORCA contribution

  -----------------------------------------------------------------------
  Existing capability                 ORCA contribution
  ----------------------------------- -----------------------------------
  PFZ                                 Correlates fishing opportunity with
                                      safety, route, mission and vessel
                                      context

  Ocean forecast                      Converts parameters into
                                      operational implications

  Weather                             Evaluates exposure over mission
                                      time

  WebGIS                              Adds contextual spatial reasoning

  Satellite/EO                        Combines relevant indicators with
                                      other evidence

  Boundary data                       Predicts approach / projected
                                      incursion

  Vessel data                         Adds environmental and mission
                                      context

  Offline navigation                  Adds connectivity-aware decision
                                      workflow

  Emergency/advisory messages         Provides an authorised-message
                                      gateway architecture

  Multiple sources                    Freshness/conflict handling +
                                      provenance
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 6. CORE USP STACK

The strongest USP stack is:

1.  **Mission-aware marine decision intelligence**
2.  **Multi-source contextual reasoning**
3.  **Evidence-first decisions**
4.  **Deterministic safety / operational constraints**
5.  **What-if / counterfactual reasoning**
6.  **Predictive boundary intelligence**
7.  **Uncertainty-aware output**
8.  **Connectivity-aware operation**
9.  **Decision replay / auditability**
10. **One intelligence engine for multiple maritime workspaces**

Do not present "we have 10 agents" as the main USP.

------------------------------------------------------------------------

# 7. MAIN ORCA WORKFLOW

``` text
USER QUESTION
      ↓
INTENT + MISSION CONTEXT
      ↓
TASK PLANNER
      ↓
SPECIALIST AGENTS
 ┌────┬────────┬─────────┬───────────┐
 ↓    ↓        ↓         ↓
Ocean Weather PFZ/Fish Geo/Safety
 └────┴────────┴─────────┴───────────┘
                ↓
       EVIDENCE NORMALISATION
                ↓
       FRESHNESS / CONFLICT
                ↓
       MISSION + VESSEL RULES
                ↓
       DETERMINISTIC SAFETY
                ↓
             DECISION
                ↓
      MAP + EXPLANATION + TRACE
                ↓
             WHAT-IF
                ↓
          ACTION / ALERT
```

------------------------------------------------------------------------

# 8. AGENT ROLES

## Mission Planner

Understands:

-   user objective
-   location
-   departure
-   duration
-   return constraint
-   vessel
-   requested output

## Oceanography Agent

Analyses, where available:

-   wave height
-   wave period
-   currents
-   SST
-   other ocean variables

## Meteorology Agent

Analyses:

-   wind
-   gusts
-   precipitation
-   visibility
-   pressure
-   forecast evolution
-   weather warnings

## PFZ / Fisheries Agent

Analyses:

-   official PFZ information
-   fishing potential indicators
-   zone/distance/bearing information
-   fisheries context

ORCA consumes official PFZ advisories; it should not claim to generate
official PFZ advisories.

## Geo / Safety Agent

Analyses:

-   boundaries
-   hazards
-   geofences
-   route conflicts
-   projected boundary approach

## Future agents

Possible:

-   route optimisation
-   hazard intelligence
-   vessel capability
-   satellite/EO analysis
-   change detection
-   disaster exposure
-   fleet intelligence
-   reporting
-   communication gateway

Only call an agent "implemented" when it actually performs meaningful
work.

------------------------------------------------------------------------

# 9. AI VS DETERMINISTIC LOGIC

## AI should help with

-   natural-language understanding
-   intent extraction
-   task decomposition
-   tool/data selection
-   explanation
-   multilingual interaction
-   summarisation
-   scientific query interpretation

## Deterministic logic should control

-   geofence geometry
-   distance
-   route geometry
-   time-to-boundary
-   return-window constraints
-   hard vessel constraints
-   severe-warning overrides
-   freshness checks
-   conflict states
-   safety-state transitions

## Judge answer

> "We use AI where flexibility is useful --- language, planning and
> explanation. Safety-critical constraints remain deterministic so that
> results are predictable, testable and auditable."

------------------------------------------------------------------------

# 10. DECISION STATES

Use:

-   **GO**
-   **CAUTION**
-   **AVOID**
-   **INSUFFICIENT DATA**

Never force a confident answer when critical information is unavailable.

Example:

> "Reliable safety recommendation unavailable because the latest
> required data is unavailable."

This is a safety feature.

------------------------------------------------------------------------

# 11. RISK VS CONFIDENCE

These are different.

### Risk

How hazardous/unfavourable the environment or mission appears.

### Decision confidence

How strong the evidence is.

Example:

> **Risk: HIGH**
>
> **Decision confidence: REDUCED --- required forecast is stale.**

Do not present an arbitrary "78% safe" as a scientifically validated
probability.

------------------------------------------------------------------------

# 12. HIGH-IMPACT FEATURES

## P0 --- core

-   Mission planner
-   Multi-source data
-   Evidence/provenance
-   Decision engine
-   Interactive map
-   What-if
-   Boundary guardian
-   Data freshness
-   Failure handling
-   Mobile/PWA usability

## P1 --- strong

-   Real INCOIS adapter
-   MOSDAC adapter
-   Backend API
-   Persistence
-   Decision replay
-   Connectivity states
-   RBAC
-   voice/local language

## P2 --- if stable

-   AIS integration
-   richer satellite/EO integration
-   historical analytics
-   change radar
-   fleet workspace

## P3 --- future

-   authorised satellite communication gateway
-   hardware experiments
-   large-scale deployment
-   advanced predictive models

------------------------------------------------------------------------

# 13. THE "WOW" FEATURES

## Mission planner

> "I have a 3 m boat, want to fish for 5 hours tomorrow and return
> before sunset."

ORCA creates a mission context.

## What-if

Change:

-   departure
-   duration
-   destination
-   route

and recompute.

## Boundary Guardian

``` text
Position
  ↓
Heading + speed
  ↓
Projected trajectory
  ↓
Boundary intersection
  ↓
Time-to-boundary
  ↓
Escalating warning
```

Use operational language:

-   projected incursion
-   restricted-zone warning
-   boundary breach detected

Avoid unsupported legal claims.

## Predictive return-to-shore guardian

Checks whether the mission can still satisfy its return constraint as
time/conditions change.

## Safe corridor

Shows a route with risk segments and configured hazards/boundaries.

## Cross-source conflict detector

If data sources disagree or a required source is stale:

> surface the conflict + reduce confidence.

## Decision replay

Store:

-   mission
-   inputs
-   agent outputs
-   evidence
-   decision
-   timestamp
-   scenario changes

Then replay why the recommendation occurred.

## Marine Change Radar

Compare snapshots:

> "Wave risk increased and the PFZ shifted."

This is interpretation, not a claim of a new satellite model.

------------------------------------------------------------------------

# 14. CONNECTIVITY --- REALISTIC PRODUCT DESIGN

## Key distinction

``` text
GPS / GNSS location
        ≠
Internet connectivity
```

A phone can determine its location without an Internet connection if
GNSS reception is available, but it cannot send that location to your
cloud server without a communication path.

## Store-and-forward

### Before departure

``` text
Internet
 ↓
Cache maps/data
 ↓
Start mission
```

### Offshore

``` text
No cellular data
 ↓
GPS position
 ↓
Local logging
 ↓
Local calculations
 ↓
Local alerts
```

### After reconnecting

``` text
Cellular returns
 ↓
Automatic sync
 ↓
Backend
 ↓
Dashboard
```

This is realistic and should be a core resilience feature.

------------------------------------------------------------------------

# 15. CONNECTIVITY OPTIONS --- REALISM RANKING

## 1. Store-and-forward smartphone

**Feasibility: Very high**

Best for:

-   offline logging
-   offline map
-   delayed sync
-   local decision support

Limitation:

> It does not provide real-time offshore communication.

------------------------------------------------------------------------

## 2. AIS data integration

**Feasibility: High for suitable vessels/data feeds**

AIS is established maritime tracking technology.

Useful for:

-   vessel position
-   heading/speed where available
-   projected boundary approach
-   environmental correlation
-   authority risk prioritisation

Limitations:

-   not every small fishing boat carries AIS
-   data availability depends on provider/coverage/access
-   operational deployment has hardware/regulatory considerations

Do not claim AIS solves every fisher's connectivity problem.

------------------------------------------------------------------------

## 3. Authorised satellite/maritime communication

**Real-world feasibility: High**

India already has maritime satellite communication infrastructure and
systems including DAT-SG and Nabhmitra.

ORCA should integrate at the software architecture level:

``` text
Authorised maritime source
        ↓
Connectivity Gateway
        ↓
Message validation
        ↓
Safety override
        ↓
ORCA alert + map + voice
```

Do not claim direct satellite/radio implementation unless actually built
and authorised.

------------------------------------------------------------------------

## 4. LoRa / boat-to-boat mesh

**Innovation: High** **Deployment certainty: Conditional**

Potentially useful for tiny packets, but range depends on:

-   antenna height
-   link budget
-   hardware
-   sea conditions
-   vessel density
-   gateway availability
-   regulation

Do not claim a guaranteed 15--20 mile ocean mesh.

Treat this as future hardware research unless actually tested.

------------------------------------------------------------------------

## 5. Smartphone + marine radio data modem

Technically interesting, but operational/regulatory complexity is high.

Do not make it the current product unless hardware and legal operating
conditions are genuinely validated.

------------------------------------------------------------------------

## 6. "RTL-SDR turns phone into VHF transmitter"

**Do not use this claim.**

A common RTL-SDR is a receiver, not a generic VHF transmitter. A
suitable compliant transceiver and operating path would be required.

------------------------------------------------------------------------

# 16. REAL DATA STRATEGY

## INCOIS first

Use official machine-readable mechanisms where available.

INCOIS ERDDAP exposes RESTful services and dataset-specific interfaces
suitable for programmatic retrieval.

Potential families include:

-   ocean datasets
-   SST
-   satellite-derived variables
-   ARGO-related data
-   other marine observations

Use:

-   REST
-   griddap
-   tabledap
-   authorised APIs/services

rather than scraping HTML when official access exists.

## MOSDAC second

MOSDAC provides an official Data Download API workflow using `mdapi.py`
and `config.json`.

Relevant parameters include:

-   dataset ID
-   start time
-   end time
-   count
-   bounding box
-   group ID

## Judge answer

> "We use official machine-readable data-access mechanisms rather than
> scraping the website UI. For MOSDAC, the official Data Download API
> supports dataset and time/bounding-box filters. For INCOIS, ERDDAP
> provides RESTful programmatic access. Python handles retrieval,
> validation and normalisation."

------------------------------------------------------------------------

# 17. DATA NORMALISATION

Common ORCA record:

``` json
{
  "source": "INCOIS",
  "dataset": "ocean_forecast",
  "timestamp": "...",
  "valid_until": "...",
  "latitude": 18.72,
  "longitude": 72.65,
  "variable": "wave_height",
  "value": 1.4,
  "unit": "m",
  "status": "valid"
}
```

Every important record should retain:

-   source
-   dataset
-   timestamp
-   validity
-   coordinates
-   value
-   unit
-   retrieval time
-   status
-   spatial relevance
-   quality/confidence

------------------------------------------------------------------------

# 18. PROTOTYPE DATA POLICY

If it is simulated, say:

> **DEMO SNAPSHOT --- NOT LIVE**

Useful statuses:

-   LIVE / INTEGRATED
-   DEMO SNAPSHOT
-   CACHED
-   STALE
-   UNAVAILABLE

Never silently show local JSON as live.

------------------------------------------------------------------------

# 19. CURRENT PROTOTYPE TRUTH

The existing ORCA prototype is a strong product skeleton.

Current architecture:

``` text
React + TypeScript + Vite PWA
        ↓
ORCA UI
  ├─ Dashboard
  ├─ Map
  ├─ Mission
  ├─ Alerts
  └─ Agent Trace
        ↓
Orchestrator
        ↓
5 domain agents
        ↓
Evidence / data layer
        ↓
Deterministic decision engine
        ↓
Recommendation
```

Current meaningful agent set:

1.  Mission Planner
2.  Oceanography
3.  Meteorology
4.  PFZ/Fisheries
5.  Geo/Safety

Do not claim a production distributed multi-agent platform if the
implementation is still a local prototype.

------------------------------------------------------------------------

# 20. PRODUCTION-SHAPED TARGET

``` text
USERS
  ↓
PWA / Mobile / API
  ↓
Authentication + RBAC
  ↓
Mission / Context
  ↓
Orchestration
  ↓
Domain Agents
  ↓
Data Adapters
  ↓
Normalisation
  ↓
Evidence / Provenance
  ↓
Freshness / Conflict
  ↓
Deterministic Decision Engine
  ↓
Decision + Explanation
  ↓
Map / Alerts / Voice / API
```

Potential stack:

-   React + TypeScript + Vite
-   PWA
-   FastAPI / Python
-   PostgreSQL
-   PostGIS
-   object storage if needed
-   authentication/RBAC
-   audit logs
-   provider abstraction for AI
-   official data adapters

Do not implement every enterprise technology just for appearance.

------------------------------------------------------------------------

# 21. PPT MASTER PLAN

> **Important:** If the current SIH 2026 portal provides a mandatory PPT
> template/slide count, that current template overrides this suggested
> structure.

## Slide 1 --- Title / Hook

Headline:

> **ORCA --- From Marine Data to Mission-Ready Decisions**

Subtitle:

> Context-Aware Marine Decision Intelligence with Collaborative Agents

Include:

-   SIH26176
-   ISRO
-   team
-   product name

Visual:

-   premium marine map / decision visual
-   not generic robot/AI stock art

------------------------------------------------------------------------

## Slide 2 --- Problem

Headline:

> **The data exists. The decision layer is missing.**

Show:

``` text
Satellite/EO
Ocean
Weather
PFZ
GIS
Hazards
Vessel
   ↓
USER
   ↓
Manual interpretation
```

Key message:

> Marine users need a decision, not another isolated dataset.

Do not overload with unverified statistics.

------------------------------------------------------------------------

## Slide 3 --- Why Existing Information Is Not Enough

Use:

  -----------------------------------------------------------------------
  Source                  Provides                Remaining question
  ----------------------- ----------------------- -----------------------
  PFZ                     Potential fishing area  Is it suitable for this
                                                  mission/vessel?

  Weather                 Forecast                What does it mean for
                                                  this mission?

  Ocean                   Sea-state data          How does exposure
                                                  change over time?

  GIS                     Boundaries              Does my route conflict?

  Vessel                  Position/capability     What does the
                                                  environment mean for
                                                  this vessel?
  -----------------------------------------------------------------------

Bottom:

> **ORCA correlates them around the mission.**

------------------------------------------------------------------------

## Slide 4 --- Users

Use 4--5 cards:

-   Fisher --- "Can I go, where, when and for how long?"
-   Operator --- "Can this mission be completed within constraints?"
-   Authority --- "What needs attention and why?"
-   Disaster management --- "What is exposed?"
-   Researcher --- "What changed and what evidence supports it?"

Centre:

> **ORCA INTELLIGENCE ENGINE**

------------------------------------------------------------------------

## Slide 5 --- Solution

Headline:

> **ORCA turns heterogeneous marine information into an explainable
> operational decision.**

Diagram:

``` text
Mission
 ↓
Intent + context
 ↓
Agentic planning
 ↓
Ocean + Weather + PFZ + Geo
 ↓
Evidence normalisation
 ↓
Deterministic safety/constraints
 ↓
GO / CAUTION / AVOID / INSUFFICIENT DATA
 ↓
Map + Evidence + Trace + What-if
```

------------------------------------------------------------------------

## Slide 6 --- Differentiation

  Typical system         ORCA
  ---------------------- -------------------------
  Displays data          Contextualises data
  Single domain          Multi-source
  Static alert           Predictive/contextual
  "Crossed boundary"     "Projected conflict"
  Opaque output          Evidence chain
  One scenario           What-if
  Assumes connectivity   Connectivity-aware
  Forced answer          Insufficient-data state
  Information viewer     Decision-support layer

Strong USP line:

> **Existing systems provide the information. ORCA connects it around
> the operational question.**

------------------------------------------------------------------------

## Slide 7 --- Architecture

Use five layers:

``` text
USER
 ↓
ORCHESTRATOR
 ↓
SPECIALIST AGENTS
 ↓
DATA + EVIDENCE
 ↓
DETERMINISTIC DECISION ENGINE
 ↓
EXPLAINABLE OUTPUT
```

Small note:

> AI handles language/planning/explanation; deterministic logic handles
> safety-critical constraints.

------------------------------------------------------------------------

## Slide 8 --- High-Impact Features

Cards:

-   Mission Planner
-   What-if Engine
-   Boundary Guardian
-   Decision Replay
-   Change Radar
-   Connectivity-aware mode

Only show features that are actually implemented or clearly mark future
features.

------------------------------------------------------------------------

## Slide 9 --- Real Data / Integration

Headline:

> **Designed to build on authoritative marine information.**

Data families:

-   INCOIS
-   MOSDAC / ISRO
-   marine/weather data
-   GIS
-   authorised vessel data
-   authorised advisories

Pipeline:

``` text
Sources
 ↓
Adapters
 ↓
Common schema
 ↓
Quality/freshness
 ↓
Evidence
 ↓
Decision
```

------------------------------------------------------------------------

## Slide 10 --- Connectivity

Headline:

> **Connectivity is a system condition, not an assumption.**

Show:

``` text
CONNECTED → DEGRADED → OFFLINE
```

and:

``` text
Authorised satellite/maritime message
 ↓
Connectivity Gateway
 ↓
Safety Override
 ↓
ORCA
```

Do not claim direct satellite/radio control.

------------------------------------------------------------------------

## Slide 11 --- Prototype / Demo

Include:

-   prototype URL
-   QR
-   demo video
-   2--3 screenshots

Demo:

``` text
Mission
 ↓
Agents
 ↓
Decision
 ↓
Evidence
 ↓
What-if
```

------------------------------------------------------------------------

## Slide 12 --- Impact / Roadmap

Near term:

-   real data adapters
-   backend
-   evidence
-   PostGIS
-   auth/RBAC
-   offline/degraded

Medium:

-   authority/fleet workspace
-   satellite/EO analytics
-   change detection
-   multilingual voice

Long term:

-   authorised communication integration
-   institutional APIs
-   large-scale marine intelligence platform

------------------------------------------------------------------------

# 22. PPT CREATIVE DIRECTION

Theme:

> **Scientific Maritime Intelligence Center**

Use:

-   deep navy
-   restrained cyan/teal
-   white/off-white
-   semantic green/amber/red
-   map-first layouts
-   ocean contour motifs
-   clean data typography

Avoid:

-   generic AI brain images
-   excessive neon
-   random 3D
-   giant paragraphs
-   15 icons per slide
-   decorative animations without meaning

## Recommended diagrams

### Diagram A --- fragmented data → ORCA → decision

### Diagram B --- mission → agents → evidence → decision

### Diagram C --- connected/degraded/offline

### Diagram D --- position → trajectory → projected boundary

### Diagram E --- source → timestamp → transformation → rule → decision

------------------------------------------------------------------------

# 23. DEMO STORY

1.  Enter mission
2.  ORCA understands it
3.  Agents run
4.  Decision appears
5.  Open evidence
6.  Inspect map
7.  Change departure
8.  What-if changes decision
9.  Optional: disable data source
10. Show reduced confidence / unavailable recommendation

The goal is to make judges realise:

> **This is a decision system, not a static dashboard.**

------------------------------------------------------------------------

# 24. 60-SECOND PITCH

> "Marine users already have access to huge amounts of ocean, weather,
> satellite and fisheries information. The problem is that these systems
> are specialised, distributed and difficult to interpret together for a
> specific mission.
>
> ORCA adds the missing decision layer. A user gives us a mission ---
> vessel, location, time and duration. ORCA decomposes that question
> across specialised agents for ocean, weather, fisheries and geospatial
> safety. We normalise the evidence, apply deterministic safety and
> mission constraints, and produce an explainable decision rather than
> another raw dataset.
>
> We do not replace INCOIS or ISRO. We contextualise their information.
> We also treat uncertainty and connectivity as first-class conditions,
> so stale data reduces confidence instead of silently producing a
> confident answer.
>
> The result is a marine decision-intelligence platform that can support
> fishermen, operators, authorities, disaster-management teams and
> researchers through different workspaces while sharing the same
> intelligence engine."

------------------------------------------------------------------------

# 25. JUDGE Q&A --- MASTER ANSWERS

## Why AI?

> Natural language reduces the interaction barrier, and agentic
> decomposition helps identify and correlate relevant domain
> information. Safety-critical constraints remain deterministic.

## Why not INCOIS?

> INCOIS already provides authoritative information. ORCA is the
> reasoning and integration layer that puts those outputs into mission
> context.

## What is actually innovative?

> Mission-aware multi-source reasoning, evidence-first decisions,
> deterministic safety constraints, scenario reasoning, predictive
> spatial intelligence, uncertainty handling and connectivity-aware
> workflows.

## Why not just a weather/PFZ/map app?

> Those expose information. ORCA correlates it around a specific mission
> and explains the resulting decision.

## Can you guarantee safety?

> No. ORCA is decision support. Operational deployment requires
> authoritative feeds, validated rules, expert testing and governance.

## What if AI hallucinates?

> The LLM is not the safety authority. Structured data and deterministic
> constraints drive critical decisions. Evidence is exposed, and
> missing/stale information can result in reduced confidence or no
> recommendation.

## What if data sources disagree?

> Preserve provenance, surface the conflict, and reduce confidence
> rather than silently choosing an answer.

## What if Internet is unavailable?

> Local GPS and cached data can support degraded/offline operation, but
> sending information to the cloud requires a communication path. ORCA
> explicitly shows connectivity state and data age.

## How do you obtain MOSDAC data?

> Through the official MOSDAC Data Download API using supported dataset,
> time and bounding-box parameters.

## How do you obtain INCOIS data?

> Through official machine-readable services such as ERDDAP RESTful
> interfaces and authorised service endpoints.

## What is PFZ?

> Potential Fishing Zone --- an advisory indicating potentially
> favourable fish-aggregation conditions. ORCA consumes the advisory
> rather than claiming to generate the official product.

## What is agentic AI?

> Software components that can plan tasks, use data/tools, perform
> specialised work and coordinate results toward a goal.

## Chatbot vs ORCA?

``` text
Chatbot:
Question → Answer

ORCA:
Mission
→ Understand
→ Plan
→ Retrieve
→ Analyse
→ Constrain
→ Decide
→ Explain
→ What-if
```

## Why GIS?

> Marine decisions are spatial. Vessel, route, PFZ, hazards and
> boundaries must be evaluated relative to one another.

## Who makes the final decision?

> The human. ORCA is decision support, not autonomous authority.

------------------------------------------------------------------------

# 26. HARD FISHERMAN QUESTIONS

## Why would a fisherman trust ORCA?

> "We do not ask users to trust an opaque AI. ORCA exposes source, time,
> validity, contributing factors and decision trace. Safety-critical
> logic is deterministic, official warnings can override optimisation,
> and stale data reduces confidence."

## What if he has local knowledge?

> "Local knowledge is valuable. ORCA augments it with information that
> may not be visible locally, such as forecast evolution, ocean state,
> PFZ information, boundaries and route exposure."

## What if he has no Internet?

> "The app can still provide offline functions such as cached maps,
> mission state, GPS-based calculations and local alerts. Actual
> communication to land requires a real communication path such as
> cellular, satellite or authorised maritime equipment."

------------------------------------------------------------------------

# 27. RADIO / HARDWARE QUESTIONS

## Can a normal phone become a marine radio?

> "Not by software alone. A standard smartphone's cellular radio is not
> a general-purpose marine VHF transmitter. A separate compliant
> transceiver and appropriate operating permissions would be required."

## Can LoRa solve it?

> "Potentially as an experimental low-power mesh, but ocean range
> depends on antenna height, hardware, link budget, vessel density and
> gateways. We treat it as a future hardware path rather than claiming
> guaranteed offshore coverage."

## Why AIS?

> "AIS can provide useful vessel context where suitable vessels and
> authorised feeds are available. ORCA's contribution is correlating
> that vessel context with environmental and mission data."

------------------------------------------------------------------------

# 28. SECURITY / PRIVACY

Production requirements:

-   authentication
-   RBAC
-   least privilege
-   encrypted transport
-   no secrets in frontend
-   protected API keys
-   audit logs
-   sensitive vessel-data controls
-   retention policy
-   provenance
-   decision records

Do not expose sensitive vessel locations publicly.

------------------------------------------------------------------------

# 29. FAILURE CASES TO DEMONSTRATE

### Source unavailable

> Ocean source unavailable → confidence reduced.

### Stale data

> Required forecast stale → reliable recommendation unavailable/reduced.

### Boundary conflict

> Route intersects configured restricted area → route rejected.

### Severe warning

> Safety override → AVOID / RETURN.

### Connectivity loss

> OFFLINE → cached data + local calculations + explicit age.

Failure handling can be more convincing than another decorative feature.

------------------------------------------------------------------------

# 30. WHAT NOT TO BUILD NOW

Do not spend remaining hackathon time on:

-   full 3D ocean simulation
-   custom satellite foundation model
-   autonomous vessel control
-   direct satellite hardware
-   custom marine VHF transmitter
-   universal LoRa ocean mesh
-   meaningless 10+ agents
-   giant admin portal
-   dozens of charts
-   generic chatbot
-   fake live feeds
-   blockchain
-   arbitrary AI safety probability

------------------------------------------------------------------------

# 31. 5--8 DAY EXECUTION PLAN

## Day 1

-   freeze product scope
-   verify PPT requirements
-   stabilise current prototype
-   define common data schema
-   define demo scenario

## Day 2

-   integrate one real official data path if practical
-   preserve deterministic fallback
-   add source/timestamp/status

## Day 3

-   backend/API if needed
-   evidence/provenance
-   decision engine cleanup

## Day 4

-   what-if
-   predictive boundary
-   return-window logic

## Day 5

-   offline/degraded state
-   failure handling
-   decision replay

## Day 6

-   role workspace polish
-   mobile testing
-   auth/RBAC if needed

## Day 7

-   demo hardening
-   video
-   PPT screenshots
-   QR links
-   judge Q&A rehearsal

## Day 8 if available

-   only then add AIS/MOSDAC/extra analytics if stable
-   performance
-   deployment
-   final testing

**Priority rule:** a smaller real system beats a larger fake system.

------------------------------------------------------------------------

# 32. TEAM SPLIT

## PPT team

Own:

-   narrative
-   visual design
-   diagrams
-   references
-   screenshots
-   QR codes
-   final deck

## Prototype team

Own:

-   frontend
-   backend
-   data adapters
-   decision engine
-   evidence
-   deployment
-   demo reliability

## Everyone must know

-   core problem
-   solution
-   USP
-   architecture
-   data sources
-   AI vs deterministic logic
-   limitations
-   judge Q&A

------------------------------------------------------------------------

# 33. PPT AUTHENTICITY

Do not try to "beat AI detectors."

Instead:

1.  understand this brain
2.  discuss each slide as a team
3.  rewrite in your own voice
4.  use your actual implementation
5.  use your actual screenshots
6.  rehearse explanations

The team should be able to answer:

> "How exactly does this work?"

without reading the slide.

------------------------------------------------------------------------

# 34. SOURCE / RESEARCH REFERENCES

## Official ISRO --- DAT-SG

https://www.isro.gov.in/Second_Generation_DistressAlertTransmitter.html

Key relevance:

-   maritime distress
-   satellite communication
-   acknowledgement
-   emergency/weather messages
-   PFZ messages
-   rescue coordination

## Official ISRO --- Mobile Apps / Nabhmitra

https://new1.isro.gov.in/MobileApps.html

Key relevance:

-   real-time tracking of sub-20 m boats
-   two-way short messaging
-   weather/emergency broadcasts
-   satellite terminal dependency

## Official INCOIS ERDDAP

https://erddap.incois.gov.in/erddap/index.html

Key relevance:

-   RESTful services
-   programmatic dataset search/download
-   machine-readable access

## Official INCOIS griddap

https://erddap.incois.gov.in/erddap/griddap/documentation.html

## Official INCOIS tabledap

https://erddap.incois.gov.in/erddap/tabledap/documentation.html

## Official MOSDAC Data Download API

https://mosdac.gov.in/downloadapi-manual

Key relevance:

-   `mdapi.py`
-   `config.json`
-   dataset ID
-   time
-   bounding box

## SIH official guidance

https://www.sih.gov.in/letters/Guidelines-College-SPOC.pdf

Past official SIH guidance identifies evaluation dimensions including:

-   novelty
-   complexity
-   clarity/detail
-   feasibility
-   practicability
-   sustainability
-   scale of impact
-   user experience
-   future progression

**Always check the current SIH 2026 portal/template for the
authoritative current format.**

------------------------------------------------------------------------

# 35. ATTACHED GOOGLE AI MODE DISCUSSION --- IMPORTANT CORRECTIONS

The team's attached research discussion was useful for brainstorming:

-   cellular coverage is not guaranteed deep offshore
-   GPS location and Internet connectivity are separate
-   store-and-forward is realistic
-   AIS can be a useful data source
-   LoRa mesh is an interesting experimental concept
-   radio/data-modem concepts are technically interesting

However, several claims in that discussion should NOT be copied as
facts.

### Do not claim

-   RTL-SDR automatically turns a phone into a VHF transmitter
-   LoRa always reaches 15--20 miles at sea
-   every fisherman uses VHF
-   every fisherman loses signal at exactly 15--20 miles
-   AIS tracks every fishing boat
-   AIS is universally free
-   software alone turns a smartphone into a marine VHF radio

Use the attached conversation as an idea source, not as the authority.

------------------------------------------------------------------------

# 36. PRODUCT LANGUAGE TO USE

Strong:

> "context-aware marine decision intelligence"

> "mission-aware reasoning"

> "evidence-first decision"

> "deterministic safety constraints"

> "uncertainty-aware"

> "connectivity-aware"

> "predictive spatial reasoning"

> "decision replay"

> "authoritative data integration"

> "human-in-the-loop decision support"

Avoid:

> "100% safe"

> "guaranteed prediction"

> "AI replaces experts"

> "first ever"

> "completely solves marine communication"

> "10 autonomous agents" as the core innovation

> "live" when data is simulated

------------------------------------------------------------------------

# 37. FINAL MENTAL MODEL

``` text
                  MARINE DATA
                      ↓
              ┌──────────────┐
              │     ORCA     │
              │              │
              │ Understand   │
              │ Contextualise│
              │ Correlate    │
              │ Reason       │
              │ Constrain    │
              │ Explain      │
              └──────┬───────┘
                     ↓
                  DECISION
                     ↓
        ┌────────────┼────────────┐
        ↓            ↓            ↓
      FISHER      AUTHORITY    RESEARCH
        ↓            ↓            ↓
      FIELD        COMMAND      ANALYSIS
```

## Final North Star

### Problem

> **Marine information is abundant but fragmented.**

### Solution

> **ORCA contextualises it around a mission.**

### Intelligence

> **Specialist agents analyse different domains.**

### Safety

> **Deterministic rules control critical constraints.**

### Trust

> **Evidence, provenance and uncertainty are visible.**

### Innovation

> **What-if, predictive spatial reasoning and decision replay turn
> information into operational intelligence.**

### Resilience

> **Connectivity is treated as a changing system condition.**

### Scale

> **One intelligence engine can support multiple maritime users.**

------------------------------------------------------------------------

# 38. FINAL PITCH LINE

> **"ORCA does not create another source of marine information. It
> connects the information that already exists, understands the user's
> mission, and turns it into an explainable decision."**

------------------------------------------------------------------------

# APPENDIX A --- EXISTING TEAM BRAIN

The original ORCA brain is retained below so that no previous design
decision is lost.

------------------------------------------------------------------------

## A1. ORIGINAL ORCA_BRAIN_V1_UPDATED.md

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

------------------------------------------------------------------------

## A2. ORIGINAL ORCA_TECHNICAL_APPROACH.md

# ORCA --- Technical Approach & PPT Handoff

## SIH26176 \| ISRO \| Software

This document is intended to be copied into the team's PPT planning and
technical-approach slide.

------------------------------------------------------------------------

# 1. One-line technical approach

**ORCA is a Progressive Web App that uses an agentic orchestration layer
to interpret natural-language marine queries, retrieve/correlate
heterogeneous ocean, weather, fisheries and geospatial information,
apply deterministic risk/constraint logic, and return an explainable
contextual recommendation through chat, maps, alerts and scenario
simulation.**

------------------------------------------------------------------------

# 2. Recommended Prototype Tech Stack

  -------------------------------------------------------------------------
  Layer                 Technology              Why
  --------------------- ----------------------- ---------------------------
  Frontend              React + TypeScript      Fast, component-based,
                                                strong ecosystem

  Build                 Vite                    Very fast development/build

  Styling               Tailwind CSS            Rapid polished UI

  UI components         shadcn/ui or            Consistent professional UI
                        lightweight custom      
                        components              

  Maps                  Leaflet + OpenStreetMap Free/open, fast to
                                                prototype

  Geospatial            GeoJSON + Turf.js       Boundary checks, distance,
                                                route geometry

  PWA                   vite-plugin-pwa         Installable/offline shell

  State                 React state / Zustand   Simple predictable state
                        if needed               

  Demo data             JSON + GeoJSON          Deterministic, offline-safe

  Storage               localStorage initially  No backend required for
                                                demo

  Optional backend      FastAPI + Python        Good fit for agent/data
                                                layer

  Optional DB           Supabase PostgreSQL     Fast free-first persistence

  Optional spatial DB   PostGIS                 Production geospatial
                                                queries

  Agent orchestration   LangGraph or custom     Explicit agent/task flow
                        Python orchestrator     

  LLM                   Gemini/free-available   Natural-language
                        model or swappable      understanding/explanation
                        provider                

  Voice                 Web Speech API where    Fast no-cost prototype
                        supported               

  Hosting               Vercel/Netlify/GitHub   Simple web deployment
                        Pages depending on      
                        deployment needs        
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# 3. Architecture Diagram

``` text
┌─────────────────────────────────────────────────────────────┐
│                     ORCA PWA FRONTEND                       │
│ React + TypeScript + Vite + Tailwind + Leaflet              │
│                                                             │
│ Chat │ Marine Map │ Trip Planner │ Alerts │ Evidence        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  ORCA ORCHESTRATOR                          │
│ Intent detection → task decomposition → agent coordination  │
└──────────────┬───────────────┬───────────────┬───────────────┘
               │               │               │
               ▼               ▼               ▼
        ┌────────────┐  ┌────────────┐  ┌──────────────┐
        │ Ocean      │  │ Weather    │  │ Fisheries/PFZ│
        │ Agent      │  │ Agent      │  │ Agent        │
        └────────────┘  └────────────┘  └──────────────┘
               │               │               │
               └───────────────┼───────────────┘
                               ▼
                     ┌──────────────────┐
                     │ Geo/Safety Agent │
                     │ GIS + Geofence   │
                     └────────┬─────────┘
                              ▼
                   ┌──────────────────────┐
                   │ Evidence/Data Layer │
                   │ source + time + unit│
                   └──────────┬───────────┘
                              ▼
                   ┌──────────────────────┐
                   │ Deterministic Risk   │
                   │ & Constraint Engine  │
                   └──────────┬───────────┘
                              ▼
                   ┌──────────────────────┐
                   │ Recommendation Layer │
                   │ GO/CAUTION/AVOID     │
                   └──────────┬───────────┘
                              ▼
                   Chat + Map + Timeline +
                   Sources + Agent Trace
```

------------------------------------------------------------------------

# 4. Data Flow

``` text
Natural-language query
        ↓
Intent + entities + context
        ↓
Task planner
        ↓
Parallel domain tasks
        ├── ocean/SST/chlorophyll
        ├── weather/wind/waves
        ├── PFZ/fisheries
        └── GIS/geofence
        ↓
Normalize data
        ↓
Check freshness/conflicts
        ↓
Apply safety overrides
        ↓
Evaluate mission + vessel constraints
        ↓
Generate recommendation
        ↓
Attach evidence
        ↓
Render map + response + timeline
```

------------------------------------------------------------------------

# 5. Agent Responsibilities

## Planner Agent

-   understand user intent;
-   identify missing context;
-   create tasks;
-   decide which domain agents are needed.

## Ocean Agent

-   SST;
-   chlorophyll;
-   currents;
-   ocean-state observations/forecasts;
-   ecosystem indicators.

## Weather Agent

-   wind;
-   waves;
-   rain;
-   lightning;
-   cyclone/hazard information.

## Fisheries/PFZ Agent

-   PFZ;
-   fishing potential;
-   distance/direction;
-   fisheries context.

## Geo/Safety Agent

-   current vessel location;
-   restricted areas;
-   maritime/geofence boundaries;
-   route intersection;
-   proximity warnings.

## Risk/Decision Engine

Prefer deterministic logic for critical recommendation constraints.

## Evidence Agent / Layer

-   source;
-   timestamp;
-   validity;
-   value/unit;
-   reason used.

------------------------------------------------------------------------

# 6. Core Decision Algorithm

``` text
IF critical official hazard:
    AVOID / RETURN
ELSE IF projected geofence conflict:
    CAUTION + alternate route
ELSE:
    evaluate weather + waves + vessel
    evaluate fishing potential
    evaluate mission timing
    choose safest feasible option
```

The exact thresholds in the prototype are illustrative and must not be
presented as official safety thresholds.

------------------------------------------------------------------------

# 7. Data Schema

Example normalized observation:

``` json
{
  "parameter": "wave_height",
  "value": 1.8,
  "unit": "m",
  "latitude": 18.95,
  "longitude": 72.82,
  "timestamp": "2026-09-02T08:00:00Z",
  "validUntil": "2026-09-03T08:00:00Z",
  "source": "DEMO_INCOIS_OSF_SNAPSHOT",
  "status": "demo_snapshot"
}
```

PFZ:

``` json
{
  "id": "PFZ-01",
  "latitude": 18.70,
  "longitude": 72.90,
  "potential": "high",
  "depth_m": 42,
  "source": "DEMO_INCOIS_PFZ_SNAPSHOT",
  "date": "2026-09-02"
}
```

Boundary:

``` json
{
  "type": "Feature",
  "properties": {
    "name": "Demo Restricted Zone",
    "type": "restricted"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  }
}
```

------------------------------------------------------------------------

# 8. Frontend Information Architecture

``` text
/
├── Command Center
├── Ask ORCA
├── Marine Map
├── Trip Planner
├── Alerts
├── Decision History
└── Profile / Vessel
```

For the first internal round, prioritize: - Command Center; - Ask
ORCA; - Marine Map; - Trip Planner; - Decision Details.

------------------------------------------------------------------------

# 9. UI Components

``` text
OrcaHeader
StatusPill
MarineMap
MapLayerControl
VesselMarker
PFZMarker
HazardZone
GeofenceOverlay
DecisionCard
RiskBreakdown
AgentTrace
EvidencePanel
MarineTimeline
ScenarioControls
ChatMessage
VoiceButton
DataFreshnessBadge
AlertCard
VesselProfile
```

------------------------------------------------------------------------

# 10. PPT --- Problem → Solution

## Problem

Marine information is: - heterogeneous; - spatial; - temporal; -
dynamic; - distributed across systems; - difficult for non-experts to
interpret.

Users need decisions, not isolated datasets.

## Solution

ORCA: - understands natural language; - decomposes requests; -
coordinates specialized agents; - correlates marine data; - reasons over
time and location; - checks safety/geofences; - produces contextual
recommendations; - explains evidence; - supports
conversational/map/voice interaction.

------------------------------------------------------------------------

# 11. PPT --- Innovation

### Innovation 1

**Cross-source marine reasoning**

### Innovation 2

**Mission + vessel-aware decision support**

### Innovation 3

**Explainable evidence chain**

### Innovation 4

**What-if scenario simulation**

### Innovation 5

**Predictive geofence intelligence**

### Innovation 6

**Connectivity-aware marine assistance**

------------------------------------------------------------------------

# 12. PPT --- Existing Ecosystem vs ORCA

  ---------------------------------------------------------------------
  Existing capability                ORCA contribution
  ---------------------------------- ----------------------------------
  PFZ advisories                     Correlate PFZ with safety, route,
                                     mission and vessel context

  Ocean-state forecasts              Convert parameters into
                                     operational decisions

  Multilingual advisories            Conversational multilingual
                                     interaction

  WebGIS                             Natural-language spatial
                                     reasoning + contextual overlays

  Offline navigation/boundary alerts Integrate connectivity state into
                                     the broader decision workflow

  Satellite/EO products              Combine EO indicators with
                                     weather/fisheries/GIS context
  ---------------------------------------------------------------------

Do not claim existing systems are "bad" or "non-functional." State that
ORCA complements and integrates existing information.

------------------------------------------------------------------------

# 13. PPT --- Feasibility

## Today / prototype

-   React PWA;
-   deterministic demo data;
-   interactive map;
-   local decision engine;
-   simulated agent trace;
-   voice/browser APIs;
-   optional free weather data.

## Next stage

-   FastAPI;
-   real INCOIS adapters;
-   ISRO/MOSDAC data adapters;
-   PostGIS;
-   authenticated users;
-   real agent orchestration;
-   production-grade provenance.

## Long-term

-   real-time marine data fusion;
-   richer ecosystem analytics;
-   satellite-derived anomaly detection;
-   operational authority integrations.

------------------------------------------------------------------------

# 14. PPT --- Security / Reliability

-   no secrets in frontend;
-   environment variables for API keys;
-   source attribution;
-   timestamps and validity;
-   stale-data detection;
-   conflict detection;
-   safety override;
-   deterministic geofence calculations;
-   graceful offline mode;
-   explicit demo-data labeling.

------------------------------------------------------------------------

# 15. PPT --- Why PWA

-   installable on mobile;
-   responsive;
-   no app-store dependency;
-   browser-based;
-   can cache the app shell;
-   supports offline/degraded UX;
-   ideal for rapid prototype and field-style demo.

------------------------------------------------------------------------

# 16. Free-First Deployment

### Frontend

Vercel/Netlify/GitHub Pages as appropriate.

### Database

Supabase free tier only if persistence is needed.

### Backend

Avoid for first internal prototype unless required.

### Data

Use public/official sources where available and a clearly labelled demo
snapshot as fallback.

### AI

Keep provider abstraction so the project can switch between
available/free model quotas.

------------------------------------------------------------------------

# 17. PPT Technical Keywords / Icons

Suggested visual icon groups:

-   Satellite → Satellite / Orbit icon
-   Ocean → Waves
-   SST → Thermometer
-   Chlorophyll → Leaf / Droplet
-   Weather → Cloud / Wind
-   PFZ → Fish / Target
-   GIS → Map
-   Geofence → MapPin / Shield
-   Route → Route / Navigation
-   AI → Sparkles / Brain
-   Agents → Network / Bot
-   Evidence → FileCheck / BadgeCheck
-   Alert → TriangleAlert
-   Voice → Mic
-   Offline → WifiOff
-   PWA → Smartphone
-   Database → Database
-   Security → ShieldCheck

Use one icon family/style consistently.

------------------------------------------------------------------------

# 18. 20-second Technical Pitch

> "ORCA is a PWA-based marine decision-support platform. A
> natural-language query is converted into tasks by an orchestrator,
> which coordinates specialized ocean, weather, fisheries and geospatial
> agents. Their outputs are normalized and checked for freshness and
> safety constraints before a deterministic decision layer produces a
> contextual recommendation. The result is presented through
> conversational UI, interactive maps, timelines and a traceable
> evidence chain."

------------------------------------------------------------------------

# 19. 60-second Technical Pitch

> "Our architecture separates intelligence from presentation. The React
> PWA provides the conversational and geospatial interface. An
> orchestration layer interprets the user's mission and invokes only the
> relevant domain agents. Ocean, weather, PFZ and geospatial agents work
> over structured marine observations. Before generating a
> recommendation, ORCA performs data-freshness checks, conflict
> handling, geofence checks and safety overrides. A deterministic
> decision layer then combines mission, vessel and environmental
> constraints. Finally, the system returns a GO, CAUTION or AVOID
> recommendation together with the map, timeline, evidence and
> reasoning. This makes the system explainable and safer than relying on
> an LLM alone."

------------------------------------------------------------------------

# 20. Important Technical Honesty

Never say: - "AI predicts fish exactly." - "ORCA guarantees safe
travel." - "Radio gives internet." - "GPS requires internet." - "We
created a new satellite model" unless actually implemented. - "Our
multi-agent architecture is unique."

Say: - "potential fishing zone"; - "decision support"; - "prototype risk
model"; - "official advisory/source where available"; - "demo snapshot
when real feed is unavailable"; - "future integration" for unimplemented
production systems.

------------------------------------------------------------------------

## A3. ORIGINAL ORCA_PHASE_PLAN.md

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

  ---------------------------------------------------------------------
  File                               Purpose
  ---------------------------------- ----------------------------------
  `ORCA_BRAIN_V1.md`                 Product vision and overall project
                                     context

  `ORCA_TECHNICAL_APPROACH.md`       Architecture and technical/PPT
                                     explanation

  `ORCA_RULES.md`                    Rules Antigravity must follow

  `ORCA_SESSION_STATE.md`            Current progress and handoff state

  `ORCA_PHASE_PLAN.md`               Step-by-step implementation
                                     roadmap
  ---------------------------------------------------------------------

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

------------------------------------------------------------------------

## A4. ORIGINAL ORCA_SESSION_STATE.md

# ORCA --- Session State / Handoff

## Project

ORCA --- Marine EcOsystem Reasoning with Collaborative Agents

## SIH

SIH26176 \| ISRO \| Software

## Current Goal

Build the internal/deparment-level SIH prototype quickly, with a strong
visual interface and a convincing live demo.

## Current Phase

PHASE 0 --- not started

## Current Priority

1.  Project setup
2.  Stitch/design system
3.  React PWA shell
4.  Command Center + Marine Map
5.  Conversational demo
6.  Decision engine
7.  Evidence/agent trace
8.  What-if
9.  Polish
10. PWA/offline

## Primary Demo

User asks: \> "Can I go fishing tomorrow morning?"

Expected flow: - Planner parses intent; - Ocean Agent checks ocean
indicators; - Weather Agent checks weather/waves; - PFZ Agent checks
fishing potential; - Geo/Safety Agent checks boundaries/hazards; -
Decision Engine returns GO/CAUTION/AVOID; - map shows recommended
zone/route; - evidence explains the recommendation; - what-if changes
departure time and recalculates.

## Prototype Data Policy

Use deterministic local demo data first. Do not claim it is live. Label
data status clearly.

## Current Stack Target

React + TypeScript + Vite + Tailwind + Leaflet + GeoJSON + Turf.js +
PWA. Supabase/FastAPI are optional later.

## Design Target

Scientific maritime intelligence center: - premium; - clean; -
data-dense but understandable; - map-centric; - restrained animation; -
no gimmicky 3D.

## Decisions Made

-   Do not build a full backend before the UI/demo works.
-   Do not make the prototype dependent on paid APIs.
-   Use a small meaningful agent set.
-   Use deterministic safety/geofence logic.
-   Treat existing INCOIS/ISRO capabilities as complementary, not
    competitors to attack.
-   Main USP = contextual marine decision intelligence.

## Last Completed Work

None.

## Next Action

Create project shell and design system, then build the command-center
layout.

## Notes for New AI Account

Start by reading all ORCA markdown files. Inspect repository files
before changing anything. Continue from the current phase instead of
restarting the project.
