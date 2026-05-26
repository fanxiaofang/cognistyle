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
  verbal_imagery: {
    id: 'verbal_imagery',
    label: '言语型 vs 表象型',
    leftPolarity: {
      key: 'verbal',
      label: '逻辑阐述者 (言语型)',
      description: '偏好通过文字、注释和口头表达来理解和传递系统逻辑，对逻辑链路和文字表述高度敏感。'
    },
    rightPolarity: {
      key: 'imagery',
      label: '视觉构图者 (表象型)',
      description: '偏好通过架构图、流程图和空间模型来进行系统构思，拥有极强的直觉和空间想象力。'
    }
  }
};

export const questionsProgrammer: Question[] = [
  {
    "id": 1,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "线上出现异常告警，我会直接先动手操作版本回滚或执行降级，边执行边排查影响范围，而不是先把所有步骤和风险点梳理清楚再行动。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 2,
    "dimension": "convergent_divergent",
    "direction": "divergent",
    "text": "做技术选型时，我更倾向于引入业内最新、尚在快速迭代的方案，而不是优先选择那些已被广泛验证、文档完善的经典技术栈。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 3,
    "dimension": "wholistic_analytic",
    "direction": "analytic",
    "text": "在做 Code Review 时，即使核心逻辑正确，对于命名不规范、缺少边界检查等细节问题，我也会打回要求修改，而不是标记为建议、先放行后续再优化。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 4,
    "dimension": "solo_team",
    "direction": "solo",
    "text": "比起在群组或代码评审中与大家反复讨论方案细节，我更倾向先戴上耳机专注完成功能，整体产出后再统一沟通对齐。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 5,
    "dimension": "verbal_imagery",
    "direction": "imagery",
    "text": "在规划复杂任务或多步骤流程时，我习惯先画出流程图、结构草图，而不是先用文字列出步骤清单。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 6,
    "dimension": "impulsive_reflective",
    "direction": "reflective",
    "text": "面对不熟悉的历史遗留模块，比起直接动手修改，我更倾向于先仔细梳理调用链路和隐患，把改动点记录清楚后再着手重构。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 7,
    "dimension": "convergent_divergent",
    "direction": "divergent",
    "text": "遇到一个开源工程问题，我会先在 GitHub 上浏览和收藏多种实现思路进行对比，而不是找到一个看起来可行的方案就直接采用。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 8,
    "dimension": "wholistic_analytic",
    "direction": "wholistic",
    "text": "面对项目中某个复杂的第三方依赖，只要它端到端输出正常、不影响主流程，我更倾向于直接调用就好，而不是去深入理解其内部实现原理。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 9,
    "dimension": "solo_team",
    "direction": "team",
    "text": "进入一个新项目或陌生技术领域时，如果没有明确的任务拆分和参考指引，我会先找到有经验的同事或参考项目来定方向，而不是直接开始自行摸索。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 10,
    "dimension": "verbal_imagery",
    "direction": "verbal",
    "text": "学习新框架时，我更依赖官方文字教程和API文档，而不是去看视频教程或架构图解。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 11,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "接到一个模糊的新需求时，我更习惯直接开始写代码草稿或搭一个能跑的骨架，而不是先把整体方案细化和拆解清楚再动手。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 12,
    "dimension": "convergent_divergent",
    "direction": "convergent",
    "text": "当官方或团队已明确给出某个技术决策的最佳实践时，遇到打破该规范的写法，我会主动提出修改意见，而不是允许它以例外方式留存在代码库里。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 13,
    "dimension": "wholistic_analytic",
    "direction": "analytic",
    "text": "实现一个功能时，我倾向于先设计好高度抽象、可复用的组件结构，而不是先快速写出一个直接够用的实现再考虑后续重构。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 14,
    "dimension": "solo_team",
    "direction": "solo",
    "text": "哪怕团队大多数人不熟悉某种架构思路，如果我认为它适合当下场景，我会直接在代码库中落地实现并在文档中说明理由，而不是等待大家达成共识后再引入。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 15,
    "dimension": "verbal_imagery",
    "direction": "imagery",
    "text": "理解一个遗留系统，我会先找有没有现成的架构图或数据库ER图，而不是逐行阅读代码注释。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 16,
    "dimension": "impulsive_reflective",
    "direction": "reflective",
    "text": "着手实现一个逻辑较复杂的功能模块之前，我会花时间先在文档里把关键逻辑写清楚、把异常情况列出来，而不是一边写代码一边想清楚。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 17,
    "dimension": "convergent_divergent",
    "direction": "divergent",
    "text": "讨论一个技术难题时，我更倾向于发散地提出多种不同路径的解决思路，而不是尽快聚焦到一种可行方案上深入推进。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 18,
    "dimension": "wholistic_analytic",
    "direction": "wholistic",
    "text": "在开发产品时，主业务链路在屏幕上第一次完整穿透跑通，比看到单元测试覆盖率达到 95% 更能让我心情大好。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 19,
    "dimension": "solo_team",
    "direction": "team",
    "text": "在团队项目中，涉及技术决策时，我习惯先征询有经验的同事意见再拍板，而不是基于自己的判断直接定下来。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 20,
    "dimension": "verbal_imagery",
    "direction": "verbal",
    "text": "代码审查时，我更喜欢同事直接写清楚文字注释说明改动原因，而不是用屏幕分享口头讲解。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 21,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "需求评审会上听到一个模糊的方向，我经常当场就打开IDE开始写Demo验证想法，很少等到PRD定稿后再动手。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 22,
    "dimension": "convergent_divergent",
    "direction": "convergent",
    "text": "比起去精通或探索世界上五花八门的新兴语言，我更倾向于将擅长的主力语言性能钻研至深。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 23,
    "dimension": "wholistic_analytic",
    "direction": "analytic",
    "text": "阅读一段不熟悉的代码时，我习惯从入口函数开始，沿调用链路逐步往下追踪，而不是先浏览整个项目的目录结构和模块划分来建立整体印象。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 24,
    "dimension": "solo_team",
    "direction": "team",
    "text": "比起独自推进一个开发任务，我更享受和同事实时协作——结对编程、随时互相 review，而不是各自闷头写完再合并对齐。",
    "humorTip": "debug中，请稍后..."
  },
  {
    "id": 25,
    "dimension": "verbal_imagery",
    "direction": "imagery",
    "text": "当我向别人解释技术方案时，我更倾向于打开画板边画边讲，而不是发一篇详细的文档说明。",
    "humorTip": "debug中，请稍后..."
  }
];

