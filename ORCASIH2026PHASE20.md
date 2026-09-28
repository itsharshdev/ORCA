# ORCA SIH 2026 — PHASE 20
# FULL PRODUCT UX AUDIT + ROLE-SPECIFIC MARINE WORKSPACES
# + REAL DATA INTEGRATION VERIFICATION + SIH PRODUCT HARDENING

Phase 19 Alerts + Disaster Intelligence has passed.

Phase 20 is the major PRODUCT EXPERIENCE + MULTI-ROLE WORKSPACE phase.

IMPORTANT:

Do NOT treat this as a simple visual redesign.

The objective is to make ORCA feel and behave like one coherent, purpose-built marine decision-intelligence product for the SIH 2026 problem statement.

The product must become:

Simple for the user.
Deep for the system.
Honest at every layer.

Do NOT commit.
Do NOT push.

Do NOT blindly redesign every page.

Do NOT add UI just because it looks impressive.

ONLY change/add UI, pages, interactions, animations, components, or backend integration when the change materially improves:

- user experience
- SIH problem fit
- role-specific usability
- technical credibility
- marine decision workflow
- data visibility
- judge understanding
- accessibility
- mobile/PWA usability
- information hierarchy
- demo quality
- product coherence

If an existing page is already good, preserve it.

If a new page is clearly better, create it.

If something is unnecessary, remove it.

---

# ============================================================
# 1. PHASE 20 NORTH STAR
# ============================================================

ORCA is NOT:

- a generic dashboard
- a chatbot
- a weather website
- a GIS viewer
- a collection of AI agents
- a generic notification system

ORCA is:

> A marine decision-intelligence layer that converts fragmented ocean, weather, fisheries, geospatial and mission data into explainable, context-aware operational decisions.

Core product loop:

OBSERVE
→ UNDERSTAND
→ CORRELATE
→ REASON
→ DECIDE
→ EXPLAIN
→ ACT / ALERT
→ LEARN / REPLAY

The primary product loop should visually and functionally feel like:

MISSION / QUESTION
→ ORCA
→ DECISION
→ WHY
→ EVIDENCE
→ MAP
→ ACTION
→ WHAT-IF

Do not lose this architecture during visual redesign.

---

# ============================================================
# 2. FIRST TASK: FULL REAL PRODUCT AUDIT
# ============================================================

BEFORE implementing major UI changes:

Actually run the application.

Open the real website in Chrome.

Do not start by assuming the code is correct.

Audit the CURRENT product from the perspective of actual users.

Inspect all major routes/pages currently available.

At minimum inspect:

- landing/home
- login
- dashboard
- Ask ORCA
- mission/trip planner
- decision details
- marine map
- alerts
- history
- profile/settings
- fisherman workspace
- coastal authority workspace
- disaster management workspace
- research/analyst workspace if present
- maritime operator workspace if present
- What-If
- any existing role-selection screen

Also inspect unknown routes/navigation.

---

# ============================================================
# 3. ACTUALLY USE THE WEBSITE
# ============================================================

This is mandatory.

Do not just inspect source code.

Use real Chrome/CDP/browser interaction.

For every important page:

1. Open it.
2. Click important buttons.
3. Click navigation.
4. Open dropdowns.
5. Select options.
6. Type into inputs.
7. Submit forms.
8. Open modals.
9. Close modals.
10. Switch tabs.
11. Expand evidence.
12. Open tooltips intentionally.
13. Hover badges where tooltips are expected.
14. Inspect map controls.
15. Toggle map layers.
16. Change filters.
17. Test empty states.
18. Test loading states.
19. Test error states.
20. Test mobile layout.
21. Check keyboard/focus where practical.
22. Inspect Network requests.
23. Inspect console.
24. Verify actual backend responses.

Report the exact interactions performed.

DO NOT say "UI verified" merely because the page rendered.

---

# ============================================================
# 4. FULL DATA PIPELINE AUDIT
# ============================================================

