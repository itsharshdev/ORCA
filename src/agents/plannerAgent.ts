import type { PlannerResult, PlannerOutput } from '@/types/agents';

/**
 * Planner Agent: Interprets the operator's mission query, extracts structured intent,
 * timing, activity parameters, and dispatches tasks to specialized downstream agents.
 */
export const runPlannerAgent = async (query: string): Promise<PlannerResult> => {
  const normalized = query.toLowerCase();

  // Intent parsing rules
  let activity: 'fishing' | 'survey' | 'patrol' = 'fishing';
  if (normalized.includes('survey') || normalized.includes('research') || normalized.includes('ocean state')) {
    activity = 'survey';
  } else if (normalized.includes('patrol') || normalized.includes('security') || normalized.includes('guard')) {
    activity = 'patrol';
  }

  // Duration extraction
  let durationHours = 5;
  const hourMatch = normalized.match(/(\d+)\s*(hour|hr|hrs|hours)/);
  if (hourMatch && hourMatch[1]) {
    durationHours = parseInt(hourMatch[1], 10);
  } else if (normalized.includes('half day')) {
    durationHours = 6;
  } else if (normalized.includes('full day')) {
    durationHours = 10;
  }

  // Departure timing extraction
  let requestedPeriod = 'tomorrow_morning';
  let departureTime = '05:45 IST';
  if (normalized.includes('evening') || normalized.includes('afternoon')) {
    requestedPeriod = 'afternoon_window';
    departureTime = '14:00 IST';
  } else if (normalized.includes('now') || normalized.includes('immediate')) {
    requestedPeriod = 'immediate';
    departureTime = '08:30 IST';
  }

  const plannerData: PlannerOutput = {
    intent: 'fishing_trip_assessment',
    activity,
    requestedPeriod,
    departureTime,
    durationHours,
    locationContext: 'Alibaug Coastal Sector / Mumbai Offshore',
    vesselRequired: true,
    assignedTasks: ['ocean', 'weather', 'pfz', 'geoSafety'],
  };

  return {
    agentId: 'planner',
    agentName: 'Mission Planner Agent',
    role: 'Intent Deconstruction & Task Delegation',
    status: 'completed',
    startedAt: '08:30:00 IST',
    completedAt: '08:30:01 IST',
    summary: `Parsed intent: ${activity.toUpperCase()} mission • Departure ${departureTime} (${durationHours}h duration) • 4 agent subtasks dispatched.`,
    data: plannerData,
    evidence: [
      {
        key: 'parsed_intent',
        label: 'Mission Objective',
        value: `${activity.toUpperCase()} (${durationHours} hours)`,
        impact: 'neutral',
        provenance: {
          source: 'ORCA_INTENT_NORMALIZER',
          timestamp: '2026-09-02 08:30 IST',
          status: 'live',
        },
      },
      {
        key: 'time_window',
        label: 'Departure Window',
        value: `${departureTime} (${requestedPeriod})`,
        impact: 'neutral',
        provenance: {
          source: 'ORCA_MISSION_SCHEDULER',
          timestamp: '2026-09-02 08:30 IST',
          status: 'live',
        },
      },
    ],
    confidence: 96,
    sourceStatus: 'live',
  };
};
