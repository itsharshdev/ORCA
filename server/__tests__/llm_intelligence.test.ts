import { describe, it, expect, beforeEach } from 'vitest';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { orcaQueryRoutes } from '../routes/orcaQuery.js';
import { LlmService } from '../llm/llmService.js';
import { FallbackLlmProvider } from '../llm/fallbackLlmProvider.js';
import { GeminiLlmProvider } from '../llm/geminiLlmProvider.js';
import { OpenAiLlmProvider } from '../llm/openAiLlmProvider.js';
import { structuredIntentZodSchema } from '../llm/llmTypes.js';

describe('ORCA Phase 16: LLM Intelligence & Natural Language Reasoning Layer', () => {
  let llmService: LlmService;

  beforeEach(() => {
    llmService = LlmService.getInstance();
    llmService.setProvider(new FallbackLlmProvider());
  });

  // 1. Structured Intent Extraction & Zod Validation
  it('01. Extracts structured intent from natural language and passes strict Zod validation', async () => {
    const rawQuery = 'Can I go fishing tomorrow morning at 06:00 for 5 hours from Mumbai in motorized craft?';
    const result = await llmService.parseIntent(rawQuery, undefined, 'FISHERMAN', 'maharashtra');

    expect(result.intent).toBeDefined();
    expect(result.intent.activity).toBe('FISHING');
    expect(result.intent.questionType).toBe('FEASIBILITY');
    expect(result.intent.durationHours).toBe(5);
    expect(result.intent.location.regionId).toBe('maharashtra');

    const validated = structuredIntentZodSchema.safeParse(result.intent);
    expect(validated.success).toBe(true);
  });

  // 2. Question Classification
  it('02. Accurately classifies distinct maritime question types (Safety, Opportunity, Explanation, What-If)', async () => {
    const q1 = await llmService.parseIntent('What are the main risks and wave alerts today?');
    expect(q1.intent.questionType).toBe('SAFETY');

    const q2 = await llmService.parseIntent('Where are the high density PFZ fish shoals near my route?');
    expect(q2.intent.questionType).toBe('OPPORTUNITY');

    const q3 = await llmService.parseIntent('Why is this voyage marked as CAUTION?');
    expect(q3.intent.questionType).toBe('EXPLANATION');

    const q4 = await llmService.parseIntent('What if I depart at 09:00 IST for 8 hours instead?');
    expect(q4.intent.questionType).toBe('WHAT_IF');
  });

  // 3. Conversational Context & Multi-turn Memory
  it('03. Maintains conversational context across multi-turn follow-up queries', async () => {
    const turn1 = await llmService.parseIntent(
      'Can I go fishing tomorrow morning from Mumbai for 5 hours in Vessel-001?'
    );
    const convId = turn1.conversationContext.conversationId;
    expect(convId).toBeDefined();

    // Turn 2 follow-up omitting location and duration
    const turn2 = await llmService.parseIntent('What about the afternoon?', convId);

    expect(turn2.conversationContext.conversationId).toBe(convId);
    expect(turn2.inheritedContext?.wasContextInherited).toBe(true);
    expect(turn2.intent.location.regionId).toBe('maharashtra');
    expect(turn2.intent.durationHours).toBe(5);
    expect(turn2.intent.departureWindow.timeString).toBe('13:00 IST');
  });

  // 4. Clarification Question Generation
  it('04. Generates structured clarification prompts when crucial voyage parameters are missing', async () => {
    const ambiguous = await llmService.parseIntent('Can I go out?');
    expect(ambiguous.intent.requiresClarification).toBe(true);
    expect(ambiguous.intent.clarificationPrompts).toBeDefined();
    expect(ambiguous.intent.clarificationPrompts!.length).toBeGreaterThan(0);
    expect(ambiguous.intent.clarificationPrompts![0].suggestedOptions.length).toBeGreaterThan(0);
  });

  // 5. Fallback Provider When No LLM API Key is Configured
  it('05. Fallback provider operates smoothly without external network credentials', () => {
    const fallback = new FallbackLlmProvider();
    expect(fallback.isAvailable()).toBe(true);
    expect(fallback.providerType).toBe('DETERMINISTIC_FALLBACK');
  });

  // 6. Gemini & OpenAI Provider Graceful Degradation on Missing Credentials
  it('06. Cloud LLM providers truthfully report availability and fallback gracefully', () => {
    const gemini = new GeminiLlmProvider(undefined);
    expect(gemini.providerType).toBe('GEMINI');
    expect(gemini.isAvailable()).toBe(false);

    const openAi = new OpenAiLlmProvider(undefined);
    expect(openAi.providerType).toBe('OPENAI');
    expect(openAi.isAvailable()).toBe(false);
  });

  // 7. Grounded Explanation Generation from Deterministic Decision
  it('07. Synthesizes human-readable explanation strictly grounded in deterministic evidence', async () => {
    const mockDecision: any = {
      decisionId: 'DEC-TEST-01',
      verdict: 'AVOID',
      primaryDriver: 'CRITICAL: Planned trajectory breaches Naval & Port Anchorage Security Geofence.',
      explanation: 'Trajectory enters restricted waters.',
      confidence: { level: 'HIGH', score: 95.0, reasons: [] },
      recommendedDeparture: '05:45 IST',
      recommendedReturn: '11:30 IST',
    };

    const mockEvidence: any[] = [
      {
        evidenceId: 'EVID-GIS-01',
        category: 'GIS',
        source: 'POSTGIS_HYDROGRAPHIC_REGISTRY',
        dataset: 'MARITIME_RESTRICTED_ZONES',
        variable: 'geofenceClearanceDistance',
        value: 0.0,
        unit: 'km',
      },
    ];

    const mockIntent: any = {
      intentId: 'INT-01',
      rawQuery: 'Can I fish near naval dock?',
      activity: 'FISHING',
      questionType: 'FEASIBILITY',
      location: { regionId: 'maharashtra' },
      departureWindow: { timeString: '06:00 IST', isEstimated: true },
      durationHours: 5,
      vessel: { vesselId: 'VESSEL-001', isExplicit: false },
      constraints: [],
      requiresClarification: false,
      confidenceScore: 90,
      extractedEntities: {},
    };

    const explanation = await llmService.generateExplanation(mockDecision, mockEvidence, mockIntent);

    expect(explanation.summary).toContain('prohibited');
    expect(explanation.citedEvidenceIds).toContain('EVID-GIS-01');
    expect(explanation.actionableAdvisories.length).toBeGreaterThan(0);
    expect(explanation.isFallback).toBe(true);
  });

  // 8. Strict Precedence: LLM Cannot Override Deterministic Verdict
  it('08. Strict safety invariant: LLM explanation never alters immutable deterministic verdict', async () => {
    const mockAvoidDecision: any = {
      decisionId: 'DEC-TEST-02',
      verdict: 'AVOID',
      primaryDriver: 'Severe storm warning active.',
      confidence: { level: 'HIGH', score: 95.0, reasons: [] },
    };

    const explanation = await llmService.generateExplanation(
      mockAvoidDecision,
      [],
      {
        intentId: 'INT-02',
        rawQuery: 'Go anyway?',
        activity: 'FISHING',
        questionType: 'FEASIBILITY',
        location: { regionId: 'maharashtra' },
        departureWindow: { timeString: '06:00 IST', isEstimated: true },
        durationHours: 5,
        vessel: { vesselId: 'VESSEL-001', isExplicit: false },
        constraints: [],
        requiresClarification: false,
        confidenceScore: 90,
        extractedEntities: {},
      }
    );

    expect(mockAvoidDecision.verdict).toBe('AVOID');
    expect(explanation.summary.toLowerCase()).toContain('prohibited');
  });

  // 9. Role-Aware Tailoring
  it('09. Adapts explanation terminology based on operator role (Fisherman vs Authority)', async () => {
    const mockDecision: any = {
      decisionId: 'DEC-TEST-03',
      verdict: 'AVOID',
      primaryDriver: 'Route intersects Naval Anchorage Geofence.',
      confidence: { level: 'HIGH', score: 95.0, reasons: [] },
    };

    const mockIntent: any = {
      intentId: 'INT-03',
      rawQuery: 'Check route',
      activity: 'FISHING',
      questionType: 'FEASIBILITY',
      location: { regionId: 'maharashtra' },
      departureWindow: { timeString: '06:00 IST', isEstimated: true },
      durationHours: 5,
      vessel: { vesselId: 'VESSEL-001', isExplicit: false },
      constraints: [],
      requiresClarification: false,
      confidenceScore: 90,
      extractedEntities: {},
    };

    const fishExp = await llmService.generateExplanation(mockDecision, [], mockIntent, undefined, 'FISHERMAN');
    const authExp = await llmService.generateExplanation(mockDecision, [], mockIntent, undefined, 'AUTHORITY');

    expect(fishExp.summary).toContain('Voyage prohibited');
    expect(authExp.summary).toContain('Mission Clearance DENIED');
  });

  // 10. Controlled Server Tools Execution Boundary
  it('10. Executes controlled server tools without exposing raw database credentials', async () => {
    const ocean = await llmService.getOceanConditions(18.92, 72.84, 'maharashtra');
    expect(ocean).toBeDefined();

    const weather = await llmService.getWeatherConditions(18.92, 72.84, 'maharashtra');
    expect(weather).toBeDefined();

    const pfz = await llmService.getPFZOpportunity(18.92, 72.84, 'maharashtra');
    expect(pfz).toBeDefined();

    const gis = await llmService.evaluateGISSafety(18.92, 72.84, 'maharashtra');
    expect(gis).toBeDefined();
    expect(typeof gis.safetyClearance).toBe('boolean');
  });

  // 11. End-to-End HTTP Route Verification for POST /api/v1/orca/query
  it('11. Fastify /api/v1/orca/query returns Phase 16 response with LLM intent, explanation & context', async () => {
    const app = Fastify();
    await app.register(cors, { origin: true });
    await app.register(orcaQueryRoutes, { prefix: '/api/v1' });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/orca/query',
      payload: {
        queryText: 'Can I go fishing today near Mumbai for 5 hours in Vessel-001?',
        regionId: 'maharashtra',
        operatorRole: 'FISHERMAN',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);

    expect(body.queryId).toBeDefined();
    expect(body.conversationId).toBeDefined();
    expect(body.turnId).toBeDefined();
    expect(body.llmIntent).toBeDefined();
    expect(body.llmIntent.activity).toBe('FISHING');
    expect(body.llmExplanation).toBeDefined();
    expect(body.llmExplanation.summary).toBeDefined();
    expect(body.llmExplanation.citedEvidenceIds.length).toBeGreaterThan(0);
    expect(body.decision).toBeDefined();
    expect(body.decision.verdict).toBeDefined();
    expect(body.evidence.length).toBeGreaterThan(0);
  }, 15000);
});
