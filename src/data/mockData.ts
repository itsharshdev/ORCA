import type {
  VesselProfile,
  PfzSector,
  WeatherCondition,
  SafetyAlert,
  NewsAdvisory,
  DecisionCardData,
  LanguageOption
} from '../types/orca';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' }
];

export const MOCK_VESSEL: VesselProfile = {
  id: 'vessel-tn-02',
  name: 'Sagarika',
  registrationNumber: 'IND-TN-02-MM-449',
  type: 'Motorized Wooden Crafts (22ft)',
  lengthMeters: 6.8,
  engineHp: 25,
  fuelCapacityLiters: 45,
  fuelCurrentLiters: 38,
  fuelConsumptionRateLph: 4.2,
  maxSpeedKts: 9.5,
  cruiseSpeedKts: 7.2,
  homePort: 'Rameswaram South Harbor',
  gearType: 'Ring Seine / Gillnet',
  crewCount: 4,
  maxRangeNm: 35,
  isGpsActive: true,
  gpsAccuracyMeters: 10,
  lat: 9.2885,
  lng: 79.3125
};

export const MOCK_PFZ_SECTORS: PfzSector[] = [
  {
    id: 'pfz-alpha',
    name: 'PFZ Sector Alpha',
    zoneCode: 'Gulf of Mannar Deep Trench Entry',
    lat: 9.2312,
    lng: 79.3850,
    depthMeters: '14–19m',
    expectedSpecies: ['Sardinella (Mathi)', 'Indian Mackerel (Rani)', 'Seer Fish'],
    density: 'High',
    distanceNm: 7.4,
    etaMinutes: 45,
    safeUntilTime: '13:00',
    sstCelsius: 28.4,
    chlorophyllMgM3: 1.85,
    validity: 'Valid until sunrise tomorrow (INCOIS)'
  },
  {
    id: 'pfz-beta',
    name: 'Palk Bay North Ridge',
    zoneCode: 'Dhanushkodi East Shoal',
    lat: 9.3240,
    lng: 79.4110,
    depthMeters: '8–12m',
    expectedSpecies: ['Shrimp', 'Ribbon Fish', 'Crab'],
    density: 'Medium',
    distanceNm: 11.2,
    etaMinutes: 75,
    safeUntilTime: '11:30',
    sstCelsius: 29.1,
    chlorophyllMgM3: 1.42,
    validity: 'Valid until 18:00 today (INCOIS)'
  },
  {
    id: 'pfz-gamma',
    name: 'Mandapam Deep South',
    zoneCode: 'Outer Coral Edge',
    lat: 9.1850,
    lng: 79.2240,
    depthMeters: '22–28m',
    expectedSpecies: ['Tuna', 'Cobia', 'Barracuda'],
    density: 'High',
    distanceNm: 14.8,
    etaMinutes: 95,
    safeUntilTime: '14:30',
    sstCelsius: 27.9,
    chlorophyllMgM3: 2.10,
    validity: 'Valid for next 24 hours'
  }
];

export const MOCK_WEATHER: WeatherCondition = {
  windSpeedKts: 11,
  windDirection: 'SW',
  waveHeightMeters: 0.8,
  swellPeriodSec: 7,
  visibilityKm: 9.5,
  barometricHpa: 1009,
  tidePhase: 'High Tide',
  nextHighTide: '08:20 AM',
  warningAlert: 'Wind expected to increase abruptly to 18 kts SW with steep chop after 11:30 AM.'
};

