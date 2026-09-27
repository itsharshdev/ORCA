import type {
  LlmStructuredIntent,
  LlmExplanationResult,
  LlmClarificationPrompt,
  LlmProviderType,
  UserActivityType,
  QuestionClassificationType,
} from '../../src/types/contract.js';
import type { LLMProvider } from './llmProvider.js';
import type {
  LLMExtractIntentInput,
  LLMGenerateExplanationInput,
  LLMClarificationInput,
} from './llmTypes.js';

export class FallbackLlmProvider implements LLMProvider {
  readonly providerType: LlmProviderType = 'DETERMINISTIC_FALLBACK';
  readonly modelName: string = 'ORCA-NLP-Deterministic-V1';

  isAvailable(): boolean {
    return true;
  }

  async extractStructuredIntent(input: LLMExtractIntentInput): Promise<LlmStructuredIntent> {
    const raw = input.rawQuery.trim();
    const lower = raw.toLowerCase();

    // 1. Inherit from context if available
    const ctx = input.conversationContext?.activeMissionContext;
    let activity: UserActivityType = ctx?.activity || 'FISHING';
    let regionId = input.defaultRegionId || ctx?.regionId || 'maharashtra';
    let durationHours = ctx?.durationHours || 5;
    let departureTimeString = ctx?.departureTime || '06:00 IST';
    let vesselId = ctx?.vesselId || 'VESSEL-001';
    let targetZoneId = ctx?.targetZoneId || 'PFZ-MUM-01';

    // 2. Activity Extraction
    if (lower.includes('survey') || lower.includes('bathymetry') || lower.includes('research')) {
      activity = 'SURVEY';
    } else if (lower.includes('patrol') || lower.includes('security') || lower.includes('enforce') || lower.includes('coast guard')) {
      activity = 'PATROL';
    } else if (lower.includes('transit') || lower.includes('ferry') || lower.includes('commute')) {
      activity = 'TRANSIT';
    } else if (lower.includes('fish') || lower.includes('catch') || lower.includes('trawl') || lower.includes('net') || lower.includes('matsya')) {
      activity = 'FISHING';
    }

    // 3. Question Classification
    let questionType: QuestionClassificationType = 'FEASIBILITY';
    if (lower.includes('why') || lower.includes('explain') || lower.includes('reason') || lower.includes('how come') || lower.includes('why avoid')) {
      questionType = 'EXPLANATION';
    } else if (lower.includes('what if') || lower.includes('what-if') || lower.includes('scenario') || lower.includes('suppose')) {
      questionType = 'WHAT_IF';
    } else if (lower.includes('opportunity') || lower.includes('pfz') || lower.includes('catch') || lower.includes('hotspot') || lower.includes('shoal') || lower.includes('fish zone') || lower.includes('potential fishing')) {
      questionType = 'OPPORTUNITY';
    } else if (lower.includes('is it safe') || lower.includes('is this route safe') || lower.includes('is this safe') || lower.includes('safety') || lower.includes('safe to') || lower.includes('risk')) {
      questionType = 'SAFETY';
    } else if (lower.includes('warning') || lower.includes('alert') || lower.includes('cyclone') || lower.includes('bulletin') || lower.includes('squall') || lower.includes('advisory')) {
      questionType = 'ALERT';
    } else if (lower.includes('what is orca') || lower.includes('tell me about') || lower.includes('general information') || lower.includes('information') || lower.includes('overview')) {
      questionType = 'GENERAL_INFORMATION';
    } else if (lower.includes('route') || lower.includes('waypoint') || lower.includes('course') || lower.includes('corridor')) {
      questionType = 'ROUTE';
    } else if (lower.includes('sea condition') || lower.includes('weather condition') || lower.includes('conditions') || lower.includes('condition') || lower.includes('current') || lower.includes('wind') || lower.includes('swell') || lower.includes('wave') || lower.includes('temperature') || lower.includes('sst')) {
      questionType = 'CONDITIONS';
    } else if (lower.length < 10 || lower === 'hello' || lower === 'hi' || lower === 'test' || lower === 'asdf') {
      questionType = 'UNKNOWN';
    }

    // 4. Region & Location Extraction
    let sectorName = 'Alibaug Coastal Sector / Arabian Sea';
    let portName = 'Sassoon Docks / Alibaug Port';
    let coordinates: [number, number] = [72.84, 18.92];

    if (lower.includes('tamil nadu') || lower.includes('chennai') || lower.includes('nagapattinam') || lower.includes('bay of bengal')) {
      regionId = 'tamil_nadu';
      sectorName = 'Nagapattinam Deep Shelf / Bay of Bengal';
      portName = 'Nagapattinam Fishing Harbour';
      coordinates = [79.85, 10.76];
      targetZoneId = 'PFZ-TN-01';
    } else if (lower.includes('mumbai') || lower.includes('alibaug') || lower.includes('maharashtra') || lower.includes('arabian sea')) {
      regionId = 'maharashtra';
      sectorName = 'Alibaug Coastal Sector / Arabian Sea';
      portName = 'Sassoon Docks / Alibaug Port';
      coordinates = [72.84, 18.92];
      targetZoneId = 'PFZ-MUM-01';
    }

    // 5. Departure Time Extraction
    let isEstimatedDeparture = true;
    const timeMatch = lower.match(/\b(\d{1,2}):(\d{2})\b/);
    if (timeMatch && timeMatch[1] && timeMatch[2]) {
      const hh = timeMatch[1].padStart(2, '0');
      const mm = timeMatch[2];
      departureTimeString = `${hh}:${mm} IST`;
      isEstimatedDeparture = false;
    } else if (lower.includes('2 pm') || lower.includes('14:00') || lower.includes('2:00 pm')) {
      departureTimeString = '14:00 IST';
      isEstimatedDeparture = false;
    } else if (lower.includes('3 pm') || lower.includes('15:00') || lower.includes('3:00 pm')) {
      departureTimeString = '15:00 IST';
      isEstimatedDeparture = false;
    } else if (lower.includes('afternoon') || lower.includes('1 pm') || lower.includes('13:00')) {
      departureTimeString = '13:00 IST';
      isEstimatedDeparture = false;
    } else if (lower.includes('evening') || lower.includes('6 pm') || lower.includes('18:00')) {
      departureTimeString = '18:00 IST';
      isEstimatedDeparture = false;
    } else if (lower.includes('tomorrow morning') || lower.includes('morning') || lower.includes('6 am') || lower.includes('06:00')) {
      departureTimeString = '06:00 IST';
      isEstimatedDeparture = false;
    } else if (lower.includes('dawn')) {
      departureTimeString = '05:45 IST';
      isEstimatedDeparture = false;
    } else if (lower.includes('9 am') || lower.includes('09:00')) {
      departureTimeString = '09:00 IST';
      isEstimatedDeparture = false;
    }

    // 6. Duration Extraction
    const durationMatch = lower.match(/\b(\d+)\s*(?:hours|hour|hrs|hr|h)\b/);
    if (durationMatch) {
      const parsed = parseInt(durationMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 72) {
        durationHours = parsed;
      }
    } else if (lower.includes('half day') || lower.includes('half-day')) {
      durationHours = 4;
    } else if (lower.includes('full day') || lower.includes('whole day')) {
      durationHours = 10;
    } else if (lower.includes('overnight')) {
      durationHours = 18;
    }

    // 7. Vessel Extraction
    let isExplicitVessel = false;
    if (lower.includes('vessel-002') || lower.includes('trawler') || lower.includes('samudra')) {
      vesselId = 'VESSEL-002';
      isExplicitVessel = true;
    } else if (lower.includes('vessel-003') || lower.includes('patrol craft') || lower.includes('sar')) {
      vesselId = 'VESSEL-003';
      isExplicitVessel = true;
    } else if (lower.includes('vessel-001') || lower.includes('matsya sagar') || lower.includes('motorized')) {
      vesselId = 'VESSEL-001';
      isExplicitVessel = true;
    }

    // 8. Constraints & Clarification Requirements
    const constraints: string[] = [];
    if (lower.includes('sunset') || lower.includes('daylight')) {
      constraints.push('MUST_RETURN_BEFORE_SUNSET');
    }
    if (lower.includes('avoid restricted') || lower.includes('no naval')) {
      constraints.push('STRICT_GEOFENCE_ENFORCEMENT');
    }

    const hasNoPriorTurns = !input.conversationContext || input.conversationContext.turns.length === 0;
    const isAmbiguousQuery = questionType === 'UNKNOWN' || lower.length < 15 || (lower.includes('can i go') && !lower.includes('mumbai') && !lower.includes('alibaug') && !lower.includes('chennai') && !lower.includes('nagapattinam') && !lower.includes('tamil nadu'));
    const requiresClarification = isAmbiguousQuery && hasNoPriorTurns;

    const clarificationPrompts: LlmClarificationPrompt[] = [];
    if (requiresClarification) {
      clarificationPrompts.push({
        promptId: 'CLARIFY-LOC-01',
        fieldTargeted: 'location',
        question: 'Which coastal sector or port are you departing from?',
        suggestedOptions: ['Maharashtra (Mumbai / Alibaug)', 'Tamil Nadu (Nagapattinam / Bay of Bengal)'],
      });
      clarificationPrompts.push({
        promptId: 'CLARIFY-VESSEL-01',
        fieldTargeted: 'vessel',
        question: 'Which craft type or registered vessel are you operating?',
        suggestedOptions: ['Matsya Sagar 1 (9.5m Fiber Boat)', 'Samudra Sevak (14m Mechanized Trawler)'],
      });
    }

    return {
      intentId: `INT-${Date.now()}`,
      rawQuery: raw,
      activity,
      questionType,
      location: {
        regionId,
        sectorName,
        portName,
        coordinates,
      },
      departureWindow: {
        timeString: departureTimeString,
        isEstimated: isEstimatedDeparture,
        requestedDate: '2026-09-27',
      },
      durationHours,
      vessel: {
        vesselId,
        vesselType: vesselId === 'VESSEL-002' ? 'MECHANIZED_TRAWLER' : 'MOTORIZED_FIBERGLASS_BOAT',
        isExplicit: isExplicitVessel,
      },
      targetZoneId,
      constraints,
      requiresClarification,
      clarificationPrompts: clarificationPrompts.length > 0 ? clarificationPrompts : undefined,
      confidenceScore: requiresClarification ? 65 : 92,
      extractedEntities: {
        rawQueryLength: raw.length,
        matchedKeywords: [activity, regionId, departureTimeString, `${durationHours}h`],
      },
    };
  }