This is one of the MOST IMPORTANT parts of Phase 20.

For every important data source, verify the complete path:

SOURCE
→ ADAPTER
→ BACKEND NORMALIZATION
→ ORCHESTRATION
→ EVIDENCE
→ DECISION/ALERT
→ API RESPONSE
→ FRONTEND STATE
→ UI DISPLAY

Do this for:

## INCOIS OSF

Verify:

- actual backend request
- adapter
- response
- normalization
- observation
- evidence
- decision usage
- frontend API response
- UI rendering

Check actual:

- wave height
- swell
- wave period
- currents
- timestamps
- source
- dataset
- units
- status

Do not just show an "INCOIS LIVE" badge.

Prove the data is actually flowing.

---

## INCOIS PFZ

Verify:

- actual WFS/API request
- feature count
- coordinates/geometries
- backend normalization
- PFZ opportunity interpretation
- frontend rendering
- map layer
- evidence
- decision relationship

Check that PFZ is:

OPPORTUNITY

NOT:

SAFETY CLEARANCE.

---

## IMD

Verify actual current state.

If credentials remain unavailable:

EVERY relevant place must consistently say:

ACCESS_PENDING / DEMO

Do not display generic LIVE weather labels that could imply IMD is live.

If credentials become legitimately available:

verify the complete real pipeline before changing UI status.

Do NOT fabricate credentials or data.

---

## GIS / PostGIS

Verify:

- restricted zones
- route evaluation
- point-in-polygon
- buffer
- route intersection
- backend result
- decision engine
- map visualization

Frontend must never become the safety authority.

---

## VESSEL CAPABILITY

Verify:

- vessel profile
- capability data
- provenance
- evaluation
- decision integration
- UI display

Prototype assumptions must be clearly distinguishable from sourced specifications.

---

## ALERTS

Verify:

evidence
→ rule
→ alert
→ API
→ frontend
→ acknowledgement
→ persistence

---

## WHAT-IF

Verify:

baseline
→ scenario
→ re-evaluation
→ evidence delta
→ rule delta
→ UI comparison

---

# ============================================================
# 5. DATA HONESTY / PROVENANCE AUDIT
# ============================================================

This is mandatory.

Search the code and UI for misleading claims.

Check every:

LIVE
DEMO
ACCESS_PENDING
DETERMINISTIC
PROTOTYPE_ASSUMPTION
HYPOTHETICAL

label.

Make sure the label corresponds to the actual backend state.

Never allow:

DEMO → visually presented as LIVE.

PROTOTYPE_ASSUMPTION → presented as official engineering specification.

HYPOTHETICAL → presented as observed weather.

PFZ opportunity → presented as safety clearance.

LLM explanation → presented as safety authority.

Also inspect claims such as:

- "verified"
- "official"
- "real-time"
- "live"
- "safe"
- "approved"
- "certified"

Every such claim needs legitimate provenance.

If provenance is missing, fix the wording rather than inventing evidence.

---

# ============================================================
# 6. FULL SIH PROBLEM-STATEMENT COVERAGE AUDIT
# ============================================================

Audit ORCA against the actual SIH PS requirements.

Do not invent requirements.

Use the project's master brain / technical brain / current phase state as the source of truth.

Identify:

1. Core problem requirements
2. Required users
3. Required data domains
4. Required decision capabilities
5. Required GIS/geospatial capabilities
6. Required marine/ocean capabilities
7. Required collaboration/agentic reasoning
8. Required explainability
9. Required operational usability
10. Required offline/degraded capability
11. Required disaster/safety capability
12. Required prototype/demo capabilities

Create a concise internal checklist.

For every requirement classify:

IMPLEMENTED
PARTIALLY IMPLEMENTED
MISSING
BLOCKED BY EXTERNAL ACCESS

Do NOT hide missing items.

Prioritize missing/high-value items.

---

