export interface MapLayerVisibility {
  userLocation: boolean;
  vessel: boolean;
  pfzZones: boolean;
  weatherRisk: boolean;
  hazards: boolean;
  boundaries: boolean;
  recommendedRoute: boolean;
  safeCorridor: boolean;
  riskAreas: boolean;
}

export type MapEntityType = 'vessel' | 'userLocation' | 'pfz' | 'hazard' | 'boundary' | 'route' | 'corridor';

export interface SelectedMapEntity {
  id: string;
  type: MapEntityType;
  title: string;
  subtitle?: string;
  status: string;
  severity?: 'low' | 'moderate' | 'high' | 'critical' | 'favorable' | 'cautionary' | 'adverse';
  location?: {
    latitude: number;
    longitude: number;
  };
  details: {
    [key: string]: string | number | undefined;
  };
  source: string;
  observedAt: string;
  validUntil?: string;
  actionRequired?: string;
  recommendedFishTypes?: string[];
}
