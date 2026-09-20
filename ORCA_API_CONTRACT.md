# ORCA — API & DATA CONTRACT SPECIFICATION
**Version:** `v2.0-Core`  
**Status:** Canonical Interface Specification  
**Governing Brain:** `ORCA_ULTIMATE_TEAM_BRAIN_SIH2026.md`  
**Repository Branch:** `orca-core`

---

## 1. Executive Summary & Purpose

This document defines the strict, unambiguous technical contract between the **ORCA Frontend (React/PWA)**, the **ORCA Backend Service (API / Orchestrator)**, the **Multi-Agent Reasoning Pipeline**, the **PostgreSQL/Supabase Database**, and external data sources (INCOIS, IMD, MOSDAC, NavArea VIII).

### Primary Objective
Enable the frontend to seamlessly transition from static/client-side simulated mock datasets to real-time backend API endpoints **without requiring any visual redesign or component restructuring**.

---

## 2. Core Architectural Ownership Rules

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             ORCA FRONTEND (Client)                          │
│  - Presentation & HUD visual rendering                                      │
│  - Map rendering & layer visibility state (Leaflet / Canvas)                │
│  - Local reactive state (active tab, selected entity, UI drawer toggles)    │
│  - Form input capturing (departure time, duration slider, activity pickers) │
│  - Offline UI shell & local cache storage                                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / WebSocket REST Contracts
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                             ORCA BACKEND (Server)                           │
│  - Ingestion, validation & freshness calculation of external data           │
│  - Multi-Agent Orchestration (Sequential Planner + Concurrent Specialists)  │
│  - Structured Evidence Extraction & Provenance tagging                      │
│  - Deterministic Safety Decision Engine (GO / CAUTION / AVOID / INSUF_DATA) │
│  - Predictive Spatial GIS (Turf.js, PostGIS spatial intersections)          │
│  - Multi-tenant role authorization & historical decision audit trail        │
└─────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **CRITICAL SAFETY BOUNDARY:**  
> All mission risk calculations, safety rule overrides, and decision evaluations **must execute deterministically on the backend**. The frontend must never attempt to override safety verdicts or evaluate raw physical wave limits locally.

---

## 3. Global Representation Standards

1. **Identifiers (IDs):** String UUIDs (`uuidv4`) or structured operational keys (e.g., `VESSEL-001`, `PFZ-MUM-01`, `HAZ-20260902-01`).
2. **Timestamps:** ISO 8601 UTC with explicit millisecond precision: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., `2026-09-02T08:30:00.000Z`).
3. **Geographic Coordinates:** WGS84 Datum in decimal degrees:
   - Latitude: `-90.000000` to `+90.000000`
   - Longitude: `-180.000000` to `+180.000000`
   - Format: `[latitude, longitude]` for point representations, GeoJSON standard `[longitude, latitude]` for geometry coordinate arrays.
4. **Physical Measurement Units:**
   - Wind Speed: Knots (`kts`)
   - Wave Swell / Significant Wave Height ($H_s$): Meters (`m`)
   - Wave Period ($T_p$): Seconds (`s`)
   - Water Depth / Elevation: Meters (`m`)
   - Distance: Kilometers (`km`) or Nautical Miles (`nm`)
   - Sea Surface Temperature (SST): Degrees Celsius (`°C`)
   - Chlorophyll-a Concentration: Milligrams per cubic meter (`mg/m³`)
   - Bearing / Heading: Degrees clockwise from True North (`0°` to `360°`)

---

## 4. The 10 Core Domain Contracts

### 4.1. Data Status & Provenance Envelope
Every data payload, observation, and evidence item carries a lifecycle provenance header.

```typescript
type DataStatus =
  | "LIVE"           // Real-time authenticated feed from official agency
  | "INTEGRATED"     // Multi-source correlated live intelligence
  | "DEMO_SNAPSHOT"  // Static deterministic evaluation snapshot
  | "CACHED"         // Valid local copy within active freshness TTL
  | "STALE"          // Expired past validity TTL (warning flag attached)
  | "UNAVAILABLE";   // Upstream data feed unreachable

interface DataProvenanceMeta {
  source: string;              // e.g. "INCOIS_PFZ_ADVISORY", "IMD_RADAR_MUMBAI"
  datasetName?: string;        // e.g. "SST_DAILY_COMPOSITE"
  observedAt: string;          // ISO 8601 UTC
  retrievedAt: string;         // ISO 8601 UTC
  validUntil: string | null;   // ISO 8601 UTC
  status: DataStatus;
  qualityLevel?: "HIGH" | "MEDIUM" | "LOW" | "DEGRADED";
  spatialRelevanceKm?: number;
}
```

---

### 4.2. Role & Multi-Dashboard Model
ORCA supports five discrete maritime operational roles with scoped permissions and contextual dashboards:

```typescript
type UserRole =
  | "FISHERMAN"          // Small-craft and artisanal operators
  | "COASTAL_AUTHORITY"  // Coast Guard, Port Authorities, Fisheries Dept
  | "DISASTER_MANAGER"   // State / National Disaster Response Authorities
  | "RESEARCHER"         // Oceanographers, Marine Ecologists, INCOIS/ISRO analysts
  | "MARITIME_OPERATOR"; // Commercial tugs, passenger ferries, coastal survey

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  harborId: string | null;
  harborName: string | null;
  assignedVesselIds: string[];
  preferredLanguage: "en" | "hi" | "mr" | "ta" | "te" | "gu";
  createdAt: string;
  updatedAt: string;
}
```

