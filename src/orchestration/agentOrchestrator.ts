import type { 
  OrchestrationPackage, 
  PlannerResult,
  AgentId,
  AgentExecutionStatus
} from '@/types/agents';
import { runPlannerAgent } from '@/agents/plannerAgent';
import { runOceanAgent } from '@/agents/oceanAgent';
import { runWeatherAgent } from '@/agents/weatherAgent';
import { runPfzAgent } from '@/agents/pfzAgent';
import { runGeoSafetyAgent } from '@/agents/geoSafetyAgent';

export interface AgentStatusCallback {
  (agentId: AgentId, status: AgentExecutionStatus, intermediateResult?: any): void;
}

/**
 * Orchestrator: Coordinates multi-agent workflow sequentially (Planner)
 * followed by concurrent parallel execution (Ocean, Weather, PFZ, GeoSafety).
 */
export const executeMultiAgentOrchestration = async (
  query: string,
  onStatusUpdate?: AgentStatusCallback
): Promise<OrchestrationPackage> => {
  const startTime = Date.now();

  // 1. Initial State: All agents queued
  onStatusUpdate?.('planner', 'running');
  onStatusUpdate?.('ocean', 'queued');
  onStatusUpdate?.('weather', 'queued');
  onStatusUpdate?.('pfz', 'queued');
  onStatusUpdate?.('geoSafety', 'queued');

  // Short delay for realistic observable async state transition
  await new Promise((resolve) => setTimeout(resolve, 350));

  // 2. Run Planner Agent (Sequential Phase)
  const plannerResult: PlannerResult = await runPlannerAgent(query);
  onStatusUpdate?.('planner', 'completed', plannerResult);

  // 3. Parallel Phase: Trigger 4 specialized agents concurrently
  onStatusUpdate?.('ocean', 'running');
  onStatusUpdate?.('weather', 'running');
  onStatusUpdate?.('pfz', 'running');
  onStatusUpdate?.('geoSafety', 'running');

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Run all 4 specialized agents concurrently
  const [oceanResult, weatherResult, pfzResult, geoSafetyResult] = await Promise.all([
    runOceanAgent(),
    runWeatherAgent(),
    runPfzAgent(),
    runGeoSafetyAgent(),
  ]);

  onStatusUpdate?.('ocean', 'completed', oceanResult);
  onStatusUpdate?.('weather', 'completed', weatherResult);
  onStatusUpdate?.('pfz', 'completed', pfzResult);
  onStatusUpdate?.('geoSafety', 'completed', geoSafetyResult);

  const totalTimeMs = Date.now() - startTime;

  return {
    orchestrationId: `ORCH-${Date.now().toString().slice(-6)}`,
    requestedQuery: query,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    executionTimeMs: totalTimeMs,
    analysisStatus: 'ready',
    planner: plannerResult,
    ocean: oceanResult,
    weather: weatherResult,
    pfz: pfzResult,
    geoSafety: geoSafetyResult,
  };
};
