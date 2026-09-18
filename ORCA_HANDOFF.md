# ORCA — AI / ACCOUNT-SWITCH / TEAM HANDOFF PROTOCOL

## Purpose

This file keeps the project understandable when:
- Google/Antigravity account changes
- a new AI starts coding
- leader changes frontend
- backend work moves branches
- a phase is interrupted

## 1. Current project

Problem: SIH26176 ORCA Marine EcOsystem Reasoning with Collaborative Agents

Product:
ORCA — Marine Decision Intelligence

Primary codebase:
Vite + React + TypeScript frontend with existing agents/orchestration/decision engine.

## 2. Source-of-truth files

Keep these in the repo:

ORCA_ULTIMATE_TEAM_BRAIN_SIH2026.md
ORCA_TECHNICAL_BRAIN.md
ORCA_PHASE_PLAN.md
ORCA_API_CONTRACT.md
ORCA_DATA_SUPABASE_BRAIN.md
ORCA_SESSION_STATE.md
ORCA_HANDOFF.md
ORCA_RULES.md

If the project grows, add documentation only when it represents a stable decision.

## 3. SESSION STATE TEMPLATE

At the end of every completed phase, update:

### Current phase
PHASE X — NAME

### Status
NOT STARTED / IN PROGRESS / BLOCKED / COMPLETE

### Last known-good commit
<git hash>

### Branch
<branch>

### What changed
- ...

### Files changed
- ...

### What was tested
- ...

### What was NOT tested
- ...

### Live integrations
- ...

### Mock/demo integrations
- ...

### Required environment variables
- variable names only; never secret values

### Known bugs
- ...

### Known technical debt
- ...

### Next exact task
- ...

### Next AI instruction
- ...

## 4. AI STARTUP PROTOCOL

Before coding:

1. Read `ORCA_ULTIMATE_TEAM_BRAIN_SIH2026.md`.
2. Read `ORCA_TECHNICAL_BRAIN.md`.
3. Read `ORCA_PHASE_PLAN.md`.
4. Read `ORCA_API_CONTRACT.md`.
5. Read `ORCA_SESSION_STATE.md`.
6. Inspect actual source files.
7. Identify current phase.
8. State what will be changed.
9. Wait/execute only the requested phase.

Never infer implementation from documentation without checking source.

## 5. AI NO-HALLUCINATION RULES

The AI must say:
"I need the endpoint/schema/credential/source to verify this."

It must NOT:
- invent API URLs
- invent response fields
- invent credentials
- claim an API works without testing
- claim live data without retrieval
- claim an agent is implemented without code
- claim a feature is production-ready because a UI exists

## 6. AFTER CODING

AI must report:

### Changed
- file
- reason

### Verified
- command
- result

### Not verified
- ...

### New environment variables
- ...

### External dependencies
- ...

### Known risks
- ...

### Recommended next phase
- ...

## 7. COMMIT FORMAT

Examples:

`feat(api): add health and query skeleton`
`feat(data): add ocean adapter`
`feat(decision): enforce geofence override`
`feat(dashboard): add authority overview`
`fix(data): handle stale weather`
`test(decision): add severe hazard override`

Avoid:
`final`
`working`
`hackathon`
`ai changes`

## 8. LEADER INTEGRATION PROTOCOL

Leader branch:
`orca-fisherman-pwa`

Technical branch:
`build/orca-core`

Integration:
`integration/orca-platform`

Do NOT repeatedly merge every tiny UI change.

Integration checkpoints:

Checkpoint A:
API/domain contract stable.

Checkpoint B:
backend decision response stable.

Checkpoint C:
fisherman dashboard consumes real endpoint.

Checkpoint D:
role dashboards integrated.

Checkpoint E:
final freeze.

Before merge:
- fetch
- inspect diff
- backup/tag current branch
- merge
- resolve intentionally
- npm install
- npm run lint
- npm run build
- manual route check
- commit integration

## 9. IF CONFLICT HAPPENS

Do not blindly accept "ours" or "theirs".

Classify file:

UI:
leader usually owns presentation.

Backend:
technical branch owns.

Shared type/API:
team decision required.

Architecture docs:
preserve newest intentional decision.

Safety engine:
technical owner + explicit verification.

## 10. HANDOFF TO LEADER

After a meaningful backend phase, send:

PHASE:
X

WHAT IS NOW WORKING:
...

API:
POST /orca/query
GET /decisions/...

EXAMPLE REQUEST:
...

EXAMPLE RESPONSE:
...

FRONTEND ACTION:
Replace mock service call with API implementation.

DO NOT CHANGE:
...

ENV:
...

KNOWN LIMITATION:
...

TESTED:
...

COMMIT:
...

## 11. HANDOFF TO NEW AI ACCOUNT

Paste this short bootstrap:

"Read these repo files before coding:
ORCA_ULTIMATE_TEAM_BRAIN_SIH2026.md
ORCA_TECHNICAL_BRAIN.md
ORCA_PHASE_PLAN.md
ORCA_API_CONTRACT.md
ORCA_DATA_SUPABASE_BRAIN.md
ORCA_SESSION_STATE.md
ORCA_HANDOFF.md
Then inspect the source code. Continue only from the phase recorded in ORCA_SESSION_STATE.md. Do not invent APIs, credentials or live data. Explain every change and verify build/tests."

## 12. GOOGLE/ANTIGRAVITY ACCOUNT SWITCH

Account switching should require no code migration.

Before switching:
1. commit
2. push
3. update session state
4. update handoff
5. push docs
6. copy no secrets
7. open new account
8. clone repo
9. read bootstrap docs
10. continue current phase

## 13. BACKUP STRATEGY

Keep:
- Git remote
- Git tags
- known-good commit
- Supabase migrations in repository
- `.env.example`
- docs

Never put:
- actual `.env`
- secret keys
- service role credentials
in the repo.

## 14. .env.example

Use names such as:

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LLM_API_KEY=
WEATHER_API_KEY=
OTHER_SOURCE_API_KEY=

Whether a variable is actually required must be determined during its phase.

## 15. HANDOFF FREQUENCY

Do not manually create a separate handoff for every line of code.

Recommended:
- session state: every phase
- handoff: meaningful integration point
- architecture brain: only architecture change
- final release notes: once at freeze

The user can request:
"Generate the handoff for Phase X"
and the current state should be converted into a clean handoff.

## 16. USER LEARNING RULE

The AI must explain:
- what it changed
- why
- what concept it demonstrates
- what the user should understand
- how to verify it
- what could fail

The goal is not only to finish the hackathon.
The goal is for the user to understand the system well enough to defend it in a technical judge Q&A.
