declare module '*.geojson' {
  const value: {
    type: string;
    metadata?: {
      source: string;
      description: string;
      updatedAt: string;
      validUntil?: string;
      status: string;
      isLive: boolean;
      disclaimer?: string;
    };
    features: Array<{
      type: string;
      id: string;
      properties: {
        name: string;
        zoneType: string;
        severityOnIncursion: string;
        restrictionDescription: string;
        bufferDistanceMeters?: number;
      };
      geometry: {
        type: string;
        coordinates: number[][][] | number[][][][];
      };
    }>;
  };
  export default value;
}
