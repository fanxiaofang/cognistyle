import { cognitiveProfiles } from '../data/suggestions';
import type { ArchetypeKey, CognitiveProfile, DimensionScore, ModeKey } from '../types';
import { buildProfileId } from '../types';
import {
  DUAL_REPORT_VERSIONS,
  type CreateResultSnapshotRequest,
  type ResultSnapshotNormalizedScores,
  type SnapshotArchetypeMatch,
} from '../contracts/dualReport';

type ResultScoreLike = Pick<DimensionScore, 'id' | 'normalizedScore'>;

interface BuildResultSnapshotInput {
  category: 'general';
  scoreMap: Record<string, number>;
  scores: ResultScoreLike[];
  primaryArchetype: SnapshotArchetypeMatch;
  secondaryArchetype: SnapshotArchetypeMatch;
  rawAnswers?: Record<number, number>;
}

interface ResolvedPrimaryProfile {
  matchedMode: ModeKey;
  profileId: CreateResultSnapshotRequest['profileId'];
  profile: CognitiveProfile;
}

function buildFallbackProfile(
  profileId: CreateResultSnapshotRequest['profileId'],
  matchedMode: ModeKey
): CognitiveProfile {
  return {
    id: profileId,
    archetype: profileId.split('-').slice(0, 3).join('-') as CognitiveProfile['archetype'],
    mode: matchedMode,
    displayName: '多维综合思考型',
    callSign: '均衡',
    department: '应急局',
    rank: '综合特勤',
    avatar: '🧩',
    visual: {
      pose: '',
      background: '',
      lighting: '',
      atmosphere: '',
      colorTone: 'slate-900',
      accent: 'neutral',
    },
    essence: '',
    cognitivePattern: [],
    workplaceEdge: [],
    growthTip: '',
    collaboration: '',
    flavorText: '',
  };
}

export function resolvePrimaryProfile({
  scoreMap,
  primaryArchetype,
}: Pick<BuildResultSnapshotInput, 'scoreMap' | 'primaryArchetype'>): ResolvedPrimaryProfile {
  // style label: impulsive_reflective dimension → I (impulsive) or R (reflective)
  const styleRawScore = scoreMap['impulsive_reflective'] ?? 0;
  const matchedMode: ModeKey = styleRawScore >= 0 ? 'R' : 'I';
  const profileId = buildProfileId(primaryArchetype.key as ArchetypeKey, matchedMode);
  const profile = cognitiveProfiles[profileId] || buildFallbackProfile(profileId, matchedMode);

  return {
    matchedMode,
    profileId,
    profile,
  };
}

function clampNormalizedScore(score?: number): number | undefined {
  if (typeof score !== 'number' || Number.isNaN(score)) return undefined;
  return Math.min(1, Math.max(0, score / 100));
}

function buildNormalizedScores(scores: ResultScoreLike[]): ResultSnapshotNormalizedScores {
  const getScore = (id: string) => scores.find((item) => item.id === id)?.normalizedScore;

  return {
    fieldIndependFieldDepend: clampNormalizedScore(getScore('fieldIndepend_fieldDepend')) ?? 0.5,
    wholisticAnalytic:         clampNormalizedScore(getScore('wholistic_analytic')) ?? 0.5,
    // 取反：percentage 方向是 0=E(探索)→100=D(定向)，而报告语义需要 0→1 表示更偏探索
    exploratoryDirected:       clampNormalizedScore(100 - (getScore('exploratory_directed') ?? 50)) ?? 0.5,
    impulsiveReflective:       clampNormalizedScore(getScore('impulsive_reflective')) ?? 0.5,
  };
}

export function buildResultSnapshot({
  category,
  scoreMap,
  scores,
  primaryArchetype,
  secondaryArchetype,
  rawAnswers,
}: BuildResultSnapshotInput): CreateResultSnapshotRequest {
  const { profileId, profile } = resolvePrimaryProfile({ scoreMap, primaryArchetype });

  return {
    category,
    questionVersion: DUAL_REPORT_VERSIONS.questionVersion,
    snapshotVersion: DUAL_REPORT_VERSIONS.snapshotVersion,
    profileId,
    primaryArchetype,
    secondaryArchetype,
    normalizedScores: buildNormalizedScores(scores),
    display: {
      displayName: profile.displayName,
      callSign: profile.callSign,
      department: profile.department,
      rank: profile.rank,
      avatar: profile.avatar,
    },
    rawAnswers,
  };
}