export const questionsGeneral: Question[] = [
  // ============================================
  // 维度1: impulsive_reflective (冲动-反思) — 4题
  // ============================================
  {
    id: 15,
    dimension: "impulsive_reflective",
    direction: "impulsive",
    reverse: false,
    text: "接触新设备或新软件时，我习惯直接上手实操摸索，较少优先查阅使用说明。",
    humorTip: "说明书是神马。"
  },
  {
    id: 3,
    dimension: "impulsive_reflective",
    direction: "impulsive",
    reverse: false,
    text: "接到陌生任务时，我偏向先实践尝试，在过程中理清思路，而非先提前梳理完整流程和方案之后再实践。",
    humorTip: "我先下水。"
  },
  {
    id: 9,
    dimension: "impulsive_reflective",
    direction: "reflective",
    reverse: true,
    text: "参与集体讨论时，我习惯收集完各方观点与信息，梳理思考完毕后再表达想法，很少临场随性发言。",
    humorTip: "手托下巴中"
  },
  {
    id: 17,
    dimension: "impulsive_reflective",
    direction: "reflective",
    reverse: true,
    text: "确定出行计划后，我会提前做好周全安排，较少选择说走就走。",
    humorTip: "我先请假。"
  },

  // ============================================
  // 维度2: convergent_divergent (聚合-发散) — 4题
  // ============================================
  {
    id: 5,
    dimension: "convergent_divergent",
    direction: "convergent",
    reverse: false,
    text: "解决技术难题时，我会直接执行那个现成的最佳方案，较少主动尝试多种不同思路去试错。",
    humorTip: "真相只有一个。"
  },
  {
    id: 1,
    dimension: "convergent_divergent",
    direction: "convergent",
    reverse: false,
    text: "学习新规范与工作流程时，我优先做到按照流程执行，较少优先思考流程之外的优化空间和是否合理之处。",
    humorTip: "裁判机器人，蜻蜓队长，前来晋见。"
  },
  {
    id: 11,
    dimension: "convergent_divergent",
    direction: "divergent",
    reverse: true,
    text: "复盘工作失误时，我习惯跳出常规经验逻辑思考，愿意联想到各类非常规影响因素。",
    humorTip: "鹰眼扫描中。"
  },
  {
    id: 19,
    dimension: "convergent_divergent",
    direction: "divergent",
    reverse: true,
    text: "当已有可行落地方案后，我依旧习惯思索其他不同设计思路，尝试探寻不一样的实现方式。",
    humorTip: "好"
  },

  // ============================================
  // 维度3: wholistic_analytic (整体-分析) — 4题
  // ============================================
  {
    id: 7,
    dimension: "wholistic_analytic",
    direction: "analytic",
    reverse: true,
    text: "审阅报表与数据内容时，我容易留意到旁人不易察觉的数字偏差与格式差异。",
    humorTip: "我不是找茬。"
  },
  {
    id: 2,
    dimension: "wholistic_analytic",
    direction: "wholistic",
    reverse: false,
    text: "接手全新项目时，我习惯先梳理整体架构与整体思路，不会过早沉浸在单一细节里打磨。",
    humorTip: "有道理。"
  },
  {
    id: 13,
    dimension: "wholistic_analytic",
    direction: "analytic",
    reverse: true,
    text: "研读专业内容时，碰到不懂的专有名词，我习惯先当场弄清含义，不会带着疑问先继续往下阅读。",
    humorTip: "翻阅词典中。"
  },
  {
    id: 18,
    dimension: "wholistic_analytic",
    direction: "wholistic",
    reverse: false,
    text: "向别人转述一件事时，我通常会先把核心结论抛出来，而不是按时间顺序一步步铺陈前因后果。",
    humorTip: "我话很少。"
  },

  // ============================================
  // 维度4: solo_team (独立-协同) — 4题
  // ============================================
  {
    id: 4,
    dimension: "solo_team",
    direction: "team",
    reverse: true,
    text: "进入一个规则陌生的新领域时，如果没有明确指引或参考模板，我会感到不知从何下手，需要先找到可以参照的对象。",
    humorTip: "躺在沙滩上写SOS。"
  },
  {
    id: 10,
    dimension: "solo_team",
    direction: "team",
    reverse: true,
    text: "做出关键抉择前，我习惯参考身边可信之人与专业前辈的看法，丰富自己的判断依据。",
    humorTip: "投我一票。"
  },
  {
    id: 6,
    dimension: "solo_team",
    direction: "solo",
    reverse: false,
    text: "团队中出现意见严重分歧时，我通常更倾向于坚持自己的方案，而不是为了和谐而妥协。",
    humorTip: "我的方案才是最好的——至少在我改主意之前。"
  },
  {
    id: 12,
    dimension: "solo_team",
    direction: "team",
    reverse: true,
    text: "结伴共事或是一同行动时，我会留意身边人的节奏与倾向，顺势调整自身行事节奏相互适配。",
    humorTip: "打的就是配合。"
  },

  // ============================================
  // 维度5: verbal_imagery (言语-表象) — 3题
  // ============================================
  {
    id: 8,
    dimension: "verbal_imagery",
    direction: "imagery",
    reverse: true,
    text: "学习新技能时，我通常会先看视频教程，而不是先阅读文字教程。",
    humorTip: "我许可。"
  },
  {
    id: 14,
    dimension: "verbal_imagery",
    direction: "verbal",
    reverse: false,
    text: "外出使用手机导航行路时，我更愿意跟着指令走，不太习惯盯着地图画面辨认路线。",
    humorTip: "忙忙碌碌寻宝藏。"
  },
  {
    id: 16,
    dimension: "verbal_imagery",
    direction: "imagery",
    reverse: true,
    text: "在商场、车站这类大型场所找位置，我更容易记住显眼实景地标，不太依靠区域编号这类文字标识。",
    humorTip: "随机掉入迷宫。"
  }
];