---

### 4.3. Vessel Asset Contract
Represents physical craft specifications and hard seaworthiness constraints:

```typescript
type VesselType =
  | "TRADITIONAL_MOTORIZED" // 6-10m FRP/wooden craft
  | "SMALL_MECHANIZED"      // 10-18m trawler/gillnetter
  | "DEEP_SEA_COMMERCIAL"   // >18m multi-day vessel
  | "PATROL_SURVEY";        // High-speed coastal craft

interface VesselContract {
  id: string;
  ownerId: string;
  name: string;
  registrationNumber: string;       // e.g. "IND-MH-02-MM-849"
  vesselType: VesselType;
  lengthMeters: number;             // LOA in meters
  beamMeters: number;
  draftMeters: number;
  engineHp: number;
  maxWaveToleranceMeters: number;   // HARD safety limit for wave height
  maxWindToleranceKnots: number;    // HARD safety limit for wind velocity
  cruisingSpeedKnots: number;
  fuelCapacityHours: number;
  crewCapacity: number;
  homePort: {
    name: string;
    latitude: number;
    longitude: number;
  };
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  currentHeadingDegrees: number;
  updatedAt: string;
}
```

---

### 4.4. Mission & Trip Plan Contract
Defines an operator's planned maritime excursion:

```typescript
interface MissionRequest {
  activity: "FISHING" | "SURVEY" | "PATROL";
  vesselId: string;
  departureTime: string;             // ISO 8601 UTC or "HH:mm" local
  durationHours: number;             // Mission duration in hours (e.g. 2 - 14)
  startLocation: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  targetZoneId?: string | null;      // Optional specific PFZ zone target
  constraints?: {
    maxDistanceKm?: number;
    mustReturnBeforeSunset?: boolean;
    maxWaveHeightMeters?: number;
  };
}
```

---

### 4.5. Observation Contracts (Oceanography & Meteorology)

```typescript
interface WeatherObservationContract {
  location: { latitude: number; longitude: number };
  windSpeedKnots: number;
  windGustKnots: number;
  windDirectionDegrees: number;
  windDirectionCompass: string;     // e.g. "WNW"
  waveHeightMeters: number;         // Significant wave height (Hs)
  wavePeriodSeconds: number;
  visibilityKm: number;
  airTemperatureCelsius: number;
  atmosphericPressureHpa: number;
  precipitationProbabilityPct: number;
  weatherConditionText: string;
  cycloneAlertActive: boolean;
  squallWarningActive: boolean;
  provenance: DataProvenanceMeta;
}

interface OceanObservationContract {
  location: { latitude: number; longitude: number };
  seaSurfaceTemperatureCelsius: number;
  sstAnomalyCelsius: number;
  chlorophyllMgM3: number;
  chlorophyllFrontDetected: boolean;
  surfaceCurrentSpeedKnots: number;
  surfaceCurrentDirectionDegrees: number;
  mixedLayerDepthMeters: number;
  thermoclineDepthMeters: number;
  salinityPsu: number | null;
  upwellingIndicator: "STRONG" | "MODERATE" | "WEAK" | "NONE";
  provenance: DataProvenanceMeta;
}

interface PfzZoneContract {
  id: string;
  zoneName: string;
  centroid: { latitude: number; longitude: number; depthMeters?: number };
  potentialScore: "HIGH" | "MODERATE" | "LOW";
  chlorophyllIndicator: string;
  sstIndicator: string;
  distanceKmFromPort: number;
  bearingDegreesFromPort: number;
  recommendedFishTypes: string[];
  depthEnvelopeMeters: { min: number; max: number };
  provenance: DataProvenanceMeta;
}
```

---

### 4.6. Structured Evidence & Provenance Contract

```typescript
interface EvidenceRecord {
  id: string;                       // Unique evidence item UUID
  key: string;                      // Machine identifier (e.g. "sst_thermal_front")
  label: string;                    // Human-readable title
  parameter: string;                // Observed parameter name
  observedValue: string | number;   // Formatted value (e.g. "27.8°C", "1.4m")
  unit: string | null;
  impact: "POSITIVE" | "CAUTIONARY" | "ADVERSE" | "NEUTRAL";
  decisionRole: string;             // Detailed explanation of decision influence
  provenance: DataProvenanceMeta;
}
```

---

### 4.7. Specialist Agent Result Contract

```typescript
type AgentDomainId =
  | "PLANNER"
  | "OCEANOGRAPHY"
  | "METEOROLOGY"
  | "PFZ_FISHERIES"
  | "GEO_SAFETY";

type AgentStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "DEGRADED";

interface BaseAgentResponse<T = Record<string, unknown>> {
  agentId: AgentDomainId;
  agentName: string;
  role: string;
  status: AgentStatus;
  startedAt: string;
  completedAt: string;
  executionDurationMs: number;
  summary: string;
  confidenceScore: number;          // 0 to 100
  data: T;
  evidence: EvidenceRecord[];
  warnings: string[];
  provenanceStatus: DataStatus;
  error?: string | null;
}
```

---

