import { createContext } from 'react';
import type { 
  OrchestrationPackage, 
  AgentId, 
  AgentExecutionStatus, 
  BaseAgentResult 
} from '@/types/agents';

export interface OrchestrationContextType {
  orchestration: OrchestrationPackage | null;
  agentStatuses: Record<AgentId, AgentExecutionStatus>;
  isOrchestrating: boolean;
  selectedAgent: BaseAgentResult | null;
  runOrchestration: (query: string) => Promise<OrchestrationPackage>;
  selectAgentForInspection: (agentId: AgentId) => void;
  closeAgentInspection: () => void;
}

export const OrchestrationContext = createContext<OrchestrationContextType | undefined>(undefined);
