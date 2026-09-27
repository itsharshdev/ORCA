import { getSupabaseAdmin } from '../supabase.js';
import type {
  VesselCapabilityContract,
  CapabilityEvaluationRequest,
  CapabilityEvaluationResponse,
  ConstraintEvaluationItem,
} from '../types.js';

// Authoritative in-memory registry of baseline vessel capabilities
const DEFAULT_VESSELS: Record<string, VesselCapabilityContract> = {
  'VESSEL-001': {
    vesselId: 'VESSEL-001',
    name: 'Matsya Sagar 1',
    registrationNumber: 'IND-MH-02-MM-849',
    vesselType: 'TRADITIONAL_MOTORIZED',
    lengthMeters: 8.5,
    beamMeters: 2.2,
    draftMeters: 1.1,
    engineHp: 25,
    operatingRangeNm: 25.0,
    maxOperatingDistanceNm: 12.0,
    enduranceHours: 10.0,
    fuelCapacityLiters: 50.0,
    fuelBurnRateLph: 4.5,
    cruisingSpeedKnots: 6.5,
    maxWaveToleranceMeters: 1.8,
    maxWindToleranceKnots: 18.0,
    minCrew: 2,
    maxCrew: 4,
    safetyEquipment: ['VHF_RADIO', 'LIFE_JACKETS', 'BASIC_FIRST_AID'],
    capabilityProfileStatus: 'ACTIVE',
    provenance: {
      wave: {
        status: 'PROTOTYPE_ASSUMPTION',
        source: 'ORCA Prototype Coastal Motorized Canoe Heuristic Model',
        notes: 'Prototype assumption calibrated against traditional Maharashtra gillnetters.',
      },
      wind: {
        status: 'PROTOTYPE_ASSUMPTION',
        source: 'ORCA Prototype Coastal Advisory Threshold',
        notes: 'IMD coastal warning threshold for artisanal craft.',
      },
      range: {
        status: 'VESSEL_SPECIFIC',
        source: 'Owner Registered Specifications',
      },
      endurance: {
        status: 'VESSEL_SPECIFIC',
        source: 'Engine Fuel Curve & Tank Capacity',
      },
      fuel: {
        status: 'VESSEL_SPECIFIC',
        source: 'Fuel Tank Measurement',
      },
      crew: {
        status: 'OFFICIAL_SOURCED',
        source: 'Merchant Shipping (Indian Fishing Boats) Manning Rules',
        officialReference: 'DG Shipping MS Notice 14/2021',
      },
      safetyEquipment: {
        status: 'OFFICIAL_SOURCED',
        source: 'State Fisheries Coastal Safety Compulsory Equipment Schedule',
      },
    },
    updatedAt: new Date().toISOString(),
  },
  'VESSEL-MECH-01': {
    vesselId: 'VESSEL-MECH-01',
    name: 'Samudra Ratna',
    registrationNumber: 'IND-MH-01-TR-402',
    vesselType: 'MECHANIZED_TRAWLER',
    lengthMeters: 15.2,
    beamMeters: 4.8,
    draftMeters: 2.1,
    engineHp: 120,
    operatingRangeNm: 80.0,
    maxOperatingDistanceNm: 40.0,
    enduranceHours: 36.0,
    fuelCapacityLiters: 400.0,
    fuelBurnRateLph: 9.5,
    cruisingSpeedKnots: 8.0,
    maxWaveToleranceMeters: 2.8,
    maxWindToleranceKnots: 28.0,
    minCrew: 4,
    maxCrew: 8,
    safetyEquipment: ['VHF_RADIO', 'LIFE_JACKETS', 'EPIRB', 'AIS_TRANSPONDER', 'GPS_PLOTTER', 'FIRST_AID_KIT'],
    capabilityProfileStatus: 'ACTIVE',
    provenance: {
      wave: {
        status: 'VESSEL_SPECIFIC',
        source: 'Vessel Stability Booklet & Survey Certificate',
        officialReference: 'IRS Class Certificate No. 2024-MH-9812',
      },
      wind: {
        status: 'OFFICIAL_SOURCED',
        source: 'Mercantile Marine Department Mechanized Vessel Operations Directive',
        officialReference: 'MMD Mumbai Circular 08/2023',
      },
      range: {
        status: 'VESSEL_SPECIFIC',
        source: 'Naval Architecture Range Calculation',
      },
      endurance: {
        status: 'VESSEL_SPECIFIC',
        source: 'Bunker Capacity & Auxiliary Generator Draw',
      },
      fuel: {
        status: 'VESSEL_SPECIFIC',
        source: 'Calibrated Tank Capacity',
      },
      crew: {
        status: 'OFFICIAL_SOURCED',
        source: 'Merchant Shipping (Fishing Vessel Manning Regulations)',
      },
      safetyEquipment: {
        status: 'OFFICIAL_SOURCED',
        source: 'IMO / DG Shipping Safety of Fishing Vessels Guidelines',
      },
    },
    updatedAt: new Date().toISOString(),
  },
  'VESSEL-TRAD-01': {
    vesselId: 'VESSEL-TRAD-01',
    name: 'Koli Kanya',
    registrationNumber: 'IND-MH-02-TRAD-11',
    vesselType: 'TRADITIONAL_NON_MOTORIZED',
    lengthMeters: 5.5,
    beamMeters: 1.4,
    draftMeters: 0.5,
    engineHp: 0,
    operatingRangeNm: 6.0,
    maxOperatingDistanceNm: 3.0,
    enduranceHours: 4.0,
    fuelCapacityLiters: 0.0,
    fuelBurnRateLph: 0.0,
    cruisingSpeedKnots: 3.0,
    maxWaveToleranceMeters: 0.9,
    maxWindToleranceKnots: 12.0,
    minCrew: 1,
    maxCrew: 2,
    safetyEquipment: ['LIFE_JACKETS'],
    capabilityProfileStatus: 'ACTIVE',
    provenance: {
      wave: {
        status: 'PROTOTYPE_ASSUMPTION',
        source: 'ORCA Prototype Non-Motorized Beach Landing Craft Model',
        notes: 'Conservative non-motorized craft surf-zone limit.',
      },
      wind: {
        status: 'PROTOTYPE_ASSUMPTION',
        source: 'ORCA Prototype Coastal Paddle/Oar Stability Guideline',
      },
      range: {
        status: 'VESSEL_SPECIFIC',
        source: 'Manual Rowing/Sailing Practical Coastal Range',
      },
      endurance: {
        status: 'VESSEL_SPECIFIC',
        source: 'Physical Crew Endurance Assumption',
      },
      crew: {
        status: 'VESSEL_SPECIFIC',
        source: 'Craft Capacity Plate',
      },
      safetyEquipment: {
        status: 'OFFICIAL_SOURCED',
        source: 'State Fisheries Artisanal Safety Requirement',
      },
    },
    updatedAt: new Date().toISOString(),
  },
};

