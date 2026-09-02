import type { PfzResult, PfzAnalysisOutput } from '@/types/agents';
import type { DataStatus } from '@/types/marine';
import { pfzData } from '@/data';

/**
 * PFZ / Fisheries Agent: Evaluates Potential Fishing Zone advisories,
 * SST gradients, chlorophyll front indicators, and pelagic habitat suitability.
 */
export const runPfzAgent = async (): Promise<PfzResult> => {
  const { zones, metadata } = pfzData;

  // Identify highest opportunity zone
  const highPotentialZones = zones.filter((z) => z.potentialScore === 'high');
  const topZone = highPotentialZones.length > 0 ? highPotentialZones[0] : zones[0];

  const data: PfzAnalysisOutput = {
    topCandidateZoneId: topZone.id,
    topCandidateZoneName: topZone.zoneName,
    opportunityLevel: (topZone.potentialScore as 'low' | 'moderate' | 'high') || 'high',
    distanceKm: topZone.distanceKmFromPort,
    bearingDegrees: topZone.bearingDegrees,
    targetFishTypes: topZone.recommendedFishTypes || ['Indian Mackerel', 'Ribbonfish'],
    chlorophyllIndicator: topZone.chlorophyllIndicator,
    sstIndicator: topZone.sstIndicator,
    totalZonesEvaluated: zones.length,
  };

  const status = (metadata.status as DataStatus) || 'demo_snapshot';

  return {
    agentId: 'pfz',
    agentName: 'PFZ / Fisheries Agent',
    role: 'Pelagic Habitat & Satellite PFZ Scoring',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: `Identified ${topZone.zoneName} (${topZone.distanceKmFromPort} km, ${topZone.bearingDegrees}° WSW) • Opportunity: HIGH • Species: ${topZone.recommendedFishTypes?.join(', ')}.`,
    data,
    evidence: [
      {
        key: 'top_pfz_zone',
        label: 'Candidate PFZ Zone',
        value: `${topZone.zoneName} (Distance: ${topZone.distanceKmFromPort} km, Bearing: ${topZone.bearingDegrees}°)`,
        impact: 'positive',
        provenance: {
          source: metadata.source,
          timestamp: metadata.updatedAt,
          status,
        },
      },
      {
        key: 'chlorophyll_gradient',
        label: 'Chlorophyll Indicator',
        value: `${topZone.chlorophyllIndicator} (Strong pelagic feed aggregation)`,
        impact: 'positive',
        provenance: {
          source: metadata.source,
          timestamp: metadata.updatedAt,
          status,
        },
      },
      {
        key: 'target_species',
        label: 'Recommended Species',
        value: topZone.recommendedFishTypes?.join(', ') || 'Mixed Pelagics',
        impact: 'positive',
        provenance: {
          source: metadata.source,
          timestamp: metadata.updatedAt,
          status,
        },
      },
    ],
    confidence: 89,
    sourceStatus: status,
  };
};