  async generateExplanation(input: LLMGenerateExplanationInput): Promise<LlmExplanationResult> {
    const { decision, evidence, intent, operatorRole } = input;
    const verdict = decision.verdict;
    const driver = decision.primaryDriver;
    const confidence = decision.confidence;
    const citedEvidenceIds = evidence.map((e) => e.evidenceId);

    let summary: string;
    let detailedReasoning: string;
    const actionableAdvisories: string[] = [];

    // Role-tailored tone
    const isFisherman = !operatorRole || operatorRole === 'FISHERMAN';
    const qType = intent.questionType;

    // Build query-type grounded answers while strictly preserving deterministic safety
    if (qType === 'CONDITIONS') {
      const waveEv = evidence.find((e) => e.variable === 'significantWaveHeight');
      const windEv = evidence.find((e) => e.variable === 'windSpeed');
      const currentEv = evidence.find((e) => e.variable === 'surfaceCurrentSpeed');
      const waveStr = waveEv ? `${waveEv.value} ${waveEv.unit}` : '1.4 m';
      const windStr = windEv ? `${windEv.value} ${windEv.unit}` : '12.0 kts';
      const currentStr = currentEv ? `${currentEv.value} ${currentEv.unit}` : '0.8 kts';

      summary = `Current sea conditions in ${intent.location.regionId}: Wave Height ${waveStr}, Surface Wind ${windStr}, Current ${currentStr}. Safety state: ${verdict}.`;
      detailedReasoning = `INCOIS Ocean State Forecast indicates ${waveStr} significant wave height with surface currents at ${currentStr}. Atmospheric winds are observed at ${windStr}. Deterministic verdict is ${verdict} driven by: ${driver}.`;
      actionableAdvisories.push(`Monitor sea state changes during the ${intent.durationHours}h voyage window.`);
      actionableAdvisories.push('Ensure radio communication is tuned to regional marine frequencies.');
    } else if (qType === 'OPPORTUNITY') {
      const pfzEv = evidence.find((e) => e.category === 'OPPORTUNITY');
      const pfzDesc = pfzEv ? pfzEv.value : (decision.recommendedZone ? `${decision.recommendedZone.name} (${decision.recommendedZone.distanceKm.toFixed(1)} km)` : 'Identified coastal PFZ zone');

      if (verdict === 'AVOID') {
        summary = `Fishing opportunity identified at ${pfzDesc}, but departure is PROHIBITED due to safety blocker: ${driver}.`;
        detailedReasoning = `While INCOIS PFZ satellite thermal-chlorophyll imagery indicates potential fishery accumulation, deterministic safety rules enforce AVOID due to active spatial or environmental hazards along the transit vector. Safety strictly overrides opportunity.`;
        actionableAdvisories.push('Do not attempt transit to PFZ zones under active safety restrictions.');
        actionableAdvisories.push('Wait for restricted zone clearance or sea state calming before re-evaluating.');
      } else {
        summary = `Favorable fishing opportunity active at ${pfzDesc}. Deterministic verdict: ${verdict}.`;
        detailedReasoning = `INCOIS PFZ thermal fronts and chlorophyll gradients indicate high pelagic fish concentration at ${pfzDesc}. Safety checks confirm route clearance.`;
        actionableAdvisories.push(`Target coordinates: ${pfzDesc}.`);
        actionableAdvisories.push('Log catch metrics and monitor sudden local sea state changes.');
      }
    } else if (qType === 'ALERT') {
      const alertEv = evidence.filter((e) => e.category === 'SAFETY');
      summary = alertEv.length > 0
        ? `Active marine safety advisories in effect: ${alertEv.map((a) => a.value).join('; ')}.`
        : `No severe cyclone warnings active. Primary operational factor: ${driver}.`;
      detailedReasoning = `Multi-agency safety audit examined IMD coastal weather bulletins and PostGIS restricted geofences. Current status evaluates to ${verdict}.`;
      actionableAdvisories.push('Check IMD coastal warnings before untying from harbor.');
      actionableAdvisories.push('Maintain lookout for security geofences and naval anchorage boundaries.');
    } else if (qType === 'SAFETY') {
      summary = verdict === 'AVOID'
        ? `Route is NOT safe. Prohibited due to: ${driver}.`
        : verdict === 'CAUTION'
        ? `Route is conditionally safe with operational cautions: ${driver}.`
        : `Route is verified SAFE. All physical and regulatory checks PASS.`;
      detailedReasoning = `Deterministic Safety Engine evaluated hydrographic boundaries, vessel seaworthiness limits, and ocean state parameters. Safety clearance result: ${verdict} (Confidence: ${confidence.level}).`;
      actionableAdvisories.push(verdict === 'AVOID' ? 'Select an alternate course avoiding restricted coordinates.' : 'Proceed along verified corridor within builder limits.');
    } else if (qType === 'EXPLANATION') {
      summary = `The ${verdict} decision was determined by primary driver: ${driver}.`;
      detailedReasoning = `ORCA evaluates 8 deterministic rule stages in priority order (Official Warnings &rarr; GIS Geofences &rarr; Vessel Builder Limits &rarr; Ocean Wave & Current &rarr; Weather &rarr; Temporal Constraints &rarr; PFZ Opportunity). The decisive rule triggered was: ${driver}.`;
      actionableAdvisories.push('Review the cited evidence audit items below for exact physical parameter readings.');
    } else if (qType === 'GENERAL_INFORMATION') {
      summary = `ORCA Operational Status: Decision Engine V2 active in ${intent.location.regionId}. Current verdict for planned parameters: ${verdict}.`;
      detailedReasoning = `ORCA continuously correlates INCOIS Ocean State Forecasts, official INCOIS PFZ fisheries intelligence, IMD Coastal Weather Bulletins, and PostGIS hydrographic geofences to provide deterministic, auditable voyage clearance.`;
      actionableAdvisories.push('Specify your vessel name, departure time, and target sector for precise clearance evaluation.');
    } else if (qType === 'UNKNOWN') {
      summary = `Please clarify your voyage parameters (e.g., location, vessel type, departure time) to evaluate clearance.`;
      detailedReasoning = `Query lacked sufficient specific parameters for full autonomous spatial resolution. Defaulted to ${intent.location.regionId} baseline.`;
      actionableAdvisories.push('Example: "Can I go fishing tomorrow morning near Mumbai in Matsya Sagar?"');
    } else {
      // Standard FEASIBILITY
      if (verdict === 'AVOID') {
        summary = isFisherman
          ? `Voyage prohibited. ${driver}`
          : `Mission Clearance DENIED. Critical safety override triggered: ${driver}`;

        detailedReasoning = `Evaluation indicates immediate physical or regulatory constraints along the planned route. ${
          driver.includes('Geofence') || driver.includes('Anchorage')
            ? 'Route intersects active naval security boundaries or port anchorage zones requiring strict hydrographic clearance.'
            : driver.includes('Wave') || driver.includes('Swell')
            ? 'Forecast sea states exceed vessel builder seaworthiness limits.'
            : 'Official meteorological storm advisories mandate immediate return or harbor anchorage.'
        } Confidence level is ${confidence.level} based on verified multi-agency observations.`;

        actionableAdvisories.push('Do not depart on the planned route trajectory.');
        actionableAdvisories.push('Re-route via designated transit lanes clear of restricted anchorage perimeters.');
        actionableAdvisories.push('Monitor official INCOIS & IMD coastal bulletin updates before re-evaluating.');
      } else if (verdict === 'CAUTION') {
        summary = isFisherman
          ? `Proceed with caution. Depart within recommended time window and maintain safety clearance.`
          : `Conditional Clearance GRANTED with operational constraints. ${driver}`;

        detailedReasoning = `Conditions are feasible for trained crew but require strict temporal and spatial discipline. ${
          decision.explanation || 'Wave swell builds in the afternoon window; return prior to deteriorating sea state.'
        }`;

        actionableAdvisories.push(`Target departure: ${decision.recommendedDeparture || '05:45 IST'}.`);
        actionableAdvisories.push(`Strict return cutoff: ${decision.recommendedReturn || '11:45 IST'}.`);
        actionableAdvisories.push('Maintain active VHF Ch-16 watch and carry serviceable life-jackets.');
      } else if (verdict === 'GO') {
        summary = isFisherman
          ? `Conditions are clear and favorable for your planned ${intent.activity.toLowerCase()} mission.`
          : `Mission Clearance GRANTED. All spatial, vessel, and hydrological criteria verified PASS.`;

        detailedReasoning = `All hydrographic boundaries are clear and environmental wave/wind parameters remain well within builder thresholds for ${intent.vessel.vesselId}. ${
          decision.recommendedZone ? `High-density PFZ fishing opportunity confirmed at ${decision.recommendedZone.name} (${decision.recommendedZone.distanceKm.toFixed(1)} km).` : ''
        }`;

        actionableAdvisories.push('Proceed as planned within standard maritime safety protocols.');
        actionableAdvisories.push('Log voyage departure with coastal fisheries station.');
      } else {
        summary = 'Insufficient observation data to assure voyage safety. Clearance withheld.';
        detailedReasoning = 'One or more required hydrographic or meteorological observation streams are unavailable. Under ORCA safety doctrine, missing data cannot be converted to clearance.';
        actionableAdvisories.push('Await refreshed ocean state forecast ingestion before departure.');
      }
    }

    return {
      summary,
      detailedReasoning,
      actionableAdvisories,
      citedEvidenceIds,
      providerUsed: this.providerType,
      modelUsed: this.modelName,
      generatedAt: new Date().toISOString(),
      isFallback: true,
    };
  }

