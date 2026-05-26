/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DimensionScore } from '../types';

interface DisplayDimensionScore extends DimensionScore {
  percentage: number;
}

interface RadarChartProps {
  scores: DisplayDimensionScore[];
  className?: string;
}

export default function RadarChart({ scores, className = '' }: RadarChartProps) {
  const size = 400;
  const center = size / 2;
  const maxRadius = 110;

  // Calculate dynamic coordinates for axes based on scores length
  // Axis 0: Top (-Math.PI / 2)
  const angles = scores.map((_, i) => -Math.PI / 2 + (i * 2 * Math.PI) / scores.length);

  // Map scores to chart radius percentages
  // A score is represented as a percentage from 0 to 100 indicating Left polarity vs Right polarity.
  // We want the chart axis to show dominance of the active pole [50% - 100%].
  // Map value to scale: 50% active -> radius 0 (center equivalent to baseline 50%), 100% active -> maxRadius
  const getRadiusForScore = (score: DisplayDimensionScore) => {
    // Percentage points from Left (0) to Right (100)
    // Absolute dominance percentage is how far it is from the center (50)
    const dominance = Math.max(score.percentage, 100 - score.percentage); // ranges 50 to 100
    // Normalize dominance [50, 100] to a radius fraction [0.2, 1] so that the center is not collapsed to a single dot,
    // which looks better visually.
    const fraction = 0.2 + ((dominance - 50) / 50) * 0.8;
    return fraction * maxRadius;
  };

  const points = scores.map((score, index) => {
    const r = getRadiusForScore(score);
    const angle = angles[index];
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, score, angle };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid line levels (draw concentric polygons)
  const levels = [0.4, 0.6, 0.8, 1.0];

  return (
    <div className={`flex flex-col items-center justify-center relative bg-black p-6 border-4 border-[#00f0ff] shadow-[6px_6px_0px_#ff007f] ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[380px] h-[380px] drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]"
        id="cognistyle-radar-svg"
      >
        <defs>
          {/* Glowing gradient for active cognitive trait shape */}
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#39ff14" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.15" />
          </radialGradient>
          {/* Drop filter for neon edges */}
          <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
 
        {/* Outer and Inner grid polygons */}
        {levels.map((level, i) => {
          const r = level * maxRadius;
          const gridPoints = angles.map(angle => {
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');
 
          return (
            <polygon
              key={i}
              points={gridPoints}
              fill="none"
              stroke={i === 3 ? "#00f0ff" : "#ff007f"}
              strokeWidth={i === 3 ? "2" : "1"}
              strokeDasharray={i < 3 ? "4,4" : "none"}
              opacity={i < 3 ? "0.45" : "0.9"}
            />
          );
        })}
 
        {/* Labels for baseline ticks (50%, 75%, 100%) */}
        <text x={center} y={center - 0.4 * maxRadius + 3} textAnchor="middle" className="text-[13px] font-pixel fill-slate-400">50%</text>
        <text x={center} y={center - 0.7 * maxRadius + 3} textAnchor="middle" className="text-[13px] font-pixel fill-slate-400">75%</text>
        <text x={center} y={center - 1.0 * maxRadius + 3} textAnchor="middle" className="text-[13px] font-pixel fill-[#00f0ff] glow-cyan">100%</text>
 
        {/* Central axes */}
        {angles.map((angle, i) => {
          const x = center + maxRadius * Math.cos(angle);
          const y = center + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-[#ff007f]/40"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
          );
        })}
 
        {/* Active Data Area Pattern */}
        <polygon
          points={polygonPath}
          fill="url(#radarGlow)"
          stroke="#39ff14"
          strokeWidth="3"
          className="transition-all duration-700 ease-out"
          filter="url(#neonFilter)"
        />
 
        {/* Vertices indicator dots as square blocks for pixel art style */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - 5}
            y={p.y - 5}
            width="10"
            height="10"
            fill="#ffe600"
            stroke="#050814"
            strokeWidth="2"
            className="transition-all duration-700 ease-out cursor-pointer hover:scale-125"
          />
        ))}
 
        {/* Text descriptions at corner endpoints */}
        {scores.map((score, index) => {
          const angle = angles[index];
          // Push text outward further for breathing room
          const textDist = maxRadius + 38;
          const tx = center + textDist * Math.cos(angle);
          const ty = center + textDist * Math.sin(angle);
  
          // Customize alignment based on quadrant position
          let textAnchor = "middle";
          if (Math.abs(Math.cos(angle)) > 0.1) {
            textAnchor = Math.cos(angle) > 0 ? "start" : "end";
          }
  
          // Larger vertical gap between label and percentage
          let dy = "0em";
          let subDy = "2em";
          if (Math.sin(angle) < -0.8) {
            dy = "-0.3em";
            subDy = "-2.3em";
          } else if (Math.sin(angle) > 0.8) {
            dy = "0.8em";
            subDy = "2.8em";
          }
  
          // Determine score label (e.g., "反思型", "冲动型" etc.)
          const activePole = score.percentage >= 50 ? score.label.split('vs')[1].trim() : score.label.split('vs')[0].trim();
          const activeScoreStr = Math.round(Math.max(score.percentage, 100 - score.percentage));
  
          return (
            <g key={index} className="text-[13px] tracking-wider uppercase">
              <text
                x={tx}
                y={ty}
                dy={dy}
                textAnchor={textAnchor}
                className="fill-white font-display text-sm md:text-base tracking-widest font-black"
              >
                {activePole}
              </text>
              <text
                x={tx}
                y={ty}
                dy={subDy}
                textAnchor={textAnchor}
                className="fill-[#00f0ff] font-pixel text-[10px]"
              >
                {activeScoreStr}% DOM
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
