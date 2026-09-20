# ORCA — Phase 6.9 Frontend & UI/UX Collaboration Handoff

> **Document Status**: Active / Authoritative Handoff  
> **Target Audience**: Frontend Engineers, UI/UX Designers, Product Teammates  
> **Repository Branch**: `orca-core`  
> **Problem Statement**: SIH26176 — ORCA: Marine EcOsystem Reasoning with Collaborative Agents  
> **Implementation Phase**: Phase 6 Completed (Data Adapter Framework) → Phase 6.9 Handoff  

---

## Document Goal & Purpose

This document is the single, authoritative handoff for any teammate leading or contributing to the **ORCA Frontend, User Interface, and User Experience**.

You can read this document, work completely independently on your own feature branch (e.g., `orca-fisherman-ui` or `orca-command-ui`), and later integrate your frontend work into the main ORCA system at any subsequent phase without breaking or fighting the backend architecture.

### What This Document Enables
1. **Zero Guesswork**: Understand exactly what ORCA builds, what is currently implemented, and what remains simulated or future.
2. **Contract Stability**: Build against real TypeScript types and documented API endpoints so frontend and backend can evolve in parallel.
3. **Decoupled Development**: Design and refine high-performance, mobile-first, and role-specific interfaces using mock services or local fixtures without modifying backend safety logic.
4. **Clean Integration**: Seamlessly merge frontend components into the core system at any milestone (Phase 7, 8, 11, 13, 17, or 20).

---

## Section 1 — ORCA Product

### Product Positioning
> **"ORCA is a marine decision-intelligence layer that converts fragmented ocean, weather, fisheries, geospatial and mission data into explainable, context-aware operational decisions."**

ORCA is **not** just a weather app, **not** just a GIS map with layer toggles, and **not** a generic SaaS dashboard.

```
       ┌────────────────────────────────────────────────────────┐
       │                 THE ORCA CORE LOOP                     │
       └────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                              [ OBSERVE ]
         (Oceanographic, Meteorological, Fisheries, Geospatial)
                                   │
                                   ▼
                             [ UNDERSTAND ]
                (Data Normalization, Quality Scoring, Freshness)
                                   │
                                   ▼
                              [ CORRELATE ]
          (Multi-source Alignment, Spatial & Temporal Fusion)
                                   │
                                   ▼
                               [ REASON ]
          (Domain Agents: Weather, Ocean, Hazard, Fish, Route)
                                   │
                                   ▼
                               [ DECIDE ]
         (Deterministic Safety Engine V2, Policy Enforcement)
                                   │
                                   ▼
                              [ EXPLAIN ]
           (Evidence Traces, Confidence, Rule Evaluations)
                                   │
                                   ▼
                             [ ACT / ALERT ]
              (Operational Actions, Dispatch, Escalations)
                                   │
                                   ▼
                            [ LEARN / REPLAY ]
              (Audit Logs, Mission History, Post-Mortem)
```

### Core Philosophy
- **"The product is the decision. The agents are the mechanism."**
- A user does not come to ORCA to inspect 15 raw charts; they come to answer: *"Can my 32-ft motorized boat safely fish in Zone 4B between 04:00 and 14:00 today, and what is my expected yield versus risk?"*
- Safety rules are deterministic and strict. Multi-agent reasoning provides depth and cross-domain correlation, but safety decisions cannot be hallucinated or overridden by an LLM.

---

## Section 2 — Current Frontend State