export class VesselCapabilityService {
  private static instance: VesselCapabilityService;
  private localRegistry: Map<string, VesselCapabilityContract> = new Map();

  private constructor() {
    Object.entries(DEFAULT_VESSELS).forEach(([id, vessel]) => {
      this.localRegistry.set(id, { ...vessel });
    });
  }

  public static getInstance(): VesselCapabilityService {
    if (!VesselCapabilityService.instance) {
      VesselCapabilityService.instance = new VesselCapabilityService();
    }
    return VesselCapabilityService.instance;
  }

  /**
   * Retrieves full capability profile with threshold provenance for a vessel.
   */
  public async getCapability(
    vesselId: string
  ): Promise<VesselCapabilityContract | null> {
    const admin = getSupabaseAdmin();

    // 1. Try to fetch from Supabase if admin is available
    if (admin) {
      try {
        const { data, error } = await admin
          .from('vessels')
          .select('*')
          .eq('id', vesselId)
          .maybeSingle();

        if (data && !error) {
          return this.mapRowToContract(data);
        }
      } catch {
        // Fall through to memory registry
      }
    }

    // 2. Check local memory registry
    const local = this.localRegistry.get(vesselId);
    if (local) {
      return { ...local };
    }

    // 3. Try to find by partial/case-insensitive match (e.g. 'VESSEL-001' or 'vessel-01')
    for (const [key, val] of this.localRegistry.entries()) {
      if (key.toLowerCase() === vesselId.toLowerCase() || val.name.toLowerCase() === vesselId.toLowerCase()) {
        return { ...val };
      }
    }

    return null;
  }

  /**
   * Updates capability fields and threshold provenance with validation.
   */
  public async updateCapability(
    vesselId: string,
    updates: Partial<VesselCapabilityContract>
  ): Promise<VesselCapabilityContract> {
    const current = await this.getCapability(vesselId);
    if (!current) {
      throw new Error(`Vessel with ID '${vesselId}' not found.`);
    }

    const updated: VesselCapabilityContract = {
      ...current,
      ...updates,
      vesselId: current.vesselId, // Preserve immutable ID
      updatedAt: new Date().toISOString(),
      provenance: {
        ...current.provenance,
        ...(updates.provenance || {}),
      },
    };

    // Update in local registry
    this.localRegistry.set(current.vesselId, updated);

    // If Supabase is available and authenticated user matches owner or admin
    const admin = getSupabaseAdmin();
    if (admin) {
      try {
        await admin
          .from('vessels')
          .update({
            operating_range_nm: updated.operatingRangeNm,
            max_operating_distance_nm: updated.maxOperatingDistanceNm,
            endurance_hours: updated.enduranceHours,
            fuel_capacity_liters: updated.fuelCapacityLiters,
            fuel_burn_rate_lph: updated.fuelBurnRateLph,
            max_safe_wave_meters: updated.maxWaveToleranceMeters,
            max_safe_wind_knots: updated.maxWindToleranceKnots,
            min_crew: updated.minCrew,
            max_crew: updated.maxCrew,
            safety_equipment: updated.safetyEquipment,
            capability_profile_status: updated.capabilityProfileStatus,
            capability_provenance: updated.provenance,
            updated_at: updated.updatedAt,
          })
          .eq('id', current.vesselId);
      } catch {
        // Keep updated in-memory version
      }
    }

    return updated;
  }

