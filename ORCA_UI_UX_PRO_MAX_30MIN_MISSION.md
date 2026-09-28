# ORCA --- 30-Minute UI/UX Pro Max Redesign Mission

## Objective

Redesign the existing ORCA Marine Decision Intelligence frontend in **30
minutes maximum**.

This is a **visual/product UX transformation**, NOT a rewrite.

Preserve: - existing React 19 + Vite + TypeScript stack - Tailwind 4 -
React Router - Leaflet / React Leaflet - existing Fastify/API services -
existing decision engine - existing orchestration/query services -
existing alert, mission, vessel, GIS, PFZ, connectivity and offline
services - existing route URLs wherever practical - existing logo
asset - existing data contracts/types

Do NOT rebuild the backend. Do NOT replace working business logic with
mock logic.

The goal is to make ORCA look and behave like a polished marine
decision-intelligence product rather than a collection of dashboard
cards.

------------------------------------------------------------------------

# 1. Product North Star

ORCA is:

> **A marine decision-intelligence layer that converts fragmented ocean,
> weather, fisheries, geospatial and mission data into explainable,
> context-aware operational decisions.**

Tagline:

> **From Marine Data to Mission-Ready Decisions.**

The UI must communicate:

**MISSION → CONTEXT → EVIDENCE → DECISION → WHY → ACTION**

Do NOT make the product look like: - generic SaaS admin dashboard -
generic AI chatbot - cyberpunk command center - neon sci-fi UI -
cryptocurrency dashboard - fake NASA control room - 3D globe demo

The visual language should be:

**premium marine technology + calm operational intelligence +
evidence-first decision support.**

------------------------------------------------------------------------

# 2. Time Constraint

Hard limit: **30 minutes for the redesign pass.**

Prioritize visible impact.

Do NOT spend the 30 minutes: - refactoring backend - rewriting
services - changing database schema - rebuilding decision logic - adding
complex new dependencies - implementing speculative features - creating
huge component abstractions - polishing obscure settings screens before
the main demo path

If something is already functional, reuse it.

If something is broken but can be fixed in under \~2 minutes while
editing the UI, fix it.

Otherwise preserve it and report it.

------------------------------------------------------------------------

# 3. UI/UX Pro Max

Use the installed **UI/UX Pro Max** skill as the design authority.

The project is explicitly asking for a professional redesign.

Use its design-system reasoning to choose: - visual style - typography
hierarchy - spacing - component density - interaction patterns -
responsive behavior - navigation structure - cards vs panels - modal vs
page decisions - progressive disclosure - transitions - accessibility -
visual hierarchy

Do not blindly apply a generic template.

The resulting system must feel specific to ORCA.

------------------------------------------------------------------------

# 4. Visual Direction

Use the existing ORCA Tidal Light foundation, but make it substantially
more refined.

Base: - white / near-white surfaces - deep marine navy - ocean blue -
subtle cyan - restrained seafoam - semantic GO / CAUTION / AVOID /
INSUFFICIENT_DATA colors

Typography: - Inter for product/UI - JetBrains Mono only for
telemetry/data values

Design: - generous spacing - strong hierarchy - thin borders -
restrained shadows - subtle depth - rounded but not excessively bubbly -
compact telemetry where useful - large decision surfaces - clear section
headers - excellent mobile layout

Avoid: - excessive gradients - neon - purple AI gradients - giant
rounded cards everywhere - excessive glassmorphism - excessive
animation - huge empty hero sections - decorative charts that don't
communicate information

------------------------------------------------------------------------

# 5. Navigation Architecture

Keep the existing multipage architecture.

Public:

/ /about /contact /login

Authenticated core:

/dashboard /ask /mission /map /alerts /decisions /history /profile
/settings

Role workspaces:

/authority /disaster /research /operator

Do NOT put every feature on one page.

Use a clear application shell:

### Top bar

Left: - ORCA logo - current coastal region

Center: - current page identity / breadcrumb

Right: - data health - connectivity/GNSS - alerts - role switcher -
profile

### Desktop navigation

Use a clean compact sidebar.

Primary: - Home - Ask ORCA - Mission - Marine Map - Alerts

Secondary: - Decisions - History - Settings

Role workspace access should be available through role switching rather
than cluttering primary navigation.

### Mobile

Use a bottom navigation with 4--5 primary destinations.

Recommended: - Home - Ask - Mission - Map - More