# ============================================================
# 7. ROLE-SPECIFIC PRODUCT ARCHITECTURE
# ============================================================

This is critical.

Do NOT give every user the same dashboard with a different title.

ORCA must become one system with multiple purpose-built workspaces.

Shared intelligence/backend:

                    ORCA INTELLIGENCE LAYER
                            |
        --------------------------------------------
        |          |           |         |           |
    Fisherman   Authority   Disaster   Research   Operator

Each role gets a different experience based on actual tasks.

============================================================
8. FISHERMAN WORKSPACE
============================================================

Primary objective:

"Can I go? Where? When? What should I avoid? Why?"

Mobile-first.

The first screen should prioritize:

Ask ORCA
Current decision
Sea/weather conditions
Fishing opportunity
Safety alerts
Mission/trip
Marine map

Avoid overwhelming the fisherman with:

raw JSON
technical rule codes
orchestration graphs
unnecessary statistics
engineering terminology

Fisherman flow:

HOME
→ ASK ORCA
→ DECISION
→ WHY
→ MAP
→ ACTION
→ WHAT-IF

Provide clear:

GO
CAUTION
AVOID
INSUFFICIENT DATA

Never use these as safety probabilities.

============================================================
9. COASTAL AUTHORITY WORKSPACE
============================================================

This MUST be a genuinely different dashboard.

Primary objective:

"What vessels/missions/areas require attention?"

Create an authority-specific command workspace.

Prioritize:

active missions
vessels
restricted zones
geofence incursions
safety alerts
affected vessels
affected missions
map
acknowledgement
incident history
evidence/audit

Suggested information architecture:

AUTHORITY OVERVIEW
→ ACTIVE INCIDENTS
→ LIVE MARINE MAP
→ VESSEL/MISSION MONITORING
→ RESTRICTED ZONES
→ ALERTS
→ INCIDENT DETAIL
→ EVIDENCE / AUDIT
→ HISTORY

Authority users should see more technical information than fishermen.

But don't make it ugly or overloaded.

============================================================
10. DISASTER MANAGEMENT WORKSPACE
============================================================

Different from Coastal Authority.

Primary question:

"What hazard is developing, where is it affecting the coastline, and what assets/missions are exposed?"

Prioritize:

active hazards
affected coastline
spatial exposure
affected missions
affected vessels
alert severity
timeline
evidence
acknowledgement
resolution

Use a strong map-first workflow.

Do not make it a copy of AuthorityDashboard.

============================================================
11. RESEARCH / ANALYST WORKSPACE
============================================================

If supported by current architecture, provide:

observation explorer
source comparison
temporal data
spatial layers
evidence inspection
decision history
replay
scenario comparison
provenance
data quality

This role should emphasize understanding the data and reasoning process.

============================================================
12. MARITIME OPERATOR WORKSPACE
============================================================

If justified by current product architecture:

Focus on:

fleet
missions
vessel capability
route
operational constraints
alerts
risk
decision history

Do not create this just to increase the number of dashboards.

Only implement if it improves SIH/product fit.

============================================================
13. MARINE MAP — IMPORTANT
============================================================

The marine map should become a genuine ORCA capability.

Do not make it just a decorative map.

Support appropriate layers such as:

vessel positions
current mission route
scenario route
PFZ opportunity
restricted zones
safety buffers
hazards
alerts
ocean conditions
weather status
affected areas

Layer controls should be understandable.

Use role-specific defaults.

Example:

FISHERMAN:
PFZ
safe corridor
alerts
mission
restricted zones

AUTHORITY:
vessels
missions
restricted zones
incursions
alerts
hazards

DISASTER:
hazards
affected coastline
missions
vessels
alerts

RESEARCH:
observations
PFZ
ocean
weather status
historical layers

Do not display every layer at once.

============================================================
14. ASK ORCA UX
============================================================

Ask ORCA remains the central intelligence interaction.

Improve only if the actual UX needs it.

It should feel like:

