import React, { useState, useCallback } from 'react';
import type { 
  OrchestrationPackage, 
  AgentId, 
  AgentExecutionStatus, 
  BaseAgentResult 
} from '@/types/agents';
import { executeMultiAgentOrchestration } from '@/orchestration/agentOrchestrator';
import { OrchestrationContext } from './orchestrationContextDef';

const initialOrchestration: OrchestrationPackage = {
  orchestrationId: 'ORCH-INIT01',
  requestedQuery: 'Can I go fishing tomorrow morning for five hours?',
  timestamp: '08:30:02 IST',
  executionTimeMs: 850,
  analysisStatus: 'ready',
  planner: {
    agentId: 'planner',
    agentName: 'Mission Planner Agent',
    role: 'Intent Deconstruction & Task Delegation',
    status: 'completed',
    startedAt: '08:30:00 IST',
    completedAt: '08:30:01 IST',
    summary: 'Parsed intent: FISHING mission • Departure 05:45 IST (5h duration) • 4 agent subtasks dispatched.',
    data: {
      intent: 'fishing_trip_assessment',
      activity: 'fishing',
      requestedPeriod: 'tomorrow_morning',
      departureTime: '05:45 IST',
      durationHours: 5,
      locationContext: 'Alibaug Coastal Sector / Mumbai Offshore',
      vesselRequired: true,
      assignedTasks: ['ocean', 'weather', 'pfz', 'geoSafety'],
    },
    evidence: [
      {
        key: 'parsed_intent',
        label: 'Mission Objective',
        value: 'FISHING (5 hours)',
        impact: 'neutral',
        provenance: {
          source: 'ORCA_INTENT_NORMALIZER',
          timestamp: '2026-09-02 08:30 IST',
          status: 'live',
        },
      },
    ],
    confidence: 96,
    sourceStatus: 'live',
  },
  ocean: {
    agentId: 'ocean',
    agentName: 'Oceanography Agent',
    role: 'Hydrographic & Thermal Front Analysis',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: 'SST 27.8°C (Thermal gradient favorable) • Chlorophyll 1.84 mg/m³ • Current 0.8 kts SSE • Marine State: MODERATE.',
    data: {
      seaSurfaceTemperatureCelsius: 27.8,
      sstAnomalyCelsius: 0.6,
      surfaceCurrentSpeedKnots: 0.8,
      surfaceCurrentDirection: 'SSE',
      mixedLayerDepthMeters: 28,
      thermoclineDepthMeters: 45,
      chlorophyllConcentrationMgM3: 1.84,
      waveSwellMeters: 1.4,
      oceanRiskLevel: 'moderate',
      favorableFishingConditions: true,
    },
    evidence: [
      {
        key: 'sst_front',
        label: 'Sea Surface Temperature',
        value: '27.8°C (Anomaly: +0.6°C)',
        impact: 'positive',
        provenance: {
          source: 'INCOIS_OCEAN_MODEL_SNAPSHOT',
          timestamp: '2026-09-02 06:00 IST',
          status: 'demo_snapshot',
        },
      },
    ],
    confidence: 88,
    sourceStatus: 'demo_snapshot',
  },
  weather: {
    agentId: 'weather',
    agentName: 'Meteorology Agent',
    role: 'Weather & Surface Atmospheric Assessment',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: 'Wind 12.5 kts (WNW) • Gusts 18.5 kts • Wave 1.4m (Period: 7.2s) • Weather Risk: MODERATE.',
    data: {
      windSpeedKnots: 12.5,
      windGustKnots: 18.5,
      windDirection: 'WNW',
      waveHeightMeters: 1.4,
      wavePeriodSeconds: 7.2,
      visibilityKm: 8.5,
      airTemperatureCelsius: 29.4,
      atmosphericPressureHpa: 1013.2,
      precipitationProbabilityPercent: 15,
      activeAdvisories: [
        'Moderate wave swell (1.4m) rising to 2.1m post-12:00 IST',
        'Squall line advisory for outer continental shelf post-13:00 IST',
      ],
      weatherRiskLevel: 'moderate',
    },
    evidence: [
      {
        key: 'wind_velocity',
        label: 'Wind Velocity',
        value: '12.5 kts WNW (Gusts up to 18.5 kts)',
        impact: 'positive',
        provenance: {
          source: 'IMD_COASTAL_RADAR_SNAPSHOT',
          timestamp: '2026-09-02 06:00 IST',
          status: 'demo_snapshot',
        },
      },
    ],
    confidence: 91,
    sourceStatus: 'demo_snapshot',
  },
  pfz: {
    agentId: 'pfz',
    agentName: 'PFZ / Fisheries Agent',
    role: 'Pelagic Habitat & Satellite PFZ Scoring',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: 'Identified Alibaug Outer Bank (PFZ-MUM-01) (18.5 km, 245° WSW) • Opportunity: HIGH • Species: Indian Mackerel, Ribbonfish, Sardines.',
    data: {
      topCandidateZoneId: 'PFZ-MUM-01',
      topCandidateZoneName: 'Alibaug Outer Bank (PFZ-MUM-01)',
      opportunityLevel: 'high',
      distanceKm: 18.5,
      bearingDegrees: 245,
      targetFishTypes: ['Indian Mackerel', 'Ribbonfish', 'Sardines'],
      chlorophyllIndicator: 'High gradient (1.82 mg/m³)',
      sstIndicator: '27.8°C (Thermal front)',
      totalZonesEvaluated: 3,
    },
    evidence: [
      {
        key: 'top_pfz_zone',
        label: 'Candidate PFZ Zone',
        value: 'Alibaug Outer Bank (PFZ-MUM-01) (18.5 km, Bearing: 245°)',
        impact: 'positive',
        provenance: {
          source: 'INCOIS_PFZ_ADVISORY_SNAPSHOT',
          timestamp: '2026-09-02 06:00 IST',
          status: 'demo_snapshot',
        },
      },
    ],
    confidence: 89,
    sourceStatus: 'demo_snapshot',
  },
  geoSafety: {
    agentId: 'geoSafety',
    agentName: 'Geo / Safety Agent',
    role: 'Geofence Compliance & Hazard Corridor Evaluation',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: 'Boundary Status: CLEAR • Naval Anchorage clearance: 4.2 km • 2 Active Hazard Advisories tracked • Safe corridor verified.',
    data: {
      boundaryStatus: 'clear',
      nearestGeofenceName: 'Naval Anchorage Security Geofence',
      geofenceClearanceKm: 4.2,
      incursionRisk: 'none',
      activeHazardsCount: 2,
      hazardsSummary: [
        'Squall Warning & Offshore Wind Advisory: Small craft advised to return before 13:00 IST',
        'Submerged Rocky Shoal Warning: Maintain min 500m buffer',
      ],
      safeCorridorVerified: true,
    },
    evidence: [
      {
        key: 'geofence_clearance',
        label: 'Naval Geofence Clearance',
        value: '4.2 km clearance along planned route (Clear Corridor)',
        impact: 'positive',
        provenance: {
          source: 'NATIONAL_HYDROGRAPHIC_OFFICE_GEOJSON',
          timestamp: '2026-09-02 06:00 IST',
          status: 'demo_snapshot',
        },
      },
    ],
    confidence: 94,
    sourceStatus: 'demo_snapshot',
  },
};