export const MOCK_INITIAL_DECISION: DecisionCardData = {
  id: 'decision-001',
  question: 'Can I go fishing tomorrow morning?',
  safetyLevel: 'CAUTION',
  headline: 'Morning fishing looks suitable. Conditions may worsen after 2:00 PM.',
  subtext: 'Rameswaram South • Safe return window until 13:30',
  narrative: 'You can depart Rameswaram at 04:30 AM. Sea remains calm until 10:30 AM. Wind picks up abruptly to 18 kts from SW with steep chop after 11:30 AM. We advise reaching harbor before 12:00 PM.',
  locationName: 'Rameswaram South • Zone 04',
  targetSectorId: 'pfz-alpha',
  safeReturnWindow: 'Return by 11:30 AM for calm passage (Harbor entry by 12:00 PM)',
  recommendedDepartureTime: '04:30 AM',
  recommendedReturnTime: '11:30 AM',
  windSpeedKts: 11,
  windDirection: 'SW',
  waveHeightMeters: 0.8,
  seaState: 'Calm early, choppy afternoon',
  pfzDistanceNm: 7.4,
  targetSpecies: ['Sardinella & Mackerel'],
  schedule: [
    { time: '04:30 AM', label: 'Depart', subtext: 'Calm Sea', type: 'depart', status: 'safe' },
    { time: '08:20 AM', label: 'High Tide', subtext: 'Max Depth', type: 'tide', status: 'safe' },
    { time: '10:30 AM', label: 'Head Back', subtext: 'Wind Rises', type: 'return', status: 'caution' },
    { time: '12:00 PM', label: 'Harbor', subtext: 'Safe Port', type: 'harbor', status: 'critical' }
  ],
  agentTraces: [
    {
      agentName: 'Planner Agent',
      role: 'Trip feasibility & timeline synthesis',
      status: 'COMPLETED',
      confidenceScore: 94,
      summary: 'Formulated 04:30 AM departure schedule to maximize high tide window while guaranteeing 11:30 AM harbor return buffer.',
      rawInputs: { departure: '04:30', returnWindow: '11:30', maxRangeNm: 35 },
      timestamp: '05:42:10 IST'
    },
    {
      agentName: 'Weather Agent',
      role: 'IMD & OpenMeteo wind wave vector analysis',
      status: 'CAUTION',
      confidenceScore: 91,
      summary: 'Detected localized wind shear ramping from 11 kts to 18 kts SW at 11:30 AM. Swell period shortens from 7s to 4s.',
      rawInputs: { morningWind: '11 kts', afternoonWind: '18 kts', waveSpike: '1.4m' },
      timestamp: '05:42:12 IST'
    },
    {
      agentName: 'Ocean Agent',
      role: 'INCOIS ERDDAP SST & Chlorophyll correlation',
      status: 'COMPLETED',
      confidenceScore: 96,
      summary: 'Confirmed sea surface temperature 28.4°C and chlorophyll-a density 1.85 mg/m³ at PFZ Sector Alpha.',
      rawInputs: { sst: 28.4, chlorophyll: 1.85 },
      timestamp: '05:42:15 IST'
    },
    {
      agentName: 'Fisheries/PFZ Agent',
      role: 'Catch potential & species distribution model',
      status: 'COMPLETED',
      confidenceScore: 93,
      summary: 'High pelagic shoal density verified 8.2 NM SE of Mandapam. Target species: Sardinella & Indian Mackerel.',
      rawInputs: { species: 'Sardinella/Mackerel', densityIndex: 0.88 },
      timestamp: '05:42:18 IST'
    },
    {
      agentName: 'Geo/Safety Agent',
      role: 'IMBL Geofence & Coast Guard active zones',
      status: 'CAUTION',
      confidenceScore: 98,
      summary: 'Route strictly avoids IMBL 2.0 NM buffer zone. Coast Guard exercise active 4.5 NM East.',
      rawInputs: { imblDistanceNm: 4.8, activeBufferNm: 2.0 },
      timestamp: '05:42:20 IST'
    }
  ],
  telemetrySources: ['IMD Wind Radar', 'INCOIS PFZ Griddap', 'MOSDAC SST', 'IMBL Boundary Geofence'],
  crossSourceConflicts: [
    'INCOIS predicts 0.9m waves; IMD coastal radar detects localized 1.2m chop near Dhanushkodi channel. Reconciliation: Defaulted to conservative 1.2m safety ceiling.'
  ],
  whatIfSuggestions: [
    'What if I leave at 03:00 AM instead?',
    'What if wind increases to 22 kts?',
    'What if engine runs at 60% power?'
  ],
  confidenceScore: 94,
  timestamp: '05:45 IST'
};

