import React, { useState } from 'react';
import { REGIONS, getRegionData, type RegionId } from '@/data';
import { RegionContext } from './regionContextDef';

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRegionId, setActiveRegionId] = useState<RegionId>('maharashtra');

  const setRegion = (regionId: RegionId) => {
    if (REGIONS[regionId]) {
      setActiveRegionId(regionId);
    }
  };

  const activeRegion = getRegionData(activeRegionId);

  return (
    <RegionContext.Provider
      value={{
        activeRegionId,
        activeRegion,
        setRegion,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};