### 4.8. Decision Contract & The Four Immutable Verdicts

The ORCA Decision Engine strictly outputs one of four immutable verdicts:

```typescript
type DecisionVerdict =
  | "GO"                 // All safety constraints satisfied; favorable operational window
  | "CAUTION"            // Mission feasible only under strict advisory / reduced window
  | "AVOID"              // Safety override or physical threshold violation (Do Not Sail)
  | "INSUFFICIENT_DATA"; // Critical observation data missing; safety cannot be verified

interface RuleEvaluationContract {
  ruleId: string;
  ruleName: string;
  category:
    | "SAFETY_OVERRIDE"
    | "PHYSICAL_CONSTRAINT"
    | "TEMPORAL_EXPOSURE"
    | "OPPORTUNITY_OPTIMIZATION"
    | "DATA_QUALITY_GATE";
  verdictImpact: "PASS" | "CAUTION" | "AVOID" | "INSUFFICIENT_DATA";
  reason: string;
  evidenceRef: string;
  deterministicScore: number;       // 0 to 100
}

interface DecisionContract {
  decisionId: string;
  verdict: DecisionVerdict;
  confidence: {
    level: "HIGH" | "MEDIUM" | "LOW";
    score: number;                  // Algorithmic verification completeness (60.0 - 98.0%)
    reasons: string[];              // Transparent factors composing score
  };
  primaryDriver: string;            // Decisive rule trigger
  explanation: string;              // Plain-language synthesis for operator
  recommendedDeparture: string;
  recommendedReturn: string;
  recommendedZone: {
    id: string;
    name: string;
    distanceKm: number;
    bearingDegrees: number;
    opportunityLevel: "HIGH" | "MODERATE" | "LOW";
  } | null;
  ruleEvaluations: RuleEvaluationContract[];
  safetyOverridesTriggered: string[];
  positiveFactors: string[];
  riskFactors: string[];
  dataQuality: {
    status: DataStatus;
    requiredSources: number;
    availableSources: number;
    staleSources: number;
    completenessScore: number;
  };
  evaluatedAt: string;
}
```

---

### 4.9. Boundary & Hazard Alert Contracts

```typescript
interface BoundaryFeatureContract {
  id: string;
  name: string;
  zoneType: "RESTRICTED_MILITARY" | "PORT_SECURITY_ANCHORAGE" | "MARINE_PROTECTED_SANCTUARY" | "SAFE_CORRIDOR";
  severityOnIncursion: "CRITICAL" | "HIGH" | "MODERATE";
  restrictionDescription: string;
  bufferDistanceMeters: number;
  coordinates: number[][][];        // GeoJSON Polygon
  provenance: DataProvenanceMeta;
}

interface HazardAlertContract {
  id: string;
  title: string;
  hazardType: "SQUALL" | "CYCLONE" | "SHALLOW_SHOAL" | "HIGH_WAVE_SWELL";
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  areaDescription: string;
  affectedCoordinates: [number, number][];
  advisoryAction: string;
  isActive: boolean;
  provenance: DataProvenanceMeta;
}
```

---

### 4.10. Connectivity & Map Layer State Contracts

```typescript
interface ConnectivityStateContract {
  isOnline: boolean;
  networkType?: "COASTAL_MESH" | "4G_CELLULAR" | "SATELLITE_NAVIX" | "OFFLINE_LOCAL";
  backendConnected: boolean;
  databaseConnected: boolean;
  activeDataFeedStatus: {
    incoisPfz: DataStatus;
    imdWeather: DataStatus;
    mosdacOcean: DataStatus;
    coastGuardAlerts: DataStatus;
  };
  lastSyncedAt: string;
}

interface MapLayersStateContract {
  userLocation: boolean;
  vessel: boolean;
  pfzZones: boolean;
  weatherRisk: boolean;
  hazards: boolean;
  boundaries: boolean;
  recommendedRoute: boolean;
  safeCorridor: boolean;
  riskAreas: boolean;
}
```

---

## 5. Endpoints Specification

### 5.1. `GET /health`
- **Method:** `GET`
- **Path:** `/api/v1/health`
- **Purpose:** System readiness, container status, and service health check.
- **Authentication:** Public (No token required).

#### Success Response (`200 OK`):
```json
{
  "status": "HEALTHY",
  "version": "1.0.0",
  "timestamp": "2026-09-18T08:30:00.000Z",
  "services": {
    "apiServer": true,
    "database": true,
    "dataIngestionScheduler": true,
    "agentOrchestrator": true
  },
  "environment": "demo"
}
```

#### Error Response (`503 Service Unavailable`):
```json
{
  "error": {
    "code": "DATABASE_UNAVAILABLE",
    "message": "Database connection pool exhausted or unreachable.",
    "requestId": "req-health-fail-001",
    "timestamp": "2026-09-18T08:30:00.000Z"
  }
}
```

---

### 5.2. `GET /me`
- **Method:** `GET`
- **Path:** `/api/v1/me`
- **Purpose:** Retrieve the authenticated operator profile, assigned vessel assets, home harbor, and permissions.
- **Authentication:** Bearer JWT token required in `Authorization` header.

