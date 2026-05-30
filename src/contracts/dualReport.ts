import type { Category, ProfileId } from '../types';

export const DUAL_REPORT_ENDPOINTS = {
  createSnapshot: '/api/results',
  createCompatibilityReport: '/api/compatibility-report',
  deleteSnapshot: '/api/results/delete',
  createPublicShare: '/api/share-report',
  readPublicShare: '/api/share/:token',
} as const;

export const DUAL_REPORT_VERSIONS = {
  questionVersion: 'questions-general-2026-06',
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

export type CompatibilityDimensionPattern =
  | 'similar'
  | 'opposite'
  | 'complementary'
  | 'moderate'
  | 'friction';

export type CompatibilityPairPattern =
  | 'homogeneous'
  | 'complementary'
  | 'asymmetric'
  | 'conflicting';

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
  pattern: CompatibilityDimensionPattern;
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
  readingGuide: string;
  pair: {
    userA: CompatibilityPairIdentity;
    userB: CompatibilityPairIdentity;
  };
  overall: {
    score: number;
    rating: string;
    pattern: CompatibilityPairPattern;
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
  readingGuide: string;
  pair: {
    userA: CompatibilityPairIdentity;
    userB: CompatibilityPairIdentity;
  };
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

export interface PatternBadgeInfo {
  label: string;
  tagline: string;
  color: string;
}

export const PATTERN_BADGE_MAP: Record<CompatibilityPairPattern, PatternBadgeInfo> = {
  homogeneous: {
    label: '镜像搭档',
    tagline: '你们太像了，适合背靠背作战，但要小心一起盲区',
    color: '#00f0ff',
  },
  complementary: {
    label: '拼图搭档',
    tagline: '你们互补得刚刚好，一人开脑洞一人踩刹车',
    color: '#39ff14',
  },
  asymmetric: {
    label: '专精搭档',
    tagline: '某一方主导，另一方在特定领域补位',
    color: '#ffe600',
  },
  conflicting: {
    label: '火花搭档',
    tagline: '你们容易吵架，但吵完方案更好',
    color: '#ff007f',
  },
};
