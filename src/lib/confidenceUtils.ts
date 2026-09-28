import type { ConfidenceLevel } from '@/types/contract';

export interface CategoricalConfidenceInfo {
  level: ConfidenceLevel;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  borderClass: string;
}

/**
 * Maps numeric scores or categorical levels to honest evidence-support language.
 * Strictly prevents misleading "78.4% chance of safety" perceptions.
 */
export function getCategoricalConfidence(
  value: number | ConfidenceLevel | undefined
): CategoricalConfidenceInfo {
  let level: ConfidenceLevel = 'MODERATE';

  if (typeof value === 'string') {
    if (value === 'HIGH' || value === 'MODERATE' || value === 'LOW') {
      level = value;
    }
  } else if (typeof value === 'number') {
    if (value >= 85) {
      level = 'HIGH';
    } else if (value >= 70) {
      level = 'MODERATE';
    } else {
      level = 'LOW';
    }
  }

  switch (level) {
    case 'HIGH':
      return {
        level: 'HIGH',
        label: 'HIGH Evidence Support',
        shortLabel: 'HIGH SUPPORT',
        description: 'Multi-agency agreement with verified sensor telemetry and unbreached safety margins.',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        borderClass: 'border-emerald-500',
      };
    case 'MODERATE':
      return {
        level: 'MODERATE',
        label: 'MODERATE Evidence Support',
        shortLabel: 'MODERATE SUPPORT',
        description: 'Single-agency forecast or aging model; vessel safety envelope must be actively monitored.',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
        borderClass: 'border-amber-500',
      };
    case 'LOW':
    default:
      return {
        level: 'LOW',
        label: 'LOW Evidence Support',
        shortLabel: 'LOW SUPPORT',
        description: 'Degraded telemetry or missing external data streams; conservative caution enforced.',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
        borderClass: 'border-rose-500',
      };
  }
}