QUESTION
↓
ORCA UNDERSTANDS
↓
DECISION
↓
WHY
↓
EVIDENCE
↓
MAP
↓
ACTION
↓
WHAT-IF

Improve:

input experience
examples
clarification
loading
response hierarchy
evidence
map
follow-up context
What-If

Do not create a generic ChatGPT clone.

The decision is the product.

============================================================
15. MISSION / TRIP PLANNER
============================================================

Make mission planning a first-class ORCA workflow.

Support where already implemented:

vessel selection
departure
duration
waypoints
operating area
mission type
constraints
route evaluation
safety decision
evidence
PFZ opportunity

The user should understand:

"ORCA evaluated THIS mission."

Not simply:

"ORCA showed me a map."

============================================================
16. DECISION DETAIL
============================================================

Decision details should progressively disclose:

LEVEL 1
Verdict + short answer

LEVEL 2
Why

LEVEL 3
Evidence

LEVEL 4
Rules

LEVEL 5
Technical trace

Do not force normal users to read technical internals.

Judges/researchers should still be able to inspect the deep reasoning.

============================================================
17. ALERTS
============================================================

Preserve Phase 19 alert architecture.

Improve UI only where it improves:

severity recognition
action
source
validity
acknowledgement
evidence
affected assets

Avoid notification spam.

============================================================
18. HISTORY / REPLAY
============================================================

Inspect current history implementation.

If useful, improve it so users can understand:

PAST MISSION
→ INPUTS
→ DATA
→ DECISION
→ WHY
→ ALERTS
→ OUTCOME / STATUS

This is important for:

research
authority
judging
trust
future replay

Do not overbuild full analytics if the architecture isn't ready.

============================================================
19. OFFLINE / DEGRADED UX
============================================================

Inspect current PWA/offline behavior.

Clearly distinguish:

CONNECTED
DEGRADED
OFFLINE
SAFETY MESSAGE RECEIVED

Do not imply that offline mode magically provides fresh external telemetry.

Offline mode should explain what data is cached and what is unavailable.

The user should understand:

GPS can work without Internet.

External live data may not.

============================================================
20. BOOT / LOADING EXPERIENCE
============================================================

Create a polished ORCA startup experience.

Keep it restrained.

Use existing ORCA logo unchanged.

Suggested:

Logo fade/scale
+
subtle ocean-blue line movement
+
"MARINE DECISION INTELLIGENCE"
+
short transition into application

Approximately 1–1.5 seconds.

Do NOT create:

spinning 3D whale
particles
neon cyberpunk
fake AI brain
excessive animations

The animation should feel like ORCA, not a gaming website.

============================================================
21. ANIMATION / TRANSITIONS
============================================================

Improve feel with subtle intentional transitions.

Use approximately:

150–250ms

for:

page transitions
card expansion
tabs
modal
evidence disclosure
map layer changes
status changes
loading transitions

Use slightly longer transitions only where meaningful.

Avoid:

constant floating cards
excessive parallax
bouncing UI
distracting motion
animation everywhere

Motion should communicate state.

============================================================
22. VISUAL LANGUAGE
============================================================

Current Tidal Light theme is acceptable.

Keep the marine identity.

Use:

white / near-white
deep navy
ocean blue
restrained cyan
restrained semantic colors

Keep:

GO
CAUTION
AVOID
INSUFFICIENT_DATA

visually distinct.

Do NOT switch to:

cyberpunk
neon
purple AI gradients
excessive glassmorphism
3D globe
particle backgrounds
generic enterprise SaaS appearance
generic ChatGPT clone appearance

The product should feel specifically designed for ORCA's marine use case.

============================================================
23. "NOT EVERYTHING ON ONE PAGE"
============================================================

This is mandatory.

Do not make giant dashboard screens containing:

map
chat
alerts
tables
analytics
history
settings
evidence
everything simultaneously.

Use task-oriented pages.

Good:

