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
  // 1. I-C-W-S: 先遣机师 · 应急局 · 单兵特勤
  // 调整：耳机→轻型通讯头盔，夹克增加反光救援条纹
  // ============================================
  'I-C-W-S': (
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
  // 2. I-C-W-T: 应急指挥官 · 应急局 · 前线指挥
  // 调整：贝雷帽→全息指挥面罩（抬起），增加应急灯条+指挥棒
  // ============================================
  'I-C-W-T': (
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
  // 3. I-C-A-S: 战地孤医 · 医疗部 · 前线速修
  // 调换：使用原I-D-A-S的连帽斗篷+发光眼镜，改为医疗绿光效
  // ============================================
  'I-C-A-S': (
    <g>
      {/* Inner dark hood and SILVER MEDICAL hair bangs */}
      <circle cx="32" cy="32" r="18" fill="#050814" />
      <path d="M20 28 Q32 20, 44 28" fill="none" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
      {/* Soft Face in shadow */}
      <path d="M24 28 H40 V42 C40 46, 24 46, 24 42 Z" fill="#ffe2ca" opacity="0.95" />
      {/* Glowing MEDICAL SCOPE goggles - green crosshair */}
      <rect x="22" y="30" width="20" height="4" rx="1.5" fill="#39ff14" opacity="0.4" />
      <circle cx="27" cy="32" r="1.5" fill="#ffffff" />
      <circle cx="37" cy="32" r="1.5" fill="#ffffff" />
      {/* Crosshair lines */}
      <line x1="27" y1="29" x2="27" y2="35" stroke="#39ff14" strokeWidth="0.8" />
      <line x1="24" y1="32" x2="30" y2="32" stroke="#39ff14" strokeWidth="0.8" />
      <line x1="37" y1="29" x2="37" y2="35" stroke="#39ff14" strokeWidth="0.8" />
      <line x1="34" y1="32" x2="40" y2="32" stroke="#39ff14" strokeWidth="0.8" />
      {/* Mysterious focused smile */}
      <path d="M29 39 Q32 41, 35 39" stroke="#39ff14" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Draped MEDICAL TECH-HOOD - white/cyan for medical */}
      <path d="M14 36 C14 16, 22 12, 32 12 C42 12, 50 16, 50 36 C50 43, 46 48, 44 48 C38 42, 26 42, 20 48" fill="none" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
      {/* Medical high-collar cape jacket */}
      <path d="M15 52 L32 48 L49 52 V60 H15 Z" fill="#ffffff" stroke="#39ff14" strokeWidth="1.5" />
      {/* Medical cross badge */}
      <rect x="29" y="54" width="6" height="2" fill="#ff007f" />
      <rect x="31" y="52" width="2" height="6" fill="#ff007f" />
    </g>
  ),

  // ============================================
  // 4. I-C-A-T: 战地医官长 · 医疗部 · 总线协调
  // 保持：学者感+规范感=医疗协调
  // ============================================
  'I-C-A-T': (
    <g>
      {/* Chin-length Neat Bob Hair with straight bangs */}
      <path d="M16 24 C16 10, 48 10, 48 24 V38 H44 V26 H20 V38 H16 Z" fill="#653b1b" />
      {/* Face */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#ffe2ca" />
      {/* Sleek round magenta glasses */}
      <circle cx="26" cy="33" r="5" fill="none" stroke="#ff007f" strokeWidth="2" />
      <circle cx="38" cy="33" r="5" fill="none" stroke="#ff007f" strokeWidth="2" />
      <line x1="31" y1="33" x2="33" y2="33" stroke="#ff007f" strokeWidth="2" />
      {/* Wise smart eyes */}
      <circle cx="26" cy="33" r="1.5" fill="#00f0ff" />
      <circle cx="38" cy="33" r="1.5" fill="#00f0ff" />
      {/* Sweet small smile */}
      <path d="M30 40 Q32 41.5, 34 40" stroke="#653b1b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Academic shirt with ribbon bowtie */}
      <path d="M17 51 L32 46 L47 51 V60 H17 Z" fill="#334155" />
      <polygon points="32,46 27,49 32,54 37,49" fill="#ffffff" />
      {/* Magenta ribbon bowtie */}
      <circle cx="32" cy="50" r="1.5" fill="#ff007f" />
      <polygon points="32,50 28,48 29,52" fill="#ff007f" />
      <polygon points="32,50 36,48 35,52" fill="#ff007f" />
      {/* Medical coordinator badge */}
      <circle cx="44" cy="52" r="2" fill="#39ff14" />
      <line x1="44" y1="50" x2="44" y2="54" stroke="#ffffff" strokeWidth="1" />
      <line x1="42" y1="52" x2="46" y2="52" stroke="#ffffff" strokeWidth="1" />
    </g>
  ),

  // ============================================
  // 5. I-D-W-S: 禁区游侠 · 边界署 · 独行勘探
  // 调整：飞行护目镜→破损扫描目镜（单边），夹克增加补丁
  // ============================================
  'I-D-W-S': (
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
  // 6. I-D-W-T: 拓荒领队 · 边界署 · 开拓小队
  // 保持：年轻活力=团队探索
  // ============================================
  'I-D-W-T': (
    <g>
      {/* Wavy lavender Split Hair */}
      <path d="M14 26 C14 11, 48 11, 48 26 V42 H44 V28 H20 V42 H14 Z" fill="#bd00ff" />
      <path d="M30 14 C30 14, 46 14, 46 26 L38 28 L32 24 Z" fill="#ff007f" opacity="0.8" />
      {/* Face */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#ffe2ca" />
      {/* Cute glowing star pins in hair */}
      <polygon points="18,18 20,20 18,22 16,20" fill="#00f0ff" />
      <polygon points="46,18 48,20 46,22 44,20" fill="#00f0ff" />
      {/* Sparkly cute eyes with starry pupils */}
      <circle cx="27" cy="33" r="2.5" fill="#bd00ff" />
      <circle cx="37" cy="33" r="2.5" fill="#bd00ff" />
      <polygon points="27,33 28,34 27,35 26,34" fill="#ffffff" />
      <polygon points="37,33 38,34 37,35 36,34" fill="#ffffff" />
      {/* Happy wide smile */}
      <path d="M28 39 Q32 43, 36 39" stroke="#ff007f" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Cozy modern oversized hoodie with team patch */}
      <path d="M16 51 L32 45 L48 51 V60 H16 Z" fill="#1e293b" />
      <circle cx="25" cy="54" r="1.5" fill="#00f0ff" />
      <circle cx="39" cy="54" r="1.5" fill="#00f0ff" />
      {/* Team leader badge */}
      <polygon points="32,48 30,50 32,52 34,50" fill="#ffe600" />
    </g>
  ),

  // ============================================
  // 7. I-D-A-S: 地下改装师 · 黑市工坊 · 独行技师
  // 调换：使用原I-C-A-S的银发+单眼瞄准镜，改为放大镜/焊枪瞄准+工具腰带
  // ============================================
  'I-D-A-S': (
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
  // 8. I-D-A-T: 创意工坊主 · 黑市工坊 · 定制专家
  // 保持：活泼+实验室=工坊创新
  // ============================================
  'I-D-A-T': (
    <g>
      {/* Side messy buns */}
      <circle cx="16" cy="18" r="5" fill="#475569" />
      <circle cx="48" cy="18" r="5" fill="#475569" />
      <path d="M14 18 Q16 12, 18 18" stroke="#39ff14" strokeWidth="1" fill="none" />
      <path d="M46 18 Q48 12, 50 18" stroke="#39ff14" strokeWidth="1" fill="none" />
      {/* Fluffy messy dark hair bangs */}
      <path d="M18 24 C18 12, 46 12, 46 24 V36 H42 V26 H22 V36 H18 Z" fill="#475569" />
      {/* Face */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#fff5eb" />
      {/* Super cute round green spectacles */}
      <circle cx="26" cy="33" r="5.5" fill="none" stroke="#39ff14" strokeWidth="2" />
      <circle cx="38" cy="33" r="5.5" fill="none" stroke="#39ff14" strokeWidth="2" />
      <line x1="31.5" y1="33" x2="32.5" y2="33" stroke="#39ff14" strokeWidth="2" />
      {/* Big eyes looking forward & blush */}
      <circle cx="26" cy="33" r="1.5" fill="#ffe600" />
      <circle cx="38" cy="33" r="1.5" fill="#ffe600" />
      <circle cx="24" cy="38" r="2" fill="#ff007f" opacity="0.4" />
      <circle cx="40" cy="38" r="2" fill="#ff007f" opacity="0.4" />
      {/* Happy small open mouth */}
      <path d="M30 40 Q32 42, 34 40" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      {/* Clean elegant sci-lab experimental coat with workshop apron */}
      <path d="M17 50 L32 45 L47 50 V60 H17 Z" fill="#e2e8f0" />
      <circle cx="32" cy="54" r="1.5" fill="#ffe600" />
      {/* Apron detail */}
      <rect x="28" y="50" width="8" height="10" fill="#78350f" opacity="0.3" />
      <rect x="30" y="52" width="4" height="2" fill="#39ff14" />
    </g>
  ),

  // ============================================
  // 9. R-C-W-S: 孤星观测员 · 总控中心 · 塔楼守望
  // 保持：权威+孤独=塔楼守望
  // ============================================
  'R-C-W-S': (
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
  // 10. R-C-W-T: 监控指挥官 · 总控中心 · 系统调度
  // 调换：使用原R-D-W-T的分层紫发+水晶耳环+数据背心
  // ============================================
  'R-C-W-T': (
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
  // 11. R-C-A-S: 孤夜守灯人 · 标准局 · 调校师
  // 调整：去掉蒙眼丝带，改为发光检测目镜
  // ============================================
  'R-C-A-S': (
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
  // 12. R-C-A-T: 质检指挥官 · 标准局 · 质检总长
  // 修正：肩章从"竖中指"改为传统横向肩章
  // ============================================
  'R-C-A-T': (
    <g>
      {/* SILVER short low ponytail - authority variant */}
      <circle cx="15" cy="40" r="4" fill="#cbd5e1" />
      <circle cx="49" cy="40" r="4" fill="#cbd5e1" />
      {/* Short fringe SILVER hair */}
      <path d="M20 25 C20 12, 44 12, 44 25" fill="none" stroke="#cbd5e1" strokeWidth="4.5" />
      {/* Face */}
      <path d="M22 24 H42 V44 C42 49, 22 49, 22 44 Z" fill="#ffe2ca" />
      {/* Elegant Safety Cap / Beret with SILVER trim */}
      <path d="M15 22 C17 11, 47 11, 49 22 Z" fill="#ffe600" />
      <rect x="12" y="22" width="40" height="3.5" rx="1" fill="#ffe600" />
      <line x1="14" y1="20" x2="48" y2="20" stroke="#cbd5e1" strokeWidth="1" />
      {/* Delicate dual purple spectacles */}
      <rect x="19" y="30" width="10" height="6" rx="1" fill="none" stroke="#ff007f" strokeWidth="1.8" />
      <rect x="35" y="30" width="10" height="6" rx="1" fill="none" stroke="#ff007f" strokeWidth="1.8" />
      <line x1="29" y1="33" x2="35" y2="33" stroke="#ff007f" strokeWidth="1.8" />
      <circle cx="24" cy="33" r="1" fill="#ffe600" />
      <circle cx="40" cy="33" r="1" fill="#ffe600" />
      {/* Sweet analytical smile */}
      <path d="M29 39.5 Q32 41, 35 39.5" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Neon striped safety jumper/vest jacket */}
      <path d="M17 52 L32 47 L47 52 V60 H17 Z" fill="#475569" />
      <line x1="20" y1="51" x2="44" y2="51" stroke="#ffe600" strokeWidth="2.5" />
      {/* 修正：传统横向肩章（替代原来的"竖中指"设计） */}
      {/* 左肩章 - 横向梯形 */}
      <path d="M15 48 L21 46 L21 50 L15 50 Z" fill="#ffe600" />
      <line x1="16" y1="48.5" x2="20" y2="47.5" stroke="#ff007f" strokeWidth="0.5" />
      <line x1="16" y1="49.5" x2="20" y2="48.5" stroke="#ff007f" strokeWidth="0.5" />
      {/* 右肩章 - 横向梯形 */}
      <path d="M49 48 L43 46 L43 50 L49 50 Z" fill="#ffe600" />
      <line x1="48" y1="48.5" x2="44" y2="47.5" stroke="#ff007f" strokeWidth="0.5" />
      <line x1="48" y1="49.5" x2="44" y2="48.5" stroke="#ff007f" strokeWidth="0.5" />
      {/* 肩章连接装饰线 */}
      <line x1="21" y1="48" x2="43" y2="48" stroke="#ffe600" strokeWidth="0.8" opacity="0.5" />
    </g>
  ),

  // ============================================
  // 13. R-D-W-S: 独行勘探员 · 遗迹司 · 废墟猎人
  // 调整：太空盔→旧式防毒面具+探照灯，粉发→灰粉渐变
  // ============================================
  'R-D-W-S': (
    <g>
      {/* Soft Pink Bob Hair inside suit - DUSTY VARIANT */}
      <path d="M20 25 C16 16, 48 16, 44 25" fill="none" stroke="#d8b4c4" strokeWidth="6" strokeLinecap="round" />
      {/* Face */}
      <path d="M24 24 H40 V42 C40 47, 24 47, 24 42 Z" fill="#ffe2ca" />
      {/* Sparkling deep space gradient eyes - EXPLORATION GAZE */}
      <circle cx="28" cy="32" r="2" fill="#00f0ff" />
      <circle cx="36" cy="32" r="2" fill="#00f0ff" />
      <polygon points="28,30 29,31 28,32 27,31" fill="#ffffff" />
      <polygon points="36,30 37,31 36,32 35,31" fill="#ffffff" />
      <path d="M29 37 Q32 39, 35 37" stroke="#ff007f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* OLD-STYLE GAS MASK + HEADLAMP - replaces space helmet */}
      <circle cx="32" cy="32" r="22.5" fill="none" stroke="#94a3b8" strokeWidth="2.2" opacity="0.8" />
      {/* Headlamp */}
      <circle cx="32" cy="12" r="3" fill="#ffe600" />
      <line x1="32" y1="9" x2="32" y2="15" stroke="#ff6b00" strokeWidth="1" />
      <line x1="29" y1="12" x2="35" y2="12" stroke="#ff6b00" strokeWidth="1" />
      {/* Filter canisters */}
      <circle cx="18" cy="38" r="3" fill="#64748b" />
      <circle cx="46" cy="38" r="3" fill="#64748b" />
      {/* Glossy light reflections arcs */}
      <path d="M14 20 A 22 22 0 0 1 24 13" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      {/* Outer Star spark decal */}
      <polygon points="46,18 48,20 46,22 44,20" fill="#ffe600" opacity="0.9" />
      {/* Dusty exploration high-collar scarf */}
      <rect x="23" y="47" width="18" height="4" fill="#78350f" rx="1.5" />
      <path d="M14 54 L32 49 L50 54 V60 H14 Z" fill="#e2e8f0" />
      {/* Dust/dirt overlay */}
      <circle cx="26" cy="28" r="0.8" fill="#94a3b8" opacity="0.3" />
      <circle cx="38" cy="30" r="0.6" fill="#94a3b8" opacity="0.2" />
    </g>
  ),

  // ============================================
  // 14. R-D-W-T: 考古领队 · 遗迹司 · 发掘主管
  // 调换：使用原R-C-W-T的不对称灰发+单片眼镜+深蓝高领
  // ============================================
  'R-D-W-T': (
    <g>
      {/* Asymmetric Sleek Grey Bob hairstyle - SCHOLAR VARIANT */}
      <path d="M16 26 C16 11, 48 11, 48 26 V38 H44 V27 H20 V38 H16 Z" fill="#94a3b8" />
      <path d="M16 26 L23 37" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      {/* Face */}
      <path d="M22 23 H42 V43 C42 48, 22 48, 22 43 Z" fill="#ffe2ca" />
      {/* Sophisticated round glass reading MONOCLE - scholar authority */}
      <circle cx="28" cy="32" r="4.5" fill="none" stroke="#ffe600" strokeWidth="1.5" />
      <line x1="28" y1="27" x2="32" y2="21" stroke="#ffe650" strokeWidth="1" />
      <circle cx="28" cy="32" r="1" fill="#39ff14" />
      {/* Soft calm eye */}
      <line x1="34" y1="32" x2="38" y2="32" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      {/* Calm wise smile */}
      <path d="M28 38.5 Q32 40, 36 38.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Sleek minimal navy blue high turtleneck style jacket with RELIC BADGE */}
      <path d="M17 51 L32 46 L47 51 V60 H17 Z" fill="#1e293b" />
      <path d="M29 46 L32 52 L35 46" fill="none" stroke="#ff007f" strokeWidth="1.5" />
      {/* Relic司 badge */}
      <circle cx="32" cy="54" r="2" fill="#d97706" />
      <line x1="32" y1="52" x2="32" y2="56" stroke="#1e293b" strokeWidth="0.8" />
      <line x1="30" y1="54" x2="34" y2="54" stroke="#1e293b" strokeWidth="0.8" />
    </g>
  ),

  // ============================================
  // 15. R-D-A-S: 碱基女巫 · 生科所 · 微观炼金
  // 调整：护目镜→生物显微镜目镜，围裙→无菌实验袍，增加DNA链
  // ============================================
  'R-D-A-S': (
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
  // 16. R-D-A-T: 研究协调员 · 生科所 · 项目牵头
  // 保持：精致+协作=生科所牵头
  // ============================================
  'R-D-A-T': (
    <g>
      {/* Sleek deep-purple symmetric cut */}
      <path d="M16 26 C16 10, 48 10, 48 26 V39 H43 V27 H21 V39 H16 Z" fill="#701a75" />
      {/* Face */}
      <path d="M22 23 H42 V43 C42 48, 22 48, 22 43 Z" fill="#fff5eb" />
      {/* Elegant hanging cyan crystal cyber earrings */}
      <line x1="20.5" y1="32" x2="20.5" y2="40" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20.5" cy="41" r="1" fill="#ffe600" />
      <line x1="43.5" y1="32" x2="43.5" y2="40" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="43.5" cy="41" r="1" fill="#ffe600" />
      {/* Sweet high-tech visual glasses frame */}
      <line x1="20" y1="31" x2="44" y2="31" stroke="#ff007f" strokeWidth="1" />
      <rect x="23" y="28" width="8" height="5" rx="1" fill="#ff007f" opacity="0.2" />
      <rect x="33" y="28" width="8" height="5" rx="1" fill="#ff007f" opacity="0.2" />
      <circle cx="27" cy="30.5" r="1.5" fill="#00f0ff" />
      <circle cx="37" cy="30.5" r="1.5" fill="#00f0ff" />
      {/* Confident wise look */}
      <path d="M29 39 Q32 41, 35 39" stroke="#701a75" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Scientific collaboration dark formal vest with neon striping */}
      <path d="M17 51 L32 45 L47 51 V60 H17 Z" fill="#1e293b" />
      <path d="M28 45 L32 58 L36 45" fill="none" stroke="#ff007f" strokeWidth="1.5" />
      {/* Team coordinator badge */}
      <rect x="30" y="54" width="4" height="4" fill="#00f0ff" />
      <line x1="32" y1="54" x2="32" y2="58" stroke="#1e293b" strokeWidth="0.8" />
      <line x1="30" y1="56" x2="34" y2="56" stroke="#1e293b" strokeWidth="0.8" />
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
  const vector = AVATAR_VECTORS[id] || AVATAR_VECTORS['I-C-W-S'];

  // Colors mapping for glow outline glow glow
  const isCStyle = id.includes('-C-');
  const accentColor = isCStyle ? '#00f0ff' : '#ff007f';

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
