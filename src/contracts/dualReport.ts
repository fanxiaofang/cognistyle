import type { Category, ProfileId } from '../types';

export const DUAL_REPORT_ENDPOINTS = {
  createSnapshot: '/api/results',
  createCompatibilityReport: '/api/compatibility-report',
  deleteSnapshot: '/api/results/delete',
  createPublicShare: '/api/share-report',
  readPublicShare: '/api/share/:token',
} as const;

export const DUAL_REPORT_VERSIONS = {
  questionVersion: 'questions-general-2026-05',
  snapshotVersion: 'snapshot-v1',
  compatibilityReportVersion: 'compatibility-v1',
  publicShareVersion: 'public-share-v1',
} as const;

export type NormalizedScoreKey =
  | 'impulsiveReflective'
  | 'convergentDivergent'
  | 'wholisticAnalytic'
  | 'soloTeam'
  | 'verbalImagery';

export type CompatibilityDimensionKey =
  | 'rhythm'
  | 'strategy'
  | 'vision'
  | 'collaboration';

export const NORMALIZED_SCORE_SEMANTICS = {
  impulsiveReflective: {
    zero: 'impulsive',
    one: 'reflective',
    sourceDimensionId: 'impulsive_reflective',
  },
  convergentDivergent: {
    zero: 'convergent',
    one: 'divergent',
    sourceDimensionId: 'convergent_divergent',
  },
  wholisticAnalytic: {
    zero: 'wholistic',
    one: 'analytic',
    sourceDimensionId: 'wholistic_analytic',
  },
  soloTeam: {
    zero: 'solo',
    one: 'team',
    sourceDimensionId: 'solo_team',
  },
  verbalImagery: {
    zero: 'verbal',
    one: 'imagery',
    sourceDimensionId: 'verbal_imagery',
  },
} as const;

export interface ResultSnapshotNormalizedScores {
  impulsiveReflective: number;
  convergentDivergent: number;
  wholisticAnalytic: number;
  soloTeam: number;
  verbalImagery?: number;
}

export interface SnapshotArchetypeMatch {
  key: string;
  matchScore: number;
}

export interface ResultSnapshotDisplay {
  displayName: string;
  callSign: string;
  department: string;
  rank: string;
  avatar: string;
}

export interface CreateResultSnapshotRequest {
  category: Extract<Category, 'general'>;
  questionVersion: typeof DUAL_REPORT_VERSIONS.questionVersion;
  snapshotVersion: typeof DUAL_REPORT_VERSIONS.snapshotVersion;
  profileId: ProfileId;
  primaryArchetype: SnapshotArchetypeMatch;
  secondaryArchetype: SnapshotArchetypeMatch;
  normalizedScores: ResultSnapshotNormalizedScores;
  display: ResultSnapshotDisplay;
}

export interface CreateResultSnapshotResponse {
  friendId: string;
  deleteToken: string;
  expiresAt: number;
}

export interface ResultSnapshotRecord extends CreateResultSnapshotRequest {
  friendId: string;
  deleteTokenHash: string;
  createdAt: number;
  expiresAt: number;
}

export interface LocalResultIdentity {
  friendId: string;
  deleteToken: string;
  createdAt: number;
  expiresAt: number;
  snapshotVersion: typeof DUAL_REPORT_VERSIONS.snapshotVersion;
}

export interface DeleteResultSnapshotRequest {
  friendId: string;
  deleteToken: string;
}

export interface DeleteResultSnapshotResponse {
  success: true;
}

export interface CompatibilityPairIdentity {
  friendId: string;
  profileId: ProfileId;
  displayName: string;
  callSign: string;
  department: string;
  rank: string;
  avatar: string;
}

export interface CompatibilityDimensionResult {
  score: number;
  delta: number;
  interpretation: string;
}

export interface MissionSuggestion {
  name: string;
  department: string;
  fitScore: number;
  reason: string;
}

export interface CompatibilityBreakdown {
  cognitiveComplementarity: number;
  collaborationCompatibility: number;
  blindSpotCoverage: number;
  frictionRisk: number;
}

export interface CompatibilityReport {
  reportVersion: typeof DUAL_REPORT_VERSIONS.compatibilityReportVersion;
  generatedAt: number;
  pair: {
    userA: CompatibilityPairIdentity;
    userB: CompatibilityPairIdentity;
  };
  overall: {
    score: number;
    rating: string;
    summary: string;
  };
  breakdown: CompatibilityBreakdown;
  dimensions: Record<CompatibilityDimensionKey, CompatibilityDimensionResult>;
  recommendations: {
    bestFor: string[];
    shouldAvoid: string[];
    communicationTips: string[];
    missionSuggestions: MissionSuggestion[];
  };
}

export interface CreateCompatibilityReportRequest {
  myFriendId: string;
  targetFriendId: string;
}

export interface CreatePublicShareRequest {
  myFriendId: string;
  targetFriendId: string;
}

export interface CreatePublicShareResponse {
  token: string;
  shareUrl: string;
  expiresAt: number;
}

export interface PublicCompatibilityReport {
  token: string;
  createdAt: number;
  expiresAt: number;
  reportVersion: typeof DUAL_REPORT_VERSIONS.publicShareVersion;
  overall: CompatibilityReport['overall'];
  breakdown: CompatibilityBreakdown;
  dimensions: CompatibilityReport['dimensions'];
  recommendations: CompatibilityReport['recommendations'];
}

export interface ApiErrorResponse {
  error: string;
  code:
    | 'BAD_REQUEST'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'RATE_LIMITED'
    | 'INTERNAL_ERROR';
}

export const DUAL_REPORT_MODULE_BOUNDARIES = {
  singleReportActions: [
    'save current single-result snapshot',
    'show current friendId',
    'accept target friendId input',
    'start compatibility report flow',
    'delete current snapshot',
  ],
  dualReportPage: [
    'render compatibility report only',
    'must not reuse second-profile toggle logic',
    'read target friendId from route',
    'request report from compatibility endpoint',
  ],
  publicSharePage: [
    'render redacted public report',
    'must not access local deleteToken',
    'must not require local friendId',
  ],
} as const;
