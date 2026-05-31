/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Question } from '../types';
interface PolarityMeta {
  key: string;
  label: string;
  description: string;
  programmerDescription?: string;
}
interface DimensionMetaItem {
  id: string;
  label: string;
  leftPolarity: PolarityMeta;
  rightPolarity: PolarityMeta;
}
export const dimensionMeta: Record<string, DimensionMetaItem> = {
  impulsive_reflective: {
    id: 'impulsive_reflective',
    label: '冲动型 vs 反思型',
    leftPolarity: {
      key: 'impulsive',
      label: '行动驱动者 (冲动型)',
      description: '偏好快速迭代，通过动手写代码、建立快速原型和直接试验来理清思路。'
    },
    rightPolarity: {
      key: 'reflective',
      label: '深度反思者 (反思型)',
      description: '偏好在行动前做充足的调研分析，通过详细方案和推敲逻辑来寻找规律。'
    }
  },
  convergent_divergent: {
    id: 'convergent_divergent',
    label: '聚合型 vs 发散型',
    leftPolarity: {
      key: 'convergent',
      label: '规范精制者 (聚合型)',
      description: '擅长自上而下的逻辑合拢，追求单一最优解和代码黄金准则，极致抗拒代码冗余。'
    },
    rightPolarity: {
      key: 'divergent',
      label: '多维探索者 (发散型)',
      description: '乐于探索各种边缘技术与非传统写法，思维开阔，喜欢搜集多种并行的备选方案。'
    }
  },
  wholistic_analytic: {
    id: 'wholistic_analytic',
    label: '整体型 vs 分析型',
    leftPolarity: {
      key: 'wholistic',
      label: '宏观俯瞰者 (整体型)',
      description: '目光聚焦于端到端业务闭环、系统骨架与商业价值，允许黑盒代码在可控范围内存在。'
    },
    rightPolarity: {
      key: 'analytic',
      label: '局部细雕者 (分析型)',
      description: '关注原子级细节、追求功能独立封装与极致的边界条件，对任何隐蔽瑕疵保持敏感。'
    }
  },
  solo_team: {
    id: 'solo_team',
    label: '独行型 vs 协同型',
    leftPolarity: {
      key: 'solo',
      label: '独行研习者 (独行型)',
      description: '在无秩序、模糊的环境中亦能自主工作，坚持个人操守，不受外界嘈杂打扰。',
      programmerDescription: '在无秩序、模糊的环境中亦能自主工作，坚持个人编码操守，不受外界嘈杂打扰。'
    },
    rightPolarity: {
      key: 'team',
      label: '共生协调者 (协同型)',
      description: '高度重视团队契合度与他人反馈，擅于利用团队讨论、结对协作或高频对齐优化产出。',
      programmerDescription: '高度重视团队契合度与他人反馈，擅于利用 Code Review、结对编程或高频对齐优化产出。'
    }
  },
};
export const questionsProgrammer: Question[] = [
  {
    "id": 1,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "线上出现异常告警，我会直接先动手操作版本回滚或执行降级，边执行边排查影响范围，而不是先把所有步骤和风险点梳理清楚再行动。",
  },
  {
    "id": 2,
    "dimension": "convergent_divergent",
    "direction": "divergent",
    "text": "做技术选型时，我更倾向于引入业内最新、尚在快速迭代的方案，而不是优先选择那些已被广泛验证、文档完善的经典技术栈。",
  },
  {
    "id": 3,
    "dimension": "wholistic_analytic",
    "direction": "analytic",
    "text": "在做 Code Review 时，即使核心逻辑正确，对于命名不规范、缺少边界检查等细节问题，我也会打回要求修改，而不是标记为建议、先放行后续再优化。",
  },
  {
    "id": 4,
    "dimension": "solo_team",
    "direction": "solo",
    "text": "比起在群组或代码评审中与大家反复讨论方案细节，我更倾向先戴上耳机专注完成功能，整体产出后再统一沟通对齐。",
  },
  {
    "id": 6,
    "dimension": "impulsive_reflective",
    "direction": "reflective",
    "text": "面对不熟悉的历史遗留模块，比起直接动手修改，我更倾向于先仔细梳理调用链路和隐患，把改动点记录清楚后再着手重构。",
  },
  {
    "id": 7,
    "dimension": "convergent_divergent",
    "direction": "divergent",
    "text": "遇到一个开源工程问题，我会先在 GitHub 上浏览和收藏多种实现思路进行对比，而不是找到一个看起来可行的方案就直接采用。",
  },
  {
    "id": 8,
    "dimension": "wholistic_analytic",
    "direction": "wholistic",
    "text": "面对项目中某个复杂的第三方依赖，只要它端到端输出正常、不影响主流程，我更倾向于直接调用就好，而不是去深入理解其内部实现原理。",
  },
  {
    "id": 9,
    "dimension": "solo_team",
    "direction": "team",
    "text": "进入一个新项目或陌生技术领域时，如果没有明确的任务拆分和参考指引，我会先找到有经验的同事或参考项目来定方向，而不是直接开始自行摸索。",
  },
  {
    "id": 11,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "接到一个模糊的新需求时，我更习惯直接开始写代码草稿或搭一个能跑的骨架，而不是先把整体方案细化和拆解清楚再动手。",
  },
  {
    "id": 12,
    "dimension": "convergent_divergent",
    "direction": "convergent",
    "text": "当官方或团队已明确给出某个技术决策的最佳实践时，遇到打破该规范的写法，我会主动提出修改意见，而不是允许它以例外方式留存在代码库里。",
  },
  {
    "id": 13,
    "dimension": "wholistic_analytic",
    "direction": "analytic",
    "text": "实现一个功能时，我倾向于先设计好高度抽象、可复用的组件结构，而不是先快速写出一个直接够用的实现再考虑后续重构。",
  },
  {
    "id": 14,
    "dimension": "solo_team",
    "direction": "solo",
    "text": "哪怕团队大多数人不熟悉某种架构思路，如果我认为它适合当下场景，我会直接在代码库中落地实现并在文档中说明理由，而不是等待大家达成共识后再引入。",
  },
  {
    "id": 16,
    "dimension": "impulsive_reflective",
    "direction": "reflective",
    "text": "着手实现一个逻辑较复杂的功能模块之前，我会花时间先在文档里把关键逻辑写清楚、把异常情况列出来，而不是一边写代码一边想清楚。",
  },
  {
    "id": 17,
    "dimension": "convergent_divergent",
    "direction": "divergent",
    "text": "讨论一个技术难题时，我更倾向于发散地提出多种不同路径的解决思路，而不是尽快聚焦到一种可行方案上深入推进。",
  },
  {
    "id": 18,
    "dimension": "wholistic_analytic",
    "direction": "wholistic",
    "text": "在开发产品时，主业务链路在屏幕上第一次完整穿透跑通，比看到单元测试覆盖率达到 95% 更能让我心情大好。",
  },
  {
    "id": 19,
    "dimension": "solo_team",
    "direction": "team",
    "text": "在团队项目中，涉及技术决策时，我习惯先征询有经验的同事意见再拍板，而不是基于自己的判断直接定下来。",
  },
  {
    "id": 21,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "需求评审会上听到一个模糊的方向，我经常当场就打开IDE开始写Demo验证想法，很少等到PRD定稿后再动手。",
  },
  {
    "id": 22,
    "dimension": "convergent_divergent",
    "direction": "convergent",
    "text": "比起去精通或探索世界上五花八门的新兴语言，我更倾向于将擅长的主力语言性能钻研至深。",
  },
  {
    "id": 23,
    "dimension": "wholistic_analytic",
    "direction": "analytic",
    "text": "阅读一段不熟悉的代码时，我习惯从入口函数开始，沿调用链路逐步往下追踪，而不是先浏览整个项目的目录结构和模块划分来建立整体印象。",
  },
  {
    "id": 24,
    "dimension": "solo_team",
    "direction": "team",
    "text": "比起独自推进一个开发任务，我更享受和同事实时协作——结对编程、随时互相 review，而不是各自闷头写完再合并对齐。",
  },
];

