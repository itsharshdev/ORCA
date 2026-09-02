import type { OceanResult, OceanAnalysisOutput } from '@/types/agents';
import type { DataStatus } from '@/types/marine';
import { getRegionData, type RegionId } from '@/data';

/**
 * Ocean Agent: Analyzes oceanographic parameters, thermal gradients (SST),
 * surface currents, mixed-layer depth, and chlorophyll boundaries for the specified region.
 */
export const runOceanAgent = async (regionId: RegionId = 'maharashtra'): Promise<OceanResult> => {
  const region = getRegionData(regionId);
  const { parameters, metadata } = region.oceanData;
  const sst = parameters.seaSurfaceTemperatureCelsius;
  const currentSpeed = parameters.surfaceCurrentKnots;
  const chlorophyll = parameters.chlorophyllConcentrationMgM3;
  const swell = region.weatherData.currentConditions.waveHeightMeters;

  // Determine ocean risk level
  let oceanRiskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (swell > 2.0 || currentSpeed > 2.0) {
    oceanRiskLevel = 'high';
  } else if (swell >= 1.2 || currentSpeed >= 0.7) {
    oceanRiskLevel = 'moderate';
  }

  // Favorable SST for pelagic aggregation
  const favorableFishingConditions = sst >= 26.5 && sst <= 29.5 && chlorophyll >= 1.0;

  const data: OceanAnalysisOutput = {
    seaSurfaceTemperatureCelsius: sst,
    sstAnomalyCelsius: parameters.sstAnomalyCelsius,
    surfaceCurrentSpeedKnots: currentSpeed,
    surfaceCurrentDirection: parameters.currentDirection,
    mixedLayerDepthMeters: parameters.mixedLayerDepthMeters,
    thermoclineDepthMeters: 45,
    chlorophyllConcentrationMgM3: chlorophyll,
    waveSwellMeters: swell,
    oceanRiskLevel,
    favorableFishingConditions,
  };

  const status = (metadata.status as DataStatus) || 'demo_snapshot';
  const timestamp = metadata.updatedAt || metadata.timestamp || '2026-09-02 06:00 IST';

  return {
    agentId: 'ocean',
    agentName: 'Oceanography Agent',
    role: 'Hydrographic & Thermal Front Analysis',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: `SST ${sst}°C (${region.seaBody}) • Chlorophyll ${chlorophyll} mg/m³ • Current ${currentSpeed} kts ${parameters.currentDirection} • Marine State: ${oceanRiskLevel.toUpperCase()}.`,
    data,
    evidence: [
      {
        key: 'sst_front',
        label: 'Sea Surface Temperature',
        value: `${sst}°C (Anomaly: +${parameters.sstAnomalyCelsius}°C)`,
        impact: favorableFishingConditions ? 'positive' : 'neutral',
        provenance: {
          source: metadata.source,
          timestamp,
          status,
        },
      },
      {
        key: 'chlorophyll_concentration',
        label: 'Chlorophyll Concentration',
        value: `${chlorophyll} mg/m³ (${parameters.chlorophyllGradient || 'Frontal Gradient'})`,
        impact: 'positive',
        provenance: {
          source: metadata.source,
          timestamp,
          status,
        },
      },
      {
        key: 'ocean_swell',
        label: 'Ocean Swell State',
        value: `${swell}m (Moderate swell in ${region.seaBody})`,
        impact: swell >= 1.2 ? 'cautionary' : 'positive',
        provenance: {
          source: region.weatherData.metadata.source,
          timestamp: region.weatherData.metadata.updatedAt || '2026-09-02 06:00 IST',
          status: (region.weatherData.metadata.status as DataStatus) || 'demo_snapshot',
        },
      },
    ],
    confidence: 88,
    sourceStatus: status,
  };
};
