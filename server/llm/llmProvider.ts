import type {
  LlmStructuredIntent,
  LlmExplanationResult,
  LlmClarificationPrompt,
  LlmProviderType,
} from '../../src/types/contract.js';
import type {
  LLMExtractIntentInput,
  LLMGenerateExplanationInput,
  LLMClarificationInput,
} from './llmTypes.js';

export interface LLMProvider {
  readonly providerType: LlmProviderType;
  readonly modelName: string;
  isAvailable(): boolean;

  extractStructuredIntent(
    input: LLMExtractIntentInput
  ): Promise<LlmStructuredIntent>;

  generateExplanation(
    input: LLMGenerateExplanationInput
  ): Promise<LlmExplanationResult>;

  generateClarification(
    input: LLMClarificationInput
  ): Promise<LlmClarificationPrompt[]>;
}
