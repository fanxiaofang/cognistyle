// ============================================================
// CogniStyle v5.6 互补评分配置 + 文案模板
// 设计文档: doc/系统设计.md 第 9–10 章
// ============================================================

export const DEFAULT_LOCALE = 'zh-CN';

export const COMPATIBILITY_CONFIG = {
  // ==========================================
  // 9.2 维度参数（高斯核评分）
  // R 仅用于 rhythmSynergy，不参与 cognitiveComplementarity
  // ==========================================
  dimensions: {
    field: {
      label: '决策依据互补',
      shortLabel: '决策依据',
      discription: '我依据什么判断',
      sourceKey: 'fieldIndependFieldDepend',
      idealGap: 0.45,
      tolerance: 0.24,
      floor: 15,
    },
    vision: {
      label: '信息视野互补',
      shortLabel: '信息视野',
      discription: '我如何组织和理解信息',
      sourceKey: 'wholisticAnalytic',
      idealGap: 0.50,
      tolerance: 0.27,
      floor: 15,
    },
    direction: {
      label: '目标策略互补',
      shortLabel: '目标策略',
      discription: '我如何寻找解决方向',
      sourceKey: 'exploratoryDirected',
      idealGap: 0.30,
      tolerance: 0.25,
      floor: 15,
    },
    rhythm: {
      label: '行动节奏适配',
      shortLabel: '行动节奏',
      discription: '我如何推进和行动',
      sourceKey: 'impulsiveReflective',
      idealGap: 0.20,
      tolerance: 0.22,
      floor: 15,
    },
  },

  // ==========================================
  // 9.3-C 摩擦风险参数（4 维加权）
  // ==========================================
  friction: {
    field:     { dangerStart: 0.25, weight: 0.35 },
    direction: { dangerStart: 0.30, weight: 0.25 },
    vision:    { dangerStart: 0.30, weight: 0.15 },
    rhythm:    { dangerStart: 0.20, weight: 0.25 },
  },

  // ==========================================
  // 9.3 子分聚合权重
  // ==========================================
  aggregation: {
    // 9.3-A: 核心认知互补度 — 仅 F/V/D，近似等权（R 已移除）
    cognitiveComplementarity: {
      direction: 0.34,
      field:     0.33,
      vision:    0.33,
    },
    // 9.3-B: 盲区覆盖 power transform 指数（0.35: 放松压缩，让中等 Δ 更可见）
    coveragePower: 0.35,
    // 9.4: 搭档指数 — 4 子分，用户可见=计算项
    overall: {
      cognitiveComplementarity: 0.60,
      blindSpotCoverage:        0.15,
      rhythmSynergy:            0.10,
      inverseFrictionRisk:      0.15,
    },
    // homogeneous 保底分（pattern 判定后 floor）
    homogeneousFloor: 72,
  },

  // ==========================================
  // 9.6 组合模式判定（v5.6 – 仅用 raw 值，无 circularity）
  // ==========================================
  pattern: {
    // 4 维全部参与平均 delta 判定
    averageDeltaDimensions: ['field', 'vision', 'direction', 'rhythm'],

    // homogeneous: 四维平均 delta < 0.12（收紧，减少随机配对的误检）
    homogeneousMaxAvgDelta: 0.12,

    // conflicting: frictionRisk >= 30 或 两维及以上 delta > 0.50
    conflictingMinFrictionRisk: 30,
    conflictingExtremeDeltaThreshold: 0.50,
    conflictingExtremeDeltaMinDims: 2,

    // complementary: 盲区覆盖与认知互补同时达标（阈值随 coveragePower=0.35 校准）
    complementaryMinBlindSpot: 25,
    complementaryMinCogComp: 70,
  },

  // ==========================================
  // 9.7 维度解读文案分类阈值（单维度差异类型判定）
  // ==========================================
  dimensionResult: {
    highlyAlignedMaxDelta: 0.15,
    oppositeMinDelta: 0.75,
    complementaryMinScore: 75,
    moderateMinScore: 50,
  },

  // ==========================================
  // 9.5 搭档关系模式 – 分数区间标签
  // ==========================================
  rating: [
    { min: 80, label: '默契' },
    { min: 65, label: '共振' },
    { min: 50, label: '互补' },
    { min: 35, label: '探索' },
    { min:  0, label: '挑战' },
  ],

  // ==========================================
  // 10.2 任务适配权重（过渡方案，仅 F/V/D 核心三维）
  // ==========================================
  missionWeights: [
    {
      name: '禁区探索',
      department: '边界署',
      weights: { field: 0.35, direction: 0.35, vision: 0.30 },
    },
    {
      name: '应急响应',
      department: '应急局',
      weights: { field: 0.45, direction: 0.30, vision: 0.25 },
    },
    {
      name: '标准审计',
      department: '标准局',
      weights: { field: 0.15, direction: 0.25, vision: 0.60 },
    },
    {
      name: '黑市定制',
      department: '黑市工坊',
      weights: { field: 0.20, direction: 0.50, vision: 0.30 },
    },
    {
      name: '遗迹发掘',
      department: '遗迹司',
      weights: { field: 0.15, direction: 0.35, vision: 0.50 },
    },
  ],
};

