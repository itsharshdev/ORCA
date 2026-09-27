import type {
  LlmStructuredIntent,
  LlmExplanationResult,
  ServerConversationContext,
  ConversationTurnRecord,
  DecisionEvaluationResponse,
  AuditedEvidenceItem,
  DecisionVerdict,
} from '../../src/types/contract.js';
import type { LLMProvider } from './llmProvider.js';
import { FallbackLlmProvider } from './fallbackLlmProvider.js';
import { GeminiLlmProvider } from './geminiLlmProvider.js';
import { OpenAiLlmProvider } from './openAiLlmProvider.js';
import { GisSafetyService } from '../services/gisSafetyService.js';
import { VesselCapabilityService } from '../services/vesselCapabilityService.js';
import { DecisionEngineService } from '../services/decisionEngineService.js';
import { IncoisOsfAdapter } from '../adapters/incoisOsfAdapter.js';
import { ImdWeatherAdapter } from '../adapters/imdWeatherAdapter.js';
import { IncoisPfzAdapter } from '../adapters/incoisPfzAdapter.js';

export class LlmService {
  private static instance: LlmService;
  private provider: LLMProvider;
  private readonly conversationCache: Map<string, ServerConversationContext> = new Map();
  private readonly osfAdapter = new IncoisOsfAdapter();
  private readonly imdAdapter = new ImdWeatherAdapter();
  private readonly pfzAdapter = new IncoisPfzAdapter();
  private readonly gisSafetyService = GisSafetyService.getInstance();
  private readonly vesselCapabilityService = VesselCapabilityService.getInstance();
  private readonly decisionEngineService = DecisionEngineService.getInstance();
  private readonly CONVERSATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    this.provider = this.initializeProvider();
  }

  public static getInstance(): LlmService {
    if (!LlmService.instance) {
      LlmService.instance = new LlmService();
    }
    return LlmService.instance;
  }

  private initializeProvider(): LLMProvider {
    const configuredProvider = (process.env.LLM_PROVIDER || '').toUpperCase();

    if (configuredProvider === 'GEMINI' || process.env.GEMINI_API_KEY) {
      const gemini = new GeminiLlmProvider(process.env.GEMINI_API_KEY, process.env.LLM_MODEL || 'gemini-1.5-flash');
      if (gemini.isAvailable()) return gemini;
    }

    if (configuredProvider === 'OPENAI' || process.env.OPENAI_API_KEY) {
      const openAi = new OpenAiLlmProvider(process.env.OPENAI_API_KEY, process.env.LLM_MODEL || 'gpt-4o-mini');
      if (openAi.isAvailable()) return openAi;
    }

    return new FallbackLlmProvider();
  }

  public setProvider(provider: LLMProvider): void {
    this.provider = provider;
  }

  public getActiveProvider(): LLMProvider {
    return this.provider;
  }

  // ==========================================================================
  // CONVERSATION CONTEXT MANAGEMENT
  // ==========================================================================

  public getOrCreateConversation(
    conversationId?: string,
    role: 'FISHERMAN' | 'AUTHORITY' | 'DISASTER' | 'RESEARCHER' | 'OPERATOR' = 'FISHERMAN'
  ): ServerConversationContext {
    const id = conversationId || `CONV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const existing = this.conversationCache.get(id);

    if (existing) {
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const newContext: ServerConversationContext = {
      conversationId: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role,
      turns: [],
    };

    this.conversationCache.set(id, newContext);
    return newContext;
  }

  public getConversation(conversationId: string): ServerConversationContext | undefined {
    return this.conversationCache.get(conversationId);
  }

  // ==========================================================================
  // INTENT UNDERSTANDING & CONVERSATIONAL CONTINUITY
  // ==========================================================================

  public async parseIntent(
    rawQuery: string,
    conversationId?: string,
    role: 'FISHERMAN' | 'AUTHORITY' | 'DISASTER' | 'RESEARCHER' | 'OPERATOR' = 'FISHERMAN',
    defaultRegionId = 'maharashtra'
  ): Promise<{
    intent: LlmStructuredIntent;
    conversationContext: ServerConversationContext;
    inheritedContext?: {
      wasContextInherited: boolean;
      inheritedFields: string[];
      previousVerdict?: DecisionVerdict;
    };
  }> {
    const context = this.getOrCreateConversation(conversationId, role);
    const hasPriorTurns = context.turns.length > 0;
    const lastTurn = hasPriorTurns ? context.turns[context.turns.length - 1] : undefined;

    const structuredIntent = await this.provider.extractStructuredIntent({
      rawQuery,
      conversationContext: context,
      operatorRole: role,
      defaultRegionId,
    });

    let inheritedContext:
      | {
          wasContextInherited: boolean;
          inheritedFields: string[];
          previousVerdict?: DecisionVerdict;
        }
      | undefined;

    const activeCtx = context.activeMissionContext;
    const hasPriorContext = (hasPriorTurns && lastTurn) || !!activeCtx;

    if (hasPriorContext) {
      const lower = rawQuery.toLowerCase();
      const isFollowUp =
        lower.includes('what about') ||
        lower.includes('what if') ||
        lower.includes('why') ||
        lower.includes('how about') ||
        lower.includes('instead') ||
        lower.length < 30;

      if (isFollowUp) {
        const inheritedFields: string[] = [];
        if (!rawQuery.toLowerCase().includes('mumbai') && !rawQuery.toLowerCase().includes('chennai') && !rawQuery.toLowerCase().includes('nagapattinam')) {
          if (lastTurn) {
            structuredIntent.location = lastTurn.structuredIntent.location;
          } else if (activeCtx) {
            structuredIntent.location = { regionId: activeCtx.regionId, sectorName: 'Alibaug Coastal Sector / Arabian Sea' };
          }
          inheritedFields.push('location');
        }
        if (!rawQuery.toLowerCase().includes('hour') && !rawQuery.toLowerCase().includes('hr') && !rawQuery.toLowerCase().includes('h\b')) {
          if (lastTurn) {
            structuredIntent.durationHours = lastTurn.structuredIntent.durationHours;
          } else if (activeCtx) {
            structuredIntent.durationHours = activeCtx.durationHours;
          }
          inheritedFields.push('durationHours');
        }
        if (!structuredIntent.vessel.isExplicit) {
          if (lastTurn) {
            structuredIntent.vessel = lastTurn.structuredIntent.vessel;
          } else if (activeCtx) {
            structuredIntent.vessel = { vesselId: activeCtx.vesselId, isExplicit: false };
          }
          inheritedFields.push('vessel');
        }

        inheritedContext = {
          wasContextInherited: inheritedFields.length > 0,
          inheritedFields,
          previousVerdict: lastTurn?.verdict,
        };
      }
    }

    // Seed/update activeMissionContext
    context.activeMissionContext = {
      regionId: structuredIntent.location.regionId,
      activity: structuredIntent.activity,
      departureTime: structuredIntent.departureWindow.timeString,
      durationHours: structuredIntent.durationHours,
      vesselId: structuredIntent.vessel.vesselId || 'VESSEL-001',
      targetZoneId: structuredIntent.targetZoneId,
    };

    return {
      intent: structuredIntent,
      conversationContext: context,
      inheritedContext,
    };
  }

  // ==========================================================================
  // EXPLANATION GENERATION
  // ==========================================================================

  public async generateExplanation(
    decision: DecisionEvaluationResponse,
    evidence: AuditedEvidenceItem[],
    intent: LlmStructuredIntent,
    conversationId?: string,
    role: 'FISHERMAN' | 'AUTHORITY' | 'DISASTER' | 'RESEARCHER' | 'OPERATOR' = 'FISHERMAN'
  ): Promise<LlmExplanationResult> {
    const context = conversationId ? this.getConversation(conversationId) : undefined;

    const explanation = await this.provider.generateExplanation({
      decision,
      evidence,
      intent,
      conversationContext: context,
      operatorRole: role,
    });

    // STRICT SAFETY GATE: Ensure cited evidence IDs only reference real evidence records
    const validEvidenceIds = new Set(evidence.map((e) => e.evidenceId));
    explanation.citedEvidenceIds = explanation.citedEvidenceIds.filter((id) => validEvidenceIds.has(id));
    if (explanation.citedEvidenceIds.length === 0) {
      explanation.citedEvidenceIds = evidence.slice(0, 5).map((e) => e.evidenceId);
    }

    return explanation;
  }

  // ==========================================================================
  // TURN RECORDING
  // ==========================================================================

  public recordTurn(
    conversationId: string,
    userQuery: string,
    intent: LlmStructuredIntent,
    decision: DecisionEvaluationResponse,
    explanation: LlmExplanationResult
  ): ConversationTurnRecord {
    const context = this.getOrCreateConversation(conversationId);
    const turn: ConversationTurnRecord = {
      turnId: `TURN-${context.turns.length + 1}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userQuery,
      structuredIntent: intent,
      verdict: decision.verdict,
      explanation,
    };

    context.turns.push(turn);
    context.updatedAt = new Date().toISOString();
    context.activeMissionContext = {
      regionId: intent.location.regionId,
      activity: intent.activity,
      departureTime: intent.departureWindow.timeString,
      durationHours: intent.durationHours,
      vesselId: intent.vessel.vesselId || 'VESSEL-001',
      targetZoneId: intent.targetZoneId,
    };

    return turn;
  }

  // ==========================================================================
  // CONTROLLED SERVER-SIDE TOOLS BOUNDARY
  // ==========================================================================

  public async getOceanConditions(latitude: number, longitude: number, regionId = 'maharashtra') {
    return this.osfAdapter.fetch({
      latitude,
      longitude,
      regionId,
    });
  }

  public async getWeatherConditions(latitude: number, longitude: number, regionId = 'maharashtra') {
    return this.imdAdapter.fetch({
      latitude,
      longitude,
      regionId,
    });
  }

  public async getPFZOpportunity(latitude: number, longitude: number, regionId = 'maharashtra') {
    return this.pfzAdapter.fetch({
      latitude,
      longitude,
      regionId,
    });
  }

  public async evaluateGISSafety(latitude: number, longitude: number, regionId = 'maharashtra') {
    return this.gisSafetyService.evaluateRoute({
      vesselId: 'VESSEL-001',
      vesselPosition: { latitude, longitude },
      region: regionId,
    });
  }

  public async evaluateVesselCapability(vesselId: string, waveMeters: number, windKts: number, distanceKm: number) {
    return this.vesselCapabilityService.evaluateCapability({
      vesselId,
      missionDistanceNm: distanceKm / 1.852,
      maxDistanceFromPortNm: (distanceKm / 1.852) / 2,
      missionDurationHours: 5,
      environmentalContext: {
        waveHeightMeters: waveMeters,
        windSpeedKnots: windKts,
        windGustKnots: windKts * 1.3,
        visibilityKm: 10,
      },
    });
  }

  public async evaluateDecision(payload: Parameters<typeof DecisionEngineService.prototype.evaluateDecision>[0]) {
    return this.decisionEngineService.evaluateDecision(payload);
  }
}
