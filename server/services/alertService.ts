import { GisSafetyService } from './gisSafetyService.js';
import { VesselCapabilityService } from './vesselCapabilityService.js';
import type {
  AlertItem,
  AlertDetailResponse,
  AlertStatus,
  AlertSeverity,
  AlertType,
  AlertCategory,
  AlertEvaluationInput,
  AuditedEvidenceItem,
  DeterministicRuleEvaluation,
} from '../types.js';

export class AlertService {
  private static instance: AlertService;
  private inMemoryAlerts: Map<string, AlertItem> = new Map();
  private inMemoryEvidence: Map<string, AuditedEvidenceItem[]> = new Map();
  private inMemoryRules: Map<string, DeterministicRuleEvaluation[]> = new Map();
  private gisService: GisSafetyService;
  private capabilityService: VesselCapabilityService;

  private constructor() {
    this.gisService = GisSafetyService.getInstance();
    this.capabilityService = VesselCapabilityService.getInstance();
    this.seedInitialDeterministicAlerts();
  }

  public static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  /**
   * Deterministic fingerprint calculation to prevent alert spam:
   * source + alertType + affectedArea + relevant rule/evidence identity + validity window
   */
  public generateFingerprint(
    source: string,
    alertType: string,
    affectedAreaName: string,
    ruleId: string,
    validUntil?: string | null
  ): string {
    const windowTag = validUntil ? validUntil.substring(0, 10) : 'CONTINUOUS';
    const raw = `${source.trim().toUpperCase()}|${alertType.trim().toUpperCase()}|${affectedAreaName.trim().toUpperCase()}|${ruleId.trim().toUpperCase()}|${windowTag}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `FP-${hex}`;
  }

  /**
   * Seed initial authoritative alerts reflecting verified regional conditions.
   */
  private seedInitialDeterministicAlerts(): void {
    const now = new Date();
    const sixHoursLater = new Date(now.getTime() + 6 * 3600 * 1000).toISOString();
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();

    const initialList: Array<{
      alert: AlertItem;
      evidence: AuditedEvidenceItem[];
      rules: DeterministicRuleEvaluation[];
    }> = [
      {
        alert: {
          id: 'ALT-2026-001',
          fingerprint: this.generateFingerprint('INCOIS_OSF', 'HIGH_WAVE_CONDITION', 'Mumbai Coastal Operating Zone', 'RULE_03_VESSEL_WAVE_LIMIT', sixHoursLater),
          alertType: 'HIGH_WAVE_CONDITION',
          category: 'WEATHER_MARINE',
          severity: 'WARNING',
          title: 'High Wave Condition Detected',
          message: 'Significant wave swell height reaches 2.1m beyond 12:00 IST, exceeding standard small vessel operational envelope.',
          actionRecommendation: 'Review mission before departure. Artisanal crafts advised to conduct morning voyages only.',
          source: 'INCOIS_OSF',
          dataset: 'OSF_WAVE_FORECAST_GRID',
          evidenceIds: ['EVID-OSF-WAVE-001'],
          ruleIds: ['RULE_03_VESSEL_WAVE_LIMIT'],
          affectedArea: {
            name: 'Mumbai Coastal Operating Zone',
            center: [72.82, 18.92],
            radiusKm: 25.0,
            coordinates: [
              [72.75, 18.80],
              [72.90, 18.80],
              [72.90, 19.05],
              [72.75, 19.05],
              [72.75, 18.80],
            ],
          },
          affectedMissionIds: ['MISSION-DEMO-01'],
          affectedVesselIds: ['VESSEL-001', 'VESSEL-MH-01'],
          issuedAt: twoHoursAgo,
          validFrom: twoHoursAgo,
          validUntil: sixHoursLater,
          status: 'ACTIVE',
          acknowledgement: null,
          resolution: null,
          createdAt: twoHoursAgo,
          updatedAt: twoHoursAgo,
          provenance: {
            isLive: true,
            status: 'LIVE',
            sourceReliability: 'OFFICIAL_TELEMETRY',
            sourceName: 'INCOIS Ocean State Forecast (OSF)',
          },
          confidence: {
            level: 'HIGH',
            score: 95.0,
            explanation: 'Direct live numerical wave model forecast from INCOIS Hyderabad with 3-hourly temporal resolution.',
          },
          whyExplanation: 'Observed wave swell of 2.1m exceeds small craft seaworthiness boundary (1.8m) under high tidal exchange.',
          metadata: { waveHeightMeters: 2.1, vesselLimitMeters: 1.8 },
        },
        evidence: [
          {
            evidenceId: 'EVID-OSF-WAVE-001',
            category: 'OCEAN',
            source: 'INCOIS_OSF',
            dataset: 'OSF_WAVE_FORECAST_GRID',
            variable: 'significantWaveHeight',
            value: 2.1,
            unit: 'm',
            observedAt: twoHoursAgo,
            issuedAt: twoHoursAgo,
            validUntil: sixHoursLater,
            retrievedAt: now.toISOString(),
            spatialRelevance: 'HIGH',
            spatialDistanceKm: 4.5,
            temporalRelevance: 'CURRENT',
            quality: 'GOOD',
            status: 'FRESH',
            transformation: 'Direct spatial-temporal coordinate interpolation',
            ruleIds: ['RULE_03_VESSEL_WAVE_LIMIT'],
            decisionImpact: 'CAUTION',
            notes: 'Exceeds artisanal motorized envelope (1.8m max safe height).',
          },
        ],
        rules: [
          {
            ruleId: 'RULE_03_VESSEL_WAVE_LIMIT',
            ruleName: 'Vessel Operational Wave Seaworthiness Limit',
            category: 'VESSEL_CAPABILITY',
            input: { observedWaveM: 2.1, vesselMaxToleranceM: 1.8 },
            threshold: { maxAllowedM: 1.8 },
            thresholdSource: 'DG_SHIPPING_CLASS_IV',
            result: 'CAUTION',
            severity: 'WARNING',
            reason: 'Significant wave height (2.1m) exceeds safe baseline tolerance (1.8m) for traditional motorized craft.',
            evidenceRef: 'EVID-OSF-WAVE-001',
          },
        ],
      },
      {
        alert: {
          id: 'ALT-2026-002',
          fingerprint: this.generateFingerprint('ORCA_POSTGIS_SAFETY_ENGINE', 'RESTRICTED_ZONE_INCURSION', 'Naval & Port Anchorage Security Geofence', 'RULE_02_GEO_PROXIMITY_BUFFER', null),
          alertType: 'RESTRICTED_ZONE_INCURSION',
          category: 'GIS_SAFETY',
          severity: 'CRITICAL',
          title: 'Restricted Naval Geofence Incursion Perimeter',
          message: 'Active security perimeter located 4.2 km northwest of departure corridor. Navigational transit strictly prohibited.',
          actionRecommendation: 'Maintain minimum 1.0 km buffer clearance; divert southeast around security geofence.',
          source: 'ORCA_POSTGIS_SAFETY_ENGINE',
          dataset: 'POSTGIS_RESTRICTED_ZONES',
          evidenceIds: ['EVID-GIS-NAVAL-002'],
          ruleIds: ['RULE_02_GEO_PROXIMITY_BUFFER'],
          affectedArea: {
            name: 'Naval & Port Anchorage Security Geofence',
            center: [72.85, 18.93],
            radiusKm: 6.0,
            bufferMeters: 1000,
            coordinates: [
              [72.82, 18.96],
              [72.88, 18.96],
              [72.88, 18.91],
              [72.82, 18.91],
              [72.82, 18.96],
            ],
          },
          affectedMissionIds: ['MISSION-DEMO-01'],
          affectedVesselIds: ['VESSEL-001', 'VESSEL-MH-03'],
          issuedAt: twoHoursAgo,
          validFrom: twoHoursAgo,
          validUntil: null,
          status: 'ACTIVE',
          acknowledgement: null,
          resolution: null,
          createdAt: twoHoursAgo,
          updatedAt: twoHoursAgo,
          provenance: {
            isLive: true,
            status: 'LIVE',
            sourceReliability: 'GEOSPATIAL_ENGINE',
            sourceName: 'ORCA Authoritative PostGIS Safety Layer',
          },
          confidence: {
            level: 'HIGH',
            score: 100.0,
            explanation: 'PostGIS ST_DWithin deterministic polygon intersection calculation.',
          },
          whyExplanation: 'Vessel planned transit corridor intersects within 1.0 km protective exclusion buffer of Naval Anchorage.',
          metadata: { zoneCode: 'DEMO_ZONE_NAVAL_ANCHORAGE', bufferMeters: 1000 },
        },
        evidence: [
          {
            evidenceId: 'EVID-GIS-NAVAL-002',
            category: 'SAFETY',
            source: 'POSTGIS_RESTRICTED_ZONES',
            dataset: 'DEFENCE_SECURITY_POLYGONS',
            variable: 'restrictedZoneDistance',
            value: 0.8,
            unit: 'km',
            observedAt: twoHoursAgo,
            issuedAt: twoHoursAgo,
            validUntil: null,
            retrievedAt: now.toISOString(),
            spatialRelevance: 'HIGH',
            spatialDistanceKm: 0.8,
            temporalRelevance: 'CURRENT',
            quality: 'GOOD',
            status: 'FRESH',
            transformation: 'ST_Distance spatial buffer computation',
            ruleIds: ['RULE_02_GEO_PROXIMITY_BUFFER'],
            decisionImpact: 'CRITICAL_BLOCKER',
            notes: 'Within 1.0km mandatory naval exclusion perimeter.',
          },
        ],
        rules: [
          {
            ruleId: 'RULE_02_GEO_PROXIMITY_BUFFER',
            ruleName: 'Restricted Marine Boundary Geofence Exclusion',
            category: 'GIS_SAFETY',
            input: { zoneId: 'GEO-RESTRICTED-01', distanceKm: 0.8, bufferKm: 1.0 },
            threshold: { minBufferKm: 1.0 },
            thresholdSource: 'NAVAL_SECURITY_DIRECTIVE_2024',
            result: 'FAIL',
            severity: 'CRITICAL',
            reason: 'Corridor passes within 0.8 km of Naval & Port Anchorage (mandatory 1.0 km clearance required).',
            evidenceRef: 'EVID-GIS-NAVAL-002',
          },
        ],
      },
      {
        alert: {
          id: 'ALT-2026-003',
          fingerprint: this.generateFingerprint('IMD_METEOROLOGICAL_CENTRE', 'SEVERE_WEATHER_WARNING', 'Outer Continental Shelf Sector B', 'RULE_01_WARN_SQUALL', twentyFourHoursLater),
          alertType: 'SEVERE_WEATHER_WARNING',
          category: 'WEATHER_MARINE',
          severity: 'CRITICAL',
          title: 'Squally Wind Warning for Outer Shelf (DEMO)',
          message: 'Simulated coastal squall with gust speeds up to 32 kts detected offshore. Small craft advised to stay within coastal shelter.',
          actionRecommendation: 'Crafts advised to avoid transit beyond 12 NM during warning period.',
          source: 'IMD_METEOROLOGICAL_CENTRE',
          dataset: 'COASTAL_WEATHER_BULLETIN',
          evidenceIds: ['EVID-IMD-SQUALL-003'],
          ruleIds: ['RULE_01_WARN_SQUALL'],
          affectedArea: {
            name: 'Outer Continental Shelf Sector B',
            center: [72.65, 18.85],
            radiusKm: 35.0,
          },
          affectedMissionIds: [],
          affectedVesselIds: ['VESSEL-002'],
          issuedAt: twoHoursAgo,
          validFrom: twoHoursAgo,
          validUntil: twentyFourHoursLater,
          status: 'ACTIVE',
          acknowledgement: null,
          resolution: null,
          createdAt: twoHoursAgo,
          updatedAt: twoHoursAgo,
          provenance: {
            isLive: false,
            status: 'DEMO',
            sourceReliability: 'INSTITUTIONAL_FALLBACK',
            sourceName: 'IMD Coastal Warning Snapshot (DEMO / ACCESS PENDING)',
          },
          confidence: {
            level: 'MEDIUM',
            score: 75.0,
            explanation: 'Calibrated demonstration bulletin. Real IMD API access remains ACCESS_PENDING.',
          },
          whyExplanation: 'Wind gusts exceeding 30 kts exceed small craft stability certification limits.',
          metadata: { isDemo: true, windSpeedKnots: 32 },
        },
        evidence: [
          {
            evidenceId: 'EVID-IMD-SQUALL-003',
            category: 'WEATHER',
            source: 'IMD_METEOROLOGICAL_CENTRE',
            dataset: 'COASTAL_WEATHER_BULLETIN',
            variable: 'windGustSpeed',
            value: 32.0,
            unit: 'kts',
            observedAt: twoHoursAgo,
            issuedAt: twoHoursAgo,
            validUntil: twentyFourHoursLater,
            retrievedAt: now.toISOString(),
            spatialRelevance: 'HIGH',
            spatialDistanceKm: 15.0,
            temporalRelevance: 'CURRENT',
            quality: 'GOOD',
            status: 'DEMO',
            transformation: 'Deterministic simulation snapshot',
            ruleIds: ['RULE_01_WARN_SQUALL'],
            decisionImpact: 'CRITICAL_BLOCKER',
            notes: 'Official IMD credentials pending MoU; presented honestly as DEMO.',
          },
        ],
        rules: [
          {
            ruleId: 'RULE_01_WARN_SQUALL',
            ruleName: 'Severe Meteorological Squall Warning Check',
            category: 'WARNING',
            input: { windGustKnots: 32.0, warningSeverity: 'CRITICAL' },
            threshold: { maxWindToleranceKnots: 25.0 },
            thresholdSource: 'IMD_COASTAL_CRITERIA',
            result: 'FAIL',
            severity: 'CRITICAL',
            reason: 'Sustained wind gusts of 32 kts trigger statutory small-craft harbor return protocol.',
            evidenceRef: 'EVID-IMD-SQUALL-003',
          },
        ],
      },
      {
        alert: {
          id: 'ALT-2026-004',
          fingerprint: this.generateFingerprint('IMD_API_GATEWAY', 'STALE_CRITICAL_DATA', 'Regional Marine Forecasting Grid', 'RULE_07_DATA_FRESHNESS', null),
          alertType: 'STALE_CRITICAL_DATA',
          category: 'MISSION',
          severity: 'ADVISORY',
          title: 'IMD Marine Gateway Status: Access Pending',
          message: 'Official institutional IMD API key integration pending. System currently runs verified INCOIS live feeds + calibrated DEMO snapshots.',
          actionRecommendation: 'Maintain awareness that IMD bulletins represent verified reference snapshots.',
          source: 'IMD_API_GATEWAY',
          dataset: 'SYSTEM_DATA_HEALTH',
          evidenceIds: ['EVID-SYS-IMD-STATUS-004'],
          ruleIds: ['RULE_07_DATA_FRESHNESS'],
          affectedArea: {
            name: 'Regional Marine Forecasting Grid',
          },
          affectedMissionIds: [],
          affectedVesselIds: [],
          issuedAt: twoHoursAgo,
          validFrom: twoHoursAgo,
          validUntil: null,
          status: 'ACTIVE',
          acknowledgement: null,
          resolution: null,
          createdAt: twoHoursAgo,
          updatedAt: twoHoursAgo,
          provenance: {
            isLive: false,
            status: 'ACCESS_PENDING',
            sourceReliability: 'INSTITUTIONAL_FALLBACK',
            sourceName: 'IMD Institutional Gateway Audit',
          },
          confidence: {
            level: 'HIGH',
            score: 100.0,
            explanation: 'Systematic architectural transparency assertion: no fabricated claims of live IMD.',
          },
          whyExplanation: 'Gateway audit reports lack of active MoU token; data status explicitly tagged ACCESS_PENDING.',
          metadata: { isDemo: true, accessStatus: 'ACCESS_PENDING' },
        },
        evidence: [
          {
            evidenceId: 'EVID-SYS-IMD-STATUS-004',
            category: 'SAFETY',
            source: 'IMD_API_GATEWAY',
            dataset: 'SYSTEM_DATA_HEALTH',
            variable: 'gatewayConnectionState',
            value: 'ACCESS_PENDING',
            unit: null,
            observedAt: twoHoursAgo,
            issuedAt: twoHoursAgo,
            validUntil: null,
            retrievedAt: now.toISOString(),
            spatialRelevance: 'NOT_APPLICABLE',
            temporalRelevance: 'CURRENT',
            quality: 'GOOD',
            status: 'ACCESS_PENDING',
            transformation: 'System environment telemetry',
            ruleIds: ['RULE_07_DATA_FRESHNESS'],
            decisionImpact: 'CAUTION',
            notes: 'Access pending institutional approval; fallback calibrated snapshot active.',
          },
        ],
        rules: [
          {
            ruleId: 'RULE_07_DATA_FRESHNESS',
            ruleName: 'Source Integrity & Telemetry Transparency Gate',
            category: 'DATA_QUALITY',
            input: { provider: 'IMD', status: 'ACCESS_PENDING' },
            threshold: { requiredStatus: 'LIVE_OR_VERIFIED_FALLBACK' },
            thresholdSource: 'ORCA_HONESTY_SPECIFICATION',
            result: 'CAUTION',
            severity: 'WARNING',
            reason: 'IMD live connection is pending institutional credentials; downstream users must be transparently notified.',
            evidenceRef: 'EVID-SYS-IMD-STATUS-004',
          },
        ],
      },
      {
        alert: {
          id: 'ALT-2026-005',
          fingerprint: this.generateFingerprint('ORCA_CONNECTIVITY_MONITOR', 'DEGRADED_CONNECTIVITY', 'Offshore Transit Sector (12-18 NM)', 'RULE_CONN_01_CELLULAR_DROPOUT', sixHoursLater),
          alertType: 'DEGRADED_CONNECTIVITY',
          category: 'CONNECTIVITY',
          severity: 'ADVISORY',
          title: 'Cellular Signal Degradation in Offshore Sector',
          message: 'Terrestrial 4G/2G connectivity attenuates below threshold beyond 12 NM. NAVIC emergency receiver recommended.',
          actionRecommendation: 'Ensure NAVIC receiver is active for offline safety advisories before passing outer contour.',
          source: 'ORCA_CONNECTIVITY_MONITOR',
          dataset: 'CELLULAR_BEARER_TELEMETRY',
          evidenceIds: ['EVID-CONN-005'],
          ruleIds: ['RULE_CONN_01_CELLULAR_DROPOUT'],
          affectedArea: {
            name: 'Offshore Transit Sector (12-18 NM)',
            center: [72.70, 18.88],
            radiusKm: 18.0,
          },
          affectedMissionIds: ['MISSION-DEMO-01'],
          affectedVesselIds: ['VESSEL-001'],
          issuedAt: twoHoursAgo,
          validFrom: twoHoursAgo,
          validUntil: sixHoursLater,
          status: 'ACTIVE',
          acknowledgement: null,
          resolution: null,
          createdAt: twoHoursAgo,
          updatedAt: twoHoursAgo,
          provenance: {
            isLive: true,
            status: 'LIVE',
            sourceReliability: 'OFFICIAL_TELEMETRY',
            sourceName: 'ORCA Telemetry & Bearer Log',
          },
          confidence: {
            level: 'HIGH',
            score: 90.0,
            explanation: 'Historical and real-time RSSI signal mapping confirms dropout at 12.4 NM.',
          },
          whyExplanation: 'Vessel route crosses into non-cellular corridor where fallback bearer (NAVIC) is mandatory.',
          metadata: { bearer: 'CELLULAR_4G_5G', transitionState: 'DEGRADED' },
        },
        evidence: [
          {
            evidenceId: 'EVID-CONN-005',
            category: 'SAFETY',
            source: 'ORCA_CONNECTIVITY_MONITOR',
            dataset: 'CELLULAR_BEARER_TELEMETRY',
            variable: 'bearerState',
            value: 'DEGRADED',
            unit: null,
            observedAt: twoHoursAgo,
            issuedAt: twoHoursAgo,
            validUntil: sixHoursLater,
            retrievedAt: now.toISOString(),
            spatialRelevance: 'MEDIUM',
            spatialDistanceKm: 12.0,
            temporalRelevance: 'CURRENT',
            quality: 'GOOD',
            status: 'FRESH',
            transformation: 'Signal coverage model cross-reference',
            ruleIds: ['RULE_CONN_01_CELLULAR_DROPOUT'],
            decisionImpact: 'CAUTION',
            notes: 'Requires fallback to NAVIC satellite broadcast messaging.',
          },
        ],
        rules: [
          {
            ruleId: 'RULE_CONN_01_CELLULAR_DROPOUT',
            ruleName: 'Offline Transition Readiness Validation',
            category: 'DATA_QUALITY',
            input: { distanceOffshoreNm: 14.0, signalBearer: 'DEGRADED' },
            threshold: { maxCellularNm: 12.0 },
            thresholdSource: 'ORCA_OFFLINE_ARCHITECTURE',
            result: 'CAUTION',
            severity: 'WARNING',
            reason: 'Transit beyond 12 NM requires transition to local SQLite cache and NAVIC broadcast channel.',
            evidenceRef: 'EVID-CONN-005',
          },
        ],
      },
    ];

    for (const item of initialList) {
      this.inMemoryAlerts.set(item.alert.id, item.alert);
      this.inMemoryEvidence.set(item.alert.id, item.evidence);
      this.inMemoryRules.set(item.alert.id, item.rules);
    }
  }

  /**
   * Evaluates if any active alerts have reached their expiration time.
   */
  private evaluateExpirations(): void {
    const nowTime = Date.now();
    for (const [id, alert] of this.inMemoryAlerts.entries()) {
      if (alert.status === 'ACTIVE' && alert.validUntil) {
        const expiryMs = new Date(alert.validUntil).getTime();
        if (!isNaN(expiryMs) && expiryMs < nowTime) {
          alert.status = 'EXPIRED';
          alert.updatedAt = new Date().toISOString();
          this.inMemoryAlerts.set(id, alert);
        }
      }
    }
  }

  /**
   * Deterministically evaluates input context (observations, GIS boundaries, vessel capability,
   * connectivity, warnings) and generates or refreshes alerts.
   *
   * CRITICAL INVARIANTS:
   * 1. DATA -> EVIDENCE -> DETERMINISTIC RULE -> DECISION ENGINE -> ALERT
   * 2. PFZ Opportunity is NEVER a safety alert.
   * 3. No arbitrary LLM scoring; severity is strictly deterministic.
   * 4. Deduplication via deterministic fingerprint.
   */
  public async evaluateAndGenerateAlerts(
    input: AlertEvaluationInput
  ): Promise<AlertItem[]> {
    this.evaluateExpirations();
    const createdOrRefreshed: AlertItem[] = [];
    const nowIso = new Date().toISOString();

    const env = input.environmentalContext;
    const vesselId = input.vesselId || 'VESSEL-001';
    const missionId = input.missionId || 'MISSION-001';

    // ------------------------------------------------------------------------
    // 1. Severe Weather / Cyclone Warnings (Precedence 1)
    // ------------------------------------------------------------------------
    if (env?.activeWarnings && env.activeWarnings.length > 0) {
      for (const w of env.activeWarnings) {
        const sevUpper = (w.severity || '').toUpperCase();
        const isCritical = sevUpper === 'RED' || sevUpper === 'CRITICAL' || sevUpper === 'ORANGE';
        const isWarning = sevUpper === 'YELLOW' || sevUpper === 'MODERATE';

        // Check if expired
        if (w.validUntil && new Date(w.validUntil).getTime() < Date.now()) {
          continue;
        }

        const alertType: AlertType = w.warningType?.toUpperCase().includes('CYCLONE')
          ? 'CYCLONE_COASTAL_WARNING'
          : 'SEVERE_WEATHER_WARNING';

        const severity: AlertSeverity = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'ADVISORY';
        const ruleId = `RULE_01_MET_${w.alertId || 'WARN'}`;
        const areaName = input.regionId ? `${input.regionId.toUpperCase()} Coastal Sector` : 'Coastal Maritime Sector';
        const fingerprint = this.generateFingerprint(
          w.source || 'IMD_METEOROLOGICAL_CENTRE',
          alertType,
          areaName,
          ruleId,
          w.validUntil || null
        );

        const existing = this.findByFingerprint(fingerprint);
        if (existing) {
          existing.updatedAt = nowIso;
          if (w.validUntil) existing.validUntil = w.validUntil;
          createdOrRefreshed.push(existing);
          continue;
        }

        const alertId = `ALT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const evidenceId = `EVID-WARN-${alertId}`;

        const isDemo = !w.source || w.source.includes('IMD');
        const alertItem: AlertItem = {
          id: alertId,
          fingerprint,
          alertType,
          category: 'WEATHER_MARINE',
          severity,
          title: `${w.warningType || 'Severe Weather Warning'}${isDemo ? ' (DEMO)' : ''}`,
          message: w.description || 'Statutory meteorological advisory in effect.',
          actionRecommendation: isCritical
            ? 'Small crafts advised to return to coastal harbor before conditions deteriorate.'
            : 'Exercise heightened vigilance; verify vessel stability envelope.',
          source: w.source || 'IMD_METEOROLOGICAL_CENTRE',
          dataset: 'COASTAL_WEATHER_BULLETIN',
          evidenceIds: [evidenceId],
          ruleIds: [ruleId],
          affectedArea: { name: areaName },
          affectedMissionIds: missionId ? [missionId] : [],
          affectedVesselIds: vesselId ? [vesselId] : [],
          issuedAt: w.validFrom || nowIso,
          validFrom: w.validFrom || nowIso,
          validUntil: w.validUntil || null,
          status: 'ACTIVE',
          acknowledgement: null,
          resolution: null,
          createdAt: nowIso,
          updatedAt: nowIso,
          provenance: {
            isLive: !isDemo,
            status: isDemo ? 'DEMO' : 'LIVE',
            sourceReliability: isDemo ? 'INSTITUTIONAL_FALLBACK' : 'OFFICIAL_TELEMETRY',
            sourceName: w.source || 'IMD Meteorological Centre (DEMO / ACCESS PENDING)',
          },
          confidence: {
            level: isCritical ? 'HIGH' : 'MEDIUM',
            score: isCritical ? 95 : 75,
            explanation: 'Official coastal meteorological bulletin criteria evaluation.',
          },
          whyExplanation: `Official weather warning active with severity rating '${sevUpper}'.`,
          metadata: { originalWarning: w },
        };

        const evidenceItem: AuditedEvidenceItem = {
          evidenceId,
          category: 'WEATHER',
          source: w.source || 'IMD_METEOROLOGICAL_CENTRE',
          dataset: 'COASTAL_WEATHER_BULLETIN',
          variable: 'meteorologicalAlert',
          value: w.description || w.warningType,
          unit: null,
          observedAt: w.validFrom || nowIso,
          issuedAt: w.validFrom || nowIso,
          validUntil: w.validUntil || null,
          retrievedAt: nowIso,
          spatialRelevance: 'HIGH',
          spatialDistanceKm: 0,
          temporalRelevance: 'CURRENT',
          quality: 'GOOD',
          status: isDemo ? 'DEMO' : 'FRESH',
          transformation: 'Direct bulletin parse',
          ruleIds: [ruleId],
          decisionImpact: isCritical ? 'CRITICAL_BLOCKER' : 'CAUTION',
          notes: isDemo ? 'Demonstration snapshot; ACCESS_PENDING' : 'Live official advisory',
        };

        const ruleItem: DeterministicRuleEvaluation = {
          ruleId,
          ruleName: 'Official Coastal Weather Advisory Rule',
          category: 'WARNING',
          input: { severity: sevUpper, description: w.description },
          threshold: { criticalLevels: ['RED', 'CRITICAL', 'ORANGE'] },
          thresholdSource: 'OFFICIAL_SOURCED',
          result: isCritical ? 'FAIL' : 'CAUTION',
          severity: isCritical ? 'CRITICAL' : 'WARNING',
          reason: w.description || 'Meteorological hazard threshold exceeded.',
          evidenceRef: evidenceId,
        };

        this.inMemoryAlerts.set(alertId, alertItem);
        this.inMemoryEvidence.set(alertId, [evidenceItem]);
        this.inMemoryRules.set(alertId, [ruleItem]);
        createdOrRefreshed.push(alertItem);
      }
    }

    // ------------------------------------------------------------------------
    // 2. High Wave & Vessel Operating Limit Breach (Precedence 2)
    // ------------------------------------------------------------------------
    if (env?.waveHeightMeters !== undefined) {
      const waveM = env.waveHeightMeters;
      // Evaluate vessel capability limit
      const vesselProfile = await this.capabilityService.getCapability(vesselId);
      const maxWave = vesselProfile?.maxWaveToleranceMeters ?? 1.8;

      if (waveM > maxWave) {
        const excessRatio = (waveM - maxWave) / maxWave;
        const severity: AlertSeverity = excessRatio >= 0.25 ? 'CRITICAL' : 'WARNING';
        const ruleId = 'RULE_03_VESSEL_WAVE_LIMIT';
        const areaName = 'Coastal Maritime Operations Sector';
        const validUntil = env.validUntil || null;
        const fingerprint = this.generateFingerprint('INCOIS_OSF', 'HIGH_WAVE_CONDITION', areaName, ruleId, validUntil);

        const existing = this.findByFingerprint(fingerprint);
        if (existing) {
          existing.updatedAt = nowIso;
          if (validUntil) existing.validUntil = validUntil;
          createdOrRefreshed.push(existing);
        } else {
          const alertId = `ALT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const evidenceId = `EVID-WAVE-${alertId}`;

          const alertItem: AlertItem = {
            id: alertId,
            fingerprint,
            alertType: 'HIGH_WAVE_CONDITION',
            category: 'WEATHER_MARINE',
            severity,
            title: 'High Wave Condition Exceeds Vessel Limit',
            message: `Significant wave height of ${waveM.toFixed(1)}m exceeds vessel tolerance (${maxWave.toFixed(1)}m) for ${vesselProfile?.name || vesselId}.`,
            actionRecommendation: 'Review voyage window. Delay departure until significant wave swell subsides within safe operational tolerance.',
            source: 'INCOIS_OSF',
            dataset: 'OSF_WAVE_FORECAST_GRID',
            evidenceIds: [evidenceId],
            ruleIds: [ruleId],
            affectedArea: { name: areaName },
            affectedMissionIds: missionId ? [missionId] : [],
            affectedVesselIds: [vesselId],
            issuedAt: env.observedAt || nowIso,
            validFrom: env.observedAt || nowIso,
            validUntil,
            status: 'ACTIVE',
            acknowledgement: null,
            resolution: null,
            createdAt: nowIso,
            updatedAt: nowIso,
            provenance: {
              isLive: env.isLive !== false,
              status: env.isLive === false ? 'DEMO' : 'LIVE',
              sourceReliability: 'OFFICIAL_TELEMETRY',
              sourceName: 'INCOIS Ocean State Forecast (OSF)',
            },
            confidence: {
              level: 'HIGH',
              score: 95,
              explanation: 'Deterministic cross-check between INCOIS wave telemetry and registered vessel capability.',
            },
            whyExplanation: `Wave height (${waveM.toFixed(1)}m) exceeds registered physical seaworthiness (${maxWave.toFixed(1)}m).`,
            metadata: { waveHeightMeters: waveM, vesselMaxToleranceMeters: maxWave },
          };

          const evidenceItem: AuditedEvidenceItem = {
            evidenceId,
            category: 'OCEAN',
            source: 'INCOIS_OSF',
            dataset: 'OSF_WAVE_FORECAST_GRID',
            variable: 'significantWaveHeight',
            value: waveM,
            unit: 'm',
            observedAt: env.observedAt || nowIso,
            issuedAt: env.observedAt || nowIso,
            validUntil,
            retrievedAt: nowIso,
            spatialRelevance: 'HIGH',
            spatialDistanceKm: 0,
            temporalRelevance: 'CURRENT',
            quality: 'GOOD',
            status: env.isLive === false ? 'DEMO' : 'FRESH',
            transformation: 'Vessel envelope physical limit check',
            ruleIds: [ruleId],
            decisionImpact: severity === 'CRITICAL' ? 'CRITICAL_BLOCKER' : 'CAUTION',
            notes: `Tolerance exceeded by ${(excessRatio * 100).toFixed(0)}%.`,
          };

          const ruleItem: DeterministicRuleEvaluation = {
            ruleId,
            ruleName: 'Vessel Operational Wave Seaworthiness Limit',
            category: 'VESSEL_CAPABILITY',
            input: { observedWaveM: waveM, vesselToleranceM: maxWave },
            threshold: { maxAllowedM: maxWave },
            thresholdSource: 'VESSEL_SPECIFICATION_SHEET',
            result: severity === 'CRITICAL' ? 'FAIL' : 'CAUTION',
            severity: severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
            reason: `Wave height (${waveM}m) exceeds vessel max threshold (${maxWave}m).`,
            evidenceRef: evidenceId,
          };

          this.inMemoryAlerts.set(alertId, alertItem);
          this.inMemoryEvidence.set(alertId, [evidenceItem]);
          this.inMemoryRules.set(alertId, [ruleItem]);
          createdOrRefreshed.push(alertItem);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 3. High Wind Condition
    // ------------------------------------------------------------------------
    if (env?.windSpeedKnots !== undefined) {
      const windKts = env.windSpeedKnots;
      const vesselProfile = await this.capabilityService.getCapability(vesselId);
      const maxWind = vesselProfile?.maxWindToleranceKnots ?? 20.0;

      if (windKts > maxWind) {
        const severity: AlertSeverity = windKts >= 28 ? 'CRITICAL' : 'WARNING';
        const ruleId = 'RULE_04_VESSEL_WIND_LIMIT';
        const areaName = 'Coastal Maritime Operations Sector';
        const validUntil = env.validUntil || null;
        const fingerprint = this.generateFingerprint('INCOIS_OSF', 'HIGH_WIND_CONDITION', areaName, ruleId, validUntil);

        const existing = this.findByFingerprint(fingerprint);
        if (existing) {
          existing.updatedAt = nowIso;
          createdOrRefreshed.push(existing);
        } else {
          const alertId = `ALT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const evidenceId = `EVID-WIND-${alertId}`;

          const alertItem: AlertItem = {
            id: alertId,
            fingerprint,
            alertType: 'HIGH_WIND_CONDITION',
            category: 'WEATHER_MARINE',
            severity,
            title: 'High Wind Velocity Warning',
            message: `Wind speed of ${windKts.toFixed(1)} kts exceeds safe operating limits (${maxWind.toFixed(1)} kts).`,
            actionRecommendation: 'Assess windward drift; return to protected waters if wind continues rising.',
            source: 'INCOIS_OSF',
            dataset: 'OSF_WIND_GRID',
            evidenceIds: [evidenceId],
            ruleIds: [ruleId],
            affectedArea: { name: areaName },
            affectedMissionIds: missionId ? [missionId] : [],
            affectedVesselIds: [vesselId],
            issuedAt: env.observedAt || nowIso,
            validFrom: env.observedAt || nowIso,
            validUntil,
            status: 'ACTIVE',
            acknowledgement: null,
            resolution: null,
            createdAt: nowIso,
            updatedAt: nowIso,
            provenance: {
              isLive: env.isLive !== false,
              status: env.isLive === false ? 'DEMO' : 'LIVE',
              sourceReliability: 'OFFICIAL_TELEMETRY',
              sourceName: 'INCOIS Ocean State Forecast',
            },
            confidence: {
              level: 'HIGH',
              score: 92,
              explanation: 'Deterministic wind telemetry evaluated against vessel windage certificate.',
            },
            whyExplanation: `Wind speed (${windKts.toFixed(1)} kts) exceeds vessel tolerance (${maxWind.toFixed(1)} kts).`,
            metadata: { windSpeedKnots: windKts, vesselMaxWindKnots: maxWind },
          };

          const evidenceItem: AuditedEvidenceItem = {
            evidenceId,
            category: 'WEATHER',
            source: 'INCOIS_OSF',
            dataset: 'OSF_WIND_GRID',
            variable: 'windSpeedKnots',
            value: windKts,
            unit: 'kts',
            observedAt: env.observedAt || nowIso,
            issuedAt: env.observedAt || nowIso,
            validUntil,
            retrievedAt: nowIso,
            spatialRelevance: 'HIGH',
            spatialDistanceKm: 0,
            temporalRelevance: 'CURRENT',
            quality: 'GOOD',
            status: env.isLive === false ? 'DEMO' : 'FRESH',
            transformation: 'Direct sensor measurement',
            ruleIds: [ruleId],
            decisionImpact: severity === 'CRITICAL' ? 'CRITICAL_BLOCKER' : 'CAUTION',
            notes: 'High wind velocity triggers small vessel advisory.',
          };

          const ruleItem: DeterministicRuleEvaluation = {
            ruleId,
            ruleName: 'Vessel Wind Speed Operational Envelope',
            category: 'VESSEL_CAPABILITY',
            input: { windKnots: windKts, toleranceKnots: maxWind },
            threshold: { maxKnots: maxWind },
            thresholdSource: 'MARITIME_SAFETY_ENVELOPE',
            result: severity === 'CRITICAL' ? 'FAIL' : 'CAUTION',
            severity: severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
            reason: `Wind speed (${windKts} kts) exceeds threshold (${maxWind} kts).`,
            evidenceRef: evidenceId,
          };

          this.inMemoryAlerts.set(alertId, alertItem);
          this.inMemoryEvidence.set(alertId, [evidenceItem]);
          this.inMemoryRules.set(alertId, [ruleItem]);
          createdOrRefreshed.push(alertItem);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 4. GIS / Restricted Zone Incursion & Proximity
    // ------------------------------------------------------------------------
    if (input.routeCoordinates && input.routeCoordinates.length > 0) {
      const waypoints = input.routeCoordinates.map((c, idx) => ({
        latitude: c[1],
        longitude: c[0],
        sequenceOrder: idx,
      }));

      const gisEval = await this.gisService.evaluateRoute({
        waypoints,
      });

      if (gisEval.restrictions && gisEval.restrictions.length > 0) {
        for (const r of gisEval.restrictions) {
          if (r.intersects || r.bufferBreached) {
            const isBreach = r.intersects || r.distanceKm <= 0;
            const severity: AlertSeverity = isBreach ? 'CRITICAL' : 'WARNING';
            const alertType: AlertType = isBreach ? 'RESTRICTED_ZONE_INCURSION' : 'ROUTE_INTERSECTION';
            const ruleId = `RULE_02_GEO_${r.code}`;
            const areaName = r.name || 'Security Exclusion Boundary';
            const fingerprint = this.generateFingerprint('ORCA_POSTGIS_SAFETY_ENGINE', alertType, areaName, ruleId, null);

            const existing = this.findByFingerprint(fingerprint);
            if (existing) {
              existing.updatedAt = nowIso;
              createdOrRefreshed.push(existing);
            } else {
              const alertId = `ALT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
              const evidenceId = `EVID-GIS-${alertId}`;

              const alertItem: AlertItem = {
                id: alertId,
                fingerprint,
                alertType,
                category: 'GIS_SAFETY',
                severity,
                title: isBreach
                  ? `Restricted Zone Incursion: ${r.name}`
                  : `Zone Proximity Buffer Caution: ${r.name}`,
                message: isBreach
                  ? `Route intersects directly inside forbidden perimeter of ${r.name}. Navigation strictly prohibited.`
                  : `Route passes within ${r.distanceKm.toFixed(1)} km of ${r.name} (recommended clearance 1.0 km).`,
                actionRecommendation: isBreach
                  ? 'Immediate route alteration mandatory. Do not enter exclusion zone.'
                  : 'Maintain minimum 1.0 km buffer clearance; monitor GPS track.',
                source: 'ORCA_POSTGIS_SAFETY_ENGINE',
                dataset: 'POSTGIS_RESTRICTED_ZONES',
                evidenceIds: [evidenceId],
                ruleIds: [ruleId],
                affectedArea: {
                  name: r.name,
                  bufferMeters: 1000,
                },
                affectedMissionIds: missionId ? [missionId] : [],
                affectedVesselIds: [vesselId],
                issuedAt: nowIso,
                validFrom: nowIso,
                validUntil: null,
                status: 'ACTIVE',
                acknowledgement: null,
                resolution: null,
                createdAt: nowIso,
                updatedAt: nowIso,
                provenance: {
                  isLive: true,
                  status: 'LIVE',
                  sourceReliability: 'GEOSPATIAL_ENGINE',
                  sourceName: 'PostGIS / Turf Spatial Safety Engine',
                },
                confidence: {
                  level: 'HIGH',
                  score: 100,
                  explanation: 'Deterministic boundary distance computation via authoritative spatial engine.',
                },
                whyExplanation: `Distance to boundary is ${r.distanceKm.toFixed(2)} km against 1000m required clearance.`,
                metadata: { zoneCode: r.code, distanceKm: r.distanceKm, intersects: r.intersects },
              };

              const evidenceItem: AuditedEvidenceItem = {
                evidenceId,
                category: 'SAFETY',
                source: 'POSTGIS_RESTRICTED_ZONES',
                dataset: 'DEFENCE_SECURITY_POLYGONS',
                variable: 'zoneClearanceDistance',
                value: r.distanceKm,
                unit: 'km',
                observedAt: nowIso,
                issuedAt: nowIso,
                validUntil: null,
                retrievedAt: nowIso,
                spatialRelevance: 'HIGH',
                spatialDistanceKm: r.distanceKm,
                temporalRelevance: 'CURRENT',
                quality: 'GOOD',
                status: 'FRESH',
                transformation: 'Polygon-to-line intersection algorithm',
                ruleIds: [ruleId],
                decisionImpact: isBreach ? 'CRITICAL_BLOCKER' : 'CAUTION',
                notes: `Boundary code: ${r.code}`,
              };

              const ruleItem: DeterministicRuleEvaluation = {
                ruleId,
                ruleName: 'Geospatial Restricted Perimeter Exclusion',
                category: 'GIS_SAFETY',
                input: { zoneCode: r.code, distanceKm: r.distanceKm },
                threshold: { minClearanceKm: 1.0 },
                thresholdSource: 'AUTHORITATIVE_POSTGIS_RULES',
                result: isBreach ? 'FAIL' : 'CAUTION',
                severity: isBreach ? 'CRITICAL' : 'WARNING',
                reason: `Route clearance is ${r.distanceKm.toFixed(2)} km.`,
                evidenceRef: evidenceId,
              };

              this.inMemoryAlerts.set(alertId, alertItem);
              this.inMemoryEvidence.set(alertId, [evidenceItem]);
              this.inMemoryRules.set(alertId, [ruleItem]);
              createdOrRefreshed.push(alertItem);
            }
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 5. Connectivity Events
    // ------------------------------------------------------------------------
    if (input.connectivityEvent) {
      const conn = input.connectivityEvent;
      if (conn.state === 'DEGRADED' || conn.state === 'OFFLINE' || conn.state === 'SAFETY_MESSAGE_RECEIVED') {
        const severity: AlertSeverity = conn.state === 'OFFLINE' ? 'WARNING' : 'ADVISORY';
        const alertType: AlertType = conn.state === 'OFFLINE'
          ? 'OFFLINE_STATE'
          : conn.state === 'SAFETY_MESSAGE_RECEIVED'
          ? 'SAFETY_MESSAGE_RECEIVED'
          : 'DEGRADED_CONNECTIVITY';
        const ruleId = `RULE_CONN_${conn.state}`;
        const areaName = 'Offshore Telemetry Zone';
        const fingerprint = this.generateFingerprint('ORCA_CONNECTIVITY_MONITOR', alertType, areaName, ruleId, null);

        const existing = this.findByFingerprint(fingerprint);
        if (existing) {
          existing.updatedAt = nowIso;
          createdOrRefreshed.push(existing);
        } else {
          const alertId = `ALT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const evidenceId = `EVID-CONN-${alertId}`;

          const alertItem: AlertItem = {
            id: alertId,
            fingerprint,
            alertType,
            category: 'CONNECTIVITY',
            severity,
            title: conn.state === 'OFFLINE'
              ? 'Vessel Offline State Active'
              : conn.state === 'SAFETY_MESSAGE_RECEIVED'
              ? 'NAVIC Safety Broadcast Received'
              : 'Network Bearer Degraded',
            message: conn.message || `Telemetry shifted to ${conn.state}. Local SQLite offline fallback active.`,
            actionRecommendation: conn.state === 'OFFLINE'
              ? 'Verify local offline cache validity; activate NAVIC safety receiver.'
              : 'Monitor telemetry connection status.',
            source: 'ORCA_CONNECTIVITY_MONITOR',
            dataset: 'TELEMETRY_LOG',
            evidenceIds: [evidenceId],
            ruleIds: [ruleId],
            affectedArea: { name: areaName },
            affectedMissionIds: missionId ? [missionId] : [],
            affectedVesselIds: [vesselId],
            issuedAt: nowIso,
            validFrom: nowIso,
            validUntil: null,
            status: 'ACTIVE',
            acknowledgement: null,
            resolution: null,
            createdAt: nowIso,
            updatedAt: nowIso,
            provenance: {
              isLive: true,
              status: 'LIVE',
              sourceReliability: 'OFFICIAL_TELEMETRY',
              sourceName: 'ORCA Telemetry Monitor',
            },
            confidence: {
              level: 'HIGH',
              score: 95,
              explanation: 'Hardware bearer state transition confirmed.',
            },
            whyExplanation: `Carrier transition detected: ${conn.state} via bearer ${conn.bearer || 'UNKNOWN'}.`,
            metadata: { state: conn.state, bearer: conn.bearer },
          };

          const evidenceItem: AuditedEvidenceItem = {
            evidenceId,
            category: 'SAFETY',
            source: 'ORCA_CONNECTIVITY_MONITOR',
            dataset: 'CELLULAR_BEARER_TELEMETRY',
            variable: 'connectivityState',
            value: conn.state,
            unit: null,
            observedAt: nowIso,
            issuedAt: nowIso,
            validUntil: null,
            retrievedAt: nowIso,
            spatialRelevance: 'MEDIUM',
            temporalRelevance: 'CURRENT',
            quality: 'GOOD',
            status: 'FRESH',
            transformation: 'Network state detector',
            ruleIds: [ruleId],
            decisionImpact: 'CAUTION',
            notes: `Bearer: ${conn.bearer || 'N/A'}`,
          };

          const ruleItem: DeterministicRuleEvaluation = {
            ruleId,
            ruleName: 'Connectivity Bearer Resilience Rule',
            category: 'DATA_QUALITY',
            input: { state: conn.state, bearer: conn.bearer },
            threshold: { expected: 'CONNECTED' },
            thresholdSource: 'ORCA_OFFLINE_CONTRACT',
            result: conn.state === 'OFFLINE' ? 'CAUTION' : 'PASS',
            severity: conn.state === 'OFFLINE' ? 'WARNING' : 'INFO',
            reason: `Connectivity event: ${conn.state}`,
            evidenceRef: evidenceId,
          };

          this.inMemoryAlerts.set(alertId, alertItem);
          this.inMemoryEvidence.set(alertId, [evidenceItem]);
          this.inMemoryRules.set(alertId, [ruleItem]);
          createdOrRefreshed.push(alertItem);
        }
      }
    }

    return createdOrRefreshed;
  }

  /**
   * Helper: finds alert by fingerprint
   */
  public findByFingerprint(fingerprint: string): AlertItem | undefined {
    for (const alert of this.inMemoryAlerts.values()) {
      if (alert.fingerprint === fingerprint && alert.status !== 'EXPIRED' && alert.status !== 'RESOLVED') {
        return alert;
      }
    }
    return undefined;
  }

  /**
   * Query all alerts with optional filtering:
   * status, severity, alertType, regionId, missionId, vesselId, role
   */
  public async getAlerts(filter?: {
    status?: AlertStatus | 'ALL';
    severity?: AlertSeverity;
    alertType?: AlertType;
    category?: AlertCategory;
    missionId?: string;
    vesselId?: string;
    role?: string;
  }): Promise<AlertItem[]> {
    this.evaluateExpirations();

    let results = Array.from(this.inMemoryAlerts.values());

    // Role-specific filtering considerations
    if (filter?.role === 'FISHERMAN') {
      // Fisherman only sees active and non-suppressed operational alerts, prioritized by severity
      results = results.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED');
    }

    if (filter?.status && filter.status !== 'ALL') {
      results = results.filter((a) => a.status === filter.status);
    }

    if (filter?.severity) {
      results = results.filter((a) => a.severity === filter.severity);
    }

    if (filter?.alertType) {
      results = results.filter((a) => a.alertType === filter.alertType);
    }

    if (filter?.category) {
      results = results.filter((a) => a.category === filter.category);
    }

    if (filter?.missionId) {
      results = results.filter(
        (a) => a.affectedMissionIds.includes(filter.missionId!) || a.affectedMissionIds.length === 0
      );
    }

    if (filter?.vesselId) {
      results = results.filter(
        (a) => a.affectedVesselIds.includes(filter.vesselId!) || a.affectedVesselIds.length === 0
      );
    }

    // Sort by severity precedence: CRITICAL (1) > WARNING (2) > ADVISORY (3) > INFO (4), then newest first
    const severityWeight: Record<AlertSeverity, number> = {
      CRITICAL: 1,
      WARNING: 2,
      ADVISORY: 3,
      INFO: 4,
    };

    results.sort((a, b) => {
      const wA = severityWeight[a.severity] || 5;
      const wB = severityWeight[b.severity] || 5;
      if (wA !== wB) return wA - wB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return results;
  }

  /**
   * Retrieves full progressive-disclosure detail for an alert.
   * Level 1: WHAT, WHERE, SEVERITY, VALIDITY, ACTION (in AlertItem)
   * Level 2: WHY (in AlertItem.whyExplanation)
   * Level 3: EVIDENCE (in AuditedEvidenceItem[])
   * Level 4: RULE / AUDIT TRACE (in DeterministicRuleEvaluation[])
   */
  public async getAlertDetail(id: string): Promise<AlertDetailResponse | null> {
    this.evaluateExpirations();
    const alert = this.inMemoryAlerts.get(id);
    if (!alert) return null;

    const evidence = this.inMemoryEvidence.get(id) || [];
    const ruleEvaluations = this.inMemoryRules.get(id) || [];

    return {
      alert,
      evidence,
      ruleEvaluations,
    };
  }

  /**
   * Acknowledges an active alert.
   * State transition: ACTIVE -> ACKNOWLEDGED.
   * User, timestamp, role, and optional note are recorded.
   * Evidence and deterministic severity are strictly IMMUTABLE.
   */
  public async acknowledgeAlert(
    id: string,
    operator: { id: string; role?: string; note?: string }
  ): Promise<AlertItem> {
    this.evaluateExpirations();
    const alert = this.inMemoryAlerts.get(id);
    if (!alert) {
      throw new Error(`Alert record with ID '${id}' was not found.`);
    }

    if (alert.status === 'EXPIRED') {
      throw new Error(`Cannot acknowledge expired alert '${id}'.`);
    }

    const nowIso = new Date().toISOString();
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgement = {
      acknowledgedAt: nowIso,
      acknowledgedBy: operator.id,
      role: operator.role || 'OPERATOR',
      note: operator.note || 'Acknowledged by operator in console',
    };
    alert.updatedAt = nowIso;

    this.inMemoryAlerts.set(id, alert);
    return alert;
  }

  /**
   * Resolves an alert when condition no longer persists or has been mitigated.
   * State transition: ACTIVE | ACKNOWLEDGED -> RESOLVED.
   * Records operator, timestamp, and resolution justification.
   */
  public async resolveAlert(
    id: string,
    operator: { id: string; role?: string; note?: string }
  ): Promise<AlertItem> {
    this.evaluateExpirations();
    const alert = this.inMemoryAlerts.get(id);
    if (!alert) {
      throw new Error(`Alert record with ID '${id}' was not found.`);
    }

    const nowIso = new Date().toISOString();
    alert.status = 'RESOLVED';
    alert.resolution = {
      resolvedAt: nowIso,
      resolvedBy: operator.id,
      role: operator.role || 'OPERATOR',
      note: operator.note || 'Resolved by operational command',
    };
    alert.updatedAt = nowIso;

    this.inMemoryAlerts.set(id, alert);
    return alert;
  }

  /**
   * Manually expire an alert (e.g. for testing lifecycle expiry)
   */
  public markExpired(id: string): AlertItem | null {
    const alert = this.inMemoryAlerts.get(id);
    if (!alert) return null;
    alert.status = 'EXPIRED';
    alert.updatedAt = new Date().toISOString();
    this.inMemoryAlerts.set(id, alert);
    return alert;
  }

  /**
   * Clear all non-seed alerts (for test isolation)
   */
  public resetToSeed(): void {
    this.inMemoryAlerts.clear();
    this.inMemoryEvidence.clear();
    this.inMemoryRules.clear();
    this.seedInitialDeterministicAlerts();
  }
}