Put Alerts / Decisions / History / Profile inside More or contextual
entry points.

------------------------------------------------------------------------

# 6. Landing Page

Do NOT make the landing page a generic marketing website.

Hero should immediately communicate the product.

Suggested structure:

ORCA logo / product name

MARINE DECISION INTELLIGENCE

Headline:

> From Marine Data to Mission-Ready Decisions.

Short explanation:

> ORCA correlates ocean, weather, fisheries, geospatial and vessel
> context to produce explainable operational decisions.

Primary CTA: **Enter ORCA**

Secondary: **See how it works**

Visual: A restrained marine decision visualization: - route - vessel -
safety boundary - ocean conditions - decision marker

Do NOT create a fake 3D globe.

Include a concise 3-step explanation:

OBSERVE → CORRELATE → DECIDE

Then a compact product capabilities section: - Mission-aware reasoning -
Deterministic safety - Evidence traceability - What-If scenarios -
Offline/degraded operation

------------------------------------------------------------------------

# 7. Boot Animation

Preserve the ORCA logo.

Animation: 1. logo fades in 2. very subtle scale 3. thin ocean-blue line
expands 4. text appears:

MARINE DECISION INTELLIGENCE

Then transition into application.

Duration: \~1--1.5 seconds.

No: - spinning whale - particles - 3D effects - neon - loading spinner
dominating screen

------------------------------------------------------------------------

# 8. Login

Make login feel like entering an operational system.

Left: ORCA identity + short mission statement.

Right: clean login form.

After authentication / role selection:

Role selection should be explicit but compact.

Roles: - Fisherman - Coastal Authority - Disaster Management -
Research - Maritime Operator

Each role should show: - short purpose - icon - primary workspace

Then enter the appropriate workspace.

------------------------------------------------------------------------

# 9. Fisherman Dashboard --- MOST IMPORTANT SCREEN

This is the flagship screen.

Do NOT overwhelm it.

Hierarchy:

### 1. Current decision

Large decision surface:

GO CAUTION AVOID INSUFFICIENT DATA

Under it:

-   short answer
-   what to do
-   why
-   evidence support category

Example:

AVOID

> Conditions exceed the selected vessel's operating envelope.

Action: Delay departure or select a safer window.

Buttons: **Why this decision** **Plan a trip** **Ask ORCA**

### 2. Current conditions

Compact telemetry: - wave - wind - swell - SST - current - data
freshness

Each item should show source/state when relevant.

### 3. Fishing opportunity

PFZ must be visually subordinate to safety.

Label:

FISHING OPPORTUNITY

Never make PFZ look like a safety clearance.

### 4. Active alerts

Only important alerts.

### 5. Recent mission

One compact card.

The dashboard should answer in seconds:

**Can I go? Why? What should I do next?**

------------------------------------------------------------------------

# 10. Ask ORCA --- SECOND MOST IMPORTANT SCREEN

This should look like a decision workspace, NOT ChatGPT clone.

Layout:

Left/main: conversation.

Right/secondary desktop panel: current mission context / evidence /
decision.

Mobile: stack conversation → decision → evidence.

Input placeholder:

"Ask about a trip, route, conditions, safety, or fishing opportunity..."

Example chips:

-   Can I go fishing today?
-   What changes this afternoon?
-   Show me the safest window.
-   What if waves reach 2.5 m?

Response hierarchy:

DECISION SHORT ANSWER ACTION WHY EVIDENCE MAP

Keep the specialist reasoning trace progressive/collapsible.

Do not show internal agent chatter by default.

------------------------------------------------------------------------

# 11. Mission Planner

Make this a structured operational workflow.

Do not make it a giant form.

Use steps:

1.  Mission
2.  Vessel
3.  Timing
4.  Route
5.  Safety check
6.  Decision

Desktop: two-column layout.

Left: mission parameters.

Right: map + live decision preview.

Important: - vessel capability - departure - duration -
route/waypoints - safety clearance - PFZ opportunity

Primary action:

**Evaluate Mission**

After evaluation: show decision prominently.

If AVOID: show exact blocking factors.

If CAUTION: show constraints.

If GO: show evidence support.

Use modal only for technical GIS details or deep rule explanation.

------------------------------------------------------------------------

# 12. Marine Map

Map should be a real operational workspace.

Use: - full-height map - floating compact controls - layer drawer -
legend - context panel

Layer groups:

### Safety

-   restricted zones
-   hazard zones
-   safety buffers

