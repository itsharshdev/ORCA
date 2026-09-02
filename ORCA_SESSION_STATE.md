# ORCA --- Session State / Handoff

## Project

ORCA --- Marine EcOsystem Reasoning with Collaborative Agents

## SIH

SIH26176 \| ISRO \| Software

## Current Goal

Build the internal/department-level SIH prototype quickly, with a strong
visual interface and a convincing live demo.

## Current Phase

PHASE 2 --- COMPLETE (Command Center & Real Multi-Page Application)

## Current Priority

1.  Phase 0 Foundation Setup (COMPLETED)
2.  Phase 1 Design System (COMPLETED - Integrated from Stitch)
3.  Phase 2 Command Center & Real Multi-Page App (COMPLETED)
4.  Phase 3 Interactive Marine Map Reasoning (NEXT)
5.  Phase 4 Agent Orchestration & Pipeline Trace
6.  Phase 5 Decision Engine & Safety Override Logic
7.  Phase 6 Evidence & Explainability Panel
8.  Phase 7 What-If Scenario Simulator
9.  Phase 8 Voice & Multilingual Localization
10. Phase 9 PWA & Offline/Degraded Mode
11. Phase 10 Final Polish & Demo Hardening

## Primary Demo

User asks: \> "Can I go fishing tomorrow morning for five hours?"

Current flow established in Phase 2:
- Command Center HUD (`/dashboard`) shows full interactive Leaflet map canvas with vessel and PFZ coordinates.
- Mission Card (`/dashboard/mission`) allows configuring departure time, duration, and vessel constraints.
- Decision Card (`/dashboard/decisions`) explains the CAUTION verdict with 78% confidence and cross-source evidence audit.
- Marine Map Explorer (`/dashboard/map`) allows dedicated layer toggling and entity inspection.
- Decision Replay History (`/dashboard/history`) provides audit trails of past decisions.
- Real client-side navigation allows seamless multi-page transitions.

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

- Implemented real client-side multi-page routing via `react-router-dom` across 6 distinct pages.
- Built reusable AppShell with responsive TopBar, desktop Sidebar, and mobile bottom navigation.
- Preserved Leaflet dark marine styling with custom glowing SVG markers for vessels, PFZs, geofences, and hazards.
- Connected deterministic demo datasets cleanly through `@/data` without backend/API dependencies.
- Zero fake live data claims; all provenance metadata is explicitly stamped.

## Last Completed Work

PHASE 2 — COMMAND CENTER & REAL MULTI-PAGE APPLICATION
- Installed `react-router-dom` and configured real client-side routing.
- Built `/login` with serious maritime authentication design & one-click demo access.
- Built `/dashboard` (Command Center) with HUD layout: full Leaflet marine map canvas, Mission Card, Decision Card, Agent Reasoning Trace, and Conversational Assistant.
- Built `/dashboard/mission` (Trip Planner) with activity, vessel, timing, and constraint controls.
- Built `/dashboard/map` (Geospatial Explorer) with full-screen map canvas and floating detail drawer.
- Built `/dashboard/decisions` (Evidence & Explainability) with cross-source audit table.
- Built `/dashboard/history` (Audit Log) with verdict filters and replay triggers.
- Built `/dashboard/settings` (Configuration) with vessel specs, offline storage, and language selection.
- Tested and verified: `npm run build` (Passed, 0 errors, 367ms) and `npx eslint src` (Passed, 0 errors).

## Next Action

Awaiting user direction to proceed to **PHASE 3 — INTERACTIVE MARINE MAP REASONING**.
