/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================
// 第一层：核心认知维度（3维，6极）
// ============================================

export type CoreDimensionId = 
  | 'impulsive_reflective'      // 认知节奏：行动 vs 推演
  | 'convergent_divergent'      // 信息策略：收敛 vs 探索
  | 'wholistic_analytic';       // 视野焦点：全局 vs 局部

export type CorePolarityKey = 
  | 'impulsive' | 'reflective' 
  | 'convergent' | 'divergent' 
  | 'wholistic' | 'analytic';

export interface CoreDimensionMetadata {
  id: CoreDimensionId;
  label: string;
  leftPolarity: { 
    key: CorePolarityKey; 
    label: string; 
    description: string;  // 通用场景描述
    programmerDescription: string;  // 程序员场景描述
  };
  rightPolarity: { 
    key: CorePolarityKey; 
    label: string; 
    description: string;
    programmerDescription: string;
  };
}

// ============================================
// 第二层：协作偏好（1维，2极）—— 独立维度，非认知加工方式
// ============================================

export type CollaborationDimensionId = 'solo_team';

export type CollaborationPolarityKey = 'solo' | 'team';

export interface CollaborationDimensionMetadata {
  id: CollaborationDimensionId;
  label: string;
  soloLabel: string;   // 独立工作偏好
  teamLabel: string;   // 协同工作偏好
  description: string; // 说明这是"情境偏好"而非"人格特质"
}

// ============================================
// 第三层：知识表征维度（可选补充维度）
// ============================================

export type RepresentationDimensionId = 'verbal_imagery';

export type RepresentationPolarityKey = 'verbal' | 'imagery';

export interface RepresentationDimensionMetadata {
  id: RepresentationDimensionId;
  label: string;
  verbalLabel: string;  // 文本/符号/线性
  imageryLabel: string; // 图形/空间/可视化
  description: string;
}

// ============================================
// 组合维度类型（用于测验计算）
// ============================================

export type AllDimensionId = CoreDimensionId | CollaborationDimensionId | RepresentationDimensionId;
export type AllPolarityKey = CorePolarityKey | CollaborationPolarityKey | RepresentationPolarityKey;

// ============================================
// 测验题目结构
// ============================================

export interface Question {
  id: number;
  dimension: CoreDimensionId | CollaborationDimensionId | RepresentationDimensionId;
  direction: AllPolarityKey;
  reverse?: boolean;
  text: string;
  programmerText?: string;
  humorTip: string;
}

export type QuestionCategory = 'programmer' | 'general';

export type Category = QuestionCategory;

export interface QuestionBank {
  category: QuestionCategory;
  questions: Question[];
  // 协作维度题目通过统计"是否提到团队/他人"间接计算，不直接作为Likert题
  collaborationIndicators: number[];  // 题目ID列表，用于检测S/T倾向
}

// ============================================
// 用户作答与得分
// ============================================

export interface UserAnswers {
  [questionId: number]: number;  // 1-5 Likert得分
}

export interface DimensionScore {
  id: AllDimensionId;
  label: string;
  rawScore: number;      // 原始总分（如10-50）
  normalizedScore: number;  // 标准化到 0-100，指向Right/High极性
  polarity: AllPolarityKey;   // 当前偏向的极性
  strength: 'slight' | 'moderate' | 'strong';  // 倾向强度
}

// ============================================
// 原型与职业系统（核心重构）
// ============================================

// 8个认知原型（3维组合）
export type ArchetypeKey = 
  | 'I-C-W' | 'I-C-A' | 'I-D-W' | 'I-D-A'
  | 'R-C-W' | 'R-C-A' | 'R-D-W' | 'R-D-A';

// 2种协作模式
export type ModeKey = 'S' | 'T';

// 16格完整ID
export type ProfileId = `${ArchetypeKey}-${ModeKey}`;

// 世界观部门（赛博朋克城市）
export type DepartmentId = 
  | 'emergency'    // 应急局
  | 'frontier'     // 边界署
  | 'medical'      // 医疗部
  | 'workshop'     // 黑市工坊
  | 'control'      // 总控中心
  | 'standard'     // 标准局
  | 'relic'        // 遗迹司
  | 'biotech';     // 生科所

