/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PixelAvatarProps {
  id: string; // The 16-character profile ID (e.g., 'I-C-W-S')
  size?: number; // Visual size in pixels, default is 64
  className?: string;
  glow?: boolean;
}

// 16 Dual Unisex / Feminine (Gender-neutral/Slightly Feminine MBTI-style) Vector Illustrations
const AVATAR_VECTORS: Record<string, React.ReactNode> = {
  // ============================================
  // 1. FD-D-W-I: 战地联络官 · 应急局 · 单兵特勤
  // ============================================
  'FD-D-W-I': (
    <g>
      {/* Twin space buns on top */}
      <circle cx="18" cy="18" r="6" fill="#00f0ff" />
      <circle cx="46" cy="18" r="6" fill="#00f0ff" />
      {/* Short bob hair shape */}
      <path d="M16 26 C16 12, 48 12, 48 26 V36 H44 V28 H20 V38 H16 Z" fill="#00f0ff" />
      {/* Soft face */}
      <path d="M22 24 H42 V43 C42 48, 22 48, 22 43 Z" fill="#ffe2ca" />
      {/* Cheerful anime blushing cheeks */}
      <circle cx="25" cy="38" r="2.5" fill="#ff007f" opacity="0.4" />
      <circle cx="39" cy="38" r="2.5" fill="#ff007f" opacity="0.4" />
      {/* Closed happy eyes & cute smile */}
      <path d="M24 33 Q26 31, 28 33" stroke="#2563eb" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M36 33 Q38 31, 40 33" stroke="#2563eb" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M30 38 Q32 41, 34 38" stroke="#ff007f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Sleek Cyan EMERGENCY HEADSET with visor */}
      <path d="M20 28 C20 18, 44 18, 44 28" fill="none" stroke="#ff6b00" strokeWidth="2" />
      <circle cx="18" cy="32" r="4.5" fill="#ffffff" stroke="#ff6b00" strokeWidth="1.5" />
      <circle cx="46" cy="32" r="4.5" fill="#ffffff" stroke="#ff6b00" strokeWidth="1.5" />
      {/* Visor band */}
      <rect x="22" y="25" width="20" height="3" fill="#ff6b00" opacity="0.8" />
      {/* Cozy modern high-collar EMERGENCY JACKET with reflective stripes */}
      <path d="M18 52 L32 47 L46 52 V60 H18 Z" fill="#ff007f" />
      <path d="M28 47 V60 M36 47 V60" stroke="#00f0ff" strokeWidth="1.5" />
      {/* Reflective rescue stripes */}
      <line x1="18" y1="54" x2="46" y2="54" stroke="#ffe600" strokeWidth="1" opacity="0.8" />
      <line x1="18" y1="57" x2="46" y2="57" stroke="#ffe600" strokeWidth="1" opacity="0.8" />
      {/* Sweat/dirt detail */}
      <circle cx="26" cy="30" r="0.8" fill="#d97706" opacity="0.3" />
      <circle cx="38" cy="31" r="0.6" fill="#d97706" opacity="0.3" />
    </g>
  ),

  // ============================================
  // 2. : 应急指挥官 · 应急局 · 前线指挥
  // ============================================
  'FD-D-W-R': (
    <g>
      {/* Soft Blonde Bob Hair */}
      <path d="M16 26 C16 12, 48 12, 48 26 V38 H44 V28 H20 V38 H16 Z" fill="#ffe600" />
      <path d="M16 26 L23 34" stroke="#ffe600" strokeWidth="3" strokeLinecap="round" />
      {/* Soft Face */}
      <path d="M22 24 H42 V43 C42 48, 22 48, 22 43 Z" fill="#ffd4b2" />
      {/* HOLOGRAPHIC COMMAND VISOR (raised) */}
      <path d="M14 18 C18 8, 44 10, 46 20 L16 20 Z" fill="none" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6" />
      <rect x="22" y="16" width="20" height="4" rx="1" fill="#00f0ff" opacity="0.3" />
      <circle cx="24" cy="18" r="1" fill="#00f0ff" />
      <circle cx="40" cy="18" r="1" fill="#00f0ff" />
      {/* EMERGENCY LIGHT BAR on shoulder */}
      <rect x="42" y="38" width="4" height="2" fill="#ff6b00" />
      <rect x="42" y="41" width="4" height="2" fill="#ff6b00" opacity="0.5" />
      {/* Soft smart eyes & blush */}
      <circle cx="26" cy="33" r="2" fill="#005fbc" />
      <circle cx="38" cy="33" r="2" fill="#005fbc" />
      <circle cx="24" cy="37" r="2" fill="#ff007f" opacity="0.3" />
      <circle cx="40" cy="37" r="2" fill="#ff007f" opacity="0.3" />
      <line x1="29" y1="38" x2="35" y2="38" stroke="#ffe600" strokeWidth="1.5" strokeLinecap="round" />
      {/* COMMAND BATON in hand (implied) */}
      <line x1="46" y1="42" x2="50" y2="38" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="37" r="2" fill="#ff007f" />
      {/* High-collared elegant COMMAND COAT with emergency orange trim */}
      <path d="M17 50 L32 46 L47 50 V60 H17 Z" fill="#005fbc" />
      <circle cx="21" cy="54" r="1.5" fill="#ffffff" />
      <circle cx="43" cy="54" r="1.5" fill="#ffffff" />
      <line x1="32" y1="46" x2="32" y2="60" stroke="#ff6b00" strokeWidth="1.5" />
      {/* Emergency light strip */}
      <line x1="17" y1="52" x2="47" y2="52" stroke="#ff6b00" strokeWidth="0.8" opacity="0.7" />
    </g>
  ),

  // ============================================
  // 3. FD-E-A-I: 生命哨兵 · 生命监察局 (高洁赛博机能姬 · 柔美女性化版)
  // 优化：收窄下颌线，增加兜帽内侧边长发修饰脸型，调大双眼并加入科技腮红，强化英气少女感
  // ============================================
  'FD-E-A-I': (
    <g>
      {/* 1. 科技兜帽深色内衬与后脑基底 */}
      <circle cx="32" cy="31" r="17" fill="#0b132b" />

      {/* 2. 纤细修长的肤色脖颈（奠定柔美体态） */}
      <path d="M29 39 H35 V48 H29 Z" fill="#ffe2ca" />
      <path d="M29 39 H35 V41 H29 Z" fill="#ecd0b9" /> {/* 颈部阴影 */}

      {/* 3. 精致清秀的女性面部轮廓（向内收进 2px，下巴更尖更圆润） */}
      <path d="M25 21 H39 V35 C39 39, 35 42, 32 42 C29 42, 25 39, 25 35 Z" fill="#ffe2ca" />

      {/* 4. 白银质感科技发型（齐刘海 + 新增包裹脸颊的少女长侧发） */}
      {/* 主刘海 */}
      <path d="M19 23 Q32 15, 45 23" fill="none" stroke="#e2e8f0" strokeWidth="3.2" strokeLinecap="round" />
      {/* 两侧顺着兜帽垂落的知性长发束，完美修饰脸型 */}
      <path d="M23 25 V36" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
      <path d="M41 25 V36" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" opacity="0.95" />

      {/* 5. 极轻微的科技全息腮红 (Cyber-Blush) */}
      <circle cx="27.5" cy="35" r="1" fill="#00f5d4" opacity="0.2" />
      <circle cx="36.5" cy="35" r="1" fill="#00f5d4" opacity="0.2" />

      {/* 6. 游刃有余的神秘自信浅笑 */}
      <path d="M30.5 37.5 Q32 38.5, 33.5 37.5" fill="none" stroke="#4a5568" strokeWidth="1.2" strokeLinecap="round" />

      {/* 7. 高精生命状态全息扫描矩阵目镜（略微调整比例，双眼更灵动） */}
      {/* 扫描镜片主体 */}
      <rect x="22" y="27" width="20" height="4.5" rx="1.5" fill="#00f5d4" opacity="0.3" stroke="#00f5d4" strokeWidth="0.8" />
      {/* 精密全息十字准心 */}
      <line x1="26.5" y1="26" x2="26.5" y2="32.5" stroke="#00f5d4" strokeWidth="0.6" opacity="0.8" />
      <line x1="24" y1="29.2" x2="29" y2="29.2" stroke="#00f5d4" strokeWidth="0.6" opacity="0.8" />
      <line x1="37.5" y1="26" x2="37.5" y2="32.5" stroke="#00f5d4" strokeWidth="0.6" opacity="0.8" />
      <line x1="35" y1="29.2" x2="40" y2="29.2" stroke="#00f5d4" strokeWidth="0.6" opacity="0.8" />
      {/* 核心瞳孔点 */}
      <circle cx="26.5" cy="29.2" r="0.8" fill="#ffffff" />
      <circle cx="37.5" cy="29.2" r="0.8" fill="#ffffff" />

      {/* 8. 高科技机能防尘兜帽外壳 */}
      <path d="M15 35 C15 15, 22 11, 32 11 C42 11, 49 15, 49 35 C49 41, 46 45, 44 46 C39 40, 25 40, 20 46 C18 45, 15 41, 15 35" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
      {/* 兜帽排能灯条 */}
      <path d="M18 20 C22 14, 42 14, 46 20" fill="none" stroke="#00f5d4" strokeWidth="0.8" opacity="0.5" />

      {/* 9. 生命监察局高领披风大衣 */}
      <path d="M18 51 L32 48 L46 51 V60 H18 Z" fill="#f8fafc" />
      {/* 科技深色内衬 */}
      <path d="M26 49 L32 52 L38 49 L36 47 L28 47 Z" fill="#0f172a" />
      
      {/* 胸前生命总线核心脉冲徽章 */}
      <circle cx="32" cy="53" r="2.2" fill="#00f5d4" />
      <line x1="32" y1="51.5" x2="32" y2="54.5" stroke="#f8fafc" strokeWidth="0.8" />
      <line x1="30.5" y1="53" x2="33.5" y2="53" stroke="#f8fafc" strokeWidth="0.8" />
    </g>
  ),



  // ============================================
  // 4. FD-E-A-R: 监察医官 · 医疗部 · 总线协调 (干练高级知识分子版)
  // 优化：拉出修长脖颈，统一医疗部薄荷绿/深板岩蓝冷色系，强化冷静、严谨、高级协调官气质
  // ============================================
  'FD-E-A-R': (
    <g>
      {/* 知性利落的微翘短发 - 后脑 (Deep Intellect Brown) */}
      {/* <path d="M16 26 C16 11, 48 11, 48 26 V35 H44 V26 C44 14, 20 14, 20 26 V35 H16 Z" fill="#4a2810" /> */}
            <path d="M16 26 C16 11, 48 11, 48 26 V35 H44 V26 C44 14, 20 14, 20 26 V35 H16 Z" fill="#cbd5e1" />

      {/* 纤细脖颈：彻底与衣服拉开距离，拒绝臃肿 */}
      <path d="M28 41 H36 V49 H28 Z" fill="#ffe2ca" />
      <path d="M28 41 H36 V43 H28 Z" fill="#ecd0b9" /> {/* 颈部阴影 */}

      {/* 锐利精细的女性下颌轮廓 */}
      <path d="M24 23 H40 V38 C40 42, 36 45, 32 45 C28 45, 24 42, 24 38 Z" fill="#ffe2ca" />

      {/* 层次感侧发与空气刘海 */}
      {/* <path d="M16 23 C16 12, 48 9, 48 21 C44 17, 33 14, 24 22 C21 24, 19 28, 19 32" fill="none" stroke="#5c3314" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M43 25 L45 33" stroke="#5c3314" strokeWidth="1.5" strokeLinecap="round" />  */}
      <path d="M16 23 C16 12, 48 9, 48 21 C44 17, 33 14, 24 22 C21 24, 19 28, 19 32" fill="none" stroke="#cbd5e1" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M43 25 L45 33" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" /> {/* 侧面垂发 */}

      {/* 智慧浅笑 (反思型特有的睿智内敛) */}
      <path d="M30 40 Q32 41.5, 34 40" fill="none" stroke="#5c3314" strokeWidth="1.2" strokeLinecap="round" />

      {/* 精密总线医疗监察镜 (圆形细框钛金/薄荷绿全息镜) */}
      {/* 极细高级镜框 */}
      <circle cx="26.5" cy="31.5" r="4.5" fill="none" stroke="#00f5d4" strokeWidth="1.2" />
      <circle cx="37.5" cy="31.5" r="4.5" fill="none" stroke="#00f5d4" strokeWidth="1.2" />
      <line x1="31" y1="31.5" x2="33" y2="31.5" stroke="#00f5d4" strokeWidth="1.2" />
      {/* 薄荷绿全息微光镜片 */}
      <circle cx="26.5" cy="31.5" r="3.5" fill="#00f5d4" opacity="0.15" />
      <circle cx="37.5" cy="31.5" r="3.5" fill="#00f5d4" opacity="0.15" />
      {/* 锐利冷峻的瞳孔 */}
      <circle cx="26.5" cy="31.5" r="1" fill="#0f172a" />
      <circle cx="37.5" cy="31.5" r="1" fill="#0f172a" />

      {/* 医官高阶制服 (深板岩蓝外衣 + 洁白高立领衬衫) */}
      {/* 外套主体 (下压至 Y:49 之后) */}
      <path d="M18 51 L32 48 L46 51 V60 H18 Z" fill="#1e293b" />
      {/* 规范的洁白立领 (V-Neck Base) */}
      <path d="M26 49 L32 53 L38 49 L36 47 L28 47 Z" fill="#f8fafc" />
      
      {/* 总线协调官·全息十字胸章 (替代原本突兀的品红蝴蝶结) */}
      <circle cx="32" cy="53" r="2.5" fill="#00f5d4" />
      <line x1="32" y1="51.5" x2="32" y2="54.5" stroke="#1e293b" strokeWidth="0.8" />
      <line x1="30.5" y1="53" x2="33.5" y2="53" stroke="#1e293b" strokeWidth="0.8" />

      {/* 挂载式总线数据指示灯 (原绿色胸章精细化) */}
      <rect x="42" y="51" width="3" height="4" rx="0.5" fill="#334155" />
      <circle cx="43.5" cy="53" r="0.8" fill="#00f5d4" opacity="0.9" />
    </g>
  ),


  // ============================================
  // 5. FI-E-W-I: 禁区游侠 · 边界署 · 独行勘探
  // 调整：飞行护目镜→破损扫描目镜（单边），夹克增加补丁
  // ============================================
  'FI-E-W-I': (
    <g>
      {/* High Ponytail sticking out to side */}
      <path d="M42 16 Q56 12, 54 26 L44 24 Z" fill="#ff6b00" />
      <circle cx="43" cy="21" r="3.5" fill="#00f0ff" />
      {/* Fluffy messy front hair */}
      <path d="M14 26 C14 12, 44 12, 44 26 V36 H40 V28 H20 V36 H14 Z" fill="#ff6b00" />
      {/* Face */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#ffd4b2" />
      {/* BROKEN SCANNER GOGGLE (single eye) */}
      <rect x="22" y="19" width="12" height="5" rx="1.5" fill="#1e293b" opacity="0.8" />
      <circle cx="27" cy="21.5" r="2" fill="#39ff14" opacity="0.6" />
      <line x1="25" y1="21.5" x2="29" y2="21.5" stroke="#39ff14" strokeWidth="0.5" />
      {/* Cracked lens detail */}
      <line x1="24" y1="20" x2="26" y2="23" stroke="#ff6b00" strokeWidth="0.5" />
      {/* Other eye - scar/bandage */}
      <rect x="36" y="20" width="6" height="4" fill="#ffe2ca" stroke="#d97706" strokeWidth="0.5" />
      {/* Big happy gaze & dimpled blush */}
      <circle cx="26" cy="33" r="2" fill="#1e293b" />
      <circle cx="24" cy="37" r="1.5" fill="#ff007f" opacity="0.4" />
      <circle cx="40" cy="37" r="1.5" fill="#ff007f" opacity="0.4" />
      {/* Cute open smile */}
      <path d="M29 39 Q32 42, 35 39" stroke="#ff007f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Outdoorsy safety PATCHED jacket with gear loops */}
      <path d="M16 52 L32 47 L48 52 V60 H16 Z" fill="#ff6b00" />
      <path d="M28 47 V60 M36 47 V60" stroke="#ffe600" strokeWidth="1" />
      {/* Patch details */}
      <rect x="18" y="54" width="4" height="3" fill="#78350f" />
      <rect x="42" y="55" width="3" height="2" fill="#1e293b" />
      {/* Gear loops */}
      <line x1="46" y1="50" x2="48" y2="48" stroke="#94a3b8" strokeWidth="1" />
      <circle cx="48" cy="47" r="1" fill="#94a3b8" />
      {/* Rust/vine detail */}
      <path d="M14 44 Q16 42, 15 40" stroke="#39ff14" strokeWidth="0.5" fill="none" opacity="0.6" />
    </g>
  ),

  // ============================================
  // 6. FI-E-W-R: 拓荒领队 · 边界署 · 先导规划
  // 优化：罗盘/探险规划主题，Lime-800/Compass-Gold 配色
  // ============================================
  'FI-E-W-R': (
    <g>
      {/* Warm campfire glow on the left background */}
      <circle cx="20" cy="48" r="14" fill="#f59e0b" opacity="0.15" />

      {/* Rugged wind-swept explorer hair with lime green highlights */}
      {/* Back hair */}
      <path d="M15 28 C13 14, 49 14, 49 28 V38 H45 V28 H19 V38 H15 Z" fill="#1e293b" />
      {/* Lime highlights */}
      <path d="M15 28 C15 22, 25 18, 30 20 L28 26 Z" fill="#84cc16" />
      <path d="M49 28 C49 22, 39 18, 34 20 L36 26 Z" fill="#84cc16" />

      {/* Face */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#ffe2ca" />

      {/* Campfire warmth reflection on right cheek */}
      <path d="M22 36 Q25 41, 22 44 Z" fill="#ea580c" opacity="0.35" />

      {/* Focused planning expression */}
      {/* Right eye - focused strategist */}
      <path d="M24 32 H28" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />

      {/* Left eye - analyzing under holographic monocle */}
      <circle cx="37" cy="32" r="4.5" fill="none" stroke="#eab308" strokeWidth="1.8" />
      <circle cx="37" cy="32" r="1.5" fill="#84cc16" />

      {/* Floating Holographic map lines projection */}
      <path d="M37 26 Q40 20, 35 15" stroke="#84cc16" strokeWidth="0.8" fill="none" opacity="0.6" strokeDasharray="2,2" />
      <line x1="33" y1="18" x2="41" y2="18" stroke="#84cc16" strokeWidth="0.8" opacity="0.5" />

      {/* Calm wise smile */}
      <path d="M28 39 Q31 41, 34 39" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Explorer Tactical Jacket (Deep Lime / Olive) with high collar */}
      <path d="M17 50 L32 46 L47 50 V60 H17 Z" fill="#3f6212" />

      {/* Tactical straps & zipper */}
      <line x1="32" y1="46" x2="32" y2="60" stroke="#eab308" strokeWidth="2" />

      {/* Compass emblem on left chest */}
      <circle cx="41" cy="53" r="2.5" fill="#eab308" />
      <line x1="41" y1="51.5" x2="41" y2="54.5" stroke="#1e293b" strokeWidth="0.8" />
      <line x1="39.5" y1="53" x2="42.5" y2="53" stroke="#1e293b" strokeWidth="0.8" />
      <polygon points="41,51.5 42,53 41,54.5 40,53" fill="#ef4444" />

      {/* Glowing holographic arrow (compass-gold) floating near shoulder */}
      <polygon points="50,42 54,39 52,43 51,42" fill="#eab308" opacity="0.8" />
      <line x1="50" y1="45" x2="52" y2="43" stroke="#eab308" strokeWidth="1" opacity="0.8" />
    </g>
  ),

  // ============================================
  // 7. FI-D-A-I: 地下改装师 · 黑市工坊 · 独行技师
  // ============================================
  'FI-D-A-I': (
    <g>
      {/* Straight Silver Hair with soft frame */}
      <path d="M16 26 C16 11, 48 11, 48 26 V41 H44 V27 H20 V41 H16 Z" fill="#e2e8f0" />
      {/* Face */}
      <path d="M23 24 H41 V43 C41 48, 23 48, 23 43 Z" fill="#fff5eb" />
      {/* Gentle Eyes */}
      <circle cx="28" cy="33" r="1.8" fill="#1e293b" />
      {/* WELDING SCOPE eyepiece on left eye - purple arc glow */}
      <circle cx="36" cy="33" r="4.5" fill="none" stroke="#bd00ff" strokeWidth="1.5" />
      <line x1="32" y1="33" x2="40" y2="33" stroke="#bd00ff" strokeWidth="0.8" />
      <line x1="36" y1="29" x2="36" y2="37" stroke="#bd00ff" strokeWidth="0.8" />
      <circle cx="36" cy="33" r="1" fill="#ff6b00" />
      {/* Arc weld spark */}
      <path d="M38 29 Q40 27, 41 29" stroke="#ff6b00" strokeWidth="0.8" fill="none" />
      <circle cx="41" cy="28" r="0.8" fill="#ffe600" />
      {/* Calm small mouth */}
      <line x1="29" y1="39" x2="33" y2="39" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
      {/* TOOL BELT collar / neckband */}
      <rect x="25" y="44" width="14" height="3" fill="#78350f" rx="1" />
      <circle cx="28" cy="45.5" r="1" fill="#94a3b8" />
      <circle cx="36" cy="45.5" r="1" fill="#94a3b8" />
      {/* Sleek tech zip up hoodie with oil stains */}
      <path d="M15 54 L32 48 L49 54 V60 H15 Z" fill="#0f172a" stroke="#bd00ff" strokeWidth="1" />
      {/* Oil stain details */}
      <circle cx="20" cy="56" r="1" fill="#475569" opacity="0.5" />
      <circle cx="44" cy="57" r="0.8" fill="#475569" opacity="0.4" />
    </g>
  ),

  // ============================================
  // 8. FI-D-A-R: 改装工坊主 · 黑市工坊 · 首席技师 (硬核废土重工·机械外骨骼版)
  // ============================================
  'FI-D-A-R': (
    <g>
      {/* 1. 规整硬朗的工装短发 (彻底删除写实刘海，回归标志性积木发帽，重工深灰) */}
      <path d="M16 26 C16 11, 48 11, 48 26 V41 H44 V27 H20 V41 H16 Z" fill="#374151" />

      {/* 2. 完美对齐系列比例的脸型 (完全纠正之前错位的脖子和下巴坐标) */}
      <path d="M23 24 H41 V43 C41 48, 23 48, 23 43 Z" fill="#fff5eb" />

      {/* 3. 左眼：饱满清澈的聚焦瞳孔 (告别呆滞，凝聚废土大佬的深邃冷酷) */}
      <circle cx="28" cy="32" r="1.6" fill="#111827" />

      {/* 4. 右眼【工坊主专属】：重型工业红外线测距目镜 (核心视觉锚点，拒绝单边敷衍小圈) */}
      {/* 核心重装厚镜框 (琥珀重工金，直径加大到 4.5 框住眼睛) */}
      <circle cx="36" cy="32" r="4.5" fill="none" stroke="#f59e0b" strokeWidth="1.6" />
      {/* 外圈重型卡槽接口/齿轮刻度点点 */}
      <circle cx="36" cy="32" r="5.5" fill="none" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="1.5,1.5" opacity="0.8" />
      {/* 内部红外线测距十字准星 */}
      <line x1="32" y1="32" x2="40" y2="32" stroke="#ef4444" strokeWidth="0.8" opacity="0.8" />
      <line x1="36" y1="28" x2="36" y2="36" stroke="#ef4444" strokeWidth="0.8" opacity="0.8" />
      {/* 镜片核心高亮激光对焦源 */}
      <circle cx="36" cy="32" r="1" fill="#ef4444" />
      {/* 侧面连接到太阳穴的重工业铆钉固定铰链 */}
      <line x1="40.5" y1="32" x2="43.5" y2="30" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />

      {/* 5. 绝对冷静、从容平直的工坊主抿嘴线 (去掉假笑，大佬气场全开) */}
      <line x1="28.5" y1="39" x2="33.5" y2="39" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" />

      {/* 6. 颈部：黑市工装高强度防风围领 */}
      <rect x="25" y="44" width="14" height="3" fill="#1f2937" rx="1" />
      <circle cx="28" cy="45.5" r="0.8" fill="#4b5563" />
      <circle cx="36" cy="45.5" r="0.8" fill="#4b5563" />

      {/* 7. 服饰与重型外骨骼装甲 (重组肩颈比例，延展至 15-49 舒适架构) */}
      {/* 耐磨废土重工大衣主体 */}
      <path d="M15 52 L32 47 L49 52 V60 H15 Z" fill="#374151" />
      {/* 大衣中缝与拉链加固条 */}
      <rect x="31" y="48.5" width="2" height="11.5" fill="#1f2937" />

      {/* 左侧·重装甲机动护肩 (增加模块化黑铁防撞层与金属铆钉，突显重型机械姬身份) */}
      <path d="M15 52 Q19 48, 23 50 V58 H15 Z" fill="#475569" /> {/* 基座 */}
      <path d="M15 52 Q18 49, 21 51 V55 H15 Z" fill="#94a3b8" /> {/* 钛合金强化层 */}
      <circle cx="17" cy="54" r="0.5" fill="#1f2937" /> {/* 模块铆钉 */}

      {/* 右侧·重装甲机动护肩 (镜像对称，四平八稳的首席风范) */}
      <path d="M49 52 Q45 48, 41 50 V58 H49 Z" fill="#475569" />
      <path d="M49 52 Q46 49, 43 51 V55 H49 Z" fill="#94a3b8" />
      <circle cx="47" cy="54" r="0.5" fill="#1f2937" />

      {/* 胸前挂载：重型工坊能量核心徽章 (呼应整体色彩) */}
      <rect x="25" y="52" width="4" height="5" rx="0.5" fill="#f59e0b" />
      <circle cx="27" cy="54.5" r="1" fill="#fde68a" />
    </g>
  ),





  // ============================================
  // 9. FI-D-W-I: 孤星观测员 · 总控中心 · 塔楼守望
  // 保持：权威+孤独=塔楼守望
  // ============================================
  'FI-D-W-I': (
    <g>
      {/* Flowing super long dark elegant hair */}
      <path d="M15 28 C15 10, 49 10, 49 28 V56 H45 V32 H19 V56 H15 Z" fill="#1e293b" />
      {/* Face */}
      <path d="M23 24 H41 V43 C41 48, 23 48, 23 43 Z" fill="#ffe2ca" />
      {/* Delicate Golden Tiara crown pin */}
      <path d="M28 14 L32 9 L36 14 Z" fill="#ffe600" />
      <circle cx="32" cy="7" r="1.5" fill="#ffe600" />
      <line x1="28" y1="14" x2="36" y2="14" stroke="#ffe600" strokeWidth="1.5" />
      {/* Serene half-closed eyes (Zen wisdom) */}
      <path d="M25 33 L29 34 Q27 36, 25 33" fill="#00f0ff" stroke="#00f0ff" strokeWidth="1" />
      <path d="M35 33 L39 34 Q37 36, 35 33" fill="#00f0ff" stroke="#00f0ff" strokeWidth="1" />
      <circle cx="27" cy="37" r="1.5" fill="#ff007f" opacity="0.25" />
      <circle cx="37" cy="37" r="1.5" fill="#ff007f" opacity="0.25" />
      {/* Zen smile */}
      <path d="M29 39 Q32 41, 35 39" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Majestic neat high collar dress/gown (Royal Cyber Blue) with data patterns */}
      <path d="M14 54 L32 48 L50 54 V65 H14 Z" fill="#005fbc" />
      <path d="M25 48 L32 52 L39 48" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
      {/* Data stream pattern */}
      <line x1="16" y1="56" x2="16" y2="62" stroke="#00f0ff" strokeWidth="0.5" opacity="0.5" />
      <line x1="20" y1="58" x2="20" y2="64" stroke="#00f0ff" strokeWidth="0.5" opacity="0.3" />
      <line x1="44" y1="57" x2="44" y2="63" stroke="#00f0ff" strokeWidth="0.5" opacity="0.4" />
      <line x1="48" y1="55" x2="48" y2="61" stroke="#00f0ff" strokeWidth="0.5" opacity="0.6" />
    </g>
  ),

  // ============================================
  // 10. FI-D-W-R: 中枢架构师 · 总控中心 · 系统调度
  // 调换：使用原R-D-W-T的分层紫发+水晶耳环+数据背心
  // ============================================
  'FI-D-W-R': (
    <g>
      {/* Neat Bob Cut in Lilac/Violet - COMMAND VARIANT */}
      <path d="M16 26 C16 12, 48 12, 48 26 V38 H44 V28 H20 V38 H16 Z" fill="#8b5cf6" />
      {/* Face */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#ffd4b2" />
      {/* COMMAND VISOR - orange data display */}
      <circle cx="28" cy="33" r="2.5" fill="#0f172a" />
      <rect x="32" y="31" width="10" height="4" rx="1" fill="#ff6b00" />
      <line x1="28" y1="33" x2="33" y2="33" stroke="#ff6b00" strokeWidth="1.5" />
      {/* Smart, strategic expressions */}
      <circle cx="28" cy="33" r="1" fill="#ffe600" />
      <path d="M29 40 Q32 41.5, 35 40" stroke="#0f172a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Elegant Tactical high-collar vest with COMMAND STRIPES */}
      <path d="M14 52 L32 48 L50 52 V60 H14 Z" fill="#0f172a" />
      <path d="M16 52 L32 48 L48 52" fill="none" stroke="#00f0ff" strokeWidth="2" />
      <circle cx="32" cy="54" r="2" fill="#ffe600" stroke="#0f172a" strokeWidth="0.8" />
      {/* Commander rank insignia */}
      <rect x="44" y="50" width="3" height="4" fill="#ffe600" />
      <rect x="44" y="55" width="3" height="2" fill="#ff6b00" />
      {/* Crystal data earrings - command variant */}
      <line x1="20" y1="32" x2="20" y2="38" stroke="#00f0ff" strokeWidth="1" strokeLinecap="round" />
      <circle cx="20" cy="39" r="1" fill="#ff007f" />
    </g>
  ),

  // ============================================
  // 11. FD-D-A-I: 巡夜守灯人 · 标准局 · 调校师
  // 调整：去掉蒙眼丝带，改为发光检测目镜
  // ============================================
  'FD-D-A-I': (
    <g>
      {/* Graceful flowing silver hair surrounding face */}
      <path d="M16 20 C16 10, 48 10, 48 20 V58 H44 V26 H20 V58 H16 Z" fill="#cbd5e1" />
      {/* Face */}
      <path d="M23 23 H41 V42 C41 47, 23 47, 23 42 Z" fill="#fff5eb" />
      {/* GLOWING DETECTION SCOPE - replaces blindfold */}
      <rect x="21" y="27" width="22" height="6.5" rx="1" fill="#090d16" />
      <rect x="23" y="29" width="18" height="2.5" rx="0.5" fill="#00f0ff" opacity="0.6" />
      {/* Scanning line animation effect */}
      <line x1="23" y1="30.5" x2="41" y2="30.5" stroke="#ffffff" strokeWidth="0.5" opacity="0.8" />
      {/* Golden node at temple */}
      <circle cx="41" cy="30" r="1.5" fill="#ffe600" />
      {/* Quiet meditative mouth line */}
      <line x1="29" y1="38" x2="35" y2="38" stroke="#090d16" strokeWidth="1" strokeLinecap="round" />
      {/* Silk High-collar cape layout with calibration pattern */}
      <path d="M23 42 L32 46 L41 42" fill="none" stroke="#ff007f" strokeWidth="2.2" />
      <path d="M15 52 L32 48 L49 52 V60 H15 Z" fill="#090d16" />
      <circle cx="32" cy="54" r="2.5" fill="#ff007f" />
      {/* Calibration grid pattern */}
      <line x1="18" y1="54" x2="18" y2="58" stroke="#00f0ff" strokeWidth="0.3" opacity="0.5" />
      <line x1="21" y1="54" x2="21" y2="58" stroke="#00f0ff" strokeWidth="0.3" opacity="0.5" />
      <line x1="43" y1="54" x2="43" y2="58" stroke="#00f0ff" strokeWidth="0.3" opacity="0.5" />
      <line x1="46" y1="54" x2="46" y2="58" stroke="#00f0ff" strokeWidth="0.3" opacity="0.5" />
    </g>
  ),

  // ============================================
  // 12. FD-D-A-R: 质检指挥官 · 标准局 · 质检总长 (冷酷铁面判官·白银长发版)
  // 优化：彻底删除两侧突兀的圆球，重构为垂至肩膀的利落银色直长发，强化干练女总长气质
  // ============================================
  'FD-D-A-R': (
    <g>
      {/* 1. 后脑发底（Silver Hair Base） */}
      <path d="M16 25 C16 11, 48 11, 48 25 V33 H16 Z" fill="#cbd5e1" />

      {/* 2. 纤细修长的肤色脖颈（破除头身黏连） */}
      <path d="M28 40 H36 V49 H28 Z" fill="#ffe2ca" />
      <path d="M28 40 H36 V42 H28 Z" fill="#e2d4c9" /> {/* 颈部阴影 */}

      {/* 3. 精致高冷的面部轮廓 */}
      <path d="M24 22 H40 V36 C40 40, 36 43, 32 43 C28 43, 24 40, 24 36 Z" fill="#ffe2ca" />

      {/* 4. 白银长发延伸线（顺着脸颊利落垂落至肩膀，取代原有的圆球） */}
      <path d="M18 24 V44 C18 47, 15 49, 15 51" fill="none" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M46 24 V44 C46 47, 49 49, 49 51" fill="none" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
      {/* 银发内部高光发丝，增加飘逸感 */}
      <path d="M19 26 V42" fill="none" stroke="#f1f5f9" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
      <path d="M45 26 V42" fill="none" stroke="#f1f5f9" strokeWidth="1" opacity="0.6" strokeLinecap="round" />

      {/* 5. 白银质感刘海 */}
      <path d="M18 22 C20 12, 44 12, 46 22" fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />

      {/* 6. 睿智且游刃有余的质检总长微笑 */}
      <path d="M30 38 Q32 39.5, 34 38" fill="none" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />

      {/* 7. 高阶标准局威严大檐指挥帽 */}
      {/* 帽子主体 */}
      <path d="M17 19 C20 8, 44 8, 47 19 Z" fill="#1e293b" />
      {/* 金色徽章（帽徽） */}
      <path d="M30 14 L32 11 L34 14 L32 16 Z" fill="#facc15" />
      {/* 帽檐 */}
      <rect x="12" y="18" width="40" height="3" rx="1.5" fill="#0f172a" />
      {/* 帽檐金色装饰编织线 */}
      <line x1="14" y1="18.5" x2="50" y2="18.5" stroke="#facc15" strokeWidth="1" />

      {/* 8. 标准局高精全息矩阵目镜 */}
      <rect x="21" y="27" width="9" height="5" rx="1" fill="#00f5d4" opacity="0.3" stroke="#00f5d4" strokeWidth="1" />
      <rect x="34" y="27" width="9" height="5" rx="1" fill="#00f5d4" opacity="0.3" stroke="#00f5d4" strokeWidth="1" />
      <line x1="30" y1="29.5" x2="34" y2="29.5" stroke="#00f5d4" strokeWidth="1" opacity="0.8" />
      <circle cx="25.5" cy="29.5" r="0.8" fill="#facc15" />
      <circle cx="38.5" cy="29.5" r="0.8" fill="#facc15" />

      {/* 9. 质检总长铁血制服 */}
      <path d="M18 51 L32 48 L46 51 V60 H18 Z" fill="#0f172a" />
      <path d="M26 49 L32 52 L38 49 L36 47 L28 47 Z" fill="#f8fafc" />
      
      {/* 胸前标准局黄金质检勋章 */}
      <polygon points="32,51 30,54 32,57 34,54" fill="#facc15" />
      
      {/* 规范的传统横向大肩章 */}
      {/* 左肩章 */}
      <path d="M14 49 L21 47 L21 51 L14 51 Z" fill="#facc15" />
      <line x1="16" y1="49.5" x2="19" y2="48.5" stroke="#0f172a" strokeWidth="0.8" />
      <line x1="16" y1="50.5" x2="19" y2="49.5" stroke="#0f172a" strokeWidth="0.8" />
      {/* 右肩章 */}
      <path d="M50 49 L43 47 L43 51 L50 51 Z" fill="#facc15" />
      <line x1="48" y1="49.5" x2="45" y2="48.5" stroke="#0f172a" strokeWidth="0.8" />
      <line x1="48" y1="50.5" x2="45" y2="49.5" stroke="#0f172a" strokeWidth="0.8" />
    </g>
  ),


  // // ============================================
  // // 13. FD-E-W-I: 废土寻踪客 · 遗迹司 · 废墟猎人
  // // 调整：太空盔→旧式防毒面具+探照灯，粉发→灰粉渐变
  // // ============================================
  // 'FD-E-W-I': (
  //   <g>
  //     {/* Soft Pink Bob Hair inside suit - DUSTY VARIANT */}
  //     <path d="M20 25 C16 16, 48 16, 44 25" fill="none" stroke="#d8b4c4" strokeWidth="6" strokeLinecap="round" />
  //     {/* Face */}
  //     <path d="M24 24 H40 V42 C40 47, 24 47, 24 42 Z" fill="#ffe2ca" />
  //     {/* Sparkling deep space gradient eyes - EXPLORATION GAZE */}
  //     <circle cx="28" cy="32" r="2" fill="#00f0ff" />
  //     <circle cx="36" cy="32" r="2" fill="#00f0ff" />
  //     <polygon points="28,30 29,31 28,32 27,31" fill="#ffffff" />
  //     <polygon points="36,30 37,31 36,32 35,31" fill="#ffffff" />
  //     <path d="M29 37 Q32 39, 35 37" stroke="#ff007f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  //     {/* OLD-STYLE GAS MASK + HEADLAMP - replaces space helmet */}
  //     <circle cx="32" cy="32" r="22.5" fill="none" stroke="#94a3b8" strokeWidth="2.2" opacity="0.8" />
  //     {/* Headlamp */}
  //     <circle cx="32" cy="12" r="3" fill="#ffe600" />
  //     <line x1="32" y1="9" x2="32" y2="15" stroke="#ff6b00" strokeWidth="1" />
  //     <line x1="29" y1="12" x2="35" y2="12" stroke="#ff6b00" strokeWidth="1" />
  //     {/* Filter canisters */}
  //     <circle cx="18" cy="38" r="3" fill="#64748b" />
  //     <circle cx="46" cy="38" r="3" fill="#64748b" />
  //     {/* Glossy light reflections arcs */}
  //     <path d="M14 20 A 22 22 0 0 1 24 13" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  //     {/* Outer Star spark decal */}
  //     <polygon points="46,18 48,20 46,22 44,20" fill="#ffe600" opacity="0.9" />
  //     {/* Dusty exploration high-collar scarf */}
  //     <rect x="23" y="47" width="18" height="4" fill="#78350f" rx="1.5" />
  //     <path d="M14 54 L32 49 L50 54 V60 H14 Z" fill="#e2e8f0" />
  //     {/* Dust/dirt overlay */}
  //     <circle cx="26" cy="28" r="0.8" fill="#94a3b8" opacity="0.3" />
  //     <circle cx="38" cy="30" r="0.6" fill="#94a3b8" opacity="0.2" />
  //   </g>
  // ),

  // ============================================
  // 13. FD-E-W-I: 废土寻踪客 · 遗迹司 · 废墟猎人 (重装防毒面具·硬核生化生存版)
  // ============================================
  'FD-E-W-I': (
    <g>
      {/* 1. 灰粉渐变短发 (Bob Hair - 带有沙尘覆土感的低饱和度灰粉) */}
      <path d="M16 26 C16 11, 48 11, 48 26 V41 H44 V28 H20 V41 H16 Z" fill="#9d174d" />
      <path d="M16 26 C16 11, 48 11, 48 20 L32 15 L16 22 Z" fill="#cbd5e1" opacity="0.25" />

      {/* 2. 完美对齐系列比例的脸型 */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#ffe2ca" />

      {/* 3. 额头战术强光探照灯带 (稳固固定于额头) */}
      <rect x="20" y="19" width="24" height="3" fill="#334155" rx="0.5" />
      <circle cx="32" cy="19" r="3.5" fill="#1e293b" />
      <circle cx="32" cy="19" r="2.5" fill="#ffe600" />
      <line x1="32" y1="15.5" x2="32" y2="10" stroke="#ff6b00" strokeWidth="1" strokeLinecap="round" />
      <line x1="28.5" y1="19" x2="35.5" y2="19" stroke="#ff6b00" strokeWidth="1" strokeLinecap="round" />

      {/* 4. 探索者聚焦双眼 + 工业防辐射目镜框 */}
      <path d="M21 29 H43 V35 H21 Z" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="32" r="1.6" fill="#0f172a" />
      <circle cx="36" cy="32" r="1.6" fill="#0f172a" />
      <line x1="23" y1="30.5" x2="25" y2="30.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
      <line x1="39" y1="30.5" x2="41" y2="30.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />

      {/* 5. 【核心重构】：重装模块化防毒面具 (拒绝猪鼻子，全面强化重工业结构) */}
      {/* 5a. 面具防撞树脂装甲外壳基座 (咬合人中与下巴，构成坚固的 H 型轮廓) */}
      <path d="M25 35 H39 V42 L35 46 H29 L25 42 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
      <path d="M27 35 H37 V37 H27 Z" fill="#1e293b" opacity="0.4" /> {/* 面具上沿橡胶密封条 */}

      {/* 5b. 中央圆形机械压力冷凝阀 */}
      <circle cx="32" cy="40" r="3" fill="#1e293b" />
      <circle cx="32" cy="40" r="2" fill="#475569" />
      {/* 冷凝阀垂直泄压导气槽 */}
      <line x1="32" y1="38" x2="32" y2="42" stroke="#1e293b" strokeWidth="0.8" />
      <line x1="30.5" y1="40" x2="33.5" y2="40" stroke="#1e293b" strokeWidth="0.8" />

      {/* 5c. 左右两侧·重型双层活性炭滤毒罐 (直径加大，增添细密进气格栅) */}
      {/* 左滤罐 */}
      <circle cx="21" cy="41" r="4" fill="#1e293b" />
      <circle cx="21" cy="41" r="3.2" fill="#475569" />
      <circle cx="21" cy="41" r="2.5" fill="none" stroke="#334155" strokeWidth="0.6" strokeDasharray="1.5,1" /> {/* 进气网格 */}
      <line x1="24.5" y1="39.5" x2="26" y2="38.5" stroke="#1e293b" strokeWidth="1.5" /> {/* 坚固的螺纹金属导管 */}

      {/* 右滤罐 */}
      <circle cx="43" cy="41" r="4" fill="#1e293b" />
      <circle cx="43" cy="41" r="3.2" fill="#475569" />
      <circle cx="43" cy="41" r="2.5" fill="none" stroke="#334155" strokeWidth="0.6" strokeDasharray="1.5,1" />
      <line x1="39.5" y1="39.5" x2="38" y2="38.5" stroke="#1e293b" strokeWidth="1.5" />

      {/* 6. 围领与大衣：耐磨防尘猎人斗篷 */}
      <rect x="23" y="47" width="18" height="4" fill="#78350f" rx="1.5" />
      <path d="M14 53 L32 48 L50 53 V60 H14 Z" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
      
      {/* 7. 废土环境微尘细节 */}
      <circle cx="18" cy="56" r="0.6" fill="#78350f" opacity="0.4" />
      <circle cx="46" cy="57" r="0.8" fill="#475569" opacity="0.5" />
    </g>
  ),



  // // ============================================
  // // 14. FD-E-W-R: 首席解码师 · 遗迹司 · 发掘主管
  // // 调换：使用原R-C-W-T的不对称灰发+单片眼镜+深蓝高领
  // // ============================================
  // 'FD-E-W-R': (
  //   <g>
  //     {/* Asymmetric Sleek Grey Bob hairstyle - SCHOLAR VARIANT */}
  //     <path d="M16 26 C16 11, 48 11, 48 26 V38 H44 V27 H20 V38 H16 Z" fill="#94a3b8" />
  //     <path d="M16 26 L23 37" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
  //     {/* Face */}
  //     <path d="M22 23 H42 V43 C42 48, 22 48, 22 43 Z" fill="#ffe2ca" />
  //     {/* Sophisticated round glass reading MONOCLE - scholar authority */}
  //     <circle cx="28" cy="32" r="4.5" fill="none" stroke="#ffe600" strokeWidth="1.5" />
  //     <line x1="28" y1="27" x2="32" y2="21" stroke="#ffe650" strokeWidth="1" />
  //     <circle cx="28" cy="32" r="1" fill="#39ff14" />
  //     {/* Soft calm eye */}
  //     <line x1="34" y1="32" x2="38" y2="32" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
  //     {/* Calm wise smile */}
  //     <path d="M28 38.5 Q32 40, 36 38.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
  //     {/* Sleek minimal navy blue high turtleneck style jacket with RELIC BADGE */}
  //     <path d="M17 51 L32 46 L47 51 V60 H17 Z" fill="#1e293b" />
  //     <path d="M29 46 L32 52 L35 46" fill="none" stroke="#ff007f" strokeWidth="1.5" />
  //     {/* Relic司 badge */}
  //     <circle cx="32" cy="54" r="2" fill="#d97706" />
  //     <line x1="32" y1="52" x2="32" y2="56" stroke="#1e293b" strokeWidth="0.8" />
  //     <line x1="30" y1="54" x2="34" y2="54" stroke="#1e293b" strokeWidth="0.8" />
  //   </g>
  // ),

  // ============================================
  // 14. FD-E-W-R: 首席解码师 · 遗迹司 · 历史推演 (呼号: 拼图 · 挺拔V领·彻底切除双下巴版)
  // ============================================
  'FD-E-W-R': (
    <g>
      {/* 1. 极客利落不规则短碎发 (统一高阶摩卡冷棕: #44403c) */}
      <polygon points="16,26 14,18 22,14 30,17 38,13 46,18 48,26 44,28 20,28" fill="#44403c" />
      <path d="M16 26 H48 V27 H44 V24 H20 V27 H16 Z" fill="#57534e" />
      <polygon points="16,24 25,21 28,26 22,27" fill="#57534e" />
      <polygon points="26,23 40,20 48,24 43,28 32,26" fill="#57534e" />

      {/* 2. 额头战术防尘羊皮带 */}
      <path d="M20 20 L44 22 L44 24 L20 22 Z" fill="#fef08a" opacity="0.9" />
      <rect x="31" y="20.5" width="2" height="3" fill="#ca8a04" rx="0.3" />

      {/* 3. 短款几何鹅蛋脸 (下沿最低点在 Y:42，下颌折角在 Y:40) */}
      <path d="M22 24 H42 V40 Q32 46, 22 40 Z" fill="#ffe2ca" />

      {/* 4. 无色眼白纯粹黑曜石瞳孔 */}
      <circle cx="28" cy="32" r="1.6" fill="#1c1917" />
      <circle cx="36" cy="32" r="1.6" fill="#1c1917" />

      {/* 5. 右眼：古董青铜轮合全息历史测序目镜 */}
      <circle cx="36" cy="32" r="4.5" fill="none" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="36" cy="32" r="3.4" fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeDasharray="1.5,1.5" opacity="0.85" />
      <line x1="32" y1="32" x2="40" y2="32" stroke="#b45309" strokeWidth="0.6" opacity="0.7" />
      <line x1="36" y1="28" x2="36" y2="36" stroke="#06b6d4" strokeWidth="0.6" opacity="0.7" />
      <circle cx="36" cy="32" r="0.6" fill="#39ff14" />

      {/* 6. 脸颊两侧装饰元素 */}
      <path d="M22 34 L21 37 L19 37 L20 34 Z" fill="#06b6d4" />
      <line x1="21" y1="36" x2="24" y2="37.5" stroke="#06b6d4" strokeWidth="0.8" strokeLinecap="round" /> 
      <circle cx="24" cy="37.5" r="0.4" fill="#ffffff" /> 

      <path d="M34.5 36.5 Q35.5 39, 34 40.5" fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeDasharray="1,1" opacity="0.7" />
      <path d="M37.5 36.5 Q38.5 38.5, 39 40" fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeDasharray="1,1" opacity="0.5" />

      {/* 7. 平静的理智抿嘴线 */}
      <line x1="28.5" y1="38.5" x2="33.5" y2="38.5" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />

      {/* 8. 立体三层服饰结构 */}
      {/* 8a. 第一层：最内侧深色高领打底 */}
      <path d="M26 42 L32 45 L38 42 V45 H26 Z" fill="#1c1917" />
      
      {/* 8b. 第二层：斜跨胸前的牛皮文献工具带 */}
      <path d="M17 51 L26 45 L28 47 L19 53 Z" fill="#78350f" opacity="0.85" />
      <circle cx="22" cy="49" r="0.5" fill="#f59e0b" />

      {/* 8c. 第三层：风衣长袍主体 */}
      <path d="M17 49 L32 45 L47 49 V60 H17 Z" fill="#3f6212" stroke="#f59e0b" strokeWidth="0.8" />
      <rect x="31.2" y="45" width="1.6" height="15" fill="#1c1917" />
      <circle cx="35" cy="50" r="0.6" fill="#f59e0b" />
      <circle cx="35" cy="54" r="0.6" fill="#f59e0b" />

      {/* 8d. 【核心重构】：向外、向下敞开的硬朗外翻立领 (最高点从 Y:44 大幅压低至 Y:47.5，彻底清除双下巴错觉) */}
      {/* 左敞开立领 (起点让开中庭，直接从外侧斜向下切) */}
      <path d="M17 49 L23 47.5 L24 53 Z" fill="#283d0b" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" />
      {/* 右敞开立领 */}
      <path d="M47 49 L41 47.5 L40 53 Z" fill="#283d0b" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" />
    </g>
  ),


  // ============================================
  // 15. FI-E-A-I: 碱基女巫 · 生科所 · 微观炼金
  // 调整：护目镜→生物显微镜目镜，围裙→无菌实验袍，增加DNA链
  // ============================================
  'FI-E-A-I': (
    <g>
      {/* Unruly layered copper lock */}
      <path d="M16 26 C16 12, 48 12, 48 26 V41 H44 V28 H20 V41 H16 Z" fill="#d97706" />
      {/* Safety Hairband tying it back */}
      <rect x="22" y="16" width="20" height="3" fill="#ff007f" />
      {/* Face */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#ffd4b2" />
      {/* BIOLOGICAL MICROSCOPE EYEPIECE - replaces safety visor */}
      <rect x="21" y="29" width="10" height="6.5" rx="1.5" fill="#701a75" opacity="0.85" />
      <circle cx="26" cy="32" r="1.5" fill="#ffffff" />
      {/* DNA helix pattern on eyepiece */}
      <path d="M23 30 Q25 31, 23 32 Q25 33, 23 34" stroke="#00f0ff" strokeWidth="0.5" fill="none" />
      <path d="M29 30 Q27 31, 29 32 Q27 33, 29 34" stroke="#00f0ff" strokeWidth="0.5" fill="none" />
      {/* Other eye - focused */}
      <circle cx="38" cy="32" r="1.5" fill="#701a75" />
      {/* Blushing cheeks & small cute focused mouth */}
      <circle cx="24" cy="37" r="1.5" fill="#ffe600" opacity="0.3" />
      <circle cx="40" cy="37" r="1.5" fill="#ffe600" opacity="0.3" />
      <path d="M29 39 Q32 41, 35 39" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* STERILE LAB COAT - replaces worker apron */}
      <path d="M17 50 L32 46 L47 50 V60 H17 Z" fill="#ffffff" />
      <rect x="27" y="47" width="10" height="13" rx="0.5" fill="#e2e8f0" />
      {/* DNA strand tattoo/badge on neck */}
      <path d="M30 45 Q32 44, 34 45 Q32 46, 30 45" stroke="#ff007f" strokeWidth="0.8" fill="none" />
      <path d="M30 46 Q32 45, 34 46 Q32 47, 30 46" stroke="#00f0ff" strokeWidth="0.8" fill="none" />
    </g>
  ),

  // ============================================
  // 16. FI-E-A-R: 基因织匠 · 生科所 · 项目牵头 (完整全息DNA矩阵眼镜·学术总监版)
  // ============================================
  // 'FI-E-A-R': (
  //   <g>
  //     {/* 1. 规整干净的齐短发 (科学论文 DNA 骨架深靛蓝: #1e3a8a) */}
  //     <path d="M16 26 C16 11, 48 11, 48 26 V41 H44 V28 H20 V41 H16 Z" fill="#1e3a8a" />

  //     {/* 2. 完美对齐系列比例的脸型 (下巴与头身比例保持极度舒适) */}
  //     <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#fff5eb" />

  //     {/* 3. 基础双眼位置 (作为全息眼镜内部的透视基准) */}
  //     <circle cx="28" cy="32.5" r="1.6" fill="#0f172a" />
  //     <circle cx="36" cy="32.5" r="1.6" fill="#0f172a" />

  //     {/* 4. 【核心优化】：一体化高阶全息科研眼镜 (横跨面部，端庄大气) */}
  //     {/* 4a. 完整全息透镜基底 (透亮荧光青) */}
  //     <path d="M21 29 H43 V36 H21 Z" fill="#06b6d4" opacity="0.12" />
  //     {/* 4b. 完整的一体化外框架线条 (绝对连贯，告别单眼补丁) */}
  //     <path d="M21 29 H43 V36 H21 Z" fill="none" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />
  //     {/* 4c. 中央鼻梁连接桥 */}
  //     <line x1="31" y1="31.5" x2="33" y2="31.5" stroke="#06b6d4" strokeWidth="1.2" />

  //     {/* 4d. 左镜内部：DNA 碱基对配对梯级矩阵 (Weaving Mode) */}
  //     {/* 碱基第1组：A-T结合链 */}
  //     <line x1="23" y1="31" x2="25" y2="31" stroke="#06b6d4" strokeWidth="0.8" />
  //     <line x1="25" y1="31" x2="27" y2="31" stroke="#f43f5e" strokeWidth="0.8" />
  //     <circle cx="25" cy="31" r="0.3" fill="#ffffff" />
  //     {/* 碱基第2组：G-C结合链 */}
  //     <line x1="23" y1="32" x2="25.5" y2="32" stroke="#06b6d4" strokeWidth="0.8" />
  //     <line x1="25.5" y1="32" x2="27" y2="32" stroke="#f43f5e" strokeWidth="0.8" />
  //     <circle cx="25.5" cy="32" r="0.3" fill="#ffffff" />
  //     {/* 碱基第3组：结合链 */}
  //     <line x1="23" y1="33" x2="24.5" y2="33" stroke="#06b6d4" strokeWidth="0.8" />
  //     <line x1="24.5" y1="33" x2="27" y2="33" stroke="#f43f5e" strokeWidth="0.8" />
  //     <circle cx="24.5" cy="33" r="0.3" fill="#ffffff" />
  //     {/* 碱基第4组：结合链 */}
  //     <line x1="23" y1="34" x2="26" y2="34" stroke="#06b6d4" strokeWidth="0.8" />
  //     <line x1="26" y1="34" x2="27" y2="34" stroke="#f43f5e" strokeWidth="0.8" />
  //     <circle cx="26" cy="34" r="0.3" fill="#ffffff" />

  //     {/* 4e. 右镜内部：精密基因序列锁定靶准星 (Target Lock) */}
  //     <circle cx="36" cy="32.5" r="2.5" fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeDasharray="1,1" />
  //     <line x1="33" y1="32.5" x2="39" y2="32.5" stroke="#f43f5e" strokeWidth="0.6" opacity="0.8" />
  //     <line x1="36" y1="29.5" x2="36" y2="35.5" stroke="#06b6d4" strokeWidth="0.6" opacity="0.8" />
  //     {/* 核心微米级锁定发光点 */}
  //     <circle cx="36" cy="32.5" r="0.5" fill="#f43f5e" />

  //     {/* 5. 平静、从容的沉稳小嘴 (位置与系列完美对齐，展现项目总监的理智) */}
  //     <line x1="28.5" y1="39.5" x2="33.5" y2="39.5" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />

  //     {/* 6. 颈部：生科所高阶项目牵头人·教科书级双螺旋数据锁 */}
  //     <path d="M30 45 Q32 44, 34 45 Q32 46, 30 45" stroke="#06b6d4" strokeWidth="0.8" fill="none" />
  //     <path d="M30 46 Q32 45, 34 46 Q32 47, 30 46" stroke="#f43f5e" strokeWidth="0.8" fill="none" />

  //     {/* 7. 服饰：生科所高级无菌防护大褂 (纯白无菌袍身 + 纳米灰硬朗翻领) */}
  //     <path d="M17 50 L32 46 L47 50 V60 H17 Z" fill="#ffffff" />
  //     <rect x="27" y="47" width="10" height="13" rx="0.5" fill="#e2e8f0" />
      
  //     {/* 专属细节：悬浮在防护服两侧的高阶粒子数据流 (与经典的 DNA 碱基学术色呼应) */}
  //     <circle cx="21" cy="54" r="0.8" fill="#06b6d4" opacity="0.8" />
  //     <circle cx="43" cy="55" r="0.6" fill="#f43f5e" opacity="0.8" />
  //   </g>
  // ),


  // ============================================
  // 16. FI-E-A-R: 基因织匠 · 生科所 · 项目牵头 (完整全息眼镜·深靛蓝狼尾·圆润鹅蛋脸版)
  // ============================================
  'FI-E-A-R': (
    <g>
      {/* 1. 【狼尾发型】：从后脑勺和脖颈两侧自然向下延伸出的硬朗几何发尾 (保持 DNA 骨架深靛蓝: #1e3a8a) */}
      <path d="M16 35 L14 47 L22 45 L20 35 Z" fill="#1e3a8a" />
      <path d="M48 35 L50 47 L42 45 L44 35 Z" fill="#1e3a8a" />
      <path d="M20 35 H44 V47 H20 Z" fill="#1e3a8a" />

      {/* 2. 经典积木风短发基底 (前额与两侧完美对齐同系列比例) */}
      <path d="M16 26 C16 11, 48 11, 48 26 V41 H44 V28 H20 V41 H16 Z" fill="#1e3a8a" />

      {/* 3. 【核心优化】：重构为自然、流畅的几何鹅蛋脸/圆脸轮廓 (优雅平滑，拒绝呆板方钝感) */}
      <path d="M22 24 H42 V42 Q32 48, 22 42 Z" fill="#fff5eb" />

      {/* 4. 基础双眼位置 (作为全息眼镜内部的透视基准) */}
      <circle cx="28" cy="32.5" r="1.6" fill="#0f172a" />
      <circle cx="36" cy="32.5" r="1.6" fill="#0f172a" />

      {/* 5. 一体化高阶全息科研眼镜 (横跨面部，端庄大气) */}
      {/* 5a. 完整全息透镜基底 (透亮荧光青) */}
      <path d="M21 29 H43 V36 H21 Z" fill="#06b6d4" opacity="0.12" />
      {/* 5b. 完整的一体化外框架线条 */}
      <path d="M21 29 H43 V36 H21 Z" fill="none" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />
      {/* 5c. 中央鼻梁连接桥 */}
      <line x1="31" y1="31.5" x2="33" y2="31.5" stroke="#06b6d4" strokeWidth="1.2" />

      {/* 5d. 左镜内部：DNA 碱基对配对梯级矩阵 (Weaving Mode) */}
      <line x1="23" y1="31" x2="25" y2="31" stroke="#06b6d4" strokeWidth="0.8" />
      <line x1="25" y1="31" x2="27" y2="31" stroke="#f43f5e" strokeWidth="0.8" />
      <circle cx="25" cy="31" r="0.3" fill="#ffffff" />
      
      <line x1="23" y1="32" x2="25.5" y2="32" stroke="#06b6d4" strokeWidth="0.8" />
      <line x1="25.5" y1="32" x2="27" y2="32" stroke="#f43f5e" strokeWidth="0.8" />
      <circle cx="25.5" cy="32" r="0.3" fill="#ffffff" />
      
      <line x1="23" y1="33" x2="24.5" y2="33" stroke="#06b6d4" strokeWidth="0.8" />
      <line x1="24.5" y1="33" x2="27" y2="33" stroke="#f43f5e" strokeWidth="0.8" />
      <circle cx="24.5" cy="33" r="0.3" fill="#ffffff" />
      
      <line x1="23" y1="34" x2="26" y2="34" stroke="#06b6d4" strokeWidth="0.8" />
      <line x1="26" y1="34" x2="27" y2="34" stroke="#f43f5e" strokeWidth="0.8" />
      <circle cx="26" cy="34" r="0.3" fill="#ffffff" />

      {/* 5e. 右镜内部：精密基因序列锁定靶准星 (Target Lock) */}
      <circle cx="36" cy="32.5" r="2.5" fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeDasharray="1,1" />
      <line x1="33" y1="32.5" x2="39" y2="32.5" stroke="#f43f5e" strokeWidth="0.6" opacity="0.8" />
      <line x1="36" y1="29.5" x2="36" y2="35.5" stroke="#06b6d4" strokeWidth="0.6" opacity="0.8" />
      <circle cx="36" cy="32.5" r="0.5" fill="#f43f5e" />

      {/* 6. 平静、从容的沉稳小嘴 (展现项目总监的理智) */}
      <line x1="28.5" y1="39.5" x2="33.5" y2="39.5" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />

      {/* 7. 颈部：生科所高阶项目牵头人·教科书级双螺旋数据锁 */}
      <path d="M30 45 Q32 44, 34 45 Q32 46, 30 45" stroke="#06b6d4" strokeWidth="0.8" fill="none" />
      <path d="M30 46 Q32 45, 34 46 Q32 47, 30 46" stroke="#f43f5e" strokeWidth="0.8" fill="none" />

      {/* 8. 服饰：生科所高级无菌防护大褂 (纯白无菌袍身 + 纳米灰硬朗翻领) */}
      <path d="M17 50 L32 46 L47 50 V60 H17 Z" fill="#ffffff" />
      <rect x="27" y="47" width="10" height="13" rx="0.5" fill="#e2e8f0" />
      
      {/* 专属细节：悬浮在防护服两侧的高阶粒子数据流 */}
      <circle cx="21" cy="54" r="0.8" fill="#06b6d4" opacity="0.8" />
      <circle cx="43" cy="55" r="0.6" fill="#f43f5e" opacity="0.8" />
    </g>
  ),
















};

export default function PixelAvatar({
  id,
  size = 64,
  className = '',
  glow = true,
}: PixelAvatarProps) {
  // If id is empty or not in AVATAR_VECTORS, fallback to 'I-C-W-S'
  const vector = AVATAR_VECTORS[id] || AVATAR_VECTORS['FI-D-W-I'];

  // Colors mapping for glow outline glow glow
  const isDStyle = id.includes('-D-');
  const accentColor = isDStyle ? '#00f0ff' : '#ff007f';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id={`pixel-avatar-${id}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{
        filter: glow ? `drop-shadow(0 0 5px ${accentColor}55)` : 'none',
        display: 'block',
      }}
      className={`select-none ${className}`}
    >
      {/* Clean high-contrast viewport dark background ring */}
      <circle cx="32" cy="32" r="31" fill="#050814" stroke="#1e293b" strokeWidth="0.5" />

      {/* Vector Graphics */}
      {vector}
    </svg>
  );
}