#### Success Response (`200 OK`):
```json
{
  "user": {
    "id": "usr-f8e2-411a-9b81-64d8a7c8e991",
    "email": "operator.alibaug@orca.incois.gov.in",
    "fullName": "Suresh Tandel",
    "role": "FISHERMAN",
    "harborId": "PORT-BOM-01",
    "harborName": "Sassoon Docks, Mumbai",
    "assignedVesselIds": ["VESSEL-001"],
    "preferredLanguage": "mr",
    "createdAt": "2026-08-15T04:00:00.000Z",
    "updatedAt": "2026-09-02T06:00:00.000Z"
  },
  "activeVessel": {
    "id": "VESSEL-001",
    "ownerId": "usr-f8e2-411a-9b81-64d8a7c8e991",
    "name": "Matsya Sagar 1",
    "registrationNumber": "IND-MH-02-MM-849",
    "vesselType": "TRADITIONAL_MOTORIZED",
    "lengthMeters": 8.5,
    "beamMeters": 2.2,
    "draftMeters": 1.1,
    "engineHp": 25,
    "maxWaveToleranceMeters": 1.8,
    "maxWindToleranceKnots": 18.0,
    "cruisingSpeedKnots": 6.5,
    "fuelCapacityHours": 10.0,
    "crewCapacity": 3,
    "homePort": {
      "name": "Sassoon Docks",
      "latitude": 18.915,
      "longitude": 72.825
    },
    "currentLocation": {
      "latitude": 18.915,
      "longitude": 72.825
    },
    "currentHeadingDegrees": 180,
    "updatedAt": "2026-09-02T08:00:00.000Z"
  },
  "permissions": ["query:orca", "view:pfz", "view:map", "plan:trip"]
}
```

#### Error Response (`401 Unauthorized`):
```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Missing or expired authorization bearer token.",
    "requestId": "req-me-unauth-002",
    "timestamp": "2026-09-18T08:30:00.000Z"
  }
}
```

---

### 5.3. `POST /orca/query` (The Core Multi-Agent Orchestrator Pipeline)
- **Method:** `POST`
- **Path:** `/api/v1/orca/query`
- **Purpose:** Primary conversational and mission intelligence endpoint. Deconstructs operator intent, coordinates the 5 domain specialist agents, aggregates structured evidence, evaluates deterministic safety rules, and returns a verified decision and map context.
- **Authentication:** Optional in Demo mode / Required in Authenticated mode.

#### Execution Pipeline Workflow:
```
User Query / Mission Parameters
  ↓
1. Mission Planner Agent (Intent, Duration, Departure, Vessel Limits)
  ↓
2. Parallel Specialist Execution (Oceanography, Meteorology, PFZ, GeoSafety)
  ↓
3. Structured Evidence Extraction & Normalization
  ↓
4. Deterministic Decision Engine Evaluation
  ↓
Verdict Emission: GO / CAUTION / AVOID / INSUFFICIENT_DATA
  ↓
Response Package (Trace + Decision + Evidence + GIS Context)
```

#### Request Body (`application/json`):
```json
{
  "queryText": "Can I go fishing tomorrow morning for five hours from Sassoon Docks?",
  "structuredMission": {
    "activity": "FISHING",
    "vesselId": "VESSEL-001",
    "departureTime": "05:45",
    "durationHours": 5,
    "sectorId": "maharashtra",
    "mustReturnBeforeSunset": true
  },
  "regionId": "maharashtra",
  "operatorLocation": {
    "latitude": 18.915,
    "longitude": 72.825
  }
}
```

