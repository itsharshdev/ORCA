# ORCA --- Session State / Handoff

## Project

ORCA --- Marine EcOsystem Reasoning with Collaborative Agents

## SIH

SIH26176 \| ISRO \| Software

## Current Goal

Build the internal/department-level SIH prototype quickly, with a strong
visual interface and a convincing live demo.

## Current Phase

PHASE 4 --- COMPLETE (Multi-Agent Orchestration + Pipeline Trace)

## Current Priority

1.  Phase 0 Foundation Setup (COMPLETED)
2.  Phase 1 Design System (COMPLETED - Integrated from Stitch)
3.  Phase 2 Command Center & Real Multi-Page App (COMPLETED)
4.  Phase 3 Interactive Marine Map Reasoning (COMPLETED)
5.  Phase 4 Agent Orchestration & Pipeline Trace (COMPLETED)
6.  Phase 5 Decision Engine & Safety Override Logic (NEXT)
7.  Phase 6 Evidence & Explainability Panel
8.  Phase 7 What-If Scenario Simulator
9.  Phase 8 Voice & Multilingual Localization
10. Phase 9 PWA & Offline/Degraded Mode
11. Phase 10 Final Polish & Demo Hardening

## Primary Demo

User asks: \> "Can I go fishing tomorrow morning for five hours?"

Current flow established in Phase 4:
- Query entered in the ORCA Mission Assistant or triggered via suggested chips.
- Real deterministic Multi-Agent Orchestrator executes:
  1. Planner Agent runs sequentially to extract intent (`FISHING`), departure (`05:45 IST`), duration (`5 hours`), and assign subtasks.
  2. Oceanography, Meteorology, PFZ/Fisheries, and Geo/Safety agents run concurrently over local demo datasets (`data/demo/`).
- Reasoning Pipeline Trace in the Command Center animates through real execution states (`queued` &rarr; `running` &rarr; `completed`).
- Operators can click on any agent in the pipeline trace to open the Agent Inspector Modal, reviewing normalized observations, structured evidence items, source provenance (`DEMO SNAPSHOT`), and orchestration handshakes.
- Produces a typed `OrchestrationPackage` (`analysisStatus: 'ready'`) ready for consumption by Phase 5.

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

- Implemented 5 specialized agent modules: Planner, Ocean, Weather, PFZ, and GeoSafety.
- Implemented deterministic async multi-agent orchestrator with step-by-step progress callbacks.
- Upgraded Reasoning Trace to reflect live execution states and support click-to-inspect modal.
- Connected Mission Assistant queries to trigger the orchestrator and quote real agent findings.
- Strictly preserved phase boundary: Phase 5's decision engine / GO-CAUTION-AVOID scoring was NOT implemented yet.

## Last Completed Work

PHASE 4 — AGENT ORCHESTRATION + TRACE
- Created `src/types/agents.ts` with agent models, analysis outputs, and orchestration package.
- Created `src/agents/plannerAgent.ts`, `src/agents/oceanAgent.ts`, `src/agents/weatherAgent.ts`, `src/agents/pfzAgent.ts`, and `src/agents/geoSafetyAgent.ts`.
- Created `src/orchestration/agentOrchestrator.ts` for sequential and parallel execution.
- Created `src/context/OrchestrationContext.tsx` and `src/hooks/useOrchestration.ts`.
- Created `src/components/agents/AgentInspectionModal.tsx` for granular observation/provenance auditing.
- Updated `src/components/agents/ReasoningChain.tsx` with live node statuses and click-to-inspect modal.
- Updated `src/components/agents/OrcaAssistant.tsx` to trigger orchestration on query input.
- Tested and verified: `npm run build` (Passed, 0 errors, 381ms) and `npx eslint src` (Passed, 0 errors).

## Next Action

Awaiting user direction to proceed to **PHASE 5 — DECISION ENGINE & SAFETY OVERRIDE LOGIC**.
