# ORCA — API + DATA CONTRACT
Version: v1

This file is the boundary between frontend, backend, agents, Supabase and external data.

## 1. Contract rule

Frontend does not know how external APIs work.

Backend does not know how React components render.

Agents consume normalized domain objects.

Decision engine consumes structured inputs.

Evidence accompanies claims.

## 2. Base envelope

```ts
type DataStatus =
  | "LIVE"
  | "INTEGRATED"
  | "DEMO_SNAPSHOT"
  | "CACHED"
  | "STALE"
  | "UNAVAILABLE";

interface DataMeta {
  status: DataStatus;
  source: string;
  dataset?: string;
  observedAt?: string;
  retrievedAt?: string;
  validUntil?: string;
  quality?: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  spatialRelevance?: number;
  temporalRelevance?: number;
  error?: string;
}
```

## 3. Evidence

```ts
interface Evidence {
  id: string;
  source: string;
  dataset?: string;
  variable: string;
  value: unknown;
  unit?: string;
  observedAt?: string;
  retrievedAt: string;
  validUntil?: string;
  latitude?: number;
  longitude?: number;
  geometry?: unknown;
  status: DataStatus;
  quality?: string;
  spatialRelevance?: number;
  temporalRelevance?: number;
  transformation?: string;
}
```

## 4. Mission

```ts
interface MissionRequest {
  activity: "fishing" | "survey" | "patrol";
  startLocation: {
    lat: number;
    lon: number;
  };
  departureTime: string;
  durationHours: number;
  destination?: {
    lat: number;
    lon: number;
  };
  vesselId?: string;
  constraints?: {
    maxDistanceKm?: number;
    returnBy?: string;
  };
}
```

## 5. Decision

```ts
type DecisionVerdict =
  | "GO"
  | "CAUTION"
  | "AVOID"
  | "INSUFFICIENT_DATA";

interface DecisionResponse {
  decisionId: string;
  verdict: DecisionVerdict;
  confidence: {
    level: "HIGH" | "MEDIUM" | "LOW";
    score?: number;
    reasons: string[];
  };
  primaryDriver: string;
  explanation: string;
  recommendedPlan?: {
    departureTime?: string;
    returnTime?: string;
    zone?: {
      id: string;
      name: string;
      lat?: number;
      lon?: number;
      distanceKm?: number;
    };
  };
  ruleEvaluations: RuleEvaluation[];
  evidence: Evidence[];
  dataQuality: {
    status: DataStatus;
    requiredSources: number;
    availableSources: number;
    staleSources: number;
    conflictingSources: number;
  };
  evaluatedAt: string;
}
```

## 6. Agent result

```ts
interface AgentResult<T> {
  agentId: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "DEGRADED";
  startedAt?: string;
  completedAt?: string;
  data: T;
  evidence: Evidence[];
  warnings: string[];
  error?: string;
}
```

## 7. Endpoints

### GET /health
Purpose: deployment/API health.

### GET /me
Purpose: authenticated profile + role.

### GET /home
Purpose: role-specific dashboard summary.

### POST /orca/query
Input:
- natural-language query OR structured mission

Output:
- parsed mission
- agent trace
- decision
- evidence
- explanation

### GET /map
Query:
- region
- time
- layers

Output:
- hazards
- boundaries
- PFZ
- observations
- vessels only when validated
- metadata

### GET /alerts
Filters:
- role
- region
- severity
- active

### GET /updates
Purpose:
- recent marine/environmental updates.

### POST /trips/plan
Purpose:
- create a mission/trip and evaluate it.

### GET /trips/{id}
Purpose:
- retrieve mission + latest decision.

### POST /trips/{id}/what-if
Input:
- changed time/location/duration/route/constraints

Must invoke the same decision pipeline.

### GET /decisions/{id}
Purpose:
- decision details.

### GET /decisions/{id}/evidence
Purpose:
- evidence/provenance.

### GET /decisions/history
Purpose:
- replay/audit.

### GET /vessel
Purpose:
- current user's permitted vessel profiles.

### GET /connectivity
Purpose:
- backend/source connectivity state.

## 8. Role dashboard endpoints

`/authority/overview`
- regional hazards
- operational incidents
- geofence conflicts
- vessels if validated

`/disaster/overview`
- active hazards
- affected areas
- alert timeline
- exposure context

`/research/overview`
- observations
- trends
- anomalies
- dataset provenance

`/maritime/overview`
- route/operational context

## 9. Error contract

```json
{
  "error": {
    "code": "SOURCE_UNAVAILABLE",
    "message": "Weather source unavailable",
    "requestId": "..."
  }
}
```

Never return fake successful data after a source failure.

## 10. Idempotency

Mission creation and what-if operations should have request IDs where repeated submission could duplicate records.

## 11. Pagination

History, alerts, observations and evidence endpoints should support pagination before data volumes grow.

## 12. Versioning

If breaking changes become necessary:
`/api/v1/...`

Do not silently change response shapes while frontend is integrating.

## 13. Frontend adapter

The frontend should have:

```ts
interface OrcaApi {
  getHome(): Promise<HomeResponse>;
  query(input: MissionRequest | string): Promise<DecisionResponse>;
  getMap(query: MapQuery): Promise<MapResponse>;
  getAlerts(query?: AlertQuery): Promise<AlertResponse>;
  planTrip(input: MissionRequest): Promise<DecisionResponse>;
  whatIf(tripId: string, input: WhatIfRequest): Promise<DecisionResponse>;
}
```

The existing mock service can implement this interface.

The real HTTP service can implement the same interface.

This allows:
mock → real API
without rewriting the UI.

## 14. Supabase access rule

Browser:
- public/publishable Supabase key only where necessary
- RLS enforced

Backend:
- privileged server credentials
- service-role key NEVER sent to browser

Core decisions should go through API/service layer so critical rules are not bypassed.

## 15. Database-to-API mapping

profiles → /me
vessels → /vessel
missions → /trips
decisions → /decisions
evidence → /decisions/{id}/evidence
alerts → /alerts
observations → /map and specialist services
restricted_zones → /map + Geo/Safety
decision_replays → /decisions/history

## 16. Contract testing

For every endpoint:
- valid request
- invalid request
- missing auth
- wrong role
- source unavailable
- empty result
- stale data
- malformed external source

The contract is not finished until these cases are defined.