#### Success Response (`200 OK`):
```json
{
  "queryId": "qry-78e2-411a-9b81-orca20260902",
  "timestamp": "2026-09-18T08:30:02.850Z",
  "executionTimeMs": 850,
  "parsedIntent": {
    "activity": "FISHING",
    "departureTime": "05:45 IST",
    "durationHours": 5,
    "locationContext": "Alibaug Coastal Sector / Arabian Sea",
    "vesselId": "VESSEL-001"
  },
  "agentTrace": {
    "planner": {
      "agentId": "PLANNER",
      "agentName": "Mission Planner Agent",
      "role": "Intent Deconstruction & Task Delegation",
      "status": "COMPLETED",
      "startedAt": "2026-09-18T08:30:02.000Z",
      "completedAt": "2026-09-18T08:30:02.350Z",
      "executionDurationMs": 350,
      "summary": "Parsed FISHING mission • 05:45 IST departure (5h duration) • Dispatched 4 specialist agents.",
      "confidenceScore": 96.0,
      "data": {
        "intent": "fishing_trip_assessment",
        "activity": "FISHING",
        "departureTime": "05:45 IST",
        "durationHours": 5,
        "vesselRequired": true
      },
      "evidence": [
        {
          "id": "ev-plan-01",
          "key": "parsed_intent",
          "label": "Mission Objective",
          "parameter": "Activity Target",
          "observedValue": "FISHING (5 hours)",
          "unit": null,
          "impact": "NEUTRAL",
          "decisionRole": "Sets temporal exposure window for forecast intersection",
          "provenance": {
            "source": "ORCA_PLANNER_AGENT",
            "observedAt": "2026-09-18T08:30:02.000Z",
            "retrievedAt": "2026-09-18T08:30:02.000Z",
            "validUntil": null,
            "status": "LIVE"
          }
        }
      ],
      "warnings": [],
      "provenanceStatus": "LIVE"
    },
    "oceanography": {
      "agentId": "OCEANOGRAPHY",
      "agentName": "Oceanography Agent",
      "role": "Hydrographic & Thermal Front Analysis",
      "status": "COMPLETED",
      "startedAt": "2026-09-18T08:30:02.350Z",
      "completedAt": "2026-09-18T08:30:02.850Z",
      "executionDurationMs": 500,
      "summary": "SST 27.8°C (Thermal front favorable) • Chlorophyll 1.84 mg/m³ • Current 0.8 kts SSE • Ocean Risk: MODERATE.",
      "confidenceScore": 88.0,
      "data": {
        "seaSurfaceTemperatureCelsius": 27.8,
        "sstAnomalyCelsius": 0.6,
        "surfaceCurrentSpeedKnots": 0.8,
        "mixedLayerDepthMeters": 28,
        "chlorophyllConcentrationMgM3": 1.84,
        "waveSwellMeters": 1.4,
        "oceanRiskLevel": "MODERATE"
      },
      "evidence": [
        {
          "id": "ev-ocn-01",
          "key": "sst_front",
          "label": "Sea Surface Temperature",
          "parameter": "SST Composite",
          "observedValue": "27.8°C (Anomaly: +0.6°C)",
          "unit": "°C",
          "impact": "POSITIVE",
          "decisionRole": "Favorable thermal range for pelagic aggregation",
          "provenance": {
            "source": "INCOIS_OCEAN_MODEL",
            "datasetName": "DAILY_SST_CORRELATED",
            "observedAt": "2026-09-02T06:00:00.000Z",
            "retrievedAt": "2026-09-02T07:00:00.000Z",
            "validUntil": "2026-09-03T06:00:00.000Z",
            "status": "DEMO_SNAPSHOT"
          }
        }
      ],
      "warnings": [],
      "provenanceStatus": "DEMO_SNAPSHOT"
    },
    "meteorology": {
      "agentId": "METEOROLOGY",
      "agentName": "Meteorology Agent",
      "role": "Atmospheric & Wave Swell Evaluation",
      "status": "COMPLETED",
      "startedAt": "2026-09-18T08:30:02.350Z",
      "completedAt": "2026-09-18T08:30:02.850Z",
      "executionDurationMs": 500,
      "summary": "Wind 12.5 kts WNW • Gusts 18.5 kts • Wave Swell 1.4m rising to 2.1m post-12:00 IST.",
      "confidenceScore": 91.0,
      "data": {
        "windSpeedKnots": 12.5,
        "windGustKnots": 18.5,
        "waveHeightMeters": 1.4,
        "wavePeriodSeconds": 7.2,
        "visibilityKm": 8.5,
        "weatherRiskLevel": "MODERATE"
      },
      "evidence": [
        {
          "id": "ev-met-01",
          "key": "wave_swell_forecast",
          "label": "Coastal Wave Swell",
          "parameter": "Significant Wave Height",
          "observedValue": "1.4m (Morning) -> 2.1m (Post-12:00 IST)",
          "unit": "m",
          "impact": "CAUTIONARY",
          "decisionRole": "Restricts operational departure window to before midday",
          "provenance": {
            "source": "IMD_COASTAL_RADAR",
            "observedAt": "2026-09-02T06:00:00.000Z",
            "retrievedAt": "2026-09-02T07:00:00.000Z",
            "validUntil": "2026-09-03T06:00:00.000Z",
            "status": "DEMO_SNAPSHOT"
          }
        }
      ],
      "warnings": ["Midday wave swell reaches 2.1m exceeding small craft tolerance."],
      "provenanceStatus": "DEMO_SNAPSHOT"
    },
    "pfzFisheries": {
      "agentId": "PFZ_FISHERIES",
      "agentName": "PFZ / Fisheries Agent",
      "role": "Potential Fishing Zone Scoring",
      "status": "COMPLETED",
      "startedAt": "2026-09-18T08:30:02.350Z",
      "completedAt": "2026-09-18T08:30:02.850Z",
      "executionDurationMs": 500,
      "summary": "Identified Zone Alpha (PFZ-MUM-01) at 18.5 km, 245° WSW • Opportunity: HIGH • Species: Mackerel, Sardines.",
      "confidenceScore": 89.0,
      "data": {
        "topCandidateZoneId": "PFZ-MUM-01",
        "topCandidateZoneName": "Alibaug Outer Bank (PFZ-MUM-01)",
        "opportunityLevel": "HIGH",
        "distanceKm": 18.5,
        "bearingDegrees": 245,
        "targetFishTypes": ["Indian Mackerel", "Ribbonfish", "Sardines"]
      },
      "evidence": [
        {
          "id": "ev-pfz-01",
          "key": "pfz_zone_alpha",
          "label": "Candidate Fishing Zone",
          "parameter": "Chlorophyll-SST Front",
          "observedValue": "Zone Alpha (18.5 km, 245° WSW)",
          "unit": "km",
          "impact": "POSITIVE",
          "decisionRole": "Provides primary commercial fishing utility opportunity",
          "provenance": {
            "source": "INCOIS_PFZ_ADVISORY",
            "observedAt": "2026-09-02T06:00:00.000Z",
            "retrievedAt": "2026-09-02T07:00:00.000Z",
            "validUntil": "2026-09-03T06:00:00.000Z",
            "status": "DEMO_SNAPSHOT"
          }
        }
      ],
      "warnings": [],
      "provenanceStatus": "DEMO_SNAPSHOT"
    },
    "geoSafety": {
      "agentId": "GEO_SAFETY",
      "agentName": "Geo / Safety Agent",
      "role": "Geofence Compliance & Hazard Corridor Evaluation",
      "status": "COMPLETED",
      "startedAt": "2026-09-18T08:30:02.350Z",
      "completedAt": "2026-09-18T08:30:02.850Z",
      "executionDurationMs": 500,
      "summary": "Boundary Status: CLEAR • Naval Anchorage clearance: 4.2 km • Safe corridor verified.",
      "confidenceScore": 94.0,
      "data": {
        "boundaryStatus": "CLEAR",
        "nearestGeofenceName": "Naval Anchorage Security Geofence",
        "geofenceClearanceKm": 4.2,
        "incursionRisk": "NONE",
        "activeHazardsCount": 2,
        "safeCorridorVerified": true
      },
      "evidence": [
        {
          "id": "ev-geo-01",
          "key": "geofence_clearance",
          "label": "Naval Geofence Clearance",
          "parameter": "Buffer Distance",
          "observedValue": "4.2 km clearance",
          "unit": "km",
          "impact": "POSITIVE",
          "decisionRole": "Verifies transit line is clear of restricted zone buffer",
          "provenance": {
            "source": "NATIONAL_HYDROGRAPHIC_OFFICE",
            "observedAt": "2026-09-02T06:00:00.000Z",
            "retrievedAt": "2026-09-02T07:00:00.000Z",
            "validUntil": "2026-12-31T23:59:59.000Z",
            "status": "DEMO_SNAPSHOT"
          }
        }
      ],
      "warnings": [],
      "provenanceStatus": "DEMO_SNAPSHOT"
    }
  },
  "decision": {
    "decisionId": "DEC-20260902-001",
    "verdict": "CAUTION",
    "confidence": {
      "level": "HIGH",
      "score": 78.4,
      "reasons": [
        "All 5 required marine observation streams verified.",
        "Deterministic physical wave threshold rule satisfied for morning departure.",
        "Temporal return window (10:45 IST) approaches 2.1m midday swell boundary."
      ]
    },
    "primaryDriver": "Departure at 05:45 IST is favorable, but return window approaches worsening midday sea state (> 2.0m swell post-12:00 IST).",
    "explanation": "Trip feasible for early morning departure at 05:45 IST. High pelagic opportunity in Zone Alpha (18.5 km), but return transit must conclude before 11:30 IST to avoid afternoon wave chop.",
    "recommendedDeparture": "05:45 IST",
    "recommendedReturn": "10:45 IST",
    "recommendedZone": {
      "id": "PFZ-MUM-01",
      "name": "Alibaug Outer Bank (PFZ-MUM-01)",
      "distanceKm": 18.5,
      "bearingDegrees": 245,
      "opportunityLevel": "HIGH"
    },
    "ruleEvaluations": [
      {
        "ruleId": "RULE_01_SEVERE_OFFICIAL_WARNING",
        "ruleName": "Severe Marine & Cyclone Warning Override",
        "category": "SAFETY_OVERRIDE",
        "verdictImpact": "PASS",
        "reason": "No critical cyclone or severe emergency overrides active.",
        "evidenceRef": "IMD_COASTAL_RADAR",
        "deterministicScore": 100
      },
      {
        "ruleId": "RULE_02_HARD_GEOFENCE_CONFLICT",
        "ruleName": "Naval & Marine Sanctuary Geofence Compliance",
        "category": "SAFETY_OVERRIDE",
        "verdictImpact": "PASS",
        "reason": "Clear navigation corridor verified (4.2 km clearance from Naval Anchorage).",
        "evidenceRef": "GEO-RESTRICTED-01",
        "deterministicScore": 100
      },
      {
        "ruleId": "RULE_03_VESSEL_WAVE_TOLERANCE",
        "ruleName": "Vessel Seaworthiness & Wave Tolerance Limit",
        "category": "PHYSICAL_CONSTRAINT",
        "verdictImpact": "PASS",
        "reason": "Morning wave swell (1.4m) is within craft tolerance margin (1.8m).",
        "evidenceRef": "VESSEL-001",
        "deterministicScore": 95
      },
      {
        "ruleId": "RULE_04_TEMPORAL_RETURN_WINDOW",
        "ruleName": "Temporal Forecast & Return Corridor Exposure",
        "category": "TEMPORAL_EXPOSURE",
        "verdictImpact": "CAUTION",
        "reason": "Departure at 05:45 IST is favorable, but return window approaches worsening midday sea state.",
        "evidenceRef": "HOURLY_FORECAST_WINDOW",
        "deterministicScore": 65
      },
      {
        "ruleId": "RULE_06_PFZ_OPPORTUNITY_OPTIMIZATION",
        "ruleName": "Satellite PFZ & Pelagic Habitat Opportunity",
        "category": "OPPORTUNITY_OPTIMIZATION",
        "verdictImpact": "PASS",
        "reason": "Zone Alpha exhibits HIGH pelagic aggregation potential.",
        "evidenceRef": "PFZ-MUM-01",
        "deterministicScore": 95
      },
      {
        "ruleId": "RULE_07_DATA_QUALITY_GATE",
        "ruleName": "Dataset Completeness & Quality Gate",
        "category": "DATA_QUALITY_GATE",
        "verdictImpact": "PASS",
        "reason": "All required marine datasets verified (5/5 agent reports present).",
        "evidenceRef": "DATA_QUALITY_AUDIT",
        "deterministicScore": 100
      }
    ],
    "safetyOverridesTriggered": [],
    "positiveFactors": [
      "Alibaug Outer Bank shows high pelagic aggregation potential based on SST thermal front.",
      "Clear navigation corridor verified (4.2 km clearance from Naval Anchorage Security Geofence).",
      "All required marine datasets verified (5/5 agent reports present)."
    ],
    "riskFactors": [
      "Departure at 05:45 IST is favorable, but return window (10:45 IST) approaches worsening midday sea state."
    ],
    "dataQuality": {
      "status": "DEMO_SNAPSHOT",
      "requiredSources": 5,
      "availableSources": 5,
      "staleSources": 0,
      "completenessScore": 100
    },
    "evaluatedAt": "2026-09-18T08:30:02.850Z"
  },
  "evidence": [
    {
      "id": "ev-01",
      "key": "sst_front",
      "label": "Sea Surface Temperature",
      "parameter": "SST Gradient",
      "observedValue": "27.8°C",
      "unit": "°C",
      "impact": "POSITIVE",
      "decisionRole": "Positive pelagic habitat driver",
      "provenance": {
        "source": "INCOIS_OCEAN_MODEL",
        "observedAt": "2026-09-02T06:00:00.000Z",
        "retrievedAt": "2026-09-02T07:00:00.000Z",
        "validUntil": "2026-09-03T06:00:00.000Z",
        "status": "DEMO_SNAPSHOT"
      }
    }
  ],
  "mapContext": {
    "sectorId": "maharashtra",
    "centerCoordinates": [18.78, 72.72],
    "recommendedRouteCoordinates": [
      [18.915, 72.825],
      [18.847, 72.737],
      [18.72, 72.65]
    ],
    "activeWarningCount": 2
  }
}
```