export const MOCK_ALERTS: SafetyAlert[] = [
  {
    id: 'alert-01',
    type: 'BOUNDARY_GUARDIAN',
    severity: 'WARNING',
    title: 'IMBL Proximity Notice',
    message: 'Coast Guard exercise active near IMBL boundary. Maintain minimum 2.0 NM buffer at all times.',
    timestamp: '04:30 IST',
    location: 'Palk Bay Sector 3',
    distanceToBoundaryNm: 2.4,
    recommendedAction: 'Keep route within active Safe Corridor. Do not cross red buffer line.',
    acknowledged: false
  },
  {
    id: 'alert-02',
    type: 'RETURN_WINDOW',
    severity: 'CRITICAL',
    title: 'Safe Return Window Reminder',
    message: 'Wind shift predicted at 11:30 AM. Departure recommended by 04:30 AM to return safely by 12:00 PM.',
    timestamp: '05:15 IST',
    location: 'Gulf of Mannar',
    recommendedAction: 'Plan trip to return before 11:30 AM.',
    acknowledged: false
  },
  {
    id: 'alert-03',
    type: 'WEATHER_WARNING',
    severity: 'INFO',
    title: 'High Tide Schedule',
    message: 'High tide peak expected at 08:20 AM. Favorable depth over Mandapam reef channel.',
    timestamp: '03:00 IST',
    location: 'Mandapam Jetty Channel',
    recommendedAction: 'Clear channel before low tide at 14:10 PM.',
    acknowledged: true
  }
];

export const MOCK_NEWS_ADVISORIES: NewsAdvisory[] = [
  {
    id: 'news-01',
    type: 'PFZ_BULLETIN',
    title: 'Good Pelagic Shoal Density Detected',
    source: 'INCOIS Marine Advisory Unit',
    summary: 'High density pelagic shoal detected 8.2 NM South-East (Sardinella & Mackerel). Mandapam SE waters • Valid until sunrise tomorrow.',
    timestamp: 'Updated 42m ago',
    badge: 'Shoal Detected',
    isUrgent: false
  },
  {
    id: 'news-02',
    type: 'WEATHER_RADAR',
    title: 'Localized Wind Shift Alert for Palk Bay',
    source: 'IMD Coastal Met Station',
    summary: 'South-westerly winds expected to strengthen from 11 kts to 18-20 kts after 11:30 AM. Sea state transitions to slight-to-moderate chop.',
    timestamp: 'Updated 1h ago',
    badge: 'Weather Shift',
    isUrgent: true
  },
  {
    id: 'news-03',
    type: 'COAST_GUARD',
    title: 'Navigational Warning: IMBL Channel Patrol',
    source: 'Indian Coast Guard Mandapam',
    summary: 'Joint coastal security exercise active 4.5 NM East of Dhanushkodi light. All traditional fishing vessels advised to maintain 2.0 NM buffer.',
    timestamp: 'Notice 04:30 IST',
    badge: 'Nav Warning',
    isUrgent: true
  },
  {
    id: 'news-04',
    type: 'HARBOR_NOTICE',
    title: 'Rameswaram South Jetty Dredging Completed',
    source: 'Fisheries Department TN',
    summary: 'South harbor entrance depth restored to 4.2m at low tide. Safe passage available for all 22ft–35ft crafts.',
    timestamp: 'Yesterday',
    badge: 'Harbor Notice',
    isUrgent: false
  }
];

export const SUGGESTED_QUERIES = [
  'Can I go fishing tomorrow morning?',
  'Where is fishing good today?',
  'Is the weather safe after noon?'
];
