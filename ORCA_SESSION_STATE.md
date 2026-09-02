# ORCA --- Session State / Handoff

## Project

ORCA --- Marine EcOsystem Reasoning with Collaborative Agents

## SIH

SIH26176 \| ISRO \| Software

## Current Goal

Build the internal/department-level SIH prototype quickly, with a strong
visual interface and a convincing live demo.

## Current Phase

PHASE 3 --- COMPLETE (Interactive Marine Map Reasoning Surface)

## Current Priority

1.  Phase 0 Foundation Setup (COMPLETED)
2.  Phase 1 Design System (COMPLETED - Integrated from Stitch)
3.  Phase 2 Command Center & Real Multi-Page App (COMPLETED)
4.  Phase 3 Interactive Marine Map Reasoning (COMPLETED)
5.  Phase 4 Agent Orchestration & Pipeline Trace (NEXT)
6.  Phase 5 Decision Engine & Safety Override Logic
7.  Phase 6 Evidence & Explainability Panel
8.  Phase 7 What-If Scenario Simulator
9.  Phase 8 Voice & Multilingual Localization
10. Phase 9 PWA & Offline/Degraded Mode
11. Phase 10 Final Polish & Demo Hardening

## Primary Demo

User asks: \> "Can I go fishing tomorrow morning for five hours?"

Current flow established in Phase 3:
- Interactive Marine Map (`/dashboard/map`) acts as a full operational reasoning surface.
- 8 independent toggleable layers: User Location, Active Vessel, PFZ Fishing Zones, Weather Risk Overlays, Navigational Hazards, Geofences & Sanctuaries, Recommended Route Corridor, and Safe Navigation Corridors.
- Clicking any map feature (or quick selector chip) triggers the Context Inspector Panel, showing SST, Chlorophyll gradient, depth, target pelagic species, restricted buffer requirements, mandatory hazard advisories, and data provenance (`DEMO SNAPSHOT`).
- "Focus on Map" triggers smooth map flight (`flyTo`) centering on the selected entity coordinates.
- "Plan Trip" navigates seamlessly to the Mission Planner with preset zone parameters.

## Prototype Data Policy

Deterministic local demo datasets in `data/demo/` with clear `demo_snapshot` and `cached` status labels.

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

- Implemented 8 distinct, independently toggleable map layers with active state indicators and count badges.
- Created reusable `MapContextPanel`, `MapLayerControl`, and `MapLegend` modular components.
- Added smooth map flight animation using `useMap` controller hook when features are selected.
- Highlighted safe navigation bathymetry corridors (20m - 50m depth envelope) and squall warning risk areas.
- Maintained strict data honesty (`DEMO SNAPSHOT` stamps on all context panels).

## Last Completed Work

PHASE 3 — INTERACTIVE MARINE MAP
- Created `src/types/map.ts` with `MapLayerVisibility` and `SelectedMapEntity` interfaces.
- Created `src/components/map/MapLayerControl.tsx` with 8 layer toggles and batch all/none controls.
- Created `src/components/map/MapLegend.tsx` with professional cartographic symbols.
- Created `src/components/map/MapContextPanel.tsx` with detailed parameters, target fish species, hazard advisories, and provenance tags.
- Enhanced `src/components/map/MarineMapCanvas.tsx` with smooth flight controller, user port marker, vessel heading marker, PFZ zones, weather risk overlays, geofence polygons, and recommended route corridor.
- Updated `src/pages/MarineMapPage.tsx` into a master Marine Geospatial Explorer.
- Tested and verified: `npm run build` (Passed, 0 errors, 355ms) and `npx eslint src` (Passed, 0 errors).

## Next Action

Awaiting user direction to proceed to **PHASE 4 — AGENT ORCHESTRATION & PIPELINE TRACE**.