### Ocean

-   waves
-   swell
-   currents
-   SST

### Opportunity

-   PFZ

### Mission

-   vessel
-   route
-   waypoints

Do not show every layer simultaneously.

Use progressive disclosure.

Clicking a feature should open a compact context panel rather than a
huge modal.

------------------------------------------------------------------------

# 13. Alerts

Alerts page:

Top: current operational alert summary.

Cards: - severity - location - time - source/state - affected
mission/vessel

Click alert: open progressive detail.

Level 1: human-readable alert.

Level 2: affected area.

Level 3: evidence.

Level 4: audit / technical details.

Actions: Acknowledge Resolve

Only show actions allowed for the current role.

------------------------------------------------------------------------

# 14. Decisions

Make this an evidence/audit page.

Do NOT make it look like another dashboard.

Each decision row: - decision state - mission - timestamp - vessel - key
reason - evidence support

Opening a decision: Decision → Why → Rules → Evidence → Map context

Use progressive disclosure.

------------------------------------------------------------------------

# 15. History

History should feel like a mission replay timeline.

Show: - mission - decision - time - vessel - outcome

Opening: timeline/replay view.

Do not dump every technical field immediately.

------------------------------------------------------------------------

# 16. Role Dashboards

Each role must feel different.

## Authority

Primary question:

> What is happening across my coastal operating area?

Prioritize: - map - vessels - restricted zones - active incidents -
alerts - decision audit

Use a surveillance/operations layout.

## Disaster Management

Primary question:

> Where is the hazard and who is exposed?

Prioritize: - hazard perimeter - affected vessels - coastline - alert
severity - response status - acknowledgement

## Research

Primary question:

> What does the evidence say?

Prioritize: - observations - source comparison - provenance - temporal
data - model/evidence inspection - replay

## Maritime Operator

Primary question:

> Which fleet missions can safely proceed?

Prioritize: - fleet - missions - vessel capabilities - weather windows -
route status - dispatch constraints

Do not make all role dashboards visually identical.

------------------------------------------------------------------------

# 17. Data Truthfulness

This is mandatory.

Never display a global "LIVE" badge unless the specific data is actually
live.

Use: - LIVE - RECORDED SNAPSHOT - CACHED - DEMO / SIMULATED - ACCESS
PENDING - UNAVAILABLE

Point-of-use status is preferred.

Known important sources: - INCOIS OSF - INCOIS PFZ - IMD - deterministic
PostGIS GIS - vessel registry/capability

PFZ = opportunity.

PFZ must NEVER override: - restricted zone - severe warning - vessel
capability - stale critical evidence - deterministic safety rules

------------------------------------------------------------------------

# 18. Decision Visual Language

Use only:

GO CAUTION AVOID INSUFFICIENT DATA

Do not use numeric safety percentages.

Do not imply AI probability.

The visual treatment must make the decision state immediately
recognizable without becoming a giant colored screen.

------------------------------------------------------------------------

# 19. Modals vs Pages

Use a PAGE when: - user is changing context - planning a mission -
inspecting map - reviewing history - asking ORCA

Use a MODAL when: - explaining "Why?" - showing technical evidence -
showing alert details - showing connectivity/data health - showing role
selection - showing small contextual information

Use DRAWERS for: - map layers - mobile contextual details - filters

Avoid nested modals.

------------------------------------------------------------------------

# 20. Interaction Design

Transitions: - 150--250ms - subtle - transform/opacity only where
appropriate

Interactions: - buttons clearly clickable - hover state desktop - focus
state keyboard - touch targets mobile - no animation that delays a
decision

Use skeleton/loading states where useful.

Use clear empty states.

Use clear error states.

Never hide a failed data source.

------------------------------------------------------------------------

# 21. Existing Backend/Logic MUST Remain

Do not remove or bypass:

-   `/api/v1/orca/query`
-   `/api/v1/scenarios/evaluate`
-   `/api/v1/decisions/evaluate`
-   `/api/v1/gis/evaluate-route`
-   alerts APIs
-   mission APIs
-   vessel capability APIs
-   connectivity APIs
-   adapter services
-   offline cache
-   decision engine
-   evidence/provenance

If backend calls fail during UI development: - keep the existing
fallback behavior - make the UI honest - do not invent fake live
responses

------------------------------------------------------------------------

# 22. Priority Features for the Demo

Implement/show these first:

P0: 1. Fisherman dashboard decision 2. Ask ORCA 3. Mission Planner 4.
Marine Map 5. Why / Evidence 6. What-If 7. Alerts 8. Vessel capability
9. GIS safety 10. PFZ opportunity 11. Connectivity/offline state 12.
Role switching 13. Authority dashboard 14. Disaster dashboard

P1: 15. History/replay 16. Research dashboard 17. Operator dashboard 18.
Data Health 19. Profile/settings

Do NOT spend the first 30 minutes polishing obscure P1 settings.

------------------------------------------------------------------------

# 23. Demo Journey

The UI should make this journey extremely smooth:

Landing → Enter ORCA → Login / role → Fisherman Dashboard → Current
decision → Ask ORCA → "Can I go fishing today?" → Decision → Why →
Evidence → Mission Planner → Select vessel → Change departure time →
Evaluate → What-If → Marine Map → Alert → Authority workspace → Disaster
workspace → return to fisherman

The user should never feel lost.

------------------------------------------------------------------------

# 24. Do Not Break Existing Logic

Before editing:

Inspect: - existing pages - AppShell - Sidebar - TopBar - navigation -
role context - orchestration context - services - API contracts -
decision components - map components

Reuse existing components where they already contain working logic.

Refactor only presentation/layout.

------------------------------------------------------------------------

# 25. 30-Minute Implementation Strategy

### Minutes 0--5

Audit current UI and identify: - AppShell - global styles - reusable
cards - navigation - dashboard - Ask - mission - map

### Minutes 5--10

Implement the new global design system: - typography - spacing -
surfaces - borders - buttons - badges - cards - page headers - sidebar -
topbar - mobile nav

### Minutes 10--18

Redesign: - Fisherman Dashboard - Ask ORCA - Mission Planner

These are the most important.

### Minutes 18--24

Redesign: - Map - Alerts - Decisions - History

### Minutes 24--27

Apply role-specific visual treatment: - Authority - Disaster -
Research - Operator

### Minutes 27--30

Run: - typecheck - lint - build - browser - 1440px - 375px

Fix only obvious blockers.

------------------------------------------------------------------------

# 26. Browser Verification

You MUST use the browser after implementation.

At minimum verify:

### Desktop

1440 × 900

### Mobile

375 × 812

Check: - landing - login - dashboard - ask - mission - map - alerts -
decisions - history - authority - disaster - research - operator

Click: - main navigation - dashboard CTA - Ask ORCA - Why - Mission -
Map layers - Alert details - role switcher - connectivity/data health -
mobile bottom navigation

Check: - no horizontal overflow - no clipped text - no broken icons - no
console errors - modals fit - map renders - buttons work - routes change
correctly

------------------------------------------------------------------------

# 27. Do Not Do These Things

DO NOT: - rewrite the backend - replace the decision engine - remove
APIs - invent live data - add fake statistics - add fake AI agent
activity - create fake confidence percentages - make every feature a
card - put everything on one dashboard - create a 3D globe - use
cyberpunk neon - use excessive glassmorphism - install a huge UI library
just for styling - introduce a new framework - break existing routes -
spend \>5 minutes on any one obscure component

------------------------------------------------------------------------

# 28. Definition of Done for This UI Pass

The redesign is successful if:

1.  ORCA visually feels like a distinct marine decision-intelligence
    product.
2.  The fisherman dashboard immediately communicates the decision.
3.  Ask ORCA feels like a decision workspace, not generic ChatGPT.
4.  Mission Planner feels operational and structured.
5.  Map feels like a marine intelligence workspace.
6.  Alerts are clear and role-aware.
7.  Authority/Disaster/Research/Operator feel meaningfully different.
8.  Navigation is understandable.
9.  Desktop looks premium.
10. Mobile looks intentionally designed.
11. Existing backend/API/service architecture remains intact.
12. Existing decision logic remains intact.
13. No fake live data is introduced.
14. The flagship demo journey works.

------------------------------------------------------------------------

# FINAL COMMAND

Build the redesign now.

Use UI/UX Pro Max reasoning.

**Optimize for maximum visible product quality per minute.**

Do not redesign from scratch.

Transform the existing ORCA into a polished, premium, mission-aware
marine decision intelligence interface while preserving its real
architecture and working logic.

After implementation, report: - files changed - routes redesigned -
components reused - APIs preserved - browser checks performed -
remaining UI bugs - build/typecheck/lint status

Do NOT commit or push.