// 视觉主题（用于16格差异化展示）
export interface VisualTheme {
  pose: string;           // 姿态描述
  background: string;      // 场景背景
  lighting: string;       // 光影氛围
  atmosphere: string;     // 整体气氛
  colorTone: string;       // 主色调（Tailwind类名）
  accent: string;          // 强调色
}

// S/T模式特定配置
export interface ModeConfig {
  key: ModeKey;
  name: string;            // 模式名称：独行者 / 连接者
  visualModifier: {         // 基于原型视觉的差异化
    lightingShift: string;  // 光影变化：冷→暖 / 静→动
    poseShift: string;      // 姿态变化：俯身→站立 / 独坐→指挥
    atmosphereShift: string; // 氛围变化：深夜→白昼 / 寂静→共振
  };
  collaborationTemplate: string;  // 协作建议模板
}

// ============================================
// 核心数据结构：8原型定义
// ============================================

export interface CognitiveArchetype {
  key: ArchetypeKey;
  profession: string;        // 职业名称：应急队长、城市游侠等
  department: DepartmentId;
  essence: string;           // 核心定义（8原型共享）
  cognitivePattern: string[];  // 4条认知特征（对应I/R, C/D, W/A）
  workplaceEdge: string[];     // 优势与边界（共享）
  growthTip: string;          // 成长建议（共享）
  visualBase: VisualTheme;    // 基础视觉（S/T在此基础上变异）
}

// ============================================
// 展示层数据结构：16格形象
// ============================================

export interface CognitiveProfile {
  id: ProfileId;
  archetype: ArchetypeKey;
  mode: ModeKey;
  displayName: string;
  callSign: string;
  department: string;
  rank: string;
  avatar: string;
  profession?: string;
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
  coreDimensions: DimensionScore[];           // I/R, C/D, W/A
  collaborationPreference: DimensionScore;  // S/T
  representationDimension?: DimensionScore;   // V/I（可选）
  
  // 匹配结果
  matchedArchetype: ArchetypeKey;
  matchedMode: ModeKey;
  profileId: ProfileId;
  
  // 连续谱信息（避免类型固化）
  archetypeSpectrum: {
    archetype: ArchetypeKey;
    matchScore: number;  // 0-100，该原型匹配度
  }[];
  
  // 搭档推荐
  complementaryProfiles: ProfileId[];  // 推荐互补类型
}

// ============================================
// 交互场景（用于结果页沉浸式体验）
// ============================================

export type MethodType = 'code' | 'flow' | 'checklist' | 'diagram' | 'prototype';

export interface ScenarioOption {
  label: string;
  polarity: AllPolarityKey;
  archetypeMatch: ArchetypeKey[];  // 哪些原型倾向此选项
  methodTitle: string;
  methodType: MethodType;
  methodContent: string;
}

export interface InteractiveScenario {
  id: string;
  title: string;
  context: string;           // 场景背景
  question: string;
  options: ScenarioOption[];
}

// ============================================
// 常量与工具类型
// ============================================

export const ARCHETYPE_KEYS: ArchetypeKey[] = [
  'I-C-W', 'I-C-A', 'I-D-W', 'I-D-A',
  'R-C-W', 'R-C-A', 'R-D-W', 'R-D-A'
];

export const MODE_KEYS: ModeKey[] = ['S', 'T'];

export const DEPARTMENT_LABELS: Record<DepartmentId, string> = {
  emergency: '应急局',
  frontier: '边界署',
  medical: '医疗部',
  workshop: '黑市工坊',
  control: '总控中心',
  standard: '标准局',
  relic: '遗迹司',
  biotech: '生科所'
};

// 辅助函数：从ID解析
export function parseProfileId(id: ProfileId): { archetype: ArchetypeKey; mode: ModeKey } {
  const parts = id.split('-');
  return {
    archetype: `${parts[0]}-${parts[1]}-${parts[2]}` as ArchetypeKey,
    mode: parts[3] as ModeKey
  };
}

export function buildProfileId(archetype: ArchetypeKey, mode: ModeKey): ProfileId {
  return `${archetype}-${mode}` as ProfileId;
}