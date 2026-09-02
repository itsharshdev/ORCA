import type { OceanResult, OceanAnalysisOutput } from '@/types/agents';
import type { DataStatus } from '@/types/marine';
import { oceanData, weatherData } from '@/data';

/**
 * Ocean Agent: Analyzes oceanographic parameters, thermal gradients (SST),
 * surface currents, mixed-layer depth, and chlorophyll boundaries.
 */
export const runOceanAgent = async (): Promise<OceanResult> => {
  const { parameters, metadata } = oceanData;
  const sst = parameters.seaSurfaceTemperatureCelsius;
  const currentSpeed = parameters.surfaceCurrentKnots;
  const chlorophyll = parameters.chlorophyllConcentrationMgM3;
  const swell = weatherData.currentConditions.waveHeightMeters;

  // Determine ocean risk level
  let oceanRiskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (swell > 2.0 || currentSpeed > 2.0) {
    oceanRiskLevel = 'high';
  } else if (swell >= 1.2 || currentSpeed >= 0.7) {
    oceanRiskLevel = 'moderate';
  }

  // Favorable SST for pelagic aggregation in Western Indian waters is 26.5°C - 29.0°C
  const favorableFishingConditions = sst >= 26.5 && sst <= 29.0 && chlorophyll >= 1.0;

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

  return {
    agentId: 'ocean',
    agentName: 'Oceanography Agent',
    role: 'Hydrographic & Thermal Front Analysis',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: `SST ${sst}°C (Thermal gradient favorable) • Chlorophyll ${chlorophyll} mg/m³ • Current ${currentSpeed} kts ${parameters.currentDirection} • Marine State: ${oceanRiskLevel.toUpperCase()}.`,
    data,
    evidence: [
      {
        key: 'sst_front',
        label: 'Sea Surface Temperature',
        value: `${sst}°C (Anomaly: +${parameters.sstAnomalyCelsius}°C)`,
        impact: favorableFishingConditions ? 'positive' : 'neutral',
        provenance: {
          source: metadata.source,
          timestamp: metadata.updatedAt,
          status,
        },
      },
      {
        key: 'chlorophyll_concentration',
        label: 'Chlorophyll Concentration',
        value: `${chlorophyll} mg/m³ (Strong productivity front)`,
        impact: 'positive',
        provenance: {
          source: metadata.source,
          timestamp: metadata.updatedAt,
          status,
        },
      },
      {
        key: 'ocean_swell',
        label: 'Ocean Swell State',
        value: `${swell}m (Moderate sea state)`,
        impact: swell >= 1.2 ? 'cautionary' : 'positive',
        provenance: {
          source: weatherData.metadata.source,
          timestamp: weatherData.metadata.updatedAt,
          status: (weatherData.metadata.status as DataStatus) || 'demo_snapshot',
        },
      },
    ],
    confidence: 88,
    sourceStatus: status,
  };
};
