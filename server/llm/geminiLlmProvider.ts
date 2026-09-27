import type {
  LlmStructuredIntent,
  LlmExplanationResult,
  LlmClarificationPrompt,
  LlmProviderType,
} from '../../src/types/contract.js';
import type { LLMProvider } from './llmProvider.js';
import type {
  LLMExtractIntentInput,
  LLMGenerateExplanationInput,
  LLMClarificationInput,
} from './llmTypes.js';
import { FallbackLlmProvider } from './fallbackLlmProvider.js';
import { structuredIntentZodSchema } from './llmTypes.js';

export class GeminiLlmProvider implements LLMProvider {
  readonly providerType: LlmProviderType = 'GEMINI';
  readonly modelName: string;
  private readonly apiKey: string | undefined;
  private readonly fallback: FallbackLlmProvider;

  constructor(apiKey?: string, modelName = 'gemini-1.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
    this.modelName = modelName;
    this.fallback = new FallbackLlmProvider();
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async extractStructuredIntent(input: LLMExtractIntentInput): Promise<LlmStructuredIntent> {
    if (!this.isAvailable()) {
      return this.fallback.extractStructuredIntent(input);
    }

    try {
      const prompt = `You are ORCA's Natural Language Mission Understanding Engine for Indian coastal waters.
Extract structured mission parameters from the user's maritime query.

User Query: "${input.rawQuery}"
Operator Role: "${input.operatorRole || 'FISHERMAN'}"
Default Region: "${input.defaultRegionId || 'maharashtra'}"

Return ONLY a valid JSON object with:
{
  "activity": "FISHING" | "SURVEY" | "PATROL" | "TRANSIT" | "UNKNOWN",
  "questionType": "FEASIBILITY" | "SAFETY" | "OPPORTUNITY" | "EXPLANATION" | "ROUTE" | "CONDITIONS" | "ALERT" | "WHAT_IF" | "GENERAL_INFORMATION" | "UNKNOWN",
  "location": {
    "regionId": "maharashtra" | "tamil_nadu",
    "sectorName": string,
    "portName": string
  },
  "departureWindow": {
    "timeString": string,
    "isEstimated": boolean
  },
  "durationHours": number,
  "vessel": {
    "vesselId": "VESSEL-001" | "VESSEL-002" | "VESSEL-003",
    "isExplicit": boolean
  },
  "targetZoneId": string | null,
  "constraints": string[],
  "requiresClarification": boolean,
  "confidenceScore": number
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
          }),
          signal: AbortSignal.timeout(6000),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API HTTP ${response.status}`);
      }

      const json = (await response.json()) as any;
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty Gemini response');

      const parsedJson = JSON.parse(text);
      const validated = structuredIntentZodSchema.parse({
        ...parsedJson,
        rawQuery: input.rawQuery,
      });

      return {
        ...validated,
        intentId: `INT-GEMINI-${Date.now()}`,
      };
    } catch (err) {
      console.warn('Gemini intent extraction failed, invoking fallback:', (err as Error).message);
      return this.fallback.extractStructuredIntent(input);
    }
  }

  async generateExplanation(input: LLMGenerateExplanationInput): Promise<LlmExplanationResult> {
    if (!this.isAvailable()) {
      return this.fallback.generateExplanation(input);
    }

    try {
      const { decision, evidence, intent, operatorRole } = input;
      const prompt = `You are ORCA's Natural Language Maritime Decision Explainer.
Explain this deterministic safety decision to an Indian coastal ${operatorRole || 'FISHERMAN'} for their ${intent.activity} mission with craft ${intent.vessel.vesselId}.

CRITICAL CONSTRAINTS:
1. You MUST NEVER modify the decision verdict: "${decision.verdict}".
2. You MUST strictly base your facts on the following Primary Driver: "${decision.primaryDriver}".
3. Base explanations ONLY on provided evidence. Do NOT hallucinate probabilities or unverified sources.

Evidence Summary:
${evidence.slice(0, 6).map((e) => `- [${e.category}] ${e.variable}: ${String(e.value)} ${e.unit || ''} (Source: ${e.source})`).join('\n')}

Return ONLY a JSON object:
{
  "summary": string,
  "detailedReasoning": string,
  "actionableAdvisories": string[]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(6000),
        }
      );

      if (!response.ok) throw new Error(`Gemini API HTTP ${response.status}`);

      const json = (await response.json()) as any;
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty Gemini explanation response');

      const parsed = JSON.parse(text);
      return {
        summary: parsed.summary || decision.primaryDriver,
        detailedReasoning: parsed.detailedReasoning || decision.explanation,
        actionableAdvisories: parsed.actionableAdvisories || ['Check VHF Ch-16 before departure'],
        citedEvidenceIds: evidence.map((e) => e.evidenceId),
        providerUsed: this.providerType,
        modelUsed: this.modelName,
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
    } catch (err) {
      console.warn('Gemini explanation generation failed, invoking fallback:', (err as Error).message);
      return this.fallback.generateExplanation(input);
    }
  }

  async generateClarification(input: LLMClarificationInput): Promise<LlmClarificationPrompt[]> {
    return this.fallback.generateClarification(input);
  }
}
