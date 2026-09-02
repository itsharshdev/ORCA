# ORCA --- AI Coding Rules

## 1. Read First

Before making changes, read: 1. `ORCA_BRAIN_V1.md` 2. `ORCA_RULES.md` 3.
`ORCA_SESSION_STATE.md` 4. `ORCA_TECHNICAL_APPROACH.md`

## 2. Project Goal

Optimize for: **polished visual quality + working demo + credible marine
reasoning + explainability.**

## 3. Build Discipline

-   Inspect existing code before editing.
-   Do not rewrite the entire app unless explicitly required.
-   Reuse existing components.
-   Keep components small and modular.
-   Prefer simple solutions that can be demonstrated.
-   Avoid unnecessary packages.
-   Do not introduce paid dependencies.
-   Do not expose API keys.

## 4. Data Honesty

-   Never call mock/static data "live".
-   Every demo observation should have source/status metadata.
-   Show `Demo snapshot`, `Cached`, or `Live` clearly.
-   Do not invent official thresholds.
-   Do not fabricate official warnings.
-   Do not invent marine data.

## 5. Safety

-   Critical hazards override fishing optimization.
-   Missing critical data should reduce confidence.
-   The LLM must not independently invent safety decisions.
-   Geofence calculations should be deterministic.
-   Recommendations are decision support, not guarantees.

## 6. UI

-   Mobile-first responsive behavior.
-   No broken buttons.
-   No empty screens.
-   No excessive animations.
-   No generic AI-dashboard look.
-   Use consistent typography, spacing and iconography.
-   Map must remain readable.
-   Status colors must have semantic meaning.

## 7. Agent Architecture

Use meaningful domain agents: - Planner - Ocean - Weather -
Fisheries/PFZ - Geo/Safety

Do not create agents just to inflate the agent count.

## 8. Demo Reliability

The primary demo must work without external APIs.

Use deterministic local demo data as fallback.

The primary scenario must be reproducible: 1. ask fishing-safety
question; 2. show agent activity; 3. show decision; 4. show map; 5. show
evidence; 6. change scenario; 7. show updated decision.

## 9. Performance

-   Lazy-load heavy map features if useful.
-   Avoid huge assets.
-   Avoid unnecessary dependencies.
-   Keep first load fast.
-   Test production build.

## 10. Completion

After a major change: - run build; - check console; - test main flow; -
test mobile layout; - update `ORCA_SESSION_STATE.md`.

## 11. Account Switching

Never depend on chat history. Persistent project context belongs in
Markdown files and repository code.

## 12. Priority

If time is limited:

P0 = working demo\
P1 = visual polish\
P2 = map + decision + evidence\
P3 = what-if\
P4 = voice/multilingual\
P5 = PWA/offline\
P6 = backend\
P7 = advanced real-data integration
