import { describe, it, expect, beforeEach } from 'vitest';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { orcaQueryRoutes } from '../routes/orcaQuery.js';
import { OrchestrationService } from '../services/orchestrationService.js';
import { LlmService } from '../llm/llmService.js';
import { FallbackLlmProvider } from '../llm/fallbackLlmProvider.js';

describe('ORCA Phase 17: End-to-End Query Intelligence & Production Integration', () => {
  let orchestrator: OrchestrationService;
  let llmService: LlmService;

  beforeEach(() => {
    orchestrator = OrchestrationService.getInstance();
    llmService = LlmService.getInstance();
    llmService.setProvider(new FallbackLlmProvider());
  });

  // 1. FEASIBILITY Query Type
  it('1. Handles FEASIBILITY query ("Can I go fishing today near Mumbai?") with full pipeline', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing today near Mumbai for 5 hours in Matsya Sagar 1?',
      regionId: 'maharashtra',
      operatorRole: 'FISHERMAN',
    });

    expect(result.llmIntent?.questionType).toBe('FEASIBILITY');
    expect(result.decision).toBeDefined();
    expect(['GO', 'CAUTION', 'AVOID', 'INSUFFICIENT_DATA']).toContain(result.decision.verdict);
    expect(result.shortAnswer).toBeDefined();
    expect(result.actionableAdvice).toBeDefined();
    expect(result.actionableAdvice!.length).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThan(0);
  });

  // 2. SAFETY Query Type
  it('2. Handles SAFETY query ("Is this route safe?") and directly evaluates clearance', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'Is this route safe to navigate near Mumbai port?',
      regionId: 'maharashtra',
      operatorRole: 'FISHERMAN',
    });

    expect(result.llmIntent?.questionType).toBe('SAFETY');
    expect(result.shortAnswer).toMatch(/safe|prohibited|caution|clearance/i);
    expect(result.decision.verdict).toBeDefined();
    expect(result.evidence.some((e) => e.decisionRole || e.key)).toBe(true);
  });

  // 3. CONDITIONS Query Type
  it('3. Handles CONDITIONS query ("What are the sea conditions?") and summarizes wave/wind metrics', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'What are the current sea conditions and wind speed near Mumbai?',
      regionId: 'maharashtra',
      operatorRole: 'MARITIME_OPERATOR',
    });

    expect(result.llmIntent?.questionType).toBe('CONDITIONS');
    expect(result.shortAnswer).toMatch(/conditions|wave|wind|current/i);
    expect(result.sourceStatus?.oceanography).toBeDefined();
    expect(result.sourceStatus?.meteorology).toBeDefined();
  });

  // 4. OPPORTUNITY Query Type
  it('4. Handles OPPORTUNITY query ("Is there a fishing opportunity near Mumbai?") while enforcing safety precedence', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'Is there a PFZ fishing opportunity hotspot near Mumbai?',
      regionId: 'maharashtra',
      operatorRole: 'FISHERMAN',
    });

    expect(result.llmIntent?.questionType).toBe('OPPORTUNITY');
    expect(result.orchestrationResult.specialists.PFZ_FISHERIES).toBeDefined();
    expect(result.shortAnswer).toMatch(/opportunity|PFZ|zone/i);
    // If safety verdict is AVOID, opportunity cannot force GO
    if (result.decision.verdict === 'AVOID') {
      expect(result.shortAnswer).toMatch(/prohibited|blocker|override|avoid/i);
    }
  });

  // 5. EXPLANATION Query Type
  it('5. Handles EXPLANATION query ("Why should I avoid this route?") with multi-factor breakdown', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'Why should I avoid this route and what is the primary driver?',
      regionId: 'maharashtra',
      operatorRole: 'AUTHORITY',
    });

    expect(result.llmIntent?.questionType).toBe('EXPLANATION');
    expect(result.shortAnswer).toMatch(/primary driver|rule|decision/i);
    expect(result.primaryDriver).toBeDefined();
    expect(result.llmExplanation?.citedEvidenceIds.length).toBeGreaterThan(0);
  });

  // 6. ALERT Query Type
  it('6. Handles ALERT query ("Are there any warnings affecting my trip?") examining bulletins & geofences', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'Are there any cyclone warnings, squalls, or coastal alerts active?',
      regionId: 'maharashtra',
      operatorRole: 'FISHERMAN',
    });

    expect(result.llmIntent?.questionType).toBe('ALERT');
    expect(result.shortAnswer).toMatch(/warning|advisories|bulletin|alert/i);
  });

  // 7. GENERAL_INFORMATION Query Type
  it('7. Handles GENERAL_INFORMATION query ("What is ORCA and what is the marine status?") gracefully', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'Tell me about ORCA and current marine status overview',
      regionId: 'maharashtra',
    });

    expect(result.llmIntent?.questionType).toBe('GENERAL_INFORMATION');
    expect(result.shortAnswer).toMatch(/ORCA|status|verdict/i);
  });

  // 8. UNKNOWN / AMBIGUOUS Query with Clarification Prompts
  it('8. Handles UNKNOWN/AMBIGUOUS queries by generating structured clarification prompts', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'hello',
    });

    expect(result.llmIntent?.questionType).toBe('UNKNOWN');
    expect(result.clarifications).toBeDefined();
    expect(result.clarifications!.length).toBeGreaterThan(0);
    expect(result.clarifications![0].question).toBeDefined();
    expect(result.clarifications![0].suggestedOptions.length).toBeGreaterThan(0);
  });

  // 9. Strict Invariant: PFZ Opportunity CANNOT override GIS Safety AVOID
  it('9. Invariant: PFZ opportunity presence never overrides GIS safety restricted zone AVOID', async () => {
    const result = await orchestrator.orchestrateQuery({
      queryText: 'I want to fish at PFZ-MUM-01 even if it enters the Naval Anchorage exclusion zone',
      regionId: 'maharashtra',
    });

    expect(result.decision.verdict).toBe('AVOID');
    expect(result.primaryDriver).toMatch(/Restricted|Anchorage|Geofence|Buffer/i);
  });

  // 10. Multi-Turn Context Continuity Inheritance
  it('10. Multi-turn flow preserves location, vessel and duration across conversational turns', async () => {
    const turn1 = await orchestrator.orchestrateQuery({
      queryText: 'Can I go fishing tomorrow morning near Nagapattinam in Samudra Sevak for 8 hours?',
      regionId: 'tamil_nadu',
    });

    const convId = turn1.conversationId;
    expect(convId).toBeDefined();

    const turn2 = await orchestrator.orchestrateQuery({
      queryText: 'What about the afternoon?',
      conversationId: convId,
    });

    expect(turn2.inheritedContext?.wasContextInherited).toBe(true);
    expect(turn2.llmIntent?.location.regionId).toBe('tamil_nadu');
    expect(turn2.llmIntent?.durationHours).toBe(8);
  });

  // 11. End-to-End Fastify Route POST /api/v1/orca/query Production Response Contract
  it('11. Fastify POST /api/v1/orca/query returns complete consolidated Phase 17 contract', async () => {
    const app = Fastify();
    await app.register(cors, { origin: true });
    await app.register(orcaQueryRoutes, { prefix: '/api/v1' });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/orca/query',
      payload: {
        queryText: 'Can I go fishing today near Mumbai for 5 hours in Matsya Sagar 1?',
        regionId: 'maharashtra',
        operatorRole: 'FISHERMAN',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    expect(body.queryId).toBeDefined();
    expect(body.conversationId).toBeDefined();
    expect(body.turnId).toBeDefined();
    expect(body.shortAnswer).toBeDefined();
    expect(body.primaryDriver).toBeDefined();
    expect(body.actionableAdvice).toBeDefined();
    expect(body.intelligenceMode).toBeDefined();
    expect(body.sourceStatus).toBeDefined();
    expect(body.decision).toBeDefined();
    expect(body.decision.verdict).toBeDefined();
    expect(body.evidence).toBeDefined();
    expect(body.orchestrationResult).toBeDefined();
  }, 15000);
});