#### Error Response: Insufficient Observation Data (`422 Unprocessable Entity`):
When critical feeds are down and safety cannot be verified:
```json
{
  "error": {
    "code": "INSUFFICIENT_OBSERVATION_DATA",
    "message": "Critical meteorological and oceanographic feeds are missing. Decision Engine cannot guarantee maritime safety.",
    "details": {
      "missingStreams": ["METEOROLOGY_WAVE_SWELL", "OCEAN_SURFACE_CURRENTS"],
      "recommendedAction": "Do not sail until official INCOIS/IMD observations re-synchronize."
    },
    "requestId": "req-orca-query-fail-003",
    "timestamp": "2026-09-18T08:30:00.000Z"
  }
}
```

---

### 5.4. `GET /decisions/{id}`
- **Method:** `GET`
- **Path:** `/api/v1/decisions/{id}`
- **Purpose:** Retrieve full deterministic decision record, rule evaluations, complete evidence audit trail, and replayed context.
- **Authentication:** Public in demo / Authenticated in production.

#### Success Response (`200 OK`):
```json
{
  "decision": {
    "decisionId": "DEC-20260902-001",
    "verdict": "CAUTION",
    "confidence": {
      "level": "HIGH",
      "score": 78.4,
      "reasons": [
        "5 of 5 required observation feeds verified.",
        "Temporal return corridor exposure post-midday."
      ]
    },
    "primaryDriver": "Wave swell reaches 2.1m post-midday; return window constrained.",
    "explanation": "Trip feasible between 05:45 and 11:30 IST. Conclude operations before afternoon chop.",
    "recommendedDeparture": "05:45 IST",
    "recommendedReturn": "10:45 IST",
    "recommendedZone": {
      "id": "PFZ-MUM-01",
      "name": "Zone Alpha (Offshore Alibaug)",
      "distanceKm": 18.5,
      "bearingDegrees": 245,
      "opportunityLevel": "HIGH"
    },
    "ruleEvaluations": [],
    "safetyOverridesTriggered": [],
    "positiveFactors": ["High pelagic opportunity", "Naval geofence clearance 4.2 km"],
    "riskFactors": ["Midday wave swell exceeds 2.0m"],
    "dataQuality": {
      "status": "DEMO_SNAPSHOT",
      "requiredSources": 5,
      "availableSources": 5,
      "staleSources": 0,
      "completenessScore": 100
    },
    "evaluatedAt": "2026-09-02T08:30:02.850Z"
  },
  "missionContext": {
    "queryId": "qry-78e2-411a-9b81-orca20260902",
    "vessel": {
      "id": "VESSEL-001",
      "name": "Matsya Sagar 1",
      "vesselType": "TRADITIONAL_MOTORIZED",
      "maxWaveToleranceMeters": 1.8
    },
    "activity": "FISHING",
    "departureTime": "05:45 IST",
    "durationHours": 5,
    "targetZoneName": "Zone Alpha (Offshore Alibaug)"
  },
  "fullEvidenceLog": [
    {
      "id": "ev-01",
      "key": "sst_front",
      "label": "Sea Surface Temperature Gradient",
      "parameter": "SST Composite",
      "observedValue": "27.8°C",
      "unit": "°C",
      "impact": "POSITIVE",
      "decisionRole": "Pelagic habitat indicator (+ Factor)",
      "provenance": {
        "source": "INCOIS_OCEAN_MODEL_SNAPSHOT",
        "observedAt": "2026-09-02T06:00:00.000Z",
        "retrievedAt": "2026-09-02T07:00:00.000Z",
        "validUntil": "2026-09-03T06:00:00.000Z",
        "status": "DEMO_SNAPSHOT"
      }
    }
  ],
  "replayedAt": null
}
```