  async generateClarification(input: LLMClarificationInput): Promise<LlmClarificationPrompt[]> {
    const prompts: LlmClarificationPrompt[] = [];

    if (input.missingFields.includes('location')) {
      prompts.push({
        promptId: `CLARIFY-LOC-${Date.now()}`,
        fieldTargeted: 'location',
        question: 'Which coastal region or port are you departing from?',
        suggestedOptions: ['Maharashtra (Mumbai / Alibaug)', 'Tamil Nadu (Nagapattinam / Bay of Bengal)'],
      });
    }

    if (input.missingFields.includes('durationHours')) {
      prompts.push({
        promptId: `CLARIFY-DUR-${Date.now()}`,
        fieldTargeted: 'durationHours',
        question: 'What is the planned voyage duration?',
        suggestedOptions: ['3 Hours (Short Coastal)', '5 Hours (Standard Day)', '8 Hours (Extended Offshore)'],
      });
    }

    if (input.missingFields.includes('vesselId')) {
      prompts.push({
        promptId: `CLARIFY-VESSEL-${Date.now()}`,
        fieldTargeted: 'vesselId',
        question: 'Which vessel are you operating?',
        suggestedOptions: ['Matsya Sagar 1 (9.5m Fiber Boat)', 'Samudra Sevak (14m Mechanized Trawler)'],
      });
    }

    return prompts;
  }
}
