import pfzJson from '../../data/demo/pfz.json';
import weatherJson from '../../data/demo/weather.json';
import oceanJson from '../../data/demo/ocean.json';
import hazardsJson from '../../data/demo/hazards.json';
import vesselsJson from '../../data/demo/vessels.json';
import boundariesRaw from '../../data/demo/boundaries.geojson?raw';

import pfzTnJson from '../../data/demo/regions/tamil_nadu/pfz.json';
import weatherTnJson from '../../data/demo/regions/tamil_nadu/weather.json';
import oceanTnJson from '../../data/demo/regions/tamil_nadu/ocean.json';
import hazardsTnJson from '../../data/demo/regions/tamil_nadu/hazards.json';
import vesselsTnJson from '../../data/demo/regions/tamil_nadu/vessels.json';
import boundariesTnRaw from '../../data/demo/regions/tamil_nadu/boundaries.geojson?raw';

import type { 
  PfzDataset, 
  WeatherData, 
  OceanographicData, 
  HazardsDataset, 
  VesselProfilesData,
  BoundaryFeatureCollection 
} from '@/types/marine';

// Parse raw GeoJSON files safely
const parseGeoJson = (raw: string): BoundaryFeatureCollection => {
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse boundaries.geojson:', err);
    return {
      type: 'FeatureCollection',
      metadata: {
        source: 'FALLBACK_GEOJSON',
        generatedAt: new Date().toISOString(),
        status: 'degraded',
        isLive: false,
      },
      features: [],
    };
  }
};

const boundariesMaharashtra: BoundaryFeatureCollection = parseGeoJson(boundariesRaw);
const boundariesTamilNadu: BoundaryFeatureCollection = parseGeoJson(boundariesTnRaw);

export type RegionId = 'maharashtra' | 'tamil_nadu';

export interface RegionDataBundle {
  id: RegionId;
  name: string;
  shortLabel: string;
  subSector: string;
  seaBody: string;
  mapCenter: [number, number];
  defaultZoom: number;
  pfzData: PfzDataset;
  weatherData: WeatherData;
  oceanData: OceanographicData;
  hazardsData: HazardsDataset;
  boundariesData: BoundaryFeatureCollection;
  vesselsData: VesselProfilesData;
}

export const REGIONS: Record<RegionId, RegionDataBundle> = {
  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra — Alibaug / Mumbai Sector',
    shortLabel: 'Maharashtra (Alibaug)',
    subSector: 'Alibaug Coastal Sector',
    seaBody: 'ARABIAN SEA',
    mapCenter: [18.78, 72.72],
    defaultZoom: 10,
    pfzData: pfzJson as unknown as PfzDataset,
    weatherData: weatherJson as unknown as WeatherData,
    oceanData: oceanJson as unknown as OceanographicData,
    hazardsData: hazardsJson as unknown as HazardsDataset,
    boundariesData: boundariesMaharashtra,
    vesselsData: vesselsJson as unknown as VesselProfilesData,
  },
  tamil_nadu: {
    id: 'tamil_nadu',
    name: 'Tamil Nadu — Nagapattinam / Poompuhar Sector',
    shortLabel: 'Tamil Nadu (Nagapattinam)',
    subSector: 'Nagapattinam Coastal Sector',
    seaBody: 'BAY OF BENGAL',
    mapCenter: [10.76, 80.00],
    defaultZoom: 10,
    pfzData: pfzTnJson as unknown as PfzDataset,
    weatherData: weatherTnJson as unknown as WeatherData,
    oceanData: oceanTnJson as unknown as OceanographicData,
    hazardsData: hazardsTnJson as unknown as HazardsDataset,
    boundariesData: boundariesTamilNadu,
    vesselsData: vesselsTnJson as unknown as VesselProfilesData,
  },
};

export const getRegionData = (regionId: RegionId = 'maharashtra'): RegionDataBundle => {
  return REGIONS[regionId] || REGIONS.maharashtra;
};

// Default backward-compatible exports for Maharashtra
export const pfzData: PfzDataset = pfzJson as unknown as PfzDataset;
export const weatherData: WeatherData = weatherJson as unknown as WeatherData;
export const oceanData: OceanographicData = oceanJson as unknown as OceanographicData;
export const hazardsData: HazardsDataset = hazardsJson as unknown as HazardsDataset;
export const vesselsData: VesselProfilesData = vesselsJson as unknown as VesselProfilesData;
export const boundariesData: BoundaryFeatureCollection = boundariesMaharashtra;
