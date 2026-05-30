export const DEFAULT_LOCALE = 'zh-CN';
export const COMPATIBILITY_CONFIG = {
  dimensions: {
    rhythm: {
      label: '节奏维度',
      shortLabel: '节奏',
      sourceKey: 'impulsiveReflective',
      idealGap: 0.28,
      tolerance: 0.22,
      floor: 8,
    },
    strategy: {
      label: '策略维度',
      shortLabel: '策略',
      sourceKey: 'convergentDivergent',
      idealGap: 0.38,
      tolerance: 0.25,
      floor: 3,
    },
    vision: {
      label: '视野维度',
      shortLabel: '视野',
      sourceKey: 'wholisticAnalytic',
      idealGap: 0.35,
      tolerance: 0.27,
      floor: 5,
    },
    collaboration: {
      label: '协作维度',
      shortLabel: '协作',
      sourceKey: 'soloTeam',
      idealGap: 0.08,
      tolerance: 0.17,
      floor: 2,
    },
  },
  coverage: {
    idealGap: 0.5,
    sameSideBonus: 0.6,
    baseStrengthFactor: 0.4,
    strengthWeight: 0.6,
  },
  friction: {
    rhythm: { dangerStart: 0.4, weight: 0.4 },
    collaboration: { dangerStart: 0.35, weight: 0.35 },
    strategy: { dangerStart: 0.6, weight: 0.15 },
    vision: { dangerStart: 0.65, weight: 0.1 },
  },
  aggregation: {
    cognitiveComplementarity: {
      rhythm: 0.3,
      strategy: 0.35,
      vision: 0.35,
    },
    overall: {
      cognitiveComplementarity: 0.5,
      collaborationCompatibility: 0.15,
      blindSpotCoverage: 0.25,
      inverseFrictionRisk: 0.1,
    },
  },
  scoreAdjustments: {
    homogeneousPenalty: 5,
    homogeneousMissionScoreFactor: 0.85,
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
    { min: 80, label: '王牌' },
    { min: 65, label: '合拍' },
    { min: 50, label: '适配' },
    { min: 35, label: '可期' },
    { min: 0, label: '磨合' },
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
    readingGuide:
      '这份报告不是说你们合不合得来，而是帮你们搞懂：**怎么搭伙干活最省力，哪些事别一起碰**。分数高低不代表关系好坏，只是你们认知互补的成熟度而已。',
    patternBadge: {
      homogeneous: {
        label: '镜像搭档',
        tagline: '同款脑回路，同款盲区',
        color: '#00f0ff',
        shareCaption: '我俩脑回路复制粘贴，连踩坑都同步，记得引入外部视角校验盲区就好😂',
      },
      complementary: {
        label: "拼图搭档",
        tagline: "各司所长，刚好补齐彼此缺口",
        color: "#00e676",
        shareCaption: "我们各司所长，刚好补齐彼此缺口，搭档效率拉满✨",
      },
      // 齿轮搭档（非对称咬合联动）
      asymmetric: {
        label: "齿轮搭档",
        tagline: "精准咬合，互相带动才能全速推进",
        color: "#ffb800",
        shareCaption: "我们精准咬合互相带动，搭配起来就是最强推进力💪",
      },
      conflicting: {
        label: '火花搭档',
        tagline: '见面就掐，掐完就赢',
        color: '#ff007f',
        shareCaption: '我俩属于"见面就掐，掐完真香"型。前提是谁先把规则定好🤣',
      },
    },
    shareCaption: {
      homogeneous: '我俩脑回路复制粘贴，连踩坑都同步，记得引入外部视角校验盲区就好😂',
      conflicting: '我俩属于"见面就掐，掐完真香"型。前提是谁先把规则定好🤣',
      excellent: '我们各司所长，刚好补齐彼此缺口，搭档效率拉满✨',
      strong: '我们精准咬合互相带动，搭配起来就是最强推进力💪',
      workable: '潜力股组合，正在从"能合作"进化到"会合作"。',
      highFriction: '高摩擦高回报，前提是先把"谁说了算"写清楚。',
      default: '还在互相适应中，但已经能看到互补的轮廓了。',
    },

    dimensionInterpretation: {
      similar: (label) =>
        `${label}：你们高度同频，不需要磨合就能上手。但重合度高意味着共同盲区——关键时刻需要引入第三方视角。`,
      opposite: (label) =>
        `${label}：你们俩一个左一个右，差得有点多。虽然视角不一样，但磨合成本有点高，得提前说好节奏。`,
      complementary: (label) => `${label}：你们俩差异刚刚好，天然能互相兜底，补对方的盲区。`,
      moderate: (label) => `${label}：你们俩有互补的空间，但得主动对齐步调，不然容易乱。`,
      friction: (label) =>
        `${label}：你们俩的步调差有点明显，得刻意对齐，不然容易互相拖后腿。`,
    },
    summary: {
      homogeneous:
        '你们俩简直是复制粘贴的同款脑回路——做事顺的时候默契到不用说话，但踩坑也会精准踩同一个坑。这不是合不来，是太像了，系统在提醒你：太像的组合，得需要第三方视角帮你们看看盲区。',
      conflicting:
        '你们俩的思维差异有点大，互补潜力有，但磨合成本也不低。这不是性格不合，是行事节奏没对齐。建议先把谁拍板、谁干活说清楚，再一起动手。',
      excellent: '你们俩刚好能互相兜底，一个想得到的另一个能落地，还没什么磨合成本，属于天生的搭档组合。',
      strong: '你们俩的互补点很明确，只要提前说好谁管啥、节奏怎么对齐，就能把彼此的长板拉满。',
      workable: '你们俩的差异有互补的潜力，但不会自己生效。得刻意分工——一个开脑洞一个收尾巴，一个盯全局一个抠细节，才能把潜力变成结果。',
      highFriction: '你们不是没互补的本事，就是磨合成本有点高，得把谁管啥、节奏怎么对齐说清楚，不然容易内耗。',
      default: '你们俩的认知有差异，但还没形成稳定的补位。先把各自擅长的边界划清楚，再慢慢磨默契就好。',
    },
    missionReason: {
      homogeneous: (strongest) =>
        `${strongest}维度最适配这类任务，不过你们脑回路太像，建议各自先做一遍，再交叉核对，避免一起踩坑。`,
      conflicting: (strongest) =>
        `${strongest}维度最适配这类任务，不过你们俩差异大，得先把节奏对齐，不然差异会变成内耗。`,
      default: (strongest) =>
        `${strongest}维度最适配这类任务，刚好能把你们的差异变成分工，各管一摊。`,
    },
    missionRoleSplit: {
      禁区探索: (a, b) => `建议分工：${a}负责快速突进，${b}负责后方校准`,
      应急响应: (a, b) => `建议分工：${a}负责先行响应，${b}负责持续跟进`,
      标准审计: (a, b) => `建议分工：${a}负责初查梳理，${b}负责复核把关`,
      黑市定制: (a, b) => `建议分工：${a}负责创意提案，${b}负责落地实施`,
      遗迹发掘: (a, b) => `建议分工：${a}负责全局勘探，${b}负责细节深挖`,
    },
    dimensionOneLiner: {
      similar: (label) => `${label}：高度同频，省心有默契，但要警惕共同盲区`,
      opposite: (label) => `${label}：视角两极分化，刚好能覆盖两端，但要磨合`,
      complementary: (label) => `${label}：差异刚刚好，天然补位，完美搭档`,
      moderate: (label) => `${label}：有互补空间，主动对齐就能放大效率`,
      friction: (label) => `${label}：差异有点大，先对齐节奏再干活`,
    },
    recommendations: {
      bestFor: {
        homogeneous: [
          '目标清晰的小型外勤任务',
          '可独立完成、交叉校验的工作'
        ],
        conflicting: [
          '规则明确、有第三方约束的任务',
          '异步分工、事后汇总的协作'
        ],
        strategyVisionStrong: '一人探索创意，一人落地收敛',
        highComplementarity: '多视角参与的评估与决策',
        default: '目标清晰、可拆分交付的协作',
        highCollaboration: '需高频同步、即时反馈的合作',
        asyncCollaboration: '模块拆分、异步对齐的协作'
      },
      shouldAvoid: {
        homogeneous: [
          '无外部监督的高风险决策',
          '共同深入同一细节造成盲区'
        ],
        conflicting: [
          '情绪冲动时否定对方方案',
          '未明确分工就并行推进'
        ],
        highFriction: '未明确角色就共同执行同一模块',
        lowRhythm: '高压即时同步的密集协作',
        lowCollaboration: '高频打断式的同步会议',
        default: '目标未定就深入执行细节'
      },
      communicationTips: {
        homogeneous: [
          '分工获取不同信息源，交叉校验',
          '关键决策设反方，避免共同盲区'
        ],
        homogeneousBlindSpot: '盲区高度重合，建议引入第三方复核',
        conflicting: [
          '先用文档写方案，再汇总讨论',
          '先定决策规则，再谈具体内容',
          '避免即时通讯争吵，用文档对齐'
        ],
        lowRhythm: '提前约定出稿、收敛与同步节点',
        highRhythm: '固定短周期同步，提升协作效率',
        lowCollaboration: '多用异步文档，减少互相打断',
        highCollaboration: '适当提高对齐频率，配合更顺畅',
        highBlindSpot: '关键节点请对方帮你核查盲区',
        default: '先划清分工边界，再慢慢磨合默契'
      }
    },
  },
};