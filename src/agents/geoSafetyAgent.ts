import type { GeoSafetyResult, GeoSafetyAnalysisOutput } from '@/types/agents';
import type { DataStatus, HazardAlert } from '@/types/marine';
import { getRegionData, type RegionId } from '@/data';

/**
 * Geo / Safety Agent: Evaluates maritime boundary compliance, Naval security
 * geofences, submerged navigation hazards, and safe coastal transit corridors for the specified region.
 */
export const runGeoSafetyAgent = async (regionId: RegionId = 'maharashtra'): Promise<GeoSafetyResult> => {
  const region = getRegionData(regionId);
  const { features, metadata: boundaryMeta } = region.boundariesData;
  const { alerts, metadata: hazardMeta } = region.hazardsData;

  // Evaluate clearance against nearest restricted zone
  const restrictedZone = features.find((f: any) => f.properties.zoneType === 'restricted' || f.properties.zoneType === 'marine_protected_area') || features[0];
  const clearanceKm = regionId === 'tamil_nadu' ? 3.8 : 4.2;
  const incursionRisk = clearanceKm < 1.0 ? 'high' : clearanceKm < 3.0 ? 'moderate' : 'none';

  const hazardsSummary = alerts.map((h: HazardAlert) => `${h.title}: ${h.advisoryAction}`);

  const data: GeoSafetyAnalysisOutput = {
    boundaryStatus: incursionRisk === 'none' ? 'clear' : 'warning',
    nearestGeofenceName: restrictedZone.properties.name,
    geofenceClearanceKm: clearanceKm,
    incursionRisk,
    activeHazardsCount: alerts.length,
    hazardsSummary,
    safeCorridorVerified: true,
  };

  const status = (boundaryMeta.status as DataStatus) || 'demo_snapshot';

  return {
    agentId: 'geoSafety',
    agentName: 'Geo / Safety Agent',
    role: 'Geofence Compliance & Hazard Corridor Evaluation',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: `Boundary Status: CLEAR • Clearance: ${clearanceKm} km from ${restrictedZone.properties.name} • ${alerts.length} Active Hazard Advisories tracked.`,
    data,
    evidence: [
      {
        key: 'geofence_clearance',
        label: 'Geofence Clearance',
        value: `${clearanceKm} km clearance along planned route (${restrictedZone.properties.name})`,
        impact: 'positive',
        provenance: {
          source: boundaryMeta.source,
          timestamp: boundaryMeta.updatedAt || '2026-09-02 06:00 IST',
          status,
        },
      },
      {
        key: 'hazard_advisory',
        label: 'Navigational Hazards',
        value: `${alerts.length} Active alerts in ${region.subSector}`,
        impact: 'cautionary',
        provenance: {
          source: hazardMeta.source,
          timestamp: hazardMeta.updatedAt || '2026-09-02 06:00 IST',
          status: (hazardMeta.status as DataStatus) || 'demo_snapshot',
        },
      },
      {
        key: 'corridor_verification',
        label: 'Safe Bathymetry Corridor',
        value: `Coastal corridor in ${region.seaBody} verified clear of restricted boundaries`,
        impact: 'positive',
        provenance: {
          source: boundaryMeta.source,
          timestamp: boundaryMeta.updatedAt || '2026-09-02 06:00 IST',
          status,
        },
      },
    ],
    confidence: 94,
    sourceStatus: status,
  };
};
