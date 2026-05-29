export const DEFAULT_LOCALE = 'zh-CN';

export const COMPATIBILITY_CONFIG = {
  dimensions: {
    rhythm: {
      label: '节奏维度',
      shortLabel: '节奏',
      sourceKey: 'impulsiveReflective',
      idealGap: 0.35,
      tolerance: 0.2,
      floor: 35,
    },
    strategy: {
      label: '策略维度',
      shortLabel: '策略',
      sourceKey: 'convergentDivergent',
      idealGap: 0.6,
      tolerance: 0.22,
      floor: 20,
    },
    vision: {
      label: '视野维度',
      shortLabel: '视野',
      sourceKey: 'wholisticAnalytic',
      idealGap: 0.55,
      tolerance: 0.28,
      floor: 30,
    },
    collaboration: {
      label: '协作维度',
      shortLabel: '协作',
      sourceKey: 'soloTeam',
      idealGap: 0.1,
      tolerance: 0.18,
      floor: 15,
    },
  },
  coverage: {
    idealGap: 0.5,
    sameSideBonus: 0.6,
    baseStrengthFactor: 0.4,
    strengthWeight: 0.6,
  },
  friction: {
    rhythm: { dangerStart: 0.6, weight: 0.45 },
    collaboration: { dangerStart: 0.5, weight: 0.35 },
    strategy: { dangerStart: 0.85, weight: 0.1 },
    vision: { dangerStart: 0.9, weight: 0.1 },
  },
  aggregation: {
    cognitiveComplementarity: {
      rhythm: 0.3,
      strategy: 0.35,
      vision: 0.35,
    },
    overall: {
      cognitiveComplementarity: 0.45,
      collaborationCompatibility: 0.2,
      blindSpotCoverage: 0.2,
      inverseFrictionRisk: 0.15,
    },
  },
  pattern: {
    cognitiveDimensions: ['rhythm', 'strategy', 'vision'],
    homogeneousMaxAvgDelta: 0.15,
    homogeneousMaxCollaborationDelta: 0.2,
    homogeneousMaxBlindSpotCoverage: 15,
    conflictingMinFrictionRisk: 60,
    conflictingRhythmDeltaThreshold: 0.75,
    conflictingCollaborationDeltaThreshold: 0.7,
    conflictingMaxCollaborationScore: 40,
    complementaryMinBlindSpotCoverage: 60,
    complementaryMinAvgDelta: 0.25,
    complementaryMaxAvgDelta: 0.65,
    complementaryMinCollaborationScore: 60,
  },
  dimensionResult: {
    highlyAlignedMaxDelta: 0.15,
    oppositeMinDelta: 0.75,
    complementaryMinScore: 75,
    moderateMinScore: 50,
  },
  rating: [
    { min: 80, label: '完美协作' },
    { min: 65, label: '高度协作' },
    { min: 50, label: '良好协同' },
    { min: 35, label: '基本互补' },
    { min: 0, label: '显著摩擦' },
  ],
  missionWeights: [
    {
      name: '禁区探索',
      department: '边界署',
      weights: { rhythm: 0.3, strategy: 0.3, vision: 0.25, collaboration: 0.15 },
    },
    {
      name: '应急响应',
      department: '应急局',
      weights: { rhythm: 0.35, strategy: 0.25, vision: 0.15, collaboration: 0.25 },
    },
    {
      name: '标准审计',
      department: '标准局',
      weights: { rhythm: 0.1, strategy: 0.2, vision: 0.3, collaboration: 0.4 },
    },
    {
      name: '黑市定制',
      department: '黑市工坊',
      weights: { rhythm: 0.15, strategy: 0.35, vision: 0.25, collaboration: 0.25 },
    },
    {
      name: '遗迹发掘',
      department: '遗迹司',
      weights: { rhythm: 0.1, strategy: 0.25, vision: 0.35, collaboration: 0.3 },
    },
  ],
};

