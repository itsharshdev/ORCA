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

export class OpenAiLlmProvider implements LLMProvider {
  readonly providerType: LlmProviderType = 'OPENAI';
  readonly modelName: string;
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly fallback: FallbackLlmProvider;

  constructor(apiKey?: string, modelName = 'gpt-4o-mini', baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    this.modelName = modelName;
    this.baseUrl = process.env.OPENAI_BASE_URL || baseUrl;
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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: 'You are ORCA\'s Mission NLP Parser. Extract structured maritime voyage parameters in valid JSON.',
            },
            {
              role: 'user',
              content: `Query: "${input.rawQuery}"\nRole: "${input.operatorRole || 'FISHERMAN'}"\nRegion: "${input.defaultRegionId || 'maharashtra'}"`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
      const json = (await response.json()) as any;
      const content = json?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty OpenAI response');

      const parsed = JSON.parse(content);
      const validated = structuredIntentZodSchema.parse({
        ...parsed,
        rawQuery: input.rawQuery,
      });

      return {
        ...validated,
        intentId: `INT-OPENAI-${Date.now()}`,
      };
    } catch (err) {
      console.warn('OpenAI intent extraction failed, invoking fallback:', (err as Error).message);
      return this.fallback.extractStructuredIntent(input);
    }
  }

  async generateExplanation(input: LLMGenerateExplanationInput): Promise<LlmExplanationResult> {
    if (!this.isAvailable()) {
      return this.fallback.generateExplanation(input);
    }

    try {
      const { decision, evidence, operatorRole } = input;
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: `You are ORCA Decision Explainer. Explain this deterministic decision to a ${operatorRole || 'FISHERMAN'}. Verdict: ${decision.verdict}. Primary driver: ${decision.primaryDriver}. Do NOT alter verdict or facts. Return JSON: {"summary": string, "detailedReasoning": string, "actionableAdvisories": string[]}`,
            },
            {
              role: 'user',
              content: `Evidence: ${JSON.stringify(evidence.slice(0, 5).map(e => ({ var: e.variable, val: e.value, src: e.source })))}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(6000),
      });

      if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
      const json = (await response.json()) as any;
      const content = json?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty OpenAI response');

      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || decision.primaryDriver,
        detailedReasoning: parsed.detailedReasoning || decision.explanation,
        actionableAdvisories: parsed.actionableAdvisories || ['Observe standard coastal alerts'],
        citedEvidenceIds: evidence.map((e) => e.evidenceId),
        providerUsed: this.providerType,
        modelUsed: this.modelName,
        generatedAt: new Date().toISOString(),
        isFallback: false,
      };
    } catch (err) {
      console.warn('OpenAI explanation generation failed, invoking fallback:', (err as Error).message);
      return this.fallback.generateExplanation(input);
    }
  }

  async generateClarification(input: LLMClarificationInput): Promise<LlmClarificationPrompt[]> {
    return this.fallback.generateClarification(input);
  }
}