  /**
   * Deterministically evaluates mission and environmental parameters against a vessel's capability model.
   */
  public async evaluateCapability(
    req: CapabilityEvaluationRequest
  ): Promise<CapabilityEvaluationResponse> {
    const evaluatedAt = new Date().toISOString();
    let vessel: VesselCapabilityContract | null = null;

    if (req.vesselId) {
      vessel = await this.getCapability(req.vesselId);
    }

    // Apply overrides or fallback to default baseline
    if (!vessel && req.vesselOverrides) {
      vessel = {
        vesselId: req.vesselId || 'CUSTOM-VESSEL',
        name: req.vesselOverrides.name || 'Configured Vessel',
        vesselType: req.vesselOverrides.vesselType || 'TRADITIONAL_MOTORIZED',
        lengthMeters: req.vesselOverrides.lengthMeters ?? 8.5,
        beamMeters: req.vesselOverrides.beamMeters ?? 2.2,
        draftMeters: req.vesselOverrides.draftMeters ?? 1.1,
        engineHp: req.vesselOverrides.engineHp ?? 25,
        operatingRangeNm: req.vesselOverrides.operatingRangeNm ?? 25.0,
        maxOperatingDistanceNm: req.vesselOverrides.maxOperatingDistanceNm ?? 12.0,
        enduranceHours: req.vesselOverrides.enduranceHours ?? 10.0,
        fuelCapacityLiters: req.vesselOverrides.fuelCapacityLiters ?? 50.0,
        fuelBurnRateLph: req.vesselOverrides.fuelBurnRateLph ?? 4.5,
        cruisingSpeedKnots: req.vesselOverrides.cruisingSpeedKnots ?? 6.5,
        maxWaveToleranceMeters: req.vesselOverrides.maxWaveToleranceMeters ?? 1.8,
        maxWindToleranceKnots: req.vesselOverrides.maxWindToleranceKnots ?? 18.0,
        minCrew: req.vesselOverrides.minCrew ?? 1,
        maxCrew: req.vesselOverrides.maxCrew ?? 4,
        safetyEquipment: req.vesselOverrides.safetyEquipment || ['LIFE_JACKETS'],
        capabilityProfileStatus: req.vesselOverrides.capabilityProfileStatus || 'ACTIVE',
        provenance: req.vesselOverrides.provenance || {
          wave: { status: 'PROTOTYPE_ASSUMPTION', source: 'Custom Configuration' },
          wind: { status: 'PROTOTYPE_ASSUMPTION', source: 'Custom Configuration' },
          range: { status: 'VESSEL_SPECIFIC', source: 'Custom Configuration' },
          endurance: { status: 'VESSEL_SPECIFIC', source: 'Custom Configuration' },
        },
        updatedAt: evaluatedAt,
      };
    } else if (!vessel) {
      // Default to standard vessel if completely unspecified
      vessel = DEFAULT_VESSELS['VESSEL-001'];
    }

    if (req.vesselOverrides) {
      vessel = {
        ...vessel,
        ...req.vesselOverrides,
        provenance: {
          ...vessel.provenance,
          ...(req.vesselOverrides.provenance || {}),
        },
      };
    }

    const evaluations: ConstraintEvaluationItem[] = [];

    // 1. EVALUATION: Operating Range (Round Trip Distance)
    if (typeof req.missionDistanceNm === 'number') {
      const distance = req.missionDistanceNm;
      const limit = vessel.operatingRangeNm;
      const source = vessel.provenance.range?.status || 'VESSEL_SPECIFIC';
      const sourceDesc = vessel.provenance.range?.source || 'Vessel specification';

      if (distance > limit) {
        evaluations.push({
          constraintId: 'CONST-RANGE-01',
          category: 'RANGE',
          input: { name: 'missionDistanceNm', value: distance, unit: 'NM' },
          configuredLimit: { value: limit, unit: 'NM' },
          actualValue: distance,
          unit: 'NM',
          status: 'FAIL',
          severity: 'CRITICAL',
          reason: `Planned mission distance (${distance.toFixed(1)} NM) exceeds vessel safe operating range (${limit.toFixed(1)} NM).`,
          sourceStatus: source,
          sourceDescription: sourceDesc,
        });
      } else if (distance > limit * 0.85) {
        evaluations.push({
          constraintId: 'CONST-RANGE-01',
          category: 'RANGE',
          input: { name: 'missionDistanceNm', value: distance, unit: 'NM' },
          configuredLimit: { value: limit, unit: 'NM' },
          actualValue: distance,
          unit: 'NM',
          status: 'CAUTION',
          severity: 'WARNING',
          reason: `Planned distance (${distance.toFixed(1)} NM) consumes > 85% of vessel operating range (${limit.toFixed(1)} NM). Safety buffer is tight.`,
          sourceStatus: source,
          sourceDescription: sourceDesc,
        });
      } else {
        evaluations.push({
          constraintId: 'CONST-RANGE-01',
          category: 'RANGE',
          input: { name: 'missionDistanceNm', value: distance, unit: 'NM' },
          configuredLimit: { value: limit, unit: 'NM' },
          actualValue: distance,
          unit: 'NM',
          status: 'PASS',
          severity: 'INFO',
          reason: `Planned distance (${distance.toFixed(1)} NM) is safely within vessel operating range (${limit.toFixed(1)} NM).`,
          sourceStatus: source,
          sourceDescription: sourceDesc,
        });
      }
    } else {
      evaluations.push({
        constraintId: 'CONST-RANGE-01',
        category: 'RANGE',
        input: { name: 'missionDistanceNm', value: null, unit: 'NM' },
        configuredLimit: { value: vessel.operatingRangeNm, unit: 'NM' },
        actualValue: null,
        status: 'NOT_APPLICABLE',
        severity: 'INFO',
        reason: 'Mission route distance was not specified for range evaluation.',
        sourceStatus: vessel.provenance.range?.status || 'VESSEL_SPECIFIC',
      });
    }

    // 2. EVALUATION: Max Distance From Port / Shore
    if (typeof req.maxDistanceFromPortNm === 'number') {
      const offshoreDist = req.maxDistanceFromPortNm;
      const limit = vessel.maxOperatingDistanceNm;
      const source = vessel.provenance.range?.status || 'VESSEL_SPECIFIC';

      if (offshoreDist > limit) {
        evaluations.push({
          constraintId: 'CONST-DISTANCE-01',
          category: 'DISTANCE_FROM_PORT',
          input: { name: 'maxDistanceFromPortNm', value: offshoreDist, unit: 'NM' },
          configuredLimit: { value: limit, unit: 'NM' },
          actualValue: offshoreDist,
          unit: 'NM',
          status: 'FAIL',
          severity: 'CRITICAL',
          reason: `Maximum distance from port (${offshoreDist.toFixed(1)} NM) exceeds vessel coastal seaworthiness limit (${limit.toFixed(1)} NM).`,
          sourceStatus: source,
        });
      } else if (offshoreDist > limit * 0.85) {
        evaluations.push({
          constraintId: 'CONST-DISTANCE-01',
          category: 'DISTANCE_FROM_PORT',
          input: { name: 'maxDistanceFromPortNm', value: offshoreDist, unit: 'NM' },
          configuredLimit: { value: limit, unit: 'NM' },
          actualValue: offshoreDist,
          unit: 'NM',
          status: 'CAUTION',
          severity: 'WARNING',
          reason: `Offshore distance (${offshoreDist.toFixed(1)} NM) approaches vessel maximum distance limit (${limit.toFixed(1)} NM).`,
          sourceStatus: source,
        });
      } else {
        evaluations.push({
          constraintId: 'CONST-DISTANCE-01',
          category: 'DISTANCE_FROM_PORT',
          input: { name: 'maxDistanceFromPortNm', value: offshoreDist, unit: 'NM' },
          configuredLimit: { value: limit, unit: 'NM' },
          actualValue: offshoreDist,
          unit: 'NM',
          status: 'PASS',
          severity: 'INFO',
          reason: `Offshore distance (${offshoreDist.toFixed(1)} NM) is safely within vessel harbor distance limit (${limit.toFixed(1)} NM).`,
          sourceStatus: source,
        });
      }
    }

    // 3. EVALUATION: Endurance (Operating Hours)
    if (typeof req.missionDurationHours === 'number') {
      const duration = req.missionDurationHours;
      const limit = vessel.enduranceHours;
      const source = vessel.provenance.endurance?.status || 'VESSEL_SPECIFIC';
      const sourceDesc = vessel.provenance.endurance?.source || 'Engine endurance curve';

      if (duration > limit) {
        evaluations.push({
          constraintId: 'CONST-ENDURANCE-01',
          category: 'ENDURANCE',
          input: { name: 'missionDurationHours', value: duration, unit: 'hours' },
          configuredLimit: { value: limit, unit: 'hours' },
          actualValue: duration,
          unit: 'hours',
          status: 'FAIL',
          severity: 'CRITICAL',
          reason: `Requested duration (${duration.toFixed(1)} hrs) exceeds vessel maximum operating endurance (${limit.toFixed(1)} hrs).`,
          sourceStatus: source,
          sourceDescription: sourceDesc,
        });
      } else if (duration > limit * 0.8) {
        evaluations.push({
          constraintId: 'CONST-ENDURANCE-01',
          category: 'ENDURANCE',
          input: { name: 'missionDurationHours', value: duration, unit: 'hours' },
          configuredLimit: { value: limit, unit: 'hours' },
          actualValue: duration,
          unit: 'hours',
          status: 'CAUTION',
          severity: 'WARNING',
          reason: `Requested duration (${duration.toFixed(1)} hrs) has less than 20% remaining endurance buffer on vessel limit (${limit.toFixed(1)} hrs).`,
          sourceStatus: source,
          sourceDescription: sourceDesc,
        });
      } else {
        evaluations.push({
          constraintId: 'CONST-ENDURANCE-01',
          category: 'ENDURANCE',
          input: { name: 'missionDurationHours', value: duration, unit: 'hours' },
          configuredLimit: { value: limit, unit: 'hours' },
          actualValue: duration,
          unit: 'hours',
          status: 'PASS',
          severity: 'INFO',
          reason: `Requested duration (${duration.toFixed(1)} hrs) is within vessel endurance capability (${limit.toFixed(1)} hrs).`,
          sourceStatus: source,
          sourceDescription: sourceDesc,
        });
      }

      // 4. EVALUATION: Fuel Requirement & 20% Reserve
      if (vessel.fuelBurnRateLph > 0 && vessel.fuelCapacityLiters > 0) {
        const requiredFuelLiters = duration * vessel.fuelBurnRateLph * 1.2; // 20% statutory reserve
        const capacity = vessel.fuelCapacityLiters;
        const fuelSource = vessel.provenance.fuel?.status || 'VESSEL_SPECIFIC';

        if (requiredFuelLiters > capacity) {
          evaluations.push({
            constraintId: 'CONST-FUEL-01',
            category: 'FUEL',
            input: { name: 'requiredFuelWithReserve', value: Number(requiredFuelLiters.toFixed(1)), unit: 'liters' },
            configuredLimit: { value: capacity, unit: 'liters' },
            actualValue: Number(requiredFuelLiters.toFixed(1)),
            unit: 'liters',
            status: 'FAIL',
            severity: 'CRITICAL',
            reason: `Required fuel (${requiredFuelLiters.toFixed(1)} L with 20% reserve) exceeds total tank capacity (${capacity.toFixed(1)} L).`,
            sourceStatus: fuelSource,
          });
        } else if (requiredFuelLiters > capacity * 0.85) {
          evaluations.push({
            constraintId: 'CONST-FUEL-01',
            category: 'FUEL',
            input: { name: 'requiredFuelWithReserve', value: Number(requiredFuelLiters.toFixed(1)), unit: 'liters' },
            configuredLimit: { value: capacity, unit: 'liters' },
            actualValue: Number(requiredFuelLiters.toFixed(1)),
            unit: 'liters',
            status: 'CAUTION',
            severity: 'WARNING',
            reason: `Fuel consumption with 20% reserve (${requiredFuelLiters.toFixed(1)} L) utilizes > 85% of total bunker (${capacity.toFixed(1)} L).`,
            sourceStatus: fuelSource,
          });
        } else {
          evaluations.push({
            constraintId: 'CONST-FUEL-01',
            category: 'FUEL',
            input: { name: 'requiredFuelWithReserve', value: Number(requiredFuelLiters.toFixed(1)), unit: 'liters' },
            configuredLimit: { value: capacity, unit: 'liters' },
            actualValue: Number(requiredFuelLiters.toFixed(1)),
            unit: 'liters',
            status: 'PASS',
            severity: 'INFO',
            reason: `Fuel capacity (${capacity.toFixed(1)} L) is sufficient for planned trip plus 20% safety reserve (${requiredFuelLiters.toFixed(1)} L).`,
            sourceStatus: fuelSource,
          });
        }
      }
    } else {
      evaluations.push({
        constraintId: 'CONST-ENDURANCE-01',
        category: 'ENDURANCE',
        input: { name: 'missionDurationHours', value: null, unit: 'hours' },
        configuredLimit: { value: vessel.enduranceHours, unit: 'hours' },
        actualValue: null,
        status: 'NOT_APPLICABLE',
        severity: 'INFO',
        reason: 'Mission duration was not specified for endurance evaluation.',
        sourceStatus: vessel.provenance.endurance?.status || 'VESSEL_SPECIFIC',
      });
    }

    // 5. EVALUATION: Wave Height Compatibility
    const wave = req.environmentalContext?.waveHeightMeters;
    const waveLimit = vessel.maxWaveToleranceMeters;
    const waveSource = vessel.provenance.wave?.status || 'PROTOTYPE_ASSUMPTION';
    const waveDesc = vessel.provenance.wave?.source || 'Prototype assumption';

    if (typeof wave === 'number') {
      if (wave > waveLimit) {
        evaluations.push({
          constraintId: 'CONST-WAVE-01',
          category: 'WAVE',
          input: { name: 'significantWaveHeightMeters', value: wave, unit: 'meters' },
          configuredLimit: { value: waveLimit, unit: 'meters' },
          actualValue: wave,
          unit: 'meters',
          status: 'FAIL',
          severity: 'CRITICAL',
          reason: `Significant wave height (${wave.toFixed(2)} m) exceeds vessel configured seaworthiness tolerance (${waveLimit.toFixed(2)} m). High risk of swamping/instability.`,
          sourceStatus: waveSource,
          sourceDescription: waveDesc,
        });
      } else if (wave > waveLimit * 0.85) {
        evaluations.push({
          constraintId: 'CONST-WAVE-01',
          category: 'WAVE',
          input: { name: 'significantWaveHeightMeters', value: wave, unit: 'meters' },
          configuredLimit: { value: waveLimit, unit: 'meters' },
          actualValue: wave,
          unit: 'meters',
          status: 'CAUTION',
          severity: 'WARNING',
          reason: `Significant wave height (${wave.toFixed(2)} m) approaches vessel configured limit (${waveLimit.toFixed(2)} m). Caution recommended.`,
          sourceStatus: waveSource,
          sourceDescription: waveDesc,
        });
      } else {
        evaluations.push({
          constraintId: 'CONST-WAVE-01',
          category: 'WAVE',
          input: { name: 'significantWaveHeightMeters', value: wave, unit: 'meters' },
          configuredLimit: { value: waveLimit, unit: 'meters' },
          actualValue: wave,
          unit: 'meters',
          status: 'PASS',
          severity: 'INFO',
          reason: `Significant wave height (${wave.toFixed(2)} m) is within vessel seaworthiness capability (${waveLimit.toFixed(2)} m).`,
          sourceStatus: waveSource,
          sourceDescription: waveDesc,
        });
      }
    } else {
      evaluations.push({
        constraintId: 'CONST-WAVE-01',
        category: 'WAVE',
        input: { name: 'significantWaveHeightMeters', value: null, unit: 'meters' },
        configuredLimit: { value: waveLimit, unit: 'meters' },
        actualValue: null,
        status: 'UNKNOWN',
        severity: 'WARNING',
        reason: 'Ocean wave height data not supplied in context; wave seaworthiness limit cannot be validated.',
        sourceStatus: waveSource,
        sourceDescription: waveDesc,
      });
    }

    // 6. EVALUATION: Wind Speed Compatibility
    const wind = req.environmentalContext?.windSpeedKnots;
    const windLimit = vessel.maxWindToleranceKnots;
    const windSource = vessel.provenance.wind?.status || 'PROTOTYPE_ASSUMPTION';
    const windDesc = vessel.provenance.wind?.source || 'Prototype assumption';

    if (typeof wind === 'number') {
      if (wind > windLimit) {
        evaluations.push({
          constraintId: 'CONST-WIND-01',
          category: 'WIND',
          input: { name: 'sustainedWindSpeedKnots', value: wind, unit: 'knots' },
          configuredLimit: { value: windLimit, unit: 'knots' },
          actualValue: wind,
          unit: 'knots',
          status: 'FAIL',
          severity: 'CRITICAL',
          reason: `Sustained wind speed (${wind.toFixed(1)} kts) exceeds vessel tolerance limit (${windLimit.toFixed(1)} kts).`,
          sourceStatus: windSource,
          sourceDescription: windDesc,
        });
      } else if (wind > windLimit * 0.85) {
        evaluations.push({
          constraintId: 'CONST-WIND-01',
          category: 'WIND',
          input: { name: 'sustainedWindSpeedKnots', value: wind, unit: 'knots' },
          configuredLimit: { value: windLimit, unit: 'knots' },
          actualValue: wind,
          unit: 'knots',
          status: 'CAUTION',
          severity: 'WARNING',
          reason: `Sustained wind speed (${wind.toFixed(1)} kts) approaches vessel tolerance limit (${windLimit.toFixed(1)} kts).`,
          sourceStatus: windSource,
          sourceDescription: windDesc,
        });
      } else {
        evaluations.push({
          constraintId: 'CONST-WIND-01',
          category: 'WIND',
          input: { name: 'sustainedWindSpeedKnots', value: wind, unit: 'knots' },
          configuredLimit: { value: windLimit, unit: 'knots' },
          actualValue: wind,
          unit: 'knots',
          status: 'PASS',
          severity: 'INFO',
          reason: `Wind speed (${wind.toFixed(1)} kts) is within vessel operating capability (${windLimit.toFixed(1)} kts).`,
          sourceStatus: windSource,
          sourceDescription: windDesc,
        });
      }
    } else {
      evaluations.push({
        constraintId: 'CONST-WIND-01',
        category: 'WIND',
        input: { name: 'sustainedWindSpeedKnots', value: null, unit: 'knots' },
        configuredLimit: { value: windLimit, unit: 'knots' },
        actualValue: null,
        status: 'UNKNOWN',
        severity: 'WARNING',
        reason: 'Wind speed observation not supplied in context; wind tolerance clearance unverified.',
        sourceStatus: windSource,
        sourceDescription: windDesc,
      });
    }

    // 7. EVALUATION: Crew Capacity & Manning Limits
    if (typeof req.plannedCrewCount === 'number') {
      const crew = req.plannedCrewCount;
      const min = vessel.minCrew;
      const max = vessel.maxCrew;
      const crewSource = vessel.provenance.crew?.status || 'OFFICIAL_SOURCED';

      if (crew < min) {
        evaluations.push({
          constraintId: 'CONST-CREW-01',
          category: 'CREW',
          input: { name: 'plannedCrewCount', value: crew, unit: 'persons' },
          configuredLimit: { value: `${min} - ${max}`, unit: 'persons' },
          actualValue: crew,
          unit: 'persons',
          status: 'FAIL',
          severity: 'CRITICAL',
          reason: `Planned crew (${crew}) is below the minimum safe manning level (${min} persons) for this vessel class.`,
          sourceStatus: crewSource,
        });
      } else if (crew > max) {
        evaluations.push({
          constraintId: 'CONST-CREW-01',
          category: 'CREW',
          input: { name: 'plannedCrewCount', value: crew, unit: 'persons' },
          configuredLimit: { value: `${min} - ${max}`, unit: 'persons' },
          actualValue: crew,
          unit: 'persons',
          status: 'FAIL',
          severity: 'CRITICAL',
          reason: `Planned crew (${crew}) exceeds the maximum licensed seating/liferaft capacity (${max} persons).`,
          sourceStatus: crewSource,
        });
      } else {
        evaluations.push({
          constraintId: 'CONST-CREW-01',
          category: 'CREW',
          input: { name: 'plannedCrewCount', value: crew, unit: 'persons' },
          configuredLimit: { value: `${min} - ${max}`, unit: 'persons' },
          actualValue: crew,
          unit: 'persons',
          status: 'PASS',
          severity: 'INFO',
          reason: `Crew size (${crew} persons) conforms to certified vessel manning bounds (${min} to ${max} persons).`,
          sourceStatus: crewSource,
        });
      }
    }

    // 8. EVALUATION: Safety Equipment Compliance
    if (req.requiredEquipment && req.requiredEquipment.length > 0) {
      const onboard = new Set(vessel.safetyEquipment.map((eq) => eq.toUpperCase()));
      const missing = req.requiredEquipment.filter((reqEq) => !onboard.has(reqEq.toUpperCase()));
      const equipSource = vessel.provenance.safetyEquipment?.status || 'OFFICIAL_SOURCED';

      if (missing.length > 0) {
        evaluations.push({
          constraintId: 'CONST-EQUIP-01',
          category: 'SAFETY_EQUIPMENT',
          input: { name: 'requiredSafetyEquipment', value: req.requiredEquipment },
          configuredLimit: { value: vessel.safetyEquipment },
          actualValue: vessel.safetyEquipment,
          status: 'FAIL',
          severity: 'CRITICAL',
          reason: `Missing mandatory safety equipment required for voyage: ${missing.join(', ')}.`,
          sourceStatus: equipSource,
        });
      } else {
        evaluations.push({
          constraintId: 'CONST-EQUIP-01',
          category: 'SAFETY_EQUIPMENT',
          input: { name: 'requiredSafetyEquipment', value: req.requiredEquipment },
          configuredLimit: { value: vessel.safetyEquipment },
          actualValue: vessel.safetyEquipment,
          status: 'PASS',
          severity: 'INFO',
          reason: `All required voyage safety equipment is verified on board (${req.requiredEquipment.join(', ')}).`,
          sourceStatus: equipSource,
        });
      }
    }

    // 9. EVALUATION: Capability Certification Profile Status
    if (vessel.capabilityProfileStatus === 'RESTRICTED') {
      evaluations.push({
        constraintId: 'CONST-CERT-01',
        category: 'CERTIFICATION',
        input: { name: 'capabilityProfileStatus', value: vessel.capabilityProfileStatus },
        configuredLimit: { value: 'ACTIVE' },
        actualValue: vessel.capabilityProfileStatus,
        status: 'FAIL',
        severity: 'CRITICAL',
        reason: 'Vessel operational capability certificate is currently marked as RESTRICTED by maritime administration.',
        sourceStatus: 'OFFICIAL_SOURCED',
      });
    } else if (vessel.capabilityProfileStatus === 'PENDING_SURVEY') {
      evaluations.push({
        constraintId: 'CONST-CERT-01',
        category: 'CERTIFICATION',
        input: { name: 'capabilityProfileStatus', value: vessel.capabilityProfileStatus },
        configuredLimit: { value: 'ACTIVE' },
        actualValue: vessel.capabilityProfileStatus,
        status: 'CAUTION',
        severity: 'WARNING',
        reason: 'Vessel periodic seaworthiness survey is pending inspection.',
        sourceStatus: 'OFFICIAL_SOURCED',
      });
    } else if (vessel.capabilityProfileStatus === 'INCOMPLETE') {
      evaluations.push({
        constraintId: 'CONST-CERT-01',
        category: 'CERTIFICATION',
        input: { name: 'capabilityProfileStatus', value: vessel.capabilityProfileStatus },
        configuredLimit: { value: 'ACTIVE' },
        actualValue: vessel.capabilityProfileStatus,
        status: 'CAUTION',
        severity: 'WARNING',
        reason: 'Vessel capability record has incomplete parameter registrations.',
        sourceStatus: 'VESSEL_SPECIFIC',
      });
    } else {
      evaluations.push({
        constraintId: 'CONST-CERT-01',
        category: 'CERTIFICATION',
        input: { name: 'capabilityProfileStatus', value: vessel.capabilityProfileStatus },
        configuredLimit: { value: 'ACTIVE' },
        actualValue: vessel.capabilityProfileStatus,
        status: 'PASS',
        severity: 'INFO',
        reason: 'Vessel capability profile is active and verified.',
        sourceStatus: 'OFFICIAL_SOURCED',
      });
    }

    // Tally summary
    let passedCount = 0;
    let cautionCount = 0;
    let failedCount = 0;
    let unknownCount = 0;
    let notApplicableCount = 0;

    let officialSourced = 0;
    let vesselSpecific = 0;
    let prototypeAssumption = 0;
    let unknownThreshold = 0;

    for (const ev of evaluations) {
      if (ev.status === 'PASS') passedCount++;
      else if (ev.status === 'CAUTION') cautionCount++;
      else if (ev.status === 'FAIL') failedCount++;
      else if (ev.status === 'UNKNOWN') unknownCount++;
      else if (ev.status === 'NOT_APPLICABLE') notApplicableCount++;

      if (ev.sourceStatus === 'OFFICIAL_SOURCED') officialSourced++;
      else if (ev.sourceStatus === 'VESSEL_SPECIFIC') vesselSpecific++;
      else if (ev.sourceStatus === 'PROTOTYPE_ASSUMPTION') prototypeAssumption++;
      else unknownThreshold++;
    }

    const hasCriticalFailure = failedCount > 0;
    const hasWarnings = cautionCount > 0 || unknownCount > 0;
    const allPassed = failedCount === 0 && cautionCount === 0;

    return {
      vesselId: vessel.vesselId,
      vesselName: vessel.name,
      vesselType: vessel.vesselType,
      evaluatedAt,
      allPassed,
      hasCriticalFailure,
      hasWarnings,
      evaluations,
      summary: {
        passedCount,
        cautionCount,
        failedCount,
        unknownCount,
        notApplicableCount,
      },
      provenance: {
        engine: 'ORCA_DETERMINISTIC_CAPABILITY_V1',
        rulesEvaluatedCount: evaluations.length,
        thresholdBreakdown: {
          officialSourced,
          vesselSpecific,
          prototypeAssumption,
          unknown: unknownThreshold,
        },
      },
    };
  }

