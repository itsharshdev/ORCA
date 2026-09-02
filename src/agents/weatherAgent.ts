import type { WeatherResult, WeatherAnalysisOutput } from '@/types/agents';
import type { DataStatus } from '@/types/marine';
import { getRegionData, type RegionId } from '@/data';

/**
 * Weather Agent: Evaluates meteorological conditions, wind speed, gusts,
 * wave heights, visibility, and severe weather / squall line advisories for the specified region.
 */
export const runWeatherAgent = async (regionId: RegionId = 'maharashtra'): Promise<WeatherResult> => {
  const region = getRegionData(regionId);
  const { currentConditions, metadata } = region.weatherData;
  const windSpeed = currentConditions.windSpeedKnots;
  const windGust = currentConditions.windGustKnots;
  const waveHeight = currentConditions.waveHeightMeters;

  // Determine weather risk level
  let weatherRiskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (windSpeed > 20 || windGust > 28 || waveHeight > 2.0) {
    weatherRiskLevel = 'high';
  } else if (windSpeed >= 12 || windGust >= 18 || waveHeight >= 1.3) {
    weatherRiskLevel = 'moderate';
  }

  const activeAdvisories = [
    `Moderate wave swell (${waveHeight}m) rising post-12:00 IST in ${region.seaBody}`,
    `Squall line warning for outer continental shelf post-13:00 IST`,
  ];

  const data: WeatherAnalysisOutput = {
    windSpeedKnots: windSpeed,
    windGustKnots: windGust,
    windDirection: currentConditions.windDirection,
    waveHeightMeters: waveHeight,
    wavePeriodSeconds: currentConditions.wavePeriodSeconds,
    visibilityKm: currentConditions.visibilityKm,
    airTemperatureCelsius: currentConditions.airTemperatureCelsius,
    atmosphericPressureHpa: 1013.2,
    precipitationProbabilityPercent: 15,
    activeAdvisories,
    weatherRiskLevel,
  };

  const status = (metadata.status as DataStatus) || 'demo_snapshot';
  const timestamp = metadata.updatedAt || metadata.timestamp || '2026-09-02 06:00 IST';

  return {
    agentId: 'weather',
    agentName: 'Meteorology Agent',
    role: 'Weather & Surface Atmospheric Assessment',
    status: 'completed',
    startedAt: '08:30:01 IST',
    completedAt: '08:30:02 IST',
    summary: `Wind ${windSpeed} kts (${currentConditions.windDirection}) • Gusts ${windGust} kts • Wave ${waveHeight}m (Period: ${currentConditions.wavePeriodSeconds}s) • Sector: ${region.shortLabel}.`,
    data,
    evidence: [
      {
        key: 'wind_velocity',
        label: 'Wind Velocity & Direction',
        value: `${windSpeed} kts ${currentConditions.windDirection} (Gusts up to ${windGust} kts)`,
        impact: windSpeed <= 15 ? 'positive' : 'cautionary',
        provenance: {
          source: metadata.source,
          timestamp,
          status,
        },
      },
      {
        key: 'wave_forecast',
        label: 'Coastal Wave Swell',
        value: `${waveHeight}m Swell (${currentConditions.seaState})`,
        impact: 'cautionary',
        provenance: {
          source: metadata.source,
          timestamp,
          status,
        },
      },
      {
        key: 'visibility',
        label: 'Surface Visibility',
        value: `${currentConditions.visibilityKm} km (Clear Horizon)`,
        impact: 'positive',
        provenance: {
          source: metadata.source,
          timestamp,
          status,
        },
      },
    ],
    confidence: 91,
    sourceStatus: status,
  };
};
