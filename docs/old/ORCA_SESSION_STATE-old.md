# ORCA --- Session State / Handoff

## Project

ORCA --- Marine EcOsystem Reasoning with Collaborative Agents

## SIH

SIH26176 \| ISRO \| Software

## Current Goal

Build the internal/department-level SIH prototype quickly, with a strong
visual interface and a convincing live demo.

## Current Phase

PHASE 5 --- COMPLETE (Deterministic Decision Engine + Safety Overrides & Multi-Region Support)

## Current Priority

1.  Phase 0 Foundation Setup (COMPLETED)
2.  Phase 1 Visual Design System (COMPLETED - Integrated from Stitch)
3.  Phase 2 Command Center & Real Multi-Page App (COMPLETED)
4.  Phase 3 Interactive Marine Map Reasoning (COMPLETED)
5.  Phase 4 Agent Orchestration & Pipeline Trace (COMPLETED)
6.  Phase 5 Deterministic Decision Engine & Safety Overrides (COMPLETED)
7.  Phase 6 Evidence & Explainability Panel (NEXT)
8.  Phase 7 What-If Scenario Simulator
9.  Phase 8 Voice & Multilingual Localization
10. Phase 9 PWA & Offline/Degraded Mode
11. Phase 10 Final Polish & Demo Hardening

## Primary Demo

1. User enters: \> "Can I go fishing tomorrow morning for five hours?"
2. Deterministic Multi-Agent Orchestration runs:
   - Planner Agent extracts intent (`FISHING`), departure (`05:45 IST`), duration (`5 hours`), and assigns tasks.
   - Oceanography, Meteorology, PFZ, and GeoSafety agents analyze active regional datasets (`Maharashtra` or `Tamil Nadu`).
3. Deterministic Decision Engine evaluates outputs against transparent rules:
   - Severe official warnings / cyclone alerts &rarr; `AVOID` (Override).
   - Hard geofence / restricted zone conflicts &rarr; `AVOID` (Override).
   - Physical craft wave tolerance vs swell &rarr; `AVOID`.
   - Temporal return window exposure &rarr; `CAUTION` / `AVOID`.
   - PFZ aggregation potential enhances utility but **never overrides safety constraints**.
4. Decision Card and Command Center dynamically display:
   - Verdict: `GO`, `CAUTION`, `AVOID`.
   - Deterministic Confidence Score (derived from data completeness and rule consensus, zero `Math.random()`).
   - Recommended Departure & Return Window.
   - Primary driver and concise factor breakdown.
5. Multi-Region Switching:
   - Operators can switch between **Maharashtra (Alibaug / Arabian Sea)** and **Tamil Nadu (Nagapattinam / Bay of Bengal)** using the TopBar selector.
   - The map smoothly re-centers, loads regional vessels and PFZs, and dynamically re-evaluates mission outcomes.

## Prototype Data Policy

Deterministic local demo datasets in `data/demo/` and `data/demo/regions/` with clear `demo_snapshot` and `cached` status labels.

## Current Stack Target

React 19 + TypeScript + Vite 8 + React Router v7 + Tailwind CSS v4 + Leaflet / React-Leaflet + Turf.js + vite-plugin-pwa + Lucide icons.

## Design Target

Scientific maritime intelligence center:
- Deep ocean navy foundation (`#071424` / `#0A192F`)
- Marine cyan accents (`#46EAED` / `#00CED1`)
- Translucent HUD glassmorphism panels
- JetBrains Mono telemetry typography
- High information density without clutter

## Decisions Made

- Created dedicated pure Decision Engine in `src/decision/` (`decisionTypes.ts`, `decisionRules.ts`, `decisionEngine.ts`).
- Guaranteed 100% determinism: identical inputs always yield identical verdicts and confidence scores.
- Implemented complete 2nd regional dataset for **Tamil Nadu (Nagapattinam / Bay of Bengal)** with genuine contrasting oceanography and geography.
- Built `RegionContext` and TopBar region switcher with smooth map transition.
- Connected Decision Card and Mission Planner to dynamically render live Decision Engine outputs.
- Phase 6 (Evidence & Explainability Panel) and Phase 7 (What-If Scenario Simulator) have **NOT** been started.

## Last Completed Work

PHASE 5 — DETERMINISTIC DECISION ENGINE + SAFETY OVERRIDES & MULTI-REGION SUPPORT
- Created `src/decision/decisionTypes.ts`, `src/decision/decisionRules.ts`, `src/decision/decisionEngine.ts`.
- Created Tamil Nadu datasets in `data/demo/regions/tamil_nadu/` (`pfz.json`, `weather.json`, `ocean.json`, `hazards.json`, `boundaries.geojson`, `vessels.json`).
- Created `src/context/RegionContext.tsx` and `src/hooks/useRegion.ts`.
- Created `src/decision/decisionEngine.test.ts` verifying all 11 test cases pass.
- Updated `src/components/layout/TopBar.tsx` with compact Region Selector.
- Updated `src/components/decision/DecisionCard.tsx` and `src/components/decision/MissionCard.tsx`.
- Updated `src/components/map/MarineMapCanvas.tsx` and `src/pages/MarineMapPage.tsx`.
- Updated `src/pages/MissionPlannerPage.tsx` with live parameter adjustment.
- Tested and verified: `npm run build` (Passed, 0 errors, 373ms) and `npx eslint src` (Passed, 0 errors, 0 warnings).

## Next Action

Awaiting user direction to proceed to **PHASE 6 — EVIDENCE & EXPLAINABILITY PANEL**.
