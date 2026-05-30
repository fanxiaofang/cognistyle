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
      {/* Background cyber grid lines */}
      <line x1="32" y1="12" x2="32" y2="52" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <line x1="12" y1="32" x2="52" y2="32" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3" opacity="0.15" />

      {/* Brain connection wire / data bridge */}
      <path d="M23 20 V16 H41 V20" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />
      <polygon points="32,13 35,16 32,19 29,16" fill="#00f0ff" />
      <circle cx="23" cy="20" r="1.5" fill="#00f0ff" />
      <circle cx="41" cy="20" r="1.5" fill="#00f0ff" />

      {/* Cyber scan lines or bars */}
      <rect x="20" y="47" width="24" height="2" fill="#00f0ff" opacity="0.3" />
      <rect x="24" y="51" width="16" height="1.5" fill="#00f0ff" opacity="0.2" />

      {/* Twin Face A (Left) */}
      <g>
        {/* Hair: Cyan */}
        <rect x="14" y="20" width="14" height="6" fill="#00f0ff" />
        <rect x="14" y="26" width="4" height="8" fill="#00f0ff" />
        {/* Face skin */}
        <rect x="18" y="26" width="10" height="10" fill="#ffe2ca" />
        {/* Eyes (looking forward/center) */}
        <rect x="20" y="29" width="2" height="2" fill="#1e293b" />
        <rect x="24" y="29" width="2" height="2" fill="#1e293b" />
        {/* Blush */}
        <rect x="19" y="32" width="2" height="1" fill="#ff007f" opacity="0.5" />
        <rect x="25" y="32" width="2" height="1" fill="#ff007f" opacity="0.5" />
        {/* Smile */}
        <line x1="22" y1="34" x2="24" y2="34" stroke="#ff007f" strokeWidth="1" />
        {/* Clothes */}
        <path d="M14 38 L28 38 V44 H14 Z" fill="#005fbc" />
        <line x1="16" y1="38" x2="26" y2="38" stroke="#00f0ff" strokeWidth="1" />
      </g>

      {/* Twin Face B (Right) */}
      <g>
        {/* Hair: Cyan */}
        <rect x="36" y="20" width="14" height="6" fill="#00f0ff" />
        <rect x="46" y="26" width="4" height="8" fill="#00f0ff" />
        {/* Face skin */}
        <rect x="36" y="26" width="10" height="10" fill="#ffe2ca" />
        {/* Eyes (looking forward/center) */}
        <rect x="38" y="29" width="2" height="2" fill="#1e293b" />
        <rect x="42" y="29" width="2" height="2" fill="#1e293b" />
        {/* Blush */}
        <rect x="37" y="32" width="2" height="1" fill="#ff007f" opacity="0.5" />
        <rect x="43" y="32" width="2" height="1" fill="#ff007f" opacity="0.5" />
        {/* Smile */}
        <line x1="40" y1="34" x2="42" y2="34" stroke="#ff007f" strokeWidth="1" />
        {/* Clothes */}
        <path d="M36 38 L50 38 V44 H36 Z" fill="#005fbc" />
        <line x1="38" y1="38" x2="48" y2="38" stroke="#00f0ff" strokeWidth="1" />
      </g>
    </g>
  ),

  complementary: (
    <g>
      {/* Light beams / background lines */}
      <line x1="32" y1="12" x2="32" y2="52" stroke="#00e676" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
      <line x1="12" y1="32" x2="52" y2="32" stroke="#00e676" strokeWidth="1" strokeDasharray="3 3" opacity="0.15" />

      {/* Sparkles / data packets */}
      <polygon points="32,15 34,17 32,19 30,17" fill="#00e676" />
      <polygon points="20,49 22,51 20,53 18,51" fill="#85ffd1" />
      <polygon points="44,15 46,17 44,19 42,17" fill="#00e676" opacity="0.5" />
      <polygon points="48,47 50,49 48,51 46,49" fill="#00e676" />

      {/* Piece A (Left) */}
      <g>
        <rect x="15" y="24" width="14" height="16" fill="#00e676" rx="1.5" />
        {/* Protruding tab pointing right */}
        <rect x="29" y="29" width="5" height="6" fill="#00e676" rx="1" />
        {/* Top tab */}
        <rect x="20" y="19" width="6" height="5" fill="#00e676" rx="1" />
        {/* Cute Face on Piece A */}
        <rect x="19" y="28" width="2" height="2" fill="#050814" />
        <rect x="17" y="32" width="2" height="1" fill="#ff007f" opacity="0.6" />
        <line x1="21" y1="33" x2="23" y2="33" stroke="#050814" strokeWidth="1" />
      </g>

      {/* Piece B (Right, Interlocks with Piece A) */}
      <g>
        <rect x="34" y="24" width="14" height="16" fill="#85ffd1" rx="1.5" />
        {/* Top extension forming the socket */}
        <rect x="29" y="24" width="5" height="5" fill="#85ffd1" rx="1" />
        {/* Bottom extension forming the socket */}
        <rect x="29" y="35" width="5" height="5" fill="#85ffd1" rx="1" />
        {/* Right piece bottom tab */}
        <rect x="38" y="40" width="6" height="5" fill="#85ffd1" rx="1" />
        {/* Cute Face on Piece B */}
        <rect x="42" y="28" width="2" height="2" fill="#050814" />
        <rect x="44" y="32" width="2" height="1" fill="#ff007f" opacity="0.6" />
        <line x1="40" y1="33" x2="42" y2="33" stroke="#050814" strokeWidth="1" />
      </g>
    </g>
  ),

  asymmetric: (
    <g>
      {/* Rotation speed lines */}
      <path d="M11 31 A 18 18 0 0 1 25 15" fill="none" stroke="#ffb800" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <path d="M49 29 A 10 10 0 0 0 49 17" fill="none" stroke="#ffe600" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />

      {/* Telemetry lines */}
      <line x1="25" y1="37" x2="19" y2="43" stroke="#ffb800" strokeWidth="0.8" opacity="0.5" />
      <line x1="42" y1="23" x2="46" y2="19" stroke="#ffe600" strokeWidth="0.8" opacity="0.5" />

      {/* Sparkles */}
      <polygon points="36,31 38,33 36,35 34,33" fill="#ffe600" />
      <circle cx="15" cy="18" r="1" fill="#ffb800" opacity="0.6" />
      <circle cx="49" cy="42" r="1.5" fill="#ffb800" />

      {/* Large Gear (Gold) */}
      <g>
        <circle cx="25" cy="37" r="10" stroke="#ffb800" strokeWidth="3" fill="none" />
        <circle cx="25" cy="37" r="3.5" fill="#050814" stroke="#ffb800" strokeWidth="1" />
        {/* Teeth */}
        <rect x="23" y="23" width="4" height="4" fill="#ffb800" rx="0.5" />
        <rect x="23" y="47" width="4" height="4" fill="#ffb800" rx="0.5" />
        <rect x="11" y="35" width="4" height="4" fill="#ffb800" rx="0.5" />
        <rect x="35" y="35" width="4" height="4" fill="#ffb800" rx="0.5" />
        <rect x="15" y="27" width="4" height="4" fill="#ffb800" rx="0.5" />
        <rect x="31" y="27" width="4" height="4" fill="#ffb800" rx="0.5" />
        <rect x="15" y="43" width="4" height="4" fill="#ffb800" rx="0.5" />
        <rect x="31" y="43" width="4" height="4" fill="#ffb800" rx="0.5" />
      </g>

      {/* Small Gear (Light Gold) */}
      <g>
        <circle cx="42" cy="23" r="6.5" stroke="#ffe600" strokeWidth="2.5" fill="none" />
        <circle cx="42" cy="23" r="2" fill="#050814" stroke="#ffe600" strokeWidth="0.8" />
        {/* Teeth */}
        <rect x="40.5" y="13.5" width="3" height="3" fill="#ffe600" rx="0.5" />
        <rect x="40.5" y="29.5" width="3" height="3" fill="#ffe600" rx="0.5" />
        <rect x="32.5" y="21.5" width="3" height="3" fill="#ffe600" rx="0.5" />
        <rect x="48.5" y="21.5" width="3" height="3" fill="#ffe600" rx="0.5" />
        <rect x="35.5" y="16.5" width="2.5" height="2.5" fill="#ffe600" rx="0.5" />
        <rect x="45.5" y="16.5" width="2.5" height="2.5" fill="#ffe600" rx="0.5" />
        <rect x="35.5" y="26.5" width="2.5" height="2.5" fill="#ffe600" rx="0.5" />
        <rect x="45.5" y="26.5" width="2.5" height="2.5" fill="#ffe600" rx="0.5" />
      </g>
    </g>
  ),

  conflicting: (
    <g>
      {/* Crossing Swords */}
      {/* Sword 1: Magenta */}
      <g>
        <line x1="12" y1="52" x2="18" y2="46" stroke="#475569" strokeWidth="3.5" strokeLinecap="square" />
        <line x1="15" y1="43" x2="21" y2="49" stroke="#ffe600" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="19" y1="45" x2="45" y2="19" stroke="#ff007f" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="20" y1="44" x2="44" y2="20" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Sword 2: Cyan */}
      <g>
        <line x1="52" y1="52" x2="46" y2="46" stroke="#475569" strokeWidth="3.5" strokeLinecap="square" />
        <line x1="49" y1="43" x2="43" y2="49" stroke="#ffe600" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="45" y1="45" x2="19" y2="19" stroke="#00f0ff" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="44" y1="44" x2="20" y2="20" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Collision Spark Center */}
      <g>
        <polygon points="32,16 35,28 48,32 35,36 32,48 29,36 16,32 29,28" fill="#ffe600" />
        <polygon points="32,22 34,30 42,32 34,34 32,42 30,34 22,32 30,30" fill="#ffffff" />
        {/* Magenta particles */}
        <rect x="23" y="23" width="2" height="2" fill="#ff007f" />
        <rect x="39" y="23" width="2" height="2" fill="#ff007f" />
        <rect x="23" y="39" width="2" height="2" fill="#ff007f" />
        <rect x="39" y="39" width="2" height="2" fill="#ff007f" />
        {/* Cyan particles */}
        <rect x="31" y="12" width="2" height="2" fill="#00f0ff" />
        <rect x="31" y="50" width="2" height="2" fill="#00f0ff" />
        <rect x="12" y="31" width="2" height="2" fill="#00f0ff" />
        <rect x="50" y="31" width="2" height="2" fill="#00f0ff" />
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