  private mapRowToContract(row: any): VesselCapabilityContract {
    const prov = row.capability_provenance || {};
    return {
      vesselId: row.id,
      name: row.name,
      registrationNumber: row.registration_number || undefined,
      vesselType: row.vessel_type || 'TRADITIONAL_MOTORIZED',
      lengthMeters: Number(row.length_meters || 8.5),
      beamMeters: Number(row.beam_meters || 2.2),
      draftMeters: Number(row.draft_meters || 1.1),
      engineHp: Number(row.engine_hp || 25),
      operatingRangeNm: Number(row.operating_range_nm || 25.0),
      maxOperatingDistanceNm: Number(row.max_operating_distance_nm || 12.0),
      enduranceHours: Number(row.endurance_hours || 10.0),
      fuelCapacityLiters: Number(row.fuel_capacity_liters || 50.0),
      fuelBurnRateLph: Number(row.fuel_burn_rate_lph || 4.5),
      cruisingSpeedKnots: Number(row.cruising_speed_knots || 6.5),
      maxWaveToleranceMeters: Number(row.max_safe_wave_meters || 1.8),
      maxWindToleranceKnots: Number(row.max_safe_wind_knots || 18.0),
      minCrew: Number(row.min_crew || 1),
      maxCrew: Number(row.max_crew || 4),
      safetyEquipment: Array.isArray(row.safety_equipment) ? row.safety_equipment : ['LIFE_JACKETS'],
      capabilityProfileStatus: row.capability_profile_status || 'ACTIVE',
      provenance: {
        wave: prov.wave || { status: 'PROTOTYPE_ASSUMPTION', source: 'ORCA Prototype Heuristic Model' },
        wind: prov.wind || { status: 'PROTOTYPE_ASSUMPTION', source: 'ORCA Prototype Coastal Advisory' },
        range: prov.range || { status: 'VESSEL_SPECIFIC', source: 'Owner Specifications' },
        endurance: prov.endurance || { status: 'VESSEL_SPECIFIC', source: 'Bunker Curve' },
        fuel: prov.fuel || { status: 'VESSEL_SPECIFIC', source: 'Tank Measurement' },
        crew: prov.crew || { status: 'OFFICIAL_SOURCED', source: 'Manning Regulations' },
        safetyEquipment: prov.safetyEquipment || { status: 'OFFICIAL_SOURCED', source: 'Fisheries Schedule' },
      },
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }
}