/*
export const questionsGeneral: Question[] = [
  {
    "id": 1,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "在挑选日常消耗品或大件物件时，我偏好依靠直觉和冲动立刻下单，而不是花费数天去研究测评。",
    "humorTip": "着急付款。 "
  },
  {
    "id": 2,
    "dimension": "verbal_imagery",
    "direction": "imagery",
    "text": "当我要向朋友解释一个复杂概念时，我更倾向于拿张纸边画边讲，而不是发一长段语音或文字。",
    "humorTip": "请欣赏我的灵魂画作 ~"
  },
  {
    "id": 3,
    "dimension": "convergent_divergent",
    "direction": "convergent",
    "text": "当我想解决一件急事，比起那些未吃透的黑科技或小妙招，我优先去使用最官方、最大众的传统步骤。",
    "humorTip": "你先别急。"
  },
  {
    "id": 4,
    "dimension": "wholistic_analytic",
    "direction": "analytic",
    "text": "规划小聚会或打磨策划文案时，我很容易被某一个不显眼的手绘小图、中英文混排吸引注意力。",
    "humorTip": "鹰眼扫描中~"
  },
  {
    "id": 5,
    "dimension": "solo_team",
    "direction": "team",
    "text": "在一个规则完全看不透的新陌生领域，如果没有明确的指引或参考模板，我会感到不知从何下手，需要先找到可以参照的对象。",
    "humorTip": "赖在沙滩上写SOS。"
  },
  {
    "id": 6,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "在上手一样新入手的小家电或手机软件时，我很乐意直接按着按钮倒腾，而不是先拿起说明书。",
    "humorTip": "产品说明书是神马。"
  },
  {
    "id": 7,
    "dimension": "convergent_divergent",
    "direction": "divergent",
    "text": "在做汇报 PPT、朋友圈摄影配文或是撰写文章时，我喜欢折腾各种独创的古怪排版与配色，抗拒大众化的标准模板。",
    "humorTip": "我将燃尽每一个小巧思细菌。"
  },
  {
    "id": 8,
    "dimension": "verbal_imagery",
    "direction": "verbal",
    "text": "学习新技能时，我更习惯先逐字阅读文字菜谱或说明书，而不是先看短视频教程。",
    "humorTip": "我习惯左手掏右边鼻孔"
  },
  {
    "id": 9,
    "dimension": "wholistic_analytic",
    "direction": "wholistic",
    "text": "拼装乐高、组装家具或进行烹饪时，只要最终成型稳当、吃起来够味，过程中少数小配件没装上、少放了胡椒粉也行。",
    "humorTip": "糟糕，少了一块？没事，我用口香糖粘上。"
  },
  {
    "id": 10,
    "dimension": "solo_team",
    "direction": "solo",
    "text": "比起和好友一块洗脑商量分工并完成一次厨房大扫除，我更情愿戴上高降噪耳机一人去横扫完，不用分流沟通。",
    "humorTip": "这个垃圾桶和毛巾现在由我完全掌控"
  },
  {
    "id": 11,
    "dimension": "impulsive_reflective",
    "direction": "impulsive",
    "text": "遇到一个不熟悉的突发任务时，我倾向于先动手尝试、在实践中逐步摸索清楚，而不是先花时间搜集信息、在心里把大致步骤梳理一遍再开始。",
    "humorTip": "我先下水"
  },
  {
    "id": 12,
    "dimension": "convergent_divergent",
    "direction": "convergent",
    "text": "去超市或商场时，我更倾向于按清单直奔目标、买完就走，而不是在货架间闲逛、顺便发现一些计划外的好物。",
    "humorTip": "清单在手，别的不瞅"
  },
  {
    "id": 13,
    "dimension": "verbal_imagery",
    "direction": "imagery",
    "text": "当我需要理清一个复杂主题（如工作方案、学习笔记）时，我更习惯先用思维导图或草图把各部分的关系画出来，而不是先列出条理分明的文字提纲。",
    "humorTip": "我不是小画家 "
  },
  {
    "id": 14,
    "dimension": "wholistic_analytic",
    "direction": "analytic",
    "text": "阅读一本有深度的书时，遇到不熟悉的陌生概念或人名，我更倾向于先停下来查清楚再继续往下读，而不是先标记一下、等读完整体内容再回头看",
    "humorTip": "本来只是想查一个词的出处，结果等我回过神，已经在读它的三篇相关论文和作者的生辰八字。"
  },
  {
    "id": 15,
    "dimension": "solo_team",
    "direction": "team",
    "text": "做重大决定前，我需要先了解信任的人和权威人士的意见，否则会觉得自己缺少判断的依据。",
    "humorTip": "我需要你的投票，要不然我可不敢按电梯了。"
  },
  {
    "id": 16,
    "dimension": "impulsive_reflective",
    "direction": "reflective",
    "text": "看完一部让我心头一震的电影或剧集后，比起立刻找朋友分享当下的情绪冲击，我更习惯先独自消化几天，反复琢磨其中的细节。",
    "humorTip": "‘啊太好看了’ 还是 让我先写一篇结构完整的千字影评。"
  },
  {
    "id": 17,
    "dimension": "convergent_divergent",
    "direction": "divergent",
    "text": "大家一起讨论一个话题时，我的思维更容易从当前话题发散到各种表面上不直接相关的联想上，越聊越远，而不是围绕当前话题逐层深入、直到把结论聊清楚再转向下一个。",
    "humorTip": "今晚吃什么 -> 什么是快乐星球 ... "
  },
  {
    "id": 18,
    "dimension": "verbal_imagery",
    "direction": "verbal",
    "text": "回忆过去的事情时，我更多是记住当时说的某句话或某个关键词，而不是清晰的画面或场景。",
    "humorTip": "把回忆化成空~ "
  },
  {
    "id": 19,
    "dimension": "wholistic_analytic",
    "direction": "wholistic",
    "text": "向别人转述一件事时，我更习惯先把最核心的结论或结局抛出来，而不是先按照时间顺序把前因后果和背景细节一步步铺陈清楚。",
    "humorTip": "我的讲述逻辑是： 大结局先行。"
  },
  {
    "id": 20,
    "dimension": "solo_team",
    "direction": "solo",
    "text": "选定了一个自认为很不错的方案后，即使身边多数人不太认可，我还是会坚持认为自己的方案有可取之处，而不是因为大家的意见就开始怀疑自己的判断。",
    "humorTip": "我心如磐石，黄金可摧之"
  },
  {
    "id": 21,
    "dimension": "impulsive_reflective",
    "direction": "reflective",
    "text": "在做出远行度假决定时，我偏向先做极其详实规划，不太会说走就走。",
    "humorTip": "我先请假 ..."
  },
  {
    "id": 22,
    "dimension": "convergent_divergent",
    "direction": "convergent",
    "text": "不论是平时常去的美食店，还是常用的工作技巧，只要有一套行得通，我就不会轻易去试另外的选项。",
    "humorTip": "求稳是我漫长生命的生存准则。"
  },
  {
    "id": 23,
    "dimension": "verbal_imagery",
    "direction": "imagery",
    "text": "在需要整理思路或记录要点时，我更享受在文字旁涂鸦、画小图或符号来辅助思考，而不是只用纯文字进行线性记录。",
    "humorTip": "发呆中..."
  },
  {
    "id": 24,
    "dimension": "wholistic_analytic",
    "direction": "wholistic",
    "text": "在推进一个团队项目时，我更倾向于先搭建一个粗糙但能跑的整体框架、确保各环节的依赖关系清晰，而不是先把每个模块内部功能完善再尝试对接",
    "humorTip": "我先睡了。"
  },
  {
    "id": 25,
    "dimension": "solo_team",
    "direction": "team",
    "text": "在外出或聚会时，我会不自觉地观察同行人的情绪和偏好，并据此调整自己的计划安排。",
    "humorTip": "含笑跟随大部队。"
  }
]
  */