# ORCA — ENGINEERING RULES

## Architecture
1. ORCA is a decision-intelligence platform.
2. Multiple dashboards consume one intelligence layer.
3. Never duplicate critical decision logic per role.
4. Frontend is presentation; backend owns decisions.
5. External sources are adapters.
6. Evidence is first-class data.

## Safety
7. GO / CAUTION / AVOID / INSUFFICIENT_DATA only.
8. Severe hazards override opportunity.
9. Geospatial safety is deterministic.
10. Vessel constraints are deterministic.
11. Freshness/conflict checks are deterministic.
12. LLM cannot override safety rules.

## Data
13. Never fabricate live data.
14. Never call a demo fixture LIVE.
15. Every important observation has provenance.
16. Preserve source conflicts.
17. Record timestamps.
18. Record units.
19. Record spatial and temporal relevance.
20. Use official machine-readable sources where possible.

## Security
21. Never commit secrets.
22. Never expose service-role keys to browser.
23. Use RLS.
24. Validate API input.
25. Do not log credentials.

## AI
26. Inspect before editing.
27. No invented APIs.
28. No invented environment variables beyond documented placeholders.
29. No large rewrite without explicit reason.
30. Small commits.
31. Run build/lint/tests.
32. Report what was verified.
33. Report what remains mocked.
34. Stop and ask for missing credentials/schema instead of hallucinating.

## Product
35. Do not add features solely for demo quantity.
36. One complete vertical slice beats many fake pages.
37. What-if reuses the real decision pipeline.
38. Offline mode must be honest.
39. Dashboard role changes context, not the underlying truth.
40. The decision is the product; agents are the mechanism.

## Demo
41. Every claimed feature must be demonstrable.
42. Every "live" claim must be reproducible.
43. Every important recommendation must have evidence.
44. Show failure/degraded behavior when useful.
45. Never claim safety guarantees.

## Git
46. Never work directly on main.
47. Preserve leader's branch.
48. Merge at integration checkpoints.
49. Tag known-good builds.
50. Keep docs in the repo.