// ============================================================
// COMPATIBILITY_COPY — 文案模板（v5.6 对齐设计文档 §9.7）
// ============================================================
export const COMPATIBILITY_COPY = {
  'zh-CN': {
    // ---- 错误消息 ----
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

    // ---- 报告引导语 ----
    readingGuide:
      '这份报告不是说你们合不合得来，而是帮你们搞懂：怎么搭伙干活最省力，哪些事别一起碰。',

    // ---- 子分解释 Tooltip ----
    breakdownTooltip: {
      cognitiveComplementarity: '双方在看待问题与解决问题方式上的互补程度',
      rhythmSynergy: '双方在决策与执行节奏上的匹配程度',
      blindSpotCoverage: '双方在认知盲点上的互相补足程度',
      frictionRisk: '双方差异在协作中可能带来的阻力程度',
    },

    // ---- 9.7 patternBadge（4 种搭档关系标签） ----
    patternBadge: {
      homogeneous: {
        label: '回声组',
        tagline: '镜像共振，看世界的方式几乎一样',
        emoji: '🪞',
        color: '#00f0ff',
      },
      complementary: {
        label: '经纬组',
        tagline: '经纬交织，世界才可被精准定位',
        emoji: '🧭',
        color: '#00e676',
      },
      asymmetric: {
        label: '双星共轨组',
        tagline: '节奏不同，但在引力共生中带着彼此飞驰',
        emoji: '💫',
        color: '#ffb800',
      },
      conflicting: {
        label: '化学反应组',
        tagline: '碰撞不是结束，高能反应正在催生全新的可能',
        emoji: '⚡',
        color: '#ff007f',
      },
    },

    // ---- 分享文案（按 pattern 派发）暂时不需要 ----
    shareCaption: {
      homogeneous:
        '我俩看世界的方式几乎一样，默契到不用说话——但踩坑也同步，记得引入外部视角😂',
      complementary:
        '我们刚好能补上彼此缺的那一块，一个负责打开局面，一个负责把事情做完整✨',
      asymmetric:
        '我们节奏不同，但能带着彼此往前转。有些维度天然互补，有些还在磨合💪',
      conflicting:
        '我们属于"碰撞式协作"——分歧真实存在，但说清楚规则后，每次碰撞都是新东西🤣',
    },

    // ---- 9.7 维度解读文案（4 维 × 5 类，20 段独立文案）非亮点维度底部 ----
    dimensionInterpretation: {
      field: {
        similar:
          '你们判断问题时的信息来源高度一致——要么都靠自己，要么都借外力。好处是决策成本低，但要留意你们都看不到的另一半信息。',
        moderate:
          '你们在判断依据上存在轻微差异，一方稍偏独立一方稍偏参考外界。大部分时候能自然对齐，遇到分歧时主动交换各自的信息来源就好。',
        complementary:
          '一个更信自己的判断，一个更信外部的反馈——刚好补上彼此的信息盲区。关键是各自给出依据再交叉比对，别急着否定对方的直觉。',
        opposite:
          '你们判断问题的方式几乎完全相反——一方纯靠自己分析，一方极度依赖外界信号。差异很大，但刚好把独立判断和外部验证两条线都覆盖了。',
        friction:
          '你们在"该信什么"上容易出现根本分歧——你说数据，ta说感觉。不是谁对谁错，是判断框架不一样。提前确认"这次我们以哪种信息为准"能省掉大量拉扯。',
      },
      vision: {
        similar:
          '你们组织和消化信息的方式几乎一样——要么都先看全局，要么都先抠细节。沟通很顺畅，但容易一起忽略另一半画面。',
        moderate:
          '你们在整体↔细节的偏向上差异不大，通常能自然对应。偶尔一方觉得太宏观一方觉得太琐碎时，停下来画一张图就能对齐。',
        complementary:
          '一个先看到全局结构，一个先抓住具体细节——你们一起看问题时，几乎不会漏掉任何一块拼图。记得先让对方说完再补充，别抢话。',
        opposite:
          '你们的视角几乎处在两极——一个人看森林，一个人数树叶。这恰恰是最强的覆盖组合，只是每次沟通前先确认"这次我们先聊大局还是先抠细节"。',
        friction:
          '你们在"先看全局还是先看细节"上的差异比较明显，讨论问题时容易一个觉得对方抓不住重点，一个觉得对方忽略关键细节。提前说好汇报结构能大幅减少内耗。',
      },
      direction: {
        similar:
          '你们面对问题时寻找路径的方式很接近——要么都喜欢多探索几个方向，要么都倾向于尽快锁定一条路。协同效率高，但也要留意是否错过了更好的路径。',
        moderate:
          '你们在探索↔定向的偏好上差异不大，通常能顺着同一个节奏往前推。遇到需要转向的节点时，一方负责发散、一方负责收束会很高效。',
        complementary:
          '一个喜欢先多看看有哪些可能性，一个倾向于尽快选定方向推进——探索力 + 执行力刚好互补。合作时宜让探索方先跑一圈，再由定向方锁定路径。',
        opposite:
          '你们在"先探索还是先锁定"上处于明显对立——一个想继续找更好的，一个觉得方案够了就该推进。这不是矛盾，是自然的分工结构：一个拓展边界，一个守住进度。',
        friction:
          '你们在推进路径上的冲突比较明显——一方觉得对方没想清楚就冲，一方觉得对方犹豫不决。每次任务开始前先约定一个"决策时间点"是最高杠杆的做法。',
      },
      rhythm: {
        similar:
          '你们的推进节奏高度一致——要么都快，要么都稳。沟通成本很低，但同频也可能意味着一起踩坑，关键节点引入外部节奏感会有帮助。',
        moderate:
          '你们的行动节奏比较接近，大部分时候能自然同步。偶尔出现一方想加速一方想确认时，主动说一句"再等我10分钟"就能解决。',
        complementary:
          '一个负责推、一个负责稳——快慢搭配刚好咬合。冲动方负责打开局面，反思方负责把关质量，这是经典的行事节奏好搭档。',
        polarized:
          '你们的节奏差异比较明显——一方快速决策、一方充分确认。这不是冲突，是可以利用的张力：关键决策前让反思方先说话，执行阶段让冲动方主导。',
        friction:
          '你们的推进节奏差异确实比较大——一个觉得对方拖沓，一个觉得对方冒进。提前约定"快速决策清单"和"需要充分讨论的事项"两类规则，各自尊重对方的节奏。',
      },
    },

    // ---- 9.7 summary（搭档关系叙事，4 badge 1:1） ----
    summary: {
      homogeneous:
        '你们在很多问题上会自然想到相似的解决方式，沟通成本很低，容易快速达成一致。如果遇到需要不同视角的任务，可以主动引入外部输入。',
      complementary:
        '你们在不同认知维度上形成互补，一个更擅长打开局面，一个更擅长收敛和补全。只要角色分工清晰，协作会很顺畅。',
      asymmetric:
        '你们在部分维度上配合很好，但在另一些维度上存在明显差异。这种结构既有协作优势，也需要通过明确分工来减少错位成本。',
      conflicting:
        '你们在多个关键维度上存在明显分歧，协作中容易产生拉扯。但如果规则清晰、角色明确，这种差异也最可能撞出新东西，转化为更强的结果质量。',
    },

    // ---- 任务推荐（5 任务动态模板 + 维度角色映射） ----
    taskTemplate: {
      '禁区探索': {
        reason: (strongestLabel, strongestKey) => {
          if (strongestKey === 'direction') return '面对未知环境时，你们一个负责发散可能的方向，一个负责锁定推进路线。探索类任务最容易发挥你们这种"先展开再收束"的协同优势。';
          if (strongestKey === 'field') return '在信息不完整的环境里，你们一边靠独立判断、一边靠外部信号——两条线交叉验证，比单打独斗稳得多。';
          if (strongestKey === 'vision') return '你们一个能看到全局地形，一个能抓住容易被忽略的细节线索。面对未知区域时，这种覆盖能力特别值钱。';
          return '';
        },
        warning: '这类任务节奏多变，建议在每次转向时主动对齐一次——"现在我们是继续探，还是先锁定这个方向？"',
      },
      '应急响应': {
        reason: (strongestLabel, strongestKey) => {
          if (strongestKey === 'field') return '危机时刻最需要的就是——一个人快速下判断，一个人持续验证外部变化。你们刚好有这种组合。';
          if (strongestKey === 'direction') return '应急处理的节奏天然就是"先响应再优化"——你们一个偏快速推进、一个偏持续跟进，刚好覆盖完整链路。';
          if (strongestKey === 'vision') return '你们在处理复杂信息时一个看全局优先级、一个抓关键细节——应急场景里这种分工能大幅减少疏漏。';
          return '';
        },
        warning: '应急场景节奏压力大——如果一方觉得太急、一方觉得太慢，暂停5分钟同步一下优先级就能解决大部分问题。',
      },
      '标准审计': {
        reason: (strongestLabel, strongestKey) => {
          if (strongestKey === 'vision') return '审计类工作需要在整体结构和细节条款之间来回切换——你们一个负责建框架、一个负责抠细节，刚好把最累的部分拆成了两个人的舒适区。';
          if (strongestKey === 'field') return '合规判断需要在"独立解读规则"和"参考外部标准"之间找到平衡——你们俩各占一边，交叉校验后结论更稳。';
          if (strongestKey === 'direction') return '审计推进需要一边排查、一边收束——你们一个擅长先发散看看有没有问题、一个擅长逐步锁定结论，配合起来效率很高。';
          return '';
        },
        warning: '',
      },
      '黑市定制': {
        reason: (strongestLabel, strongestKey) => {
          if (strongestKey === 'direction') return '创新类任务最难的是把点子变成方案——你们一个擅长打开可能性，一个擅长把想法收束成可执行的东西。从发散到落地刚好是你们最舒服的配合方式。';
          if (strongestKey === 'vision') return '非标改造需要一个敢想全局的人和一个能落地细节的人——你们刚好各占一边，越是非标越能发挥你们的互补。';
          if (strongestKey === 'field') return '地下创新最怕盲目——你们一个靠自己的判断、一个靠外部验证，两条线互相盯着的组合在这种任务上特别不容易走偏。';
          return '';
        },
        warning: '创意阶段别急着否定对方的想法——先把可能性全摊开，筛选阶段再用你们的互补优势去过滤。',
      },
      '遗迹发掘': {
        reason: (strongestLabel, strongestKey) => {
          if (strongestKey === 'vision') return '解读历史数据最需要的就是——一个人从碎片里看到全局模式，一个人从全局里发现关键细节。你们的视角刚好覆盖了这种任务最需要的两种人。';
          if (strongestKey === 'direction') return '遗迹工作天然是"探索→解读→收敛"的循环——你们一个习惯多探索几种读法，一个倾向于尽快锁定最可能的解释，配合起来不容易卡住。';
          if (strongestKey === 'field') return 'AI遗迹的解读没有标准答案——你们一个靠内部推理、一个靠外部比对，两条路径交叉后结论会更完整。';
          return '';
        },
        warning: '',
      },
    },

    dimensionRole: {
      direction: (highPole, lowPole) =>
        `更偏探索的那方（${highPole}）负责发散可能性，更偏定向的那方（${lowPole}）负责筛选定稿`,
      vision: (highPole, lowPole) =>
        `更偏分析的那方（${highPole}）负责补充关键细节，更偏整体的那方（${lowPole}）负责建立全局框架`,
      field: (highPole, lowPole) =>
        `更偏依赖外部的那方（${highPole}）负责验证反馈，更偏独立判断的那方（${lowPole}）负责提出初步判断`,
      rhythm: (highPole, lowPole) =>
        `更偏反思的那方（${highPole}）负责把关质量，更偏冲动的那方（${lowPole}）负责推动执行`,
    },

    // ---- 维度一句话总结（4 维 × 5 类）亮点维度卡片底部 ----
    dimensionOneLiner: {
      field: {
        similar: '决策依据：高度同频，省心但有共同信息盲区',
        moderate: '决策依据：轻微差异，交换信息来源就能对齐',
        complementary: '决策依据：内部判断+外部反馈，刚好互补',
        opposite: '决策依据：判断框架两极分化，独立判断与外部验证全覆盖',
        friction: '决策依据：判断框架差异大，先约定以哪种信息为准',
      },
      vision: {
        similar: '信息视野：看问题方式高度一致，注意共同视角盲区',
        moderate: '信息视野：整体↔细节差异不大，画张图就能对齐',
        complementary: '信息视野：全局结构+具体细节，完美覆盖',
        opposite: '信息视野：一个看森林一个数树叶，最强覆盖组合',
        friction: '信息视野：先全局还是先细节有分歧，提前定汇报结构',
      },
      direction: {
        similar: '目标策略：寻找路径的方式接近，但要留意是否错过更好的方向',
        moderate: '目标策略：探索↔定向差异不大，转折时分工发散与收束',
        complementary: '目标策略：探索力+执行力，天然互补',
        opposite: '目标策略：拓展边界+守住进度，自然分工结构',
        friction: '目标策略：推进路径分歧明显，先约定决策时间点',
      },
      rhythm: {
        similar: '行动节奏：节奏高度一致，但要留意共同踩坑',
        moderate: '行动节奏：节奏比较接近，偶尔对齐一下就好',
        complementary: '行动节奏：快慢搭配刚好咬合，经典好搭档',
        polarized: '行动节奏：快速决策+充分确认，是可利用的张力',
        friction: '行动节奏：节奏差异大，提前约定快慢决策清单',
      },
    },

    // ---- 行动建议（4 pattern × 3 类全覆盖 + 维度附加路由） ----
    recommendations: {
      bestFor: {
        homogeneous: [
          '已经有明确目标的事——你们不需要太多沟通就能一起往前走',
          '需要快速同步想法的合作——一个眼神就知道对方在想什么',
        ],
        complementary: [
          '需要一边发散一边收束的任务——一个负责打开局面，一个负责把事情做完整',
          '别人容易忽略细节的大事——你们的视角加起来几乎不会漏掉什么',
        ],
        asymmetric: [
          '可以各自负责一摊的长期项目——各自发挥长处，再定期汇合就好',
          '边做边磨合的合作——不需要一步到位，慢慢找到彼此的节奏',
        ],
        conflicting: [
          '需要不同声音一起参与的讨论——你们天然就是彼此的镜子',
          '没有标准答案的新问题——碰撞里最可能撞出没想到的路',
        ],
      },
      shouldAvoid: {
        homogeneous: [
          '两个人都特别有把握的时候——容易一起踩进同一个坑',
          '没人负责唱反调的时候——关键时刻需要一个人故意站到对面去',
        ],
        complementary: [
          '还没说清楚分工就直接开干——你们的优势是互补，不是读心术',
        ],
        asymmetric: [
          '目标还没对齐就同时推进——方向不一致时各自的努力可能互相抵消',
        ],
        conflicting: [
          '急着分出对错的时候——停下来先听听对方看见了什么，比你证明自己对了更重要',
          '谁也不愿意先听完的时候——你们的分歧往往是因为看到的是同一件事的两面',
        ],
      },
      communicationTips: {
        _base: {
          homogeneous: [
            '你们太容易想到一块去了。遇到重要决定时，试着各自先写下自己的答案，再看看有没有被彼此带偏。',
            '分工合作时，各自先独立做一遍再交叉核对——会比一起从头做到尾更不容易漏东西。',
          ],
          complementary: [
            '你们经常一个负责打开思路，一个负责补全细节。别急着抢结论——等对方把属于他的那一半说完，拼图才会完整。',
            '这种搭配最舒服的状态是：一个人先说"我觉得有这些可能"，另一个人接着说"那我们先把这件事做掉"。',
          ],
          asymmetric: [
            '你们不一定同时进入状态。有人先热身，有人后发力。开始前说一句："这一轮我们先按你的方式试试。"很多摩擦会消失。',
            '你们不需要在所有维度上同步——哪里默契就在哪里并肩，哪里不对就在哪里各自处理。',
          ],
          conflicting: [
            '你们最大的价值，往往藏在分歧里。别急着证明自己是对的。先搞清楚：对方到底看见了什么，是你没看见的。',
            '下次争执的时候试试这个顺序："你先说，我听完。然后我说，你听完。再一起看我们分别看到了什么。"',
          ],
        },
        _byDimension: {
          field: {
            friction: '你们在"该信什么"上很容易分歧——一个人讲数据、一个人讲直觉。下次别急着否定对方，先各自亮出自己判断的来源，你们会发现两边都有道理。',
            opposite: '你们判断问题的方式刚好互补：一个靠自己分析，一个靠外界反馈。重要的判断上，各自给出一版结论再交叉比对——两条线都比一条线更可靠。',
          },
          vision: {
            friction: '讨论前先问一句："这次我们是先聊大局还是先抠细节？"——一个人觉得空洞、一个人觉得琐碎，通常只是因为还没定好从哪一层开始。',
            opposite: '你们一个看森林一个数树叶——这是最强覆盖组合。产出方案时试试：一个人负责画全局图，一个人负责填具体数据，最后凑在一起就是完整拼图。',
          },
          direction: {
            friction: '每次任务开始前先约定一个"决策时间点"——在那之前尽情探索，在那之后坚决执行。这样探索方不会觉得被压制，执行方也不会觉得没完没了。',
            opposite: '把工作拆成两个阶段会很舒服：前半段只探索不锁定，后半段只推进不回头。一个人负责拓展边界，一个人负责守住进度——这不是矛盾，是天然的分工。',
          },
          rhythm: {
            polarized: '你们的节奏差异刚好可以分工：关键决策前让稳的一方先说，执行阶段让快的一方主导。不是谁对谁错——是不同阶段需要不同的节奏。',
            friction: '提前把要做的事分成两类："可以快速决定的"和"需要充分讨论的"。快的一方在第二类上等一等，稳的一方在第一类上跟一跟，你们会少很多摩擦。',
          },
        },
      },
    },
  },
};