#### Error Response: Not Found (`404 Not Found`):
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Decision record with ID 'DEC-INVALID-999' was not found in audit logs.",
    "requestId": "req-dec-notfound-004",
    "timestamp": "2026-09-18T08:30:00.000Z"
  }
}
```

---

## 6. Standardized Error Contract

All ORCA API errors strictly conform to this predictable envelope:

```typescript
type ApiErrorCode =
  | "UNAUTHENTICATED"               // Missing or invalid JWT
  | "UNAUTHORIZED"                 // Role permissions insufficient
  | "VALIDATION_ERROR"             // Malformed schema or invalid parameters
  | "NOT_FOUND"                     // Resource does not exist
  | "SOURCE_UNAVAILABLE"            // Upstream provider (IMD/INCOIS) unreachable
  | "INSUFFICIENT_OBSERVATION_DATA" // Missing critical safety parameters
  | "ORCHESTRATION_TIMEOUT"         // Specialist agent execution exceeded deadline
  | "INTERNAL_SERVER_ERROR";        // Unhandled server failure

interface ApiErrorEnvelope {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown> | null;
    requestId: string;
    timestamp: string;
  };
}
```

---

## 7. Frontend Integration Adapter Interface

The frontend consumes backend endpoints through the standardized `OrcaApiClient` interface:

```typescript
export interface OrcaApiClient {
  // System & Profile
  getHealth(): Promise<HealthResponse>;
  getMe(): Promise<MeResponse>;
  getConnectivity(): Promise<ConnectivityStateContract>;

