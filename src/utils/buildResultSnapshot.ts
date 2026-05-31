import { cognitiveProfiles, buildProfileId } from '../data/suggestions';
import type { CognitiveProfile, DimensionScore, ModeKey } from '../types';
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
  const matchedMode: ModeKey = (scoreMap['solo_team'] ?? 12.5) >= 12.5 ? 'T' : 'S';
  const profileId = buildProfileId(primaryArchetype.key as any, matchedMode);
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
    impulsiveReflective: clampNormalizedScore(getScore('impulsive_reflective')) ?? 0.5,
    convergentDivergent: clampNormalizedScore(getScore('convergent_divergent')) ?? 0.5,
    wholisticAnalytic: clampNormalizedScore(getScore('wholistic_analytic')) ?? 0.5,
    soloTeam: clampNormalizedScore(getScore('solo_team')) ?? 0.5,
  };
}

export function buildResultSnapshot({
  category,
  scoreMap,
  scores,
  primaryArchetype,
  secondaryArchetype,
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
  };
}