export const questionsGeneral: Question[] = [
  // ============================================
  // 维度1: impulsive_reflective (冲动-反思) — 6题（全保留优化版）
  // ============================================
  {
    id: 12,
    dimension: "impulsive_reflective",
    direction: "impulsive",
    text: "遇到突发状况，我会第一时间采取行动，哪怕可能出错，也绝不会等想清楚所有风险再动手。",
  },
  {
    id: 5,
    dimension: "impulsive_reflective",
    direction: "impulsive",
    text: "接到陌生任务时，我偏向先实践尝试，在过程中理清思路，而非先提前梳理完整流程和方案之后再实践。",
  },
  {
    id: 19,
    dimension: "impulsive_reflective",
    direction: "impulsive",
    text: "我想到什么就会立刻去做，从来不会等太久，哪怕事后可能会后悔。",
  },
  {
    id: 8,
    dimension: "impulsive_reflective",
    direction: "reflective",
    text: "参与集体讨论时，我习惯收集完各方观点与信息，梳理思考完毕后再表达想法，很少临场随性发言。",
  },
  {
    id: 14,
    dimension: "impulsive_reflective",
    direction: "reflective",
    text: "做任何决定前，我都会把所有可能的后果都想清楚，绝不会凭一时冲动做事。",
  },
  {
    id: 2,
    dimension: "impulsive_reflective",
    direction: "reflective",
    text: "我总是会反复思考自己的决定，确保没有遗漏任何细节，才会最终拍板。",
  },
  // ============================================
  // 维度2: convergent_divergent (聚合-发散) — 6题（全保留优化版）
  // ============================================
  {
    id: 17,
    dimension: "convergent_divergent",
    direction: "convergent",
    text: "只要有一个已经被验证过的可行方案，我绝不会再花时间去想其他没用的可能性。",
  },
  {
    id: 9,
    dimension: "convergent_divergent",
    direction: "convergent",
    text: "学习新规范与工作流程时，我优先做到按照流程执行，较少优先思考流程之外的优化空间和是否合理之处。",
  },
  {
    id: 20,
    dimension: "convergent_divergent",
    direction: "convergent",
    text: "我讨厌打破规则，只要是既定的规矩，我都会严格遵守，绝不会去想着怎么变通。",
  },
  {
    id: 4,
    dimension: "convergent_divergent",
    direction: "divergent",
    text: "复盘工作失误时，我习惯跳出常规经验逻辑思考，愿意联想到各类非常规影响因素。",
  },
  {
    id: 11,
    dimension: "convergent_divergent",
    direction: "divergent",
    text: "哪怕已经有了完美的解决方案，我还是忍不住会想有没有其他更有趣的做法。",
  },
  {
    id: 1,
    dimension: "convergent_divergent",
    direction: "divergent",
    text: "我总是忍不住会对各种事情产生新的想法，哪怕这件事已经有了定论。",
  },
  // ============================================
  // 维度3: wholistic_analytic (整体-分析) — 6题（全保留优化版）
  // ============================================
  {
    id: 15,
    dimension: "wholistic_analytic",
    direction: "analytic",
    text: "审阅报表时，我能一眼就发现哪怕最细微的数字错误，根本没法忽略它们。",
  },
  {
    id: 7,
    dimension: "wholistic_analytic",
    direction: "wholistic",

    text: "只要能找到我要的文件，文件夹乱不乱我根本不在乎。",
  },
  {
    id: 18,
    dimension: "wholistic_analytic",
    direction: "analytic",
    text: "研读专业内容时，碰到不懂的专有名词，我习惯先当场弄清含义，不会带着疑问先继续往下阅读。",
  },
  {
    id: 10,
    dimension: "wholistic_analytic",
    direction: "analytic",
    text: "如果文件没有按规范分类归档，我会浑身难受，必须立刻整理好才能继续做别的事。",
  },
  {
    id: 3,
    dimension: "wholistic_analytic",
    direction: "wholistic",
    text: "向别人转述一件事时，我通常会先把核心结论抛出来，而不是按时间顺序一步步铺陈前因后果。",
  },
  {
    id: 16,
    dimension: "wholistic_analytic",
    direction: "wholistic",
    text: "我更容易记住一件事的整体概况，平日里不太留意其中细碎的具体细节。",
  },
  // ============================================
  // 维度4: solo_team (独立-协同) — 2题（精简定稿，1独行+1协同）
  // ============================================
  {
    id: 6,
    dimension: "solo_team",
    direction: "solo",
    text: "团队中出现意见严重分歧时，我通常更倾向于坚持自己的方案，而不是为了和谐而妥协。",
  },
  {
    id: 13,
    dimension: "solo_team",
    direction: "team",
    text: "结伴共事或是一同行动时，我会留意身边人的节奏与倾向，顺势调整自身行事节奏相互适配。",
  }
];