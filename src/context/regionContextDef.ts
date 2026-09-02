import { createContext } from 'react';
import type { RegionId, RegionDataBundle } from '@/data';

export interface RegionContextType {
  activeRegionId: RegionId;
  activeRegion: RegionDataBundle;
  setRegion: (regionId: RegionId) => void;
}

export const RegionContext = createContext<RegionContextType | undefined>(undefined);
