import { createContext } from 'react';
import type { 
  OrchestrationPackage, 
  AgentId, 
  AgentExecutionStatus, 
  BaseAgentResult 
} from '@/types/agents';
import type { RegionId } from '@/data';

export interface OrchestrationContextType {
  orchestration: OrchestrationPackage | null;
  agentStatuses: Record<AgentId, AgentExecutionStatus>;
  isOrchestrating: boolean;
  selectedAgent: BaseAgentResult | null;
  runOrchestration: (
    query: string, 
    regionId?: RegionId,
    durationOverride?: number,
    departureOverride?: string
  ) => Promise<OrchestrationPackage>;
  selectAgentForInspection: (agentId: AgentId) => void;
  closeAgentInspection: () => void;
}

export const OrchestrationContext = createContext<OrchestrationContextType | undefined>(undefined);