Home
Ask
Mission
Map
Alerts
Decisions
History
Profile

Role-specific workspace pages can compose these capabilities.

Each screen should have one primary task.

============================================================
24. RESPONSIVE DESIGN
============================================================

Test:

375 × 812
390 × 844
768px-ish tablet
desktop

Check:

no horizontal overflow
touch targets
modal fit
map interaction
bottom navigation
sidebar
cards
tables
evidence
alerts

Mobile should NOT simply be a squeezed desktop layout.

============================================================
25. PWA EXPERIENCE
============================================================

Verify:

installability
manifest
service worker
app shell
reload
offline shell
cached UI
appropriate degraded messaging

Do not claim live data is available offline.

============================================================
26. BACKEND + FRONTEND INTEGRATION AUDIT
============================================================

For every important UI element:

Ask:

"Where does this data actually come from?"

Trace:

UI
→ service
→ API
→ Fastify
→ orchestration
→ adapter/service
→ source
→ response
→ UI

If something is hardcoded unnecessarily:

replace it with actual backend data where the backend already supports it.

If the backend is missing:

implement the minimum required backend endpoint/service.

Do NOT fabricate data merely to populate cards.

Demo fixtures are acceptable only when clearly labelled DEMO.

============================================================
27. FRONTEND DATA DISPLAY AUDIT
============================================================

For every data card inspect:

Is value present?
Is unit present?
Is timestamp present?
Is source present?
Is status present?
Is it stale?
Is it demo?
Is it hypothetical?
Is it actually used by decision?
Is the UI presenting more precision than the source supports?

Fix the UI where necessary.

============================================================
28. JUDGE EXPERIENCE
============================================================

Think like a judge seeing ORCA for the first time.

Within a short interaction they should understand:

What problem ORCA solves.
Who uses it.
Where data comes from.
How multiple domains are correlated.
How ORCA reaches a decision.
Why the decision is explainable.
How GIS/safety constraints work.
How PFZ is an opportunity rather than safety.
How What-If works.
How alerts work.
How different users get different workspaces.
What happens when data is missing.
What happens offline/degraded.
Why ORCA is more than a dashboard/chatbot.

Do NOT put all of this into one giant screen.

The product navigation itself should communicate the architecture.

============================================================
29. DEMO FLOW
============================================================

After implementation create a realistic judge demo path.

Example:

LOGIN
→ FISHERMAN
→ ASK ORCA
→ mission question
→ deterministic decision
→ WHY
→ evidence
→ map
→ What-If
→ alert
→ acknowledge

Then show:

COASTAL AUTHORITY
→ different dashboard
→ active vessels
→ restricted zone
→ alert
→ evidence

Then:

DISASTER MANAGEMENT
→ hazard map
→ exposed assets
→ alert coordination

Do not fake transitions.

Every screen used in the demo must actually work.

============================================================
30. REAL BROWSER VERIFICATION — EXTREMELY IMPORTANT
============================================================

Use REAL Chrome/CDP.

Do not report verification merely because code compiled.

Actually perform representative end-to-end workflows.

Fisherman
Login/role selection if implemented.
Open fisherman dashboard.
Inspect current conditions.
Open Ask ORCA.
Type:
"Can I go fishing near Mumbai today for 5 hours?"
Submit.
Inspect verdict.
Open Why.
Open evidence.
Open map.
Toggle PFZ.
Toggle restricted zones.
Open What-If.
Test:
"What if I leave at 2 PM?"
Inspect baseline/scenario.
Open alerts.
Open alert detail.
Verify provenance.
Coastal Authority
Switch/login as authority.
Open authority dashboard.
Inspect active missions.
Inspect vessel information.
Inspect restricted zones.
Inspect alerts.
Open alert detail.
Acknowledge alert.
Inspect map.
Inspect evidence/audit.
Disaster Management
Switch role.
Open disaster workspace.
Inspect hazards.
Inspect map.
Inspect affected vessels/missions.
Open alert.
Inspect evidence.
Acknowledge/resolve where appropriate.
Research/Analyst

