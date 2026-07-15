import type { Category, ProfileId } from '../types';

export const DUAL_REPORT_ENDPOINTS = {
  createSnapshot: '/api/results',
  createCompatibilityReport: '/api/compatibility-report',
  deleteSnapshot: '/api/results/delete',
  createPublicShare: '/api/share-report',
  readPublicShare: '/api/share/:token',
  submitFeedback: '/api/analytics/feedback',
} as const;

export const DUAL_HISTORY_ENDPOINTS = {
  addOrUpdate: '/api/dual-history',
  batch: '/api/dual-history/batch',
  read: '/api/dual-history/',
  delete: '/api/dual-history',
  health: '/api/dual-history/health',
} as const;

export const DUAL_REPORT_VERSIONS = {
  questionVersion: 'questions-general-2026-06',
  snapshotVersion: 'snapshot-v1',
  compatibilityReportVersion: 'compatibility-v3',
  publicShareVersion: 'public-share-v1',
  dualHistoryVersion: 'history-v1',
} as const;

// v5.6: 4 维 = 3 核心(F/V/D) + 1 风格(R)
export type NormalizedScoreKey =
  | 'fieldIndependFieldDepend'   // F: 信息参照（场独立↔场依赖）
  | 'wholisticAnalytic'          // V: 认知视角（整体↔分析）
  | 'exploratoryDirected'        // D: 问题路径（探索↔定向）
  | 'impulsiveReflective';       // R: 决策风格（冲动↔反思）

export type CompatibilityDimensionKey =
  | 'field'      // F: 信息参照
  | 'vision'     // V: 认知视角
  | 'direction'  // D: 问题路径
  | 'rhythm';    // R: 决策风格

export type CompatibilityDimensionPattern =
  | 'similar'
  | 'opposite'
  | 'complementary'
  | 'moderate'
  | 'polarized'
  | 'friction';

export type CompatibilityPairPattern =
  | 'homogeneous'
  | 'complementary'
  | 'asymmetric'
  | 'conflicting';

export interface ResultSnapshotNormalizedScores {
  fieldIndependFieldDepend: number;
  wholisticAnalytic: number;
  exploratoryDirected: number;
  impulsiveReflective: number;
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
  rawAnswers?: Record<number, number>;
  /**
   * 用户是否同意将答题数据用于题目/评分分析优化。
   * - true: 后端写入 analytics:single:<friendId> 埋点（含 rawAnswers），用于离线分析
   * - false: 后端跳过 analytics 写入，仅保留 result:<friendId> 功能快照
   * 默认 true（用户在开始页可取消勾选）
   */
  analyticsConsent: boolean;
}

export interface CreateResultSnapshotResponse {
  friendId: string;
  deleteToken: string;
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
  highlight: boolean;
  oneLiner: string;
  shortLabel: string;
  description: string;
}

export interface MissionSuggestion {
  name: string;
  department: string;
  fitScore: number;
  reason: string;
  role: string;
  warning: string;
}

export interface CompatibilityBreakdown {
  cognitiveComplementarity: number;
  blindSpotCoverage: number;
  frictionRisk: number;
  rhythmSynergy: number;
}

export interface CompatibilityReport {
  reportVersion: typeof DUAL_REPORT_VERSIONS.compatibilityReportVersion;
  reportId?: string;
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
    patternBadge: PatternBadgeInfo;
    summary: string;
    shareCaption: string;
  };
  breakdown: CompatibilityBreakdown;
  breakdownTooltips: Record<string, string>;
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
  breakdownTooltips: Record<string, string>;
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

export interface PatternBadgeInfo {
  label: string;
  tagline: string;
  emoji: string;
  color: string;
}

export type FeedbackRating = 'accurate' | 'neutral' | 'inaccurate';

export interface SubmitFeedbackRequest {
  reportId: string;
  rating: FeedbackRating;
}

export interface SubmitFeedbackResponse {
  success: true;
}

export const PATTERN_BADGE_MAP: Record<CompatibilityPairPattern, PatternBadgeInfo> = {
  homogeneous: {
    label: '回声组',
    tagline: '默契天成，看世界的方式几乎一样',
    emoji: '🪞',
    color: '#00f0ff',
  },
  complementary: {
    label: '经纬组',
    tagline: '地图不会告诉你意义，但经纬一起，世界才可被定位',
    emoji: '🧩',
    color: '#00e676',
  },
  asymmetric: {
    label: '双星共轨组',
    tagline: '节奏不同，但能带着彼此往前转',
    emoji: '⚙️',
    color: '#ffb800',
  },
  conflicting: {
    label: '化学反应组',
    tagline: '碰撞不是结束，是反应开始。',
    emoji: '⚡',
    color: '#ff007f',
  },
};

export interface AddHistoryEntryRequest {
  friendId: string;
  version: 'history-v1';
  entry: {
    targetFriendId: string;
    targetProfileId: ProfileId;
    targetDisplayName: string;
    targetCallSign: string;
    targetDepartment: string;
    overallScore: number;
    pattern: CompatibilityPairPattern;
    generatedAt: number;
  };
}

export interface AddHistoryEntryResponse {
  data: {
    success: true;
    syncedAt: number;
    totalEntries: number;
  };
}

export interface GetHistoryResponse {
  data: {
    friendId: string;
    version: 'history-v1';
    entries: Array<{
      targetFriendId: string;
      targetProfileId: ProfileId;
      targetDisplayName: string;
      targetCallSign: string;
      targetDepartment: string;
      overallScore: number;
      pattern: CompatibilityPairPattern;
      generatedAt: number;
    }>;
    fetchedAt: number;
  };
}

export interface DeleteHistoryRequest {
  friendId: string;
  targetFriendId?: string;
}

export interface DeleteHistoryResponse {
  data: {
    success: true;
    deleted: number;
  };
}

export interface BatchHistoryEntryRequest {
  friendId: string;
  version: 'history-v1';
  entries: Array<{
    targetFriendId: string;
    targetProfileId: ProfileId;
    targetDisplayName: string;
    targetCallSign: string;
    targetDepartment: string;
    overallScore: number;
    pattern: CompatibilityPairPattern;
    generatedAt: number;
  }>;
}
