import React from 'react';
import type { CompatibilityPairPattern } from '../contracts/dualReport';

interface PatternBadgeIconProps {
  pattern: CompatibilityPairPattern;
  size?: number;
  className?: string;
}

const ICONS: Record<CompatibilityPairPattern, React.ReactNode> = {
  homogeneous: (
    <g>
      {/* 赛博网格底衬 */}
      <line x1="32" y1="10" x2="32" y2="54" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" />
      <line x1="10" y1="32" x2="54" y2="32" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 4" opacity="0.2" />

      {/* 镜像对称轴心 */}
      <line x1="32" y1="18" x2="32" y2="46" stroke="#00f0ff" strokeWidth="1.5" opacity="0.6" />

      {/* 左侧脑波能量塔与向右发射的回声波 */}
      <g transform="translate(4, 0)">
        <rect x="12" y="24" width="4" height="16" fill="#00f0ff" rx="1" />
        <rect x="8" y="28" width="4" height="8" fill="#00f0ff" opacity="0.6" rx="0.5" />
        <circle cx="14" cy="20" r="2" fill="#00f0ff" />
        {/* 声波波纹线 ))) */}
        <path d="M20 22 A 10 10 0 0 1 20 42" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M24 25 A 7 7 0 0 1 24 39" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M28 28 A 4 4 0 0 1 28 36" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 右侧完美镜像脑波塔与向左发射的回声波 */}
      <g transform="translate(-4, 0)">
        <rect x="48" y="24" width="4" height="16" fill="#00f0ff" rx="1" />
        <rect x="52" y="28" width="4" height="8" fill="#00f0ff" opacity="0.6" rx="0.5" />
        <circle cx="50" cy="20" r="2" fill="#00f0ff" />
        {/* 声波波纹线 ((( */}
        <path d="M44 22 A 10 10 0 0 0 44 42" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <path d="M40 25 A 7 7 0 0 0 40 39" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M36 28 A 4 4 0 0 0 36 36" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 顶部与底部同步指示灯 */}
      <polygon points="32,10 35,14 32,18 29,14" fill="#00f0ff" />
      <polygon points="32,54 35,50 32,46 29,50" fill="#00f0ff" opacity="0.6" />
    </g>
  ),

  complementary: (
    <g>
      {/* 全球地理雷达扫描网格背景 */}
      <circle cx="32" cy="32" r="26" fill="none" stroke="#00e676" strokeWidth="1" strokeDasharray="2 4" opacity="0.25" />
      <circle cx="32" cy="32" r="16" fill="none" stroke="#85ffd1" strokeWidth="1" strokeDasharray="4 4" opacity="0.15" />
      <circle cx="32" cy="32" r="6" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.1" />
      
      {/* 经线组件 (纵向主轴 - 明亮绿 #00e676) */}
      <g>
        <line x1="32" y1="6" x2="32" y2="58" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" />
        {/* 经度仪精密刻度刻度 */}
        <line x1="28" y1="14" x2="31" y2="14" stroke="#00e676" strokeWidth="1" />
        <line x1="28" y1="22" x2="31" y2="22" stroke="#00e676" strokeWidth="1" />
        <line x1="28" y1="42" x2="31" y2="42" stroke="#00e676" strokeWidth="1" />
        <line x1="28" y1="50" x2="31" y2="50" stroke="#00e676" strokeWidth="1" />
        {/* 经线数据游标 */}
        <rect x="29" y="16" width="6" height="3" fill="#00e676" rx="0.5" />
      </g>

      {/* 纬线组件 (横向主轴 - 浅极光绿 #85ffd1) */}
      <g>
        <line x1="6" y1="32" x2="58" y2="32" stroke="#85ffd1" strokeWidth="1.5" strokeLinecap="round" />
        {/* 纬度仪精密刻度 */}
        <line x1="14" y1="28" x2="14" y2="31" stroke="#85ffd1" strokeWidth="1" />
        <line x1="22" y1="28" x2="22" y2="31" stroke="#85ffd1" strokeWidth="1" />
        <line x1="42" y1="28" x2="42" y2="31" stroke="#85ffd1" strokeWidth="1" />
        <line x1="50" y1="28" x2="50" y2="31" stroke="#85ffd1" strokeWidth="1" />
        {/* 纬线数据游标 */}
        <rect x="45" y="29" width="3" height="6" fill="#85ffd1" rx="0.5" />
      </g>

      {/* 经纬交汇核心：高精度定位准星 (世界在此被精准锚定) */}
      <g>
        {/* 数字化四角定位外框 */}
        <path d="M24 28 V24 H28 M40 28 V24 H36 M24 36 V40 H28 M40 36 V40 H36" fill="none" stroke="#ffffff" strokeWidth="1.2" />
        {/* 中心坐标锁定框 */}
        <rect x="27" y="27" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="1.5" rx="0.5" />
        {/* 核心发光绝对圆点 */}
        <circle cx="32" cy="32" r="2" fill="#ffffff" />
        <circle cx="32" cy="32" r="4.5" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.5" />
      </g>
    </g>
  ),

  asymmetric: (
    <g>
      {/* 数字化星体引力折叠空间波纹 */}
      <circle cx="32" cy="32" r="25" fill="none" stroke="#ffb800" strokeWidth="0.5" strokeDasharray="1 8" opacity="0.2" />

      {/* 主引力轨道：带有强烈动感倾角的等离子脉冲椭圆共轨线 (引力轨道效果) */}
      <path 
        d="M12 36 C 8 22, 26 12, 44 17 C 56 22, 52 38, 34 45 C 22 50, 14 44, 12 36" 
        fill="none" 
        stroke="#ffb800" 
        strokeWidth="1.8" 
        strokeDasharray="5 3" 
      />
      
      {/* 次级引力共振溢出轨 (外围弱轨线) */}
      <path 
        d="M8 38 C 2 18, 26 6, 48 13 C 60 20, 56 45, 30 51" 
        fill="none" 
        stroke="#ffe600" 
        strokeWidth="1" 
        strokeDasharray="1 4" 
        opacity="0.4" 
      />

      {/* 轨道切向动能推进矢量箭头 (体现“带着彼此往前转”的运动趋势) */}
      {/* 右上顺时针推进器 */}
      <path d="M37 13 L44 16 L39 21" fill="none" stroke="#ffe600" strokeWidth="1.5" strokeLinecap="round" />
      {/* 左下顺时针推进器 */}
      <path d="M23 49 L16 46 L21 41" fill="none" stroke="#ffb800" strokeWidth="1.5" strokeLinecap="round" />

      {/* 核心双星连线 —— 实时量子引力耦合测距线 */}
      <line x1="22" y1="38" x2="44" y2="22" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />

      {/* 大星 / 主控核心 (节奏沉稳，质感厚重) 坐落于左下引力锚点 (22, 38) */}
      <g transform="translate(22, 38)">
        <circle cx="0" cy="0" r="7.5" fill="none" stroke="#ffb800" strokeWidth="1" opacity="0.4" />
        <circle cx="0" cy="0" r="4.5" fill="#050814" stroke="#ffb800" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
        {/* 定位十字测绘线 */}
        <line x1="-10" y1="0" x2="-6" y2="0" stroke="#ffb800" strokeWidth="1" />
        <line x1="6" y1="0" x2="10" y2="0" stroke="#ffb800" strokeWidth="1" />
      </g>

      {/* 小星 / 高频伴星 (速度极快，打破对称) 坐落于右上共轨点 (44, 22) */}
      <g transform="translate(44, 22)">
        <circle cx="0" cy="0" r="4" fill="#050814" stroke="#ffe600" strokeWidth="2" />
        <circle cx="0" cy="0" r="1" fill="#ffffff" />
        {/* 高速绕转留下的能量高亮微粒 */}
        <circle cx="5" cy="-3" r="1.2" fill="#ffe600" opacity="0.8" />
        <circle cx="9" cy="-6" r="0.8" fill="#ffe600" opacity="0.4" />
      </g>
    </g>
  ),

  conflicting: (
    <g>
      {/* 冲突力场雷达波束背景 */}
      <circle cx="32" cy="32" r="16" fill="none" stroke="#ff007f" strokeWidth="1" strokeDasharray="2 6" opacity="0.15" />
      <circle cx="32" cy="32" r="6" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.1" />

      {/* 左上袭来的高能霓弧束 (粉红) */}
      <g>
        <path d="M12 12 L28 28" stroke="#ff007f" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M10 10 L26 26" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        {/* 尾翼拦截栅格 */}
        <line x1="11" y1="15" x2="15" y2="11" stroke="#ff007f" strokeWidth="1.5" />
        <line x1="15" y1="19" x2="19" y2="15" stroke="#ff007f" strokeWidth="1.5" />
      </g>

      {/* 右下逆袭的高能电荷电弧 (霓虹青) */}
      <g>
        <path d="M52 52 L36 36" stroke="#00f0ff" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M54 54 L38 38" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        {/* 尾翼拦截栅格 */}
        <line x1="49" y1="45" x2="45" y2="49" stroke="#00f0ff" strokeWidth="1.5" />
        <line x1="45" y1="41" x2="41" y2="45" stroke="#00f0ff" strokeWidth="1.5" />
      </g>

      {/* 核心崩塌湮灭碰撞点 (化学反应爆发) */}
      <g transform="translate(32, 32)">
        {/* 四角星闪耀耀斑 */}
        <polygon points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" fill="#ffe600" />
        <polygon points="0,-9 2.5,-2.5 9,0 2.5,2.5 0,9 -2.5,2.5 -9,0 -2.5,-2.5" fill="#ffffff" />
        
        {/* 溅射的等离子矩阵高能粒子流 */}
        <circle cx="-10" cy="-6" r="1.5" fill="#ff007f" />
        <circle cx="-6" cy="-12" r="1" fill="#ff007f" />
        <circle cx="10" cy="6" r="1.5" fill="#00f0ff" />
        <circle cx="6" cy="12" r="1" fill="#00f0ff" />
        
        <circle cx="8" cy="-10" r="1" fill="#ffe600" />
        <circle cx="-8" cy="10" r="1.5" fill="#ffe600" />
      </g>
    </g>
  ),
};

export default function PatternBadgeIcon({ pattern, size = 64, className }: PatternBadgeIconProps) {
  // Glow color mapping based on the pattern
  const accentColor =
    pattern === 'homogeneous' ? '#00f0ff' :
    pattern === 'complementary' ? '#00e676' :
    pattern === 'asymmetric' ? '#ffb800' :
    '#ff007f';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`select-none ${className || ''}`}
      style={{
        filter: `drop-shadow(0 0 5px ${accentColor}55)`,
        display: 'block',
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
      }}
    >
      {/* Clean high-contrast viewport dark background ring matching PixelAvatar */}
      <circle cx="32" cy="32" r="31" fill="#050814" stroke="#1e293b" strokeWidth="0.5" />
      
      {ICONS[pattern]}
    </svg>
  );
}
