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

  ---------------------------------------------------------------------------
  Layer                   Technology              Why
  ----------------------- ----------------------- ---------------------------
  Frontend                React + TypeScript      Fast, component-based,
                                                  strong ecosystem

  Build                   Vite                    Very fast development/build

  Styling                 Tailwind CSS            Rapid polished UI

  UI components           shadcn/ui or            Consistent professional UI
                          lightweight custom      
                          components              

  Maps                    Leaflet + OpenStreetMap Free/open, fast to
                                                  prototype

  Geospatial              GeoJSON + Turf.js       Boundary checks, distance,
                                                  route geometry

  PWA                     vite-plugin-pwa         Installable/offline shell

  State                   React state / Zustand   Simple predictable state
                          if needed               

  Demo data               JSON + GeoJSON          Deterministic, offline-safe

  Storage                 localStorage initially  No backend required for
                                                  demo

  Optional backend        FastAPI + Python        Good fit for agent/data
                                                  layer

  Optional DB             Supabase PostgreSQL     Fast free-first persistence

  Optional spatial DB     PostGIS                 Production geospatial
                                                  queries

  Agent orchestration     LangGraph or custom     Explicit agent/task flow
                          Python orchestrator     

  LLM                     Gemini/free-available   Natural-language
                          model or swappable      understanding/explanation
                          provider                

  Voice                   Web Speech API where    Fast no-cost prototype
                          supported               

  Hosting                 Vercel/Netlify/GitHub   Simple web deployment
                          Pages depending on      
                          deployment needs        
  ---------------------------------------------------------------------------

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

  -----------------------------------------------------------------------
  Existing capability                 ORCA contribution
  ----------------------------------- -----------------------------------
  PFZ advisories                      Correlate PFZ with safety, route,
                                      mission and vessel context

  Ocean-state forecasts               Convert parameters into operational
                                      decisions

  Multilingual advisories             Conversational multilingual
                                      interaction

  WebGIS                              Natural-language spatial
                                      reasoning + contextual overlays

  Offline navigation/boundary alerts  Integrate connectivity state into
                                      the broader decision workflow

  Satellite/EO products               Combine EO indicators with
                                      weather/fisheries/GIS context
  -----------------------------------------------------------------------

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