export const OrchestrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orchestration, setOrchestration] = useState<OrchestrationPackage | null>(initialOrchestration);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<BaseAgentResult | null>(null);

  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentExecutionStatus>>({
    planner: 'completed',
    ocean: 'completed',
    weather: 'completed',
    pfz: 'completed',
    geoSafety: 'completed',
  });

  const runOrchestration = useCallback(async (query: string): Promise<OrchestrationPackage> => {
    setIsOrchestrating(true);
    setAgentStatuses({
      planner: 'running',
      ocean: 'queued',
      weather: 'queued',
      pfz: 'queued',
      geoSafety: 'queued',
    });

    try {
      const result = await executeMultiAgentOrchestration(query, (agentId, status) => {
        setAgentStatuses((prev) => ({
          ...prev,
          [agentId]: status,
        }));
      });

      setOrchestration(result);
      return result;
    } finally {
      setIsOrchestrating(false);
    }
  }, []);

  const selectAgentForInspection = (agentId: AgentId) => {
    if (!orchestration) return;
    const agentMap: Record<AgentId, BaseAgentResult> = {
      planner: orchestration.planner,
      ocean: orchestration.ocean,
      weather: orchestration.weather,
      pfz: orchestration.pfz,
      geoSafety: orchestration.geoSafety,
    };
    setSelectedAgent(agentMap[agentId]);
  };

  const closeAgentInspection = () => {
    setSelectedAgent(null);
  };

  return (
    <OrchestrationContext.Provider
      value={{
        orchestration,
        agentStatuses,
        isOrchestrating,
        selectedAgent,
        runOrchestration,
        selectAgentForInspection,
        closeAgentInspection,
      }}
    >
      {children}
    </OrchestrationContext.Provider>
  );
};