If implemented:

Open research workspace.
Inspect observations.
Inspect source/provenance.
Compare evidence.
Open decision history/replay if available.
Data verification

Actually inspect Network calls for:

/orca/query
/scenarios/evaluate
/alerts
/pfz
observations
GIS
vessel capability
mission endpoints
relevant role endpoints

Record HTTP statuses.

Inspect actual JSON responses where necessary.

============================================================
31. HOVER / CLICK / TYPE TESTING
============================================================

Do not just click buttons.

Actually test intended interactions.

Hover:

source badges
freshness badges
confidence labels
technical terms
map layer controls
status indicators

Only if those elements intentionally have tooltips.

Click:

navigation
tabs
modals
map layers
evidence
alert actions
What-If
role switching
filters
dropdowns

Type:

Ask ORCA queries
What-If scenarios
search/filter text
mission inputs

Verify loading/error/empty states.

============================================================
32. MOBILE REAL USER TEST
============================================================

At 375 × 812:

Pretend you are an actual fisherman using a phone.

Ask:

Can I understand what ORCA wants me to do?

Can I tap everything?

Can I read the decision?

Can I open the map?

Can I understand an alert?

Can I ask a question?

Can I understand whether data is live or unavailable?

Can I recover from an error?

Do not only test CSS dimensions.

Test the USER EXPERIENCE.

============================================================
33. ACCESSIBILITY
============================================================

Check:

readable contrast
focus states
keyboard navigation where practical
labels
buttons with clear names
no icon-only ambiguous controls
modal close behavior
touch targets
status not communicated only by color
============================================================
34. PERFORMANCE
============================================================

Do not sacrifice performance for visual effects.

Inspect:

bundle size
unnecessary renders
map rendering
repeated API calls
duplicate data fetches
loading states
excessive animations

Do not introduce heavy libraries unless necessary.

============================================================
35. REMOVE WEAK / REDUNDANT UI
============================================================

If you find:

duplicate cards
redundant status bars
contradictory data
unused buttons
dead routes
fake controls
decorative analytics
meaningless counters
duplicated maps
confusing labels

remove or fix them.

Do not preserve bad UI merely because it already exists.

============================================================
36. DO NOT OVERBUILD
============================================================

Prioritize high-impact features.

DO NOT add:

pointless 3D globe
AI brain animation
fake satellites
fake weather radar
fake vessel tracking
arbitrary statistics
giant analytics dashboards
unnecessary microservices
Kafka
Redis
notification brokers
complicated auth infrastructure
fake external integrations

unless the current architecture genuinely requires them.

============================================================
37. EXTERNAL BLOCKERS
============================================================

If something cannot be completed because of:

missing official credentials
unavailable official API
external registration
infrastructure limitation

DO NOT fake it.

Report:

BLOCKED
Reason
What was verified
What remains
What can still be demonstrated honestly

Use adapters/fallbacks where appropriate.

============================================================
38. IMPORTANT: REAL DATA VS DEMO DATA
============================================================

Current known state:

INCOIS OSF:
LIVE

INCOIS PFZ:
LIVE

GIS/PostGIS:
DETERMINISTIC

Vessel capability:
DETERMINISTIC / PROVENANCE-DEPENDENT

IMD:
ACCESS_PENDING / DEMO unless legitimate credentials are verified

Preserve these states.

If a new source is added:

do not label it LIVE until actual end-to-end retrieval is verified.

============================================================
39. SIH DIFFERENTIATION
============================================================

Do not attempt to differentiate ORCA through visual gimmicks.

Differentiation should come from:

mission-aware reasoning
multi-domain correlation
deterministic safety layer
evidence-first decisions
What-If scenario intelligence
spatial safety reasoning
vessel capability
role-specific operational workspaces
degraded/offline awareness
provenance
explainability
opportunity vs safety separation

