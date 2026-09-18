# ORCA — DATA, SUPABASE & REAL-INTEGRATION BRAIN

## 1. Purpose

This document defines how ORCA moves from demo fixtures to trustworthy data without pretending that unavailable feeds are live.

## 2. Data pipeline

SOURCE
→ adapter
→ raw validation
→ normalization
→ freshness
→ spatial/temporal relevance
→ conflict detection
→ evidence
→ agent result
→ deterministic decision engine

No UI component should directly parse a government API.

## 3. Source hierarchy

Preferred:
1. official machine-readable source
2. official API/service
3. validated scientific/open dataset
4. cached validated snapshot
5. clearly labelled demo fixture

Avoid:
- scraping a website when an official machine-readable interface exists
- undocumented endpoints
- random third-party weather APIs for a claim that requires authoritative marine information
- copied screenshots as data
- unverified AIS feeds

## 4. INCOIS

Use official INCOIS services where access and terms permit.

Candidate purposes:
- ocean conditions
- PFZ/advisory information
- marine observations/products

Required before claiming integration:
- endpoint/service identified
- authentication requirements known
- sample response retrieved
- variables understood
- units understood
- timestamps understood
- spatial coverage understood
- failure behavior tested

If not available:
use `DEMO_SNAPSHOT` or `CACHED`, never `LIVE`.

## 5. MOSDAC

Potential purposes:
- satellite/earth-observation-derived marine/environmental data
- contextual environmental layers

Same verification process:
endpoint → schema → sample → units → timestamp → spatial coverage → adapter → evidence.

Do not scrape visual map tiles as if they were structured observations.

## 6. Weather

The exact weather source must be selected and verified during the weather phase.

Required metadata:
- forecast/observation type
- issue time
- valid time
- coordinate/grid
- units
- provider
- retrieval time

A forecast valid tomorrow is not the same as an observation from today.

## 7. AIS

AIS should be treated as an optional integration.

Before using:
- source access
- licensing/terms
- coverage
- latency
- vessel identity semantics
- deployment reliability

If not validated, use demo vessels and label them `DEMO_SNAPSHOT`.

Never tell judges "real-time AIS coverage" unless the deployed system actually receives and processes it.

## 8. Demo datasets

Current repo already has:
- weather
- ocean
- PFZ
- hazards
- vessels
- boundaries
- Tamil Nadu region fixtures

These should become fixtures in the adapter system.

Use multiple regions to prove that ORCA is not hard-coded to Mumbai.

## 9. Supabase database

Recommended first migration:

profiles
- id
- role
- display_name
- created_at

vessels
- id
- owner_id
- name
- type
- capabilities JSONB
- created_at

missions
- id
- user_id
- activity
- start_lat
- start_lon
- departure_time
- duration_hours
- status
- created_at

decisions
- id
- mission_id
- verdict
- confidence_level
- confidence_score nullable
- primary_driver
- explanation
- evaluated_at

evidence
- id
- decision_id
- source
- dataset
- variable
- value_json
- unit
- observed_at
- retrieved_at
- valid_until
- latitude
- longitude
- geometry
- status
- quality
- spatial_relevance
- temporal_relevance

alerts
- id
- severity
- title
- description
- source
- valid_from
- valid_until
- geometry
- status

restricted_zones
- id
- name
- type
- geometry
- source
- valid_from
- valid_until

observations
- id
- source
- dataset
- variable
- value
- unit
- observed_at
- geometry
- quality
- metadata JSONB

decision_rule_evaluations
- id
- decision_id
- rule_id
- verdict_impact
- reason
- evidence_ref
- evaluated_at

decision_replays
- id
- source_decision_id
- input_snapshot JSONB
- output_snapshot JSONB
- created_at

## 10. PostGIS

Use spatial columns for:
- restricted zones
- hazard polygons
- observation points/grids where useful
- route geometry
- decision zones

Core queries:
- ST_Contains
- ST_Intersects
- ST_DWithin
- ST_Distance
- ST_Buffer

Exact SQL should be written only after schema migration is established.

## 11. RLS principles

Fisherman:
- own profile
- own vessels
- own missions
- own decisions
- own evidence through owned decisions

Authority:
- approved region scope

Disaster:
- approved disaster datasets/regions

Research:
- approved analytical datasets

Public/demo:
- only explicitly public data

Privileged ingestion:
- server/Edge Function/service role

## 12. Supabase Storage

Possible uses:
- generated reports
- evidence documents
- dataset snapshots
- demo artifacts

Do not store secrets.

If evidence is a public government URL, store the reference/metadata rather than blindly copying copyrighted content.

## 13. Edge Functions

Use only where useful:
- secure external API calls
- scheduled ingestion
- privileged transformations
- notification workflows

Do not create an Edge Function for every tiny function.

## 14. Realtime

Use selectively:
- active alerts
- authority incident updates
- status changes

Do not add Realtime just to say "we use Supabase Realtime".

## 15. Cache

Every cached item should include:
- fetched_at
- source
- valid_until if known
- status
- checksum/version where useful

A cached value is not a live value.

## 16. Unit normalization

Examples:
- wind speed → one canonical unit
- wave height → one canonical unit
- temperature → Celsius
- coordinates → WGS84 latitude/longitude

Every conversion must be documented and tested.

## 17. Spatial/temporal matching

An observation can be:
- close in space but too old
- fresh but too far away
- both relevant
- neither relevant

Do not simply pick the newest record.

## 18. Conflicting sources

When two sources disagree:
- preserve both
- record provenance
- assess quality
- identify conflict
- reduce confidence or return INSUFFICIENT_DATA depending on criticality

Never silently overwrite the disagreement.

## 19. Data acquisition checklist

Before writing an adapter:
- What is the official source?
- Is it public?
- Does it require a key?
- Is the key free?
- What are rate limits?
- Is the endpoint stable?
- What is the schema?
- What is the unit?
- What is the time semantics?
- What geographic coverage exists?
- What happens when unavailable?
- Can the deployed environment access it?

## 20. Secrets checklist

Local:
`.env`

Never commit:
- Supabase service role key
- LLM API key
- external data API key

Frontend env:
only variables intended for browser use.

Backend env:
privileged keys.

CI/CD:
repository/environment secrets.

## 21. Data truth labels

UI must visibly distinguish:
LIVE
INTEGRATED
CACHED
STALE
DEMO SNAPSHOT
UNAVAILABLE

A judge must never need to guess whether a number is real.

## 22. Real-world reliability rule

If the real source is unavailable during the demo:

Show:
"Source unavailable — using last validated snapshot from [time]"

This is more credible than silently switching to fake live values.
