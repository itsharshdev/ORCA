import { z } from 'zod';
import type { 
  LlmStructuredIntent,
  ServerConversationContext,
  DecisionEvaluationResponse,
  AuditedEvidenceItem
} from '../../src/types/contract.js';

export const userActivityEnum = z.enum([
  'FISHING',
  'SURVEY',
  'PATROL',
  'TRANSIT',
  'UNKNOWN'
]);

export const questionClassificationEnum = z.enum([
  'FEASIBILITY',
  'SAFETY',
  'OPPORTUNITY',
  'EXPLANATION',
  'ROUTE',
  'CONDITIONS',
  'ALERT',
  'WHAT_IF',
  'GENERAL_INFORMATION',
  'UNKNOWN'
]);

export const structuredIntentZodSchema = z.object({
  intentId: z.string().default(() => `INT-${Date.now()}`),
  rawQuery: z.string(),
  activity: userActivityEnum.default('FISHING'),
  questionType: questionClassificationEnum.default('FEASIBILITY'),
  location: z.object({
    regionId: z.string().default('maharashtra'),
    sectorName: z.string().optional(),
    portName: z.string().optional(),
    coordinates: z.tuple([z.number(), z.number()]).optional(),
  }).default({ regionId: 'maharashtra' }),
  departureWindow: z.object({
    timeString: z.string().default('06:00 IST'),
    isEstimated: z.boolean().default(true),
    requestedDate: z.string().optional(),
  }).default({ timeString: '06:00 IST', isEstimated: true }),
  durationHours: z.number().min(1).max(72).default(5),
  vessel: z.object({
    vesselId: z.string().optional().default('VESSEL-001'),
    vesselType: z.string().optional(),
    isExplicit: z.boolean().default(false),
  }).default({ vesselId: 'VESSEL-001', isExplicit: false }),
  targetZoneId: z.string().optional().nullable(),
  constraints: z.array(z.string()).default([]),
  requiresClarification: z.boolean().default(false),
  clarificationPrompts: z.array(z.object({
    promptId: z.string(),
    fieldTargeted: z.string(),
    question: z.string(),
    suggestedOptions: z.array(z.string()),
  })).optional(),
  confidenceScore: z.number().min(0).max(100).default(90),
  extractedEntities: z.record(z.string(), z.unknown()).default({}),
});

export type ValidatedStructuredIntent = z.infer<typeof structuredIntentZodSchema>;

export interface LLMExtractIntentInput {
  rawQuery: string;
  conversationContext?: ServerConversationContext;
  operatorRole?: string;
  defaultRegionId?: string;
}

export interface LLMGenerateExplanationInput {
  decision: DecisionEvaluationResponse;
  evidence: AuditedEvidenceItem[];
  intent: LlmStructuredIntent;
  conversationContext?: ServerConversationContext;
  operatorRole?: string;
}

export interface LLMClarificationInput {
  rawQuery: string;
  missingFields: string[];
  intent: LlmStructuredIntent;
}

export interface ControlledToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}
