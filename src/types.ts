/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================
// 第一层：核心认知维度（3维，6极）—— 决定认知原型
// ============================================

export type CoreDimensionId = 
  | 'fieldIndepend_fieldDepend'      // 场定位：场独立 vs 场依赖
  | 'wholistic_analytic'            // 视野焦点：整体 vs 分析
  | 'exploratory_directed';         // 认知取向：探索 vs 定向

export type CorePolarityKey = 
  | 'fieldIndepend' | 'fieldDepend' 
  | 'wholistic' | 'analytic' 
  | 'exploratory' | 'directed';

export interface CoreDimensionMetadata {
  id: CoreDimensionId;
  label: string;
  leftPolarity: { 
    key: CorePolarityKey; 
    label: string; 
    description: string;
  };
  rightPolarity: { 
    key: CorePolarityKey; 
    label: string; 
    description: string;
  };
}

// ============================================
// 风格标签维度（1维，2极）—— 不参与原型判定
// ============================================

export type LabelDimensionId = 'impulsive_reflective';

export type LabelPolarityKey = 'impulsive' | 'reflective';

// ============================================
// 组合维度类型（用于测验计算）
// ============================================

export type AllDimensionId = CoreDimensionId | LabelDimensionId;
export type AllPolarityKey = CorePolarityKey | LabelPolarityKey;

// ============================================
// 测验题目结构（双端五档量表）
// ============================================

export interface Question {
  id: number;
  dimension: CoreDimensionId | LabelDimensionId;
  prompt: string;
  leftText: string;
  rightText: string;
  text?: string;
}

export type QuestionCategory = 'programmer' | 'general';

export type Category = QuestionCategory;

export interface QuestionBank {
  category: QuestionCategory;
  questions: Question[];
}

// ============================================
// 用户作答与得分
// ============================================

export interface UserAnswers {
  [questionId: number]: number;  // -2 ~ +2 双端五档量表
}

export interface DimensionScore {
  id: AllDimensionId;
  label: string;
  rawScore: number;              // 原始总分（如 -12 ~ +12）
  percentage: number;            // 百分比归一化 0 ~ 100
  polarity: AllPolarityKey;      // 当前偏向的极性
  strength: 'balanced' | 'moderate' | 'strong';  // 倾向强度（均衡/偏向/显著偏向）
}

// ============================================
// 原型与职业系统（8 原型 × 2 风格标签 = 16 职业子类型）
// ============================================

// 8个认知原型（3维笛卡尔积）
export type ArchetypeKey = 
  | 'FI-D-W' | 'FI-D-A' | 'FD-D-W' | 'FD-D-A'
  | 'FI-E-W' | 'FI-E-A' | 'FD-E-W' | 'FD-E-A';

// 2种风格标签（冲动 / 反思）
export type ModeKey = 'I' | 'R';

// 16 职业子类型完整 ID
export type ProfileId = `${ArchetypeKey}-${ModeKey}`;

// 世界观部门（赛博朋克城市）
export type DepartmentId = 
  | 'emergency'    // 应急局
  | 'control'      // 中枢塔
  | 'frontier'     // 边界署
  | 'relic'        // 遗迹司
  | 'standard'     // 标准局
  | 'lifeguard'    // 生命监察局
  | 'workshop'     // 黑市工坊
  | 'biotech';     // 生科所

// 行会
export type GuildId = 'foundation' | 'sentry' | 'explorers' | 'alchemists';

// 视觉主题
export interface VisualTheme {
  pose: string;
  background: string;
  lighting: string;
  atmosphere: string;
  colorTone: string;
  accent: string;
}

// ============================================
// 展示层数据结构：16 职业子类型
// ============================================

export interface CognitiveProfile {
  id: ProfileId;
  archetype: ArchetypeKey;
  profession: string;       // 职业名称：整合者、架构师、开拓者等
  mode: ModeKey;
  displayName: string;
  department: string;
  rank: string;
  callSign: string;
  avatar: string;
  visual: VisualTheme;
  essence: string;
  cognitivePattern: string[];
  workplaceEdge: string[];
  growthTip: string;
  collaboration: string;
  flavorText: string;
}

// ============================================
// 辅助类型：测验结果与报告
// ============================================

export interface TestResult {
  // 维度得分
  coreDimensions: DimensionScore[];       // 3 核心维
  styleLabel: DimensionScore;             // 风格标签（冲动/反思）
  
  // 匹配结果
  matchedArchetype: ArchetypeKey;
  matchedMode: ModeKey;
  profileId: ProfileId;
  
  // 连续谱信息（避免类型固化）
  archetypeSpectrum: {
    archetype: ArchetypeKey;
    matchScore: number;  // 0-100，该原型匹配度
  }[];
  
  // 推荐最合适的搭档
  complementaryProfiles: ProfileId[];
}

// ============================================
// 交互场景（用于结果页沉浸式体验）
// ============================================

export type MethodType = 'code' | 'flow' | 'checklist' | 'diagram' | 'prototype';

export interface ScenarioOption {
  label: string;
  polarity: AllPolarityKey;
  archetypeMatch: ArchetypeKey[];
  methodTitle: string;
  methodType: MethodType;
  methodContent: string;
}

export interface InteractiveScenario {
  id: string;
  title: string;
  context: string;
  question: string;
  options: ScenarioOption[];
}

// ============================================
// 常量
// ============================================

export const ARCHETYPE_KEYS: ArchetypeKey[] = [
  'FI-D-W', 'FI-D-A', 'FD-D-W', 'FD-D-A',
  'FI-E-W', 'FI-E-A', 'FD-E-W', 'FD-E-A'
];

export const MODE_KEYS: ModeKey[] = ['I', 'R'];

export const DEPARTMENT_LABELS: Record<DepartmentId, string> = {
  emergency: '应急局',
  control: '中枢塔',
  frontier: '边界署',
  relic: '遗迹司',
  standard: '标准局',
  lifeguard: '生命监察局',
  workshop: '黑市工坊',
  biotech: '生科所'
};

// ============================================
// 辅助函数
// ============================================

export function parseProfileId(id: ProfileId): { archetype: ArchetypeKey; mode: ModeKey } {
  const lastDash = id.lastIndexOf('-');
  return {
    archetype: id.substring(0, lastDash) as ArchetypeKey,
    mode: id.substring(lastDash + 1) as ModeKey
  };
}

export function buildProfileId(archetype: ArchetypeKey, mode: ModeKey): ProfileId {
  return `${archetype}-${mode}` as ProfileId;
}
