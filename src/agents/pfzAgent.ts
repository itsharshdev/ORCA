import type { PfzResult, PfzAnalysisOutput } from '@/types/agents';
import type { DataStatus, PFZRecord } from '@/types/marine';
import { getRegionData, type RegionId } from '@/data';

/**
 * PFZ / Fisheries Agent: Evaluates Potential Fishing Zone advisories,
 * SST gradients, chlorophyll front indicators, and pelagic habitat suitability for the specified region.
 */
export const runPfzAgent = async (regionId: RegionId = 'maharashtra'): Promise<PfzResult> => {
  const region = getRegionData(regionId);
  const { zones, metadata } = region.pfzData;

  // Identify highest opportunity zone
  const highPotentialZones = zones.filter((z: PFZRecord) => z.potentialScore === 'high');
  const topZone = highPotentialZones.length > 0 ? highPotentialZones[0] : zones[0];

  const data: PfzAnalysisOutput = {
    topCandidateZoneId: topZone.id,
    topCandidateZoneName: topZone.zoneName,
    opportunityLevel: (topZone.potentialScore as 'low' | 'moderate' | 'high') || 'high',
    distanceKm: topZone.distanceKmFromPort || 18.5,
    bearingDegrees: topZone.bearingDegrees || 245,
    targetFishTypes: topZone.recommendedFishTypes || ['Indian Mackerel', 'Yellowfin Tuna'],
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
    summary: `Identified ${topZone.zoneName} (${topZone.distanceKmFromPort} km, ${topZone.bearingDegrees}° bearing) • Opportunity: ${topZone.potentialScore.toUpperCase()} • Species: ${topZone.recommendedFishTypes?.join(', ')}.`,
    data,
    evidence: [
      {
        key: 'top_pfz_zone',
        label: 'Candidate PFZ Zone',
        value: `${topZone.zoneName} (Distance: ${topZone.distanceKmFromPort} km, Bearing: ${topZone.bearingDegrees}°)`,
        impact: 'positive',
        provenance: {
          source: metadata.source,
          timestamp: metadata.updatedAt || '2026-09-02 06:00 IST',
          status,
        },
      },
      {
        key: 'chlorophyll_gradient',
        label: 'Chlorophyll Indicator',
        value: `${topZone.chlorophyllIndicator} (Productivity front in ${region.seaBody})`,
        impact: 'positive',
        provenance: {
          source: metadata.source,
          timestamp: metadata.updatedAt || '2026-09-02 06:00 IST',
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
          timestamp: metadata.updatedAt || '2026-09-02 06:00 IST',
          status,
        },
      },
    ],
    confidence: 89,
    sourceStatus: status,
  };
};