### Tech Stack
- **Framework**: React 19 (`react` + `react-dom` v19.2.8)
- **Router**: React Router DOM v7 (`react-router-dom` v7.18.3)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` v4.3.3)
- **GIS / Maps**: Leaflet (`leaflet` v1.9.4, `react-leaflet` v5.0.0, `@turf/turf` v7.4.0)
- **Icons**: Lucide React (`lucide-react` v1.39.0)
- **Validation**: Zod (`zod` v4.6.5)
- **PWA**: `vite-plugin-pwa` v1.3.0

### Actual Routes Present in `src/routes.tsx` & `src/App.tsx`

| Route | Page Component | Purpose | Current Implementation Status | Data Source | What Can Be Redesigned |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/login` | `LoginPage.tsx` | User authentication & role selection | **Static Prototype** (Local state demo) | Local mock state | Entire layout, form styling, biometric/mobile auth UI, OTP flows |
| `/dashboard` | `CommandCenterPage.tsx` | Main command center overview | **Active Prototype** | In-memory context (`src/data/index.ts`) | Layout, widgets, alert panels, operational summary cards |
| `/dashboard/mission` | `MissionPlannerPage.tsx` | Mission creation, vessel parameters, route planning | **Active Prototype** | In-memory context (`src/data/index.ts`) | Form UX, vessel selector, waypoint editor, mobile wizard flow |
| `/dashboard/map` | `MarineMapPage.tsx` | Fullscreen GIS marine map with layer toggles | **Active Prototype** (Leaflet canvas) | Local GeoJSON fixtures (Maharashtra, Tamil Nadu) | Map controls, layer toggles, zone popups, legend, mobile overlays |
| `/dashboard/decisions` | `DecisionsPage.tsx` | Decision inspect, reasoning chain & rule evaluations | **Active Prototype** | In-memory mock decision results | Decision cards, confidence meters, reasoning tree, evidence drawer |
| `/dashboard/history` | `HistoryPage.tsx` | Past missions, audit trail, replay | **Active Prototype** | In-memory mock missions | Table layout, timeline view, replay playback interface |
| `/dashboard/settings` | `SettingsPage.tsx` | Language, region, alerts, offline preferences | **Active Prototype** | Local storage / React state | Settings categories, toggle controls, cache management UI |
| `*` | Fallback | Catch-all redirect to `/dashboard` | Functional redirect | N/A | Landing page, 404 screen |

### Key Component Hierarchy in `src/components/`
- `layout/`: `AppShell.tsx`, `Sidebar.tsx`, `Header.tsx`, `BottomNav.tsx` (Mobile navigation)
- `map/`: `MarineMapCanvas.tsx`, `LayerControls.tsx`, `ZoneTooltip.tsx`, `MapLegend.tsx`
- `decision/`: `DecisionCard.tsx`, `ReasoningChain.tsx`, `RuleEvaluationList.tsx`, `ConfidenceGauge.tsx`
- `agents/`: `AgentStatusGrid.tsx`, `AgentMessageFeed.tsx`, `AgentInsightCard.tsx`
- `ui/`: `Button.tsx`, `Card.tsx`, `Badge.tsx`, `Modal.tsx`, `Tabs.tsx`

---

## Section 3 — Current Backend / API Contract

The backend is built with **Fastify v5** and **TypeScript**, using **Zod** schema validation and **Supabase (PostgreSQL 17 + PostGIS)** persistence.

All endpoints support both `/api/v1/*` (canonical) and root aliases (e.g., `/health`).

### 1. Health Check
- **Endpoint**: `GET /api/v1/health` (or `GET /health`)
- **Auth**: None (Public)
- **Status**: **LIVE** (Reflects actual PostgreSQL connection status)
- **Response Shape**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-09-20T06:13:00.000Z",
  "supabaseConnected": true
}
```

### 2. User & Session Profile
- **Endpoint**: `GET /api/v1/me` (or `GET /me`)
- **Auth**: Optional (`Authorization: Bearer <jwt>`)
- **Status**: **LIVE** (Returns authenticated Supabase user profile or guest fallback)
- **Response Shape (Authenticated)**:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid-1234",
    "email": "fisherman@orca.in",
    "role": "fisherman",
    "fullName": "Murugan K.",
    "phone": "+919876543210",
    "createdAt": "2026-09-20T00:00:00.000Z"
  }
}
```