  // Core Multi-Agent Reasoning Pipeline
  queryOrca(request: OrcaQueryRequest): Promise<OrcaQueryResponse>;

  // Geospatial Map Overlays
  getMapSnapshot(sectorId: string): Promise<MapSnapshotResponse>;

  // Decision Audit Trail
  getDecisionById(decisionId: string): Promise<DecisionDetailResponse>;
  getDecisionHistory(limit?: number): Promise<DecisionContract[]>;

  // Trip Planning & What-If Simulation
  planTrip(mission: MissionRequest): Promise<DecisionContract>;
  simulateWhatIf(baseDecisionId: string, changes: Partial<MissionRequest>): Promise<DecisionContract>;
}
```

### Transition Architecture (Mock to Live API):
1. **Current State:** A local `MockOrcaApiClient` implements `OrcaApiClient` using in-memory demo datasets and client-side decision engine.
2. **Phase 3+ State:** A remote `HttpOrcaApiClient` implements the identical `OrcaApiClient` interface using standard `fetch()` calls to the backend Fastify/Node endpoints.
3. **Outcome:** React components (`AppShell`, `CommandCenterPage`, `MarineMapCanvas`, `OrcaAssistant`) do not require a single line of code modification to switch to the live backend.

---

## 8. Multi-Dashboard Role Matrix

| Endpoint / Capability | Fisherman | Coastal Authority | Disaster Manager | Researcher | Maritime Operator |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `POST /orca/query` (Trip Decision) | **Primary** | View | View | View | **Primary** |
| `GET /map` (Marine Overlays) | Coastal View | Fleet Tactical | Disaster Hazard | Scientific Grid | Transit Corridor |
| `GET /alerts` (Emergency Notices) | Local Audio/Pill | Incident Feed | Evacuation Push | Historical Log | NavArea VIII |
| `POST /trips/what-if` | Duration/Timing | Search & Rescue | Surge Exposure | Model Tuning | Waypoint Routing |
| `GET /decisions/history` | Log Replay | Compliance Audit| Incident Replay | Data Provenance| Transit Replay |
| Geofence Clearance Verification | Yes | Boundary Admin | Buffer Zone | Reserve Analysis| Nav Channel |

---

## 9. Contract Verification Scenarios

Before any backend endpoint is approved in Phase 3+, it must pass these mandatory verification cases:

1. **Deterministic Invariance:** Repeated identical `POST /orca/query` payloads produce byte-identical verdicts and confidence scores.
2. **Safety Override Precedence:** An active cyclone alert (`RULE_01`) or hard geofence incursion (`RULE_02`) **strictly emits `AVOID`**, regardless of high PFZ opportunity scores.
3. **Data Completeness Gate:** If oceanographic or meteorological feeds are omitted, the decision engine **strictly emits `INSUFFICIENT_DATA` / `AVOID`**.
4. **Error Envelope Conformance:** All non-`2xx` HTTP status codes return the standard `ApiErrorEnvelope` with a unique `requestId`.
5. **Freshness Status Integrity:** Metadata containing `status: "DEMO_SNAPSHOT"` is never converted into `status: "LIVE"` without real agency authentication.