export const COMPATIBILITY_COPY = {
  'zh-CN': {
    errors: {
      storageMissing: '结果存储未配置，请先绑定 KV。',
      rateLimited: '请求过于频繁，请稍后重试。',
      selfPair: '不能和自己的结果生成互补报告。',
      currentResultMissing: '当前设备的结果未找到，请重新保存你的测评结果。',
      targetResultMissing: '好友结果未找到，可能已过期，请让好友重新生成 ID。',
      requestBodyMustBeObject: '请求体必须为 JSON 对象。',
      invalidMyFriendId: 'myFriendId 非法。',
      invalidTargetFriendId: 'targetFriendId 非法。',
      snapshotVersionMismatch: '结果快照版本不兼容，请重新保存结果。',
      questionVersionMismatch: '题库版本不兼容，请重新测评并保存结果。',
      normalizedScoresMissing: '结果快照缺少归一化分数。',
      internalError: '服务器内部错误',
    },
    dimensionInterpretation: {
      similar: (label, delta) =>
        `${label}高度一致（差异度=${delta}）。协作无摩擦，但也意味着该维度上无人补位，容易形成共同盲区。`,
      opposite: (label, delta) =>
        `${label}差异过大（差异度=${delta}）。视角差异虽大，但配合成本可能高于收益，需要明确的接口和缓冲机制。`,
      complementary: (label) => `${label}差异适中且协作顺畅，形成稳定补位。`,
      moderate: (label) => `${label}有一定互补价值，但需要在执行中主动协调。`,
      friction: (label) => `${label}差异没有稳定转化为协同收益，容易带来摩擦。`,
    },
    summary: {
      homogeneous:
        '你们在核心认知路径上高度重合，协作顺畅但盲区叠加。这不是"合不来"，而是"容易一起掉进同一个坑"。建议在关键决策节点引入第三方视角，或刻意分配不同信息源。',
      conflicting:
        '你们在关键维度上差异显著，互补潜力存在但执行摩擦偏高。这不是"性格不合"，而是"接口没对齐"。建议先约定决策机制和节奏，再进入实质协作。',
      excellent: '你们既能形成明显补位，又没有被协作成本显著拖累，属于高潜力搭档组合。',
      strong: '你们在关键维度上存在明确互补，只要提前对齐节奏和分工，就能稳定放大彼此长板。',
      workable: '这是一组具备协同价值的组合，但需要在合作方式上做主动设计，才能把差异转化为产出。',
      highFriction: '你们不是没有互补潜力，而是执行摩擦偏高，需要更明确的接口、节奏和角色划分。',
      default: '你们当前的差异尚未形成有效协同，若缺少明确分工，很容易在合作中互相消耗。',
    },
    missionReason: {
      homogeneous: (strongest) =>
        `${strongest}维度支撑这类任务，但你们思维路径相似，建议采用"平行验证"模式：各自独立完成后再交叉比对。`,
      conflicting: (strongest) =>
        `${strongest}维度与任务需求匹配，但你们需要先对齐接口和节奏，否则差异会转化为执行阻力。`,
      default: (strongest) =>
        `${strongest}维度最能支撑这类任务，适合把双方差异转化为分工协同。`,
    },
    recommendations: {
      bestFor: {
        homogeneous: [
          '边界清晰、目标明确的小范围协作任务',
          '可以拆解为独立子任务、采用"平行验证"模式的协作场景',
        ],
        conflicting: [
          '有明确第三方仲裁或强流程约束的协作任务',
          '可以物理隔离、减少实时交互的异步协作场景',
        ],
        strategyVisionStrong: '一人发散探索，一人负责收敛和落地的复杂任务',
        highComplementarity: '需要不同视角共同参与的方案评估与决策',
        default: '边界清晰、目标明确的小范围协作任务',
        highCollaboration: '需要频繁对齐、需要同步反馈的合作场景',
        asyncCollaboration: '可以拆解模块、采用异步接口对齐的协作方式',
      },
      shouldAvoid: {
        homogeneous: [
          '在缺乏外部视角的情况下，共同承担高风险决策',
          '两人同时深入同一细节，导致信息源单一化',
        ],
        conflicting: [
          '在情绪高点时直接否定对方方案，容易触发防御性对抗',
          '没有明确角色与接口人时直接并行推进同一模块',
        ],
        highFriction: '没有明确角色与接口人时直接并行推进同一模块',
        lowRhythm: '高压且需要即时同步决策的密集协作场景',
        lowCollaboration: '高频会议、持续打断式的同步合作方式',
        default: '避免在目标尚未定义清楚时就同时深入执行细节',
      },
      communicationTips: {
        homogeneous: [
          '刻意分配不同信息源：同一任务让两人从不同渠道收集信息，再交叉验证。',
          '在关键决策前强制引入"反方视角"：指定其中一人必须站在对立面挑战结论。',
        ],
        homogeneousBlindSpot:
          '盲区高度重合：对方看不到的风险，你大概率也看不到。建议引入第三方复核。',
        conflicting: [
          '引入书面异步决策：先各自写方案，再合并，而非实时辩论。',
          '先约定决策机制（如投票、权威裁决、数据优先），再进入实质讨论。',
          '避免在即时通讯中争论分歧，改用结构化文档标注各自立场。',
        ],
        lowRhythm: '先约定节奏预期：谁先出稿、谁负责收敛、何时做同步决策。',
        highRhythm: '保持固定节奏的短周期同步，能放大你们的协作效率。',
        lowCollaboration: '优先使用异步文档和明确接口，减少彼此打断带来的消耗。',
        highCollaboration: '适当提高高频对齐密度，会让你们更容易形成合拍推进。',
        highBlindSpot: '在关键节点刻意邀请对方审视你的盲区，比单独推进更能提升质量。',
        default: '先明确各自负责的边界，再逐步建立互补默契。',
      },
    },
  },
};