### 3. Mission Management (CRUD)
- **Endpoints**:
  - `POST /api/v1/missions` — Create new mission
  - `GET /api/v1/missions` — List user missions
  - `GET /api/v1/missions/:id` — Get mission details
  - `DELETE /api/v1/missions/:id` — Delete mission
- **Auth**: Required (`Authorization: Bearer <jwt>`)
- **Status**: **LIVE** (Persists to Supabase `missions` table with Row Level Security)
- **Create Request Shape**:
```json
{
  "vesselId": "vessel-456",
  "vesselType": "motorized_fiberglass",
  "departurePort": "Chennai Harbour",
  "targetLatitude": 13.0827,
  "targetLongitude": 80.2707,
  "departureTime": "2026-09-20T04:00:00.000Z",
  "expectedReturnTime": "2026-09-20T16:00:00.000Z",
  "maxDistanceKm": 45,
  "cargoCapacityKg": 1200
}
```

### 4. ORCA Query (Operational Decision Evaluation)
- **Endpoint**: `POST /api/v1/orca/query` (or `POST /orca/query`)
- **Auth**: Optional (Evaluates mission queries)
- **Status**: **LIVE Contract / Phase 2 Decision Engine V1**
- **Request Shape**:
```json
{
  "query": "Is it safe to fish near Zone 4B off Chennai today?",
  "mission": {
    "missionId": "m-001",
    "vesselId": "v-101",
    "vesselType": "motorized_boat",
    "departurePort": "Chennai Harbour",
    "targetCoordinates": { "lat": 13.0827, "lng": 80.2707 },
    "departureTime": "2026-09-20T04:00:00.000Z",
    "returnTime": "2026-09-20T16:00:00.000Z",
    "maxDistanceKm": 35
  },
  "options": {
    "includeReasoningChain": true,
    "includeEvidence": true,
    "language": "en"
  }
}
```
- **Response Shape**:
```json
{
  "queryId": "q-987",
  "timestamp": "2026-09-20T06:15:00.000Z",
  "decision": {
    "decisionId": "dec-123",
    "status": "GO" | "CAUTION" | "NO_GO" | "ABORT",
    "confidenceScore": 0.92,
    "primaryRecommendation": "Favorable conditions for motorized crafts up to 30km offshore.",
    "summaryExplanation": "Wave heights (1.1m) and wind speed (14 knots) remain within safe operating thresholds.",
    "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
    "criticalAlerts": [],
    "ruleEvaluations": [
      {
        "ruleId": "RULE_WAVE_HEIGHT",
        "ruleName": "Significant Wave Height Threshold",
        "category": "OCEANOGRAPHY",
        "status": "PASSED",
        "threshold": "< 2.0m",
        "actualValue": "1.1m",
        "isSafetyCritical": true
      }
    ]
  },
  "reasoningChain": {
    "orchestratorSummary": "All domain evaluations passed.",
    "agentOutputs": []
  },
  "evidence": []
}
```

### 5. Data Adapters (Phase 6)
- **Endpoint**: `GET /api/v1/adapters`
  - **Auth**: Public
  - **Status**: **LIVE**
  - Returns registered adapters (e.g., `ORCA_DEMO` source with `oceanography`, `weather`, `pfz`, `hazards` datasets).
- **Endpoint**: `POST /api/v1/adapters/:source/:dataset/fetch`
  - **Auth**: Public
  - **Status**: **LIVE** (Normalized observation provider)
  - **Response Shape**: Returns standard `NormalizedObservation` records with timestamps, status, quality score, and demo flags.

---

## Section 4 — Phase 6 Data Adapters

### Ingestion & Normalization Flow
```
┌────────────────────────────────────────────────────────┐
│                   SOURCE DATA LAYER                    │
│   (INCOIS, IMD, MOSDAC, NavIC, AIS, Demo Fixtures)     │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                     DATA ADAPTER                       │
│    (implements DataAdapter<TQuery, TRawPayload>)       │
└────────────────────────────────────────────────────────┘
                           │ Raw Payload
                           ▼
┌────────────────────────────────────────────────────────┐
│                 NORMALIZATION ENGINE                   │
│      (Validation, Unit Normalization, Geometry)        │
└────────────────────────────────────────────────────────┘
                           │ NormalizedObservation[]
                           ▼
┌────────────────────────────────────────────────────────┐
│                ORCA NORMALIZED SCHEMA                  │
│       (ObservedAt, ValidUntil, Quality, isLive)        │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             API & FUTURE REASONING ENGINE              │
└────────────────────────────────────────────────────────┘
```