Make these capabilities easy for judges to discover.

============================================================
40. TESTING
============================================================

After implementation run:

npm test

npm run server:typecheck

npx tsc -b

npm run lint

npm run build

Add/update tests for any backend/data behavior changed in this phase.

Do not rely only on existing tests.

============================================================
41. FULL REGRESSION
============================================================

Ensure Phase 3–19 functionality still works.

At minimum verify:

health
auth foundation
mission
PFZ
GIS
vessel capability
decisions
evidence
Ask ORCA
What-If
alerts
disaster workspace
PWA

Do not break previous phases while improving UI.

============================================================
42. SESSION STATE
============================================================

Update:

ORCA_SESSION_STATE.md

Include:

Phase 20 implementation
product UX audit
role architecture
pages/routes
data pipeline verification
source status
SIH requirement coverage
tests
browser verification
mobile verification
PWA
known limitations
external blockers
Undergraduate Developer Walkthrough

Do not create another giant learning document.

============================================================
43. GIT
============================================================

Do NOT commit.

Do NOT push.

Only report git status.

============================================================
44. PHASE 20 GATE
============================================================

Phase 20 PASS requires:

PRODUCT
full UI audited
navigation coherent
role experiences genuinely different
fisherman UX strong
coastal authority UX strong
disaster UX strong
research/operator only if justified
no giant everything-dashboard
marine map useful
Ask ORCA strong
Mission workflow coherent
Decision workflow coherent
Alerts coherent
What-If coherent
History/replay improved where appropriate
PWA UX coherent
DATA
INCOIS OSF backend verified
INCOIS OSF frontend verified
PFZ backend verified
PFZ frontend verified
GIS backend verified
GIS frontend verified
vessel capability verified
alerts verified
IMD status honest
provenance correct
UX
browser-tested
hover tested where applicable
click tested
typing tested
loading tested
error tested
empty states tested
mobile tested
desktop tested
accessibility checked
ENGINEERING
no broken previous phases
tests pass
typecheck pass
lint pass
build pass
PWA pass
Fastify verified
Supabase verified where relevant
HONESTY

No:

fake live data
fake credentials
fake statistics
fake safety guarantees
fake AI authority
unsupported official claims
DOCUMENTATION
ORCA_SESSION_STATE.md updated
Undergraduate Developer Walkthrough added
known blockers documented
Git untouched

If any critical item is incomplete:

DO NOT declare PASS.

Report the exact blocker.

Do not start Phase 21.

============================================================
FINAL REPORT FORMAT
============================================================

Return:

Phase 20 status
Full product audit findings
Pages/routes audited
Pages/routes created
Pages/routes modified
Fisherman UX
Coastal Authority UX
Disaster Management UX
Research UX if implemented
Maritime Operator UX if implemented
Marine map changes
Ask ORCA changes
Mission changes
Decision changes
Alert changes
What-If changes
History/replay changes
PWA changes
Animation/transition changes
Data pipeline audit
INCOIS OSF verification
INCOIS PFZ verification
IMD verification/status
GIS verification
Vessel capability verification
Supabase verification
Fastify/API verification
SIH requirement coverage
Tests X/X
Typecheck
Lint
Production build
Chrome/CDP interactions actually performed
Hover interactions actually performed
Click interactions actually performed
Typed queries actually tested
Mobile verification
Console/network results
PWA verification
Remaining blockers
Known limitations
Session state update
Git status
Exact Phase 20 gate

IMPORTANT:

Do not claim something was verified unless it was actually tested.

Do not claim a data source is live unless the backend response was actually verified.

Do not claim a UI interaction works unless Chrome actually performed it.

Do not optimize for "more features".

Optimize for:

REAL PRODUCT
+
REAL DATA
+
REAL DECISIONS
+
REAL USERS
+
REAL EXPLAINABILITY
+
REAL SIH PROBLEM FIT
+
EXCELLENT UX.