### Current Adapter Reality
- The active adapter in Phase 6 is `ORCA_DEMO`.
- **`isLive: false`**: All observations returned currently carry `isLive: false` and `status: "DEMO_SNAPSHOT"`.
- Live network ingestion from INCOIS Web Services or IMD GTS will arrive in **Phases 8–10**.
- **Frontend Obligation**: The frontend must inspect the `isLive` and `status` fields and clearly display a **DEMO / SIMULATION** badge on charts and map overlays.

---

## Section 5 — Frontend / Backend Boundary

To avoid architectural conflicts, maintain a strict separation of concerns:

```
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│            FRONTEND OWNS             │     │             BACKEND OWNS             │
├──────────────────────────────────────┤     ├──────────────────────────────────────┤
│ • UI Layouts & Design System         │     │ • Authentication & JWT verification  │
│ • User Gestures & Navigation         │     │ • Persistence & Row Level Security   │
│ • Local Form State & Validation      │     │ • External Source Data Ingestion     │
│ • Map Rendering & Canvas Zoom        │     │ • Unit & Coordinate Normalization    │
│ • Chart Visualizations               │     │ • PostGIS Spatial Calculations       │
│ • Explanation & Evidence Drawers     │     │ • Deterministic Decision Engine V2   │
│ • Multilingual Text Display          │     │ • Safety Rules & Policy Enforcement  │
│ • Offline Caching of API Responses   │     │ • Multi-Agent Orchestration & LLM    │
│ • Network Status Feedback (PWA)      │     │ • Audit Trail, Replay & Compliance   │
└──────────────────────────────────────┘     └──────────────────────────────────────┘
```

> **CRITICAL RULE**: The frontend **MUST NOT** calculate safety verdicts (GO / NO_GO / CAUTION) in JavaScript. It displays what the backend deterministic engine outputs.

---

## Section 6 — UI Design Direction

### Visual & Environmental Constraints
Fishermen and coastal operators use devices under harsh operational conditions:
1. **Outdoor Sunlight Readability**: High-contrast mode, legible typography, bold status badges, minimal low-contrast pastel gradients.
2. **Mobile-First & Thumb-Driven**: Large touch targets (minimum 44x44px), bottom navigation, pull-to-refresh, bottom sheet drawers.
3. **Operational Clarity**: Zero clutter. When danger exists, critical warnings must be impossible to miss.
4. **Offline Resilience**: Immediate visual indication of offline state, cached data age, and queued actions.

```
       ┌─────────────────────────────────────────────────────────┐
       │              DO'S AND DON'TS FOR ORCA UI                │
       ├────────────────────────────┬────────────────────────────┤
       │ DO                         │ AVOID                      │
       ├────────────────────────────┼────────────────────────────┤
       │ • High contrast indicators │ • Low-contrast gray text   │
       │ • Visible data freshness   │ • Unlabeled simulated data │
       │ • Clear safety badges      │ • Generic AI sparkle icons │
       │ • Collapsible evidence     │ • Walls of unparsed text   │
       │ • Fast PWA load times      │ • Heavy blocking libraries │
       │ • Multilingual switchers   │ • Hardcoded English strings│
       └────────────────────────────┴────────────────────────────┘
```

---

## Section 7 — Fisherman Experience

The primary end-user journey for Indian coastal fishermen:

```
  [ 1. Login / Select Vessel ]
                │
                ▼
  [ 2. Create Mission Intent ]
  (Target Zone, Departure Port, Craft Type, Departure & Return Time)
                │
                ▼
  [ 3. Ask ORCA / One-Tap Check ]
                │
                ▼
  [ 4. Instant Decision Badge ]
  (GO: Green | CAUTION: Amber | NO_GO: Red | ABORT: Pulsing Red)
                │
                ▼
  [ 5. Plain Language Explanation ]
  (Localized Tamil, Hindi, Telugu, Marathi, Bengali, Malayalam, English)
                │
                ▼
  [ 6. Actionable Operational Advice ]
  ("Leave before 05:00 to avoid 1.8m swell; fish Zone 3A; return by 15:00")
                │
                ▼
  [ 7. Supporting Evidence & Map ]
  (PFZ overlay, Wave height contour, Cyclone track, International boundary)
                │
                ▼
  [ 8. Active Mission Monitoring & Emergency Alerts ]
```

> **IMPORTANT**: **PFZ (Potential Fishing Zone) does NOT equal Safe Fishing.**  
> A high-yield PFZ can coincide with extreme 3.5m storm surges or restricted naval zones. The UI must never display PFZ as a green "GO" indicator unless the Decision Engine has cleared weather, ocean, and boundary safety.

---

## Section 8 — Role Dashboards

ORCA serves multiple stakeholders through **one unified intelligence engine**:

```
                              ┌────────────────────────┐
                              │  ORCA BACKEND ENGINE   │
                              │  (Decisions & Evidence)│
                              └───────────┬────────────┘
                                          │
        ┌───────────────────┬─────────────┴───────┬───────────────────┐
        ▼                   ▼                     ▼                   ▼
┌───────────────┐   ┌───────────────┐     ┌───────────────┐   ┌───────────────┐
│   FISHERMAN   │   │   AUTHORITY   │     │   DISASTER    │   │   RESEARCH    │
│  (Mobile PWA) │   │ (Coast Guard) │     │  MANAGEMENT   │   │  (Scientist)  │
├───────────────┤   ├───────────────┤     ├───────────────┤   ├───────────────┤
│ • Quick GO/NO │   │ • Fleet view  │     │ • Cyclone path│   │ • Raw SST/SWH │
│ • PFZ vs Risk │   │ • Boundary    │     │ • Evacuation  │   │ • Model error │
│ • Local audio │   │ • SOS Alerts  │     │ • Broadcast   │   │ • Historical  │
│ • Offline mode│   │ • Permits     │     │ • Coastal risk│   │ • Correlation │
└───────────────┘   └───────────────┘     └───────────────┘   └───────────────┘
```

---

## Section 9 — Integration Strategy

You do **not** need to wait for Phase 20 to build or merge UI. You can build on an isolated branch and merge at any milestone:

### Step 1: Branch Isolation
Work on a feature branch:
```bash
git checkout -b orca-fisherman-ui
```

### Step 2: Clean Service Abstraction
Create your UI components against a client interface:
```typescript
// src/services/orcaClient.ts
export interface IOrcaClient {
  queryDecision(req: OrcaQueryRequest): Promise<OrcaQueryResponse>;
  fetchMissions(): Promise<MissionRecord[]>;
  createMission(mission: CreateMissionInput): Promise<MissionRecord>;
}
```
During local prototyping, you can toggle between `MockOrcaClient` (instant fixtures) and `HttpOrcaClient` (talking to `http://localhost:3000`).

### Step 3: Zero Hardcoding
- Never hardcode `http://localhost:3000` inside React components. Use `import.meta.env.VITE_API_BASE_URL || '/api/v1'`.
- Never put database credentials or Supabase secret keys in frontend code.

---

## Section 10 — Future Backend Evolution

| Phase | Title | What Backend Will Deliver | Frontend Impact |
| :--- | :--- | :--- | :--- |
| **Phase 6** *(Current)* | Data Adapter Framework | Source adapters, normalization schema, `/adapters` | Can view adapter inventory & mock snapshots |
| **Phase 7** | Demo Normalization & Persistence | Store normalized observations in Supabase PostGIS | Can fetch structured observations |
| **Phase 8** | Oceanography Adapter | Live/near-real-time INCOIS SST & SWH feeds | Real oceanographic heatmaps |
| **Phase 9** | Weather Adapter | IMD/ECMWF wind, rain, gust, visibility feeds | Weather barometers & wind vectors |
| **Phase 10** | PFZ / Fisheries Adapter | INCOIS PFZ polygons & species advisories | Live PFZ layer overlays on map |
| **Phase 11** | GIS Safety Engine | PostGIS EEZ, international boundary & reef checks | Accurate boundary hazard warnings |
| **Phase 12** | Vessel Capability Engine | Hull type, engine power, distance limit checks | Vessel-specific safety warnings |
| **Phase 13** | Deterministic Decision Engine V2 | Comprehensive multi-rule evaluation matrix | 100% reliable GO/NO_GO verdicts |
| **Phase 14** | Evidence & Confidence Scoring | Transparent mathematical confidence calculation | Confidence meter & evidence drawer |
| **Phase 15** | Agent Orchestration Engine | Multi-agent collaboration with event bus | Live agent reasoning trace view |
| **Phase 16** | LLM Multilingual Explanation | Context-aware explanations in Indian languages | Multilingual audio & text explanations |
| **Phase 17** | End-to-End Decision Pipeline | Integrated `/orca/query` pipeline | Full production query-to-decision flow |
| **Phase 18** | What-If Simulation Engine | "What if I delay departure by 3 hours?" API | Interactive time & route slider in UI |
| **Phase 19** | Disaster & Coastal Alerts | Live emergency broadcasting & SOS handling | Emergency banner & push notifications |
| **Phase 20** | Multi-Role Dashboard Integration | Unified role-based access & views | Authority, Disaster & Analyst screens |
| **Phase 21** | PWA Offline & Degraded Sync | Service Worker background sync & local cache | True offline-first field capability |

---

## Section 11 — Data States

The UI **must visually distinguish** between different states of data:

```
┌──────────────┬──────────────────────────────────────────┬────────────────────────┐
│ State Badge  │ Meaning                                  │ UI Presentation        │
├──────────────┼──────────────────────────────────────────┼────────────────────────┤
│ [ LIVE ]     │ Real-time, verified feed from live API   │ Solid Green pill badge │
│ [ DEMO ]     │ Simulated dataset / mock fixture         │ Amber outlined badge   │
│ [ CACHED ]   │ Freshly cached observation (< 6 hrs old) │ Blue pill badge        │
│ [ STALE ]    │ Observation past its validUntil window   │ Orange warning icon    │
│ [ DEGRADED ] │ Partial source outage, reduced accuracy  │ Yellow banner          │
│ [ OFFLINE ]  │ Device has no internet connection        │ Gray top-bar banner    │
│ [ ERROR ]    │ Endpoint failed or unreachable           │ Red error alert box    │
└──────────────┴──────────────────────────────────────────┴────────────────────────┘
```

> **NEVER** silently display stale or simulated data as live information.

---

## Section 12 — Map & GIS Rules

1. **Backend is Authoritative for Safety**:
   - The backend runs PostGIS spatial checks (`ST_Contains`, `ST_Intersects`, `ST_DWithin`) against international boundaries, marine protected areas, and cyclone hazard zones.
   - The frontend map renders the GeoJSON and allows visual exploration, but it must never independently certify that a coordinate is safe.
2. **Layer Separation**:
   - Keep layer data modular: Oceanography, Weather, PFZ, Hazards, Boundaries, Vessels.
   - Support toggling individual layers to maintain high frame rates on budget mobile devices.

---

## Section 13 — RAG / Knowledge Layer

### Current Status: NOT Implemented
- ORCA does **not** currently have a RAG (Retrieval-Augmented Generation) or GraphRAG layer active.
- Do not build UI expecting a document search engine today.

### Permitted Future Use Cases
- When RAG is introduced, it will be used for:
  - Official maritime regulations (e.g., seasonal fishing bans, maritime boundary rules).
  - Standard Operating Procedures (SOPs) for disaster response.
  - Vessel operation manuals.
- **Rule**: Numerical observations (wave height, wind speed, water temperature) must **always** flow through structured data pipelines, **never** through text retrieval.

---

## Section 14 — UI Non-Negotiables

As frontend engineers and designers, we must never compromise on these rules:

1. **NO Fake Live Claims**: Never label mock or demo data as "Live INCOIS Stream".
2. **NO Client-Side Safety Overrides**: Never calculate a green "GO" if the backend returns "NO_GO" or "CAUTION".
3. **NO Secret Key Exposure**: Never include `SUPABASE_SERVICE_ROLE_KEY` in frontend bundles. Only the public `anon` key is permitted.
4. **NO Unreadable Outdoor Themes**: Avoid low-contrast pastels and tiny 10px fonts on operational screens.
5. **NO Unexplained Decisions**: Never display a raw decision without rendering its primary explanation and rule evaluation summary.
6. **NO Autonomous Vessel Control Claims**: ORCA is a decision-support advisory system, not an autopilot controller.

---

## Section 15 — Current vs Future Matrix

| Capability / Feature | Implemented in Code? | Uses Demo / Fixture? | Backend DB Ready? | Target Phase | UI Ownership Area |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fastify API Server** | **YES** | Real server | Real Supabase | Phase 3 | Client API connector |
| **User Authentication** | **YES (Backend)** | Frontend has mock UI | Real Supabase Auth | Phase 4 | Login / Register screens |
| **Mission Persistence** | **YES (Backend)** | In-memory in UI | Real `missions` table | Phase 4 | Mission planner forms |
| **Domain Model (15 Tables)** | **YES (DB)** | N/A | PostgreSQL + PostGIS | Phase 5 | Entity view models |
| **Data Adapter Engine** | **YES (Backend)** | `ORCA_DEMO` provider | Ingestion schemas | Phase 6 | Adapter status monitor |
| **GIS Map Canvas** | **YES (Frontend)** | Local GeoJSON files | Spatial tables ready | Phase 2 / 11 | Leaflet canvas & layer UI |
| **Decision Display UI** | **YES (Frontend)** | Static mock data | Phase 2 API contract | Phase 2 / 13 | Decision cards & reasoning |
| **Live Ocean / Weather Feeds** | NO | Simulated | Planned | Phase 8–9 | Real-time weather cards |
| **Live PFZ Fishery Polygons** | NO | Simulated | Planned | Phase 10 | PFZ map layer & fish list |
| **Deterministic Decision V2**| NO (V1 active) | Rule skeleton | Planned | Phase 13 | Full rule evaluation tree |
| **Multilingual Voice/Text** | Partial (Mock UI) | Local strings | Planned | Phase 16 | Audio player & transcripts |
| **What-If Simulations** | NO | None | Planned | Phase 18 | Interactive scenario slider |
| **Emergency Broadcast / SOS** | NO | None | Planned | Phase 19 | Emergency alert modals |
| **Multi-Role Dashboards** | Partial (Scaffolded)| Mock routes | Planned | Phase 20 | Role-specific views |
| **PWA Offline Storage** | Partial (`vite-pwa`)| Cache manifest only | Planned | Phase 21 | IndexedDB & offline sync |

---

## Section 16 — Handoff Checklist

Follow this checklist to get up and running:

1. **Clone & Switch**: Ensure you are branching from `orca-core`.
2. **Install Dependencies**: Run `npm install` (Node.js 20+ required).
3. **Verify Tests**: Run `npm test -- --run` (all test suites must pass).
4. **Launch Frontend**: Run `npm run dev` (Vite dev server starts on `http://localhost:5173`).
5. **Launch Backend**: Run `npm run server:dev` in a separate terminal (Fastify starts on `http://localhost:3000`).
6. **Inspect Routes**: Open `http://localhost:5173/dashboard` and explore the navigation shell.
7. **Build in Isolation**: Create new components in `src/components/` and pages in `src/pages/`.
8. **Follow Typed Contracts**: Import request/response types from `src/types/contract.ts`.
9. **Use High Contrast**: Test UI with Chrome DevTools simulated sunlight/high-contrast mode.
10. **Test Mobile Viewport**: Test at 360x640px (standard entry-level Android smartphone in India).
11. **Check Error States**: Ensure all cards handle `loading`, `error`, `stale`, and `demo` states gracefully.
12. **Keep Business Logic in Backend**: Do not write safety calculations in React hooks.
13. **Run Lint & Typecheck**: Run `npm run lint` and `npx tsc --noEmit` before submitting PRs.
14. **Document Changes**: Note any newly introduced UI view models in your PR description.
15. **Integration Ready**: Submit PR to branch `orca-core`.

---

## Section 17 — How to Integrate Your UI Later

Here is a step-by-step walkthrough of how your UI branch will be integrated:

```
[ Your Branch: orca-fisherman-ui ]                [ Main Branch: orca-core ]
  • New Mobile Wizard UI                          • Fastify Server
  • New Bottom Navigation                         • Supabase PostGIS DB
  • High-Contrast Decision Cards                  • Data Adapters
  • Tamil/English Voice UI                        • Decision Engine V2
                  │                                         │
                  └───────────────────┬─────────────────────┘
                                      │
                                      ▼
                        [ STEP 1: API CONTRACT CHECK ]
               (Verify that src/types/contract.ts is intact)
                                      │
                                      ▼
                        [ STEP 2: MERGE UI COMPONENTS ]
                   (Copy new pages and components into src/)
                                      │
                                      ▼
                        [ STEP 3: SWITCH TO LIVE CLIENT ]
             (Replace MockOrcaClient with real API service calls)
                                      │
                                      ▼
                        [ STEP 4: AUTH & SESSION WIRING ]
            (Connect Login Page to Supabase Auth token handler)
                                      │
                                      ▼
                        [ STEP 5: TEST FULL REGRESSION ]
                   (Run npm test && npm run build && e2e tests)
```

Because contracts are strictly typed and decoupled, this integration process takes hours rather than weeks.

---

## Section 18 — Judge-Facing UI Story

When presenting ORCA to Smart India Hackathon judges or maritime evaluators:

> **"ORCA is not winning on aesthetics alone; it wins on operational clarity and actionable intelligence."**

The visual journey we present to the judges:
1. **The Human Need**: A fisherman opening an app at 03:30 AM at the pier under poor 3G connectivity.
2. **The Question**: One tap or voice query in his native tongue asking if it is safe and profitable to go out.
3. **The Intelligence Engine**: Showing in real-time how ORCA pulls ocean data, weather forecasts, fishery advisories, and vessel boundaries.
4. **The Transparent Decision**: A bold, unambiguous decision card backed by an explainable reasoning trace and mathematical confidence score.
5. **The Safety Guarantee**: Proof that hazardous weather or border incursions override commercial fish hotspots every single time.

---

## Section 19 — Current Limitations

In the spirit of complete engineering honesty:
1. **Environmental Data is Demo**: Live INCOIS / MOSDAC Web Service pipelines are scheduled for Phases 8–10. Current observations come from the Phase 6 `ORCA_DEMO` adapter.
2. **GIS Safety Checks are Static**: Real-time PostGIS polygon clipping against live boundary updates is scheduled for Phase 11.
3. **Decision Engine is V1**: The current decision engine checks core thresholds. The full deterministic matrix (Phase 13) and multi-agent orchestrator (Phase 15) are in progress.
4. **Offline Sync is Partial**: Service worker caching is active, but true offline IndexedDB background queueing is scheduled for Phase 21.
5. **RAG is Not Active**: No vector search or document RAG exists in the codebase today.

---

*Authored by the ORCA Core Architecture Team — SIH26176*
