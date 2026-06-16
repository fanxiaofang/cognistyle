/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArchetypeKey, buildProfileId, DimensionScore, Category, CognitiveProfile } from '../types';
import { cognitiveProfiles } from '../data/suggestions';
import PixelAvatar from './PixelAvatar';
import SingleReportActions from './SingleReportActions';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  CornerDownRight, 
  RefreshCw,
  Repeat,
  Link,
} from 'lucide-react';
import { buildResultSnapshot, resolvePrimaryProfile } from '../utils/buildResultSnapshot';

interface DisplayDimensionScore extends DimensionScore {
  percentage: number;
}

interface ResultsDisplayProps {
  scoreMap: Record<string, number>;
  scores: DisplayDimensionScore[];
  category: Category;
  primaryArchetype: { key: string; matchScore: number };
  secondaryArchetype: { key: string; matchScore: number };
  answers: Record<number, number>;
  onReset: () => void;
  onOpenDualReport: (targetFriendId: string) => void;
}

export default function ResultsDisplay({
  scoreMap,
  scores,
  category,
  primaryArchetype,
  secondaryArchetype,
  answers,
  onReset,
  onOpenDualReport,
}: ResultsDisplayProps) {
  const [showOtherMode, setShowOtherMode] = useState(false);
  const [resultLinkCopied, setResultLinkCopied] = useState(false);

  const { matchedMode, profileId: profileKey, profile } = resolvePrimaryProfile({
    scoreMap,
    primaryArchetype,
  });
  const otherProfileKey = buildProfileId(secondaryArchetype.key as ArchetypeKey, matchedMode);
  const otherProfile: CognitiveProfile | undefined = cognitiveProfiles[otherProfileKey];
  const snapshotRequest = buildResultSnapshot({
    category: 'general',
    scoreMap,
    scores,
    primaryArchetype,
    secondaryArchetype,
    rawAnswers: answers,
  });

  const activeProfile = showOtherMode && otherProfile ? otherProfile : profile;
  const activeProfileId = showOtherMode && otherProfile ? otherProfileKey : profileKey;
  const activeMatchScore = showOtherMode && otherProfile ? secondaryArchetype.matchScore : primaryArchetype.matchScore;

  const guildEssenceMap: Record<string, { essence: string; name: string; color: string; borderColor: string }> = {
    'D-W': { essence: '定向 × 整体：构建清晰可执行的全局框架', name: '筑基者', color: 'text-[#00f0ff]', borderColor: 'border-l-[#00f0ff]' },
    'D-A': { essence: '定向 × 分析：确保关键细节稳定可靠', name: '守门人', color: 'text-[#ffe600]', borderColor: 'border-l-[#ffe600]' },
    'E-W': { essence: '探索 × 整体：持续拓展新的方向与可能', name: '探路者', color: 'text-[#39ff14]', borderColor: 'border-l-[#39ff14]' },
    'E-A': { essence: '探索 × 分析：在细节试验中创造突破', name: '炼金师', color: 'text-[#ff007f]', borderColor: 'border-l-[#ff007f]' },
  };
  const activeArchetypeKey = showOtherMode && otherProfile ? secondaryArchetype.key : primaryArchetype.key;
  const activeArchetypeParts = activeArchetypeKey.split('-');
  const guildKey = `${activeArchetypeParts[1]}-${activeArchetypeParts[2]}`;
  const guildInfo = guildEssenceMap[guildKey];

  const handleCopyResultLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setResultLinkCopied(true);
      setTimeout(() => setResultLinkCopied(false), 3000);
    } catch {
      // silently fail, user can use browser address bar
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 select-none">
      {/* Result Card */}
      <div className="relative bg-[#050814] border-2 border-[#00f0ff]/80 p-3 sm:p-6 md:p-10 shadow-[0_0_20px_rgba(0,240,255,0.15)] overflow-hidden font-mono min-w-0">
        {/* Background Decorative Laser Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.04)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#ffe600]" />

        {/* Upper Part: Bento Grid Layout */}
        <div className="mb-4 sm:mb-8">
          
          {/* Persona Descriptions */}
          <div className="bg-black p-4 sm:p-6 md:p-8 border-2 border-[#00f0ff]/70 shadow-[3px_3px_0px_rgba(255,0,127,0.25)] flex flex-col justify-center relative select-none">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-8 z-10">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shrink-0">
                {/* 主头像：正常 */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 border-2 border-[#ff007f]/70 shadow-[3px_3px_0px_rgba(0,240,255,0.3)] bg-black flex items-center justify-center shrink-0">
                  <PixelAvatar id={activeProfileId} size={100} />
                </div>
              </div>
              <div className="z-10 text-center sm:text-left">
                <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                  <span className="text-xs sm:text-[13px] font-pixel text-[#00f0ff] glow-cyan">    
                    {activeProfileId}
                  </span>
                  <span className="text-[10px] text-[#00f0ff]/60 border-l border-[#00f0ff]/30 pl-3 tracking-widest flex items-center gap-1.5">
                    <span className="opacity-50">SYNC</span>
                    <span className="font-bold text-[#00f0ff]/80">同步率 {activeMatchScore}%</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black tracking-widest text-[#00f0ff] mt-2 font-display uppercase glow-cyan break-words">
                  {activeProfile.displayName}
                </h2>
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mt-1">
                  {activeProfile.callSign && (
                    <span className="text-xs sm:text-[13px] font-pixel text-[#ffe600] bg-black border border-[#ffe600] px-2 py-0.5 inline-block">
                      {activeProfile.callSign}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-[#ff007f] tracking-wide italic mb-4 leading-snug select-none z-10 font-mono glow-magenta">
              「 {activeProfile.flavorText} 」
            </p>

            <div className="flex flex-col gap-3 mt-4">
              {/* <div className="text-xs sm:text-[13px] leading-relaxed text-slate-300 bg-[#070b19] p-3 sm:p-5 border-2 border-dashed border-[#ff007f]/45 z-10 font-sans shadow-inner break-words relative">
                经系统深度扫描，你的核心形态为【<span className="text-[#00f0ff] font-bold glow-cyan">{profile.displayName}</span>】（{primaryArchetype.matchScore}% 共振）。你的副形态为【<span className="text-[#ff007f] font-bold glow-magenta">{otherProfile?.displayName || secondaryArchetype.key}</span>】（{secondaryArchetype.matchScore}% 共振）。
              </div> */}
              <div className="text-xs sm:text-[13px] leading-relaxed text-slate-300 bg-[#070b19] p-3 sm:p-5 border border-dashed border-[#ff007f]/25 z-10 font-sans shadow-inner break-words relative">
                {activeProfile.essence}
              </div>
            </div>
          </div>
        </div>

        {guildInfo && (
        <div className={`mb-4 bg-black border-l-4 ${guildInfo.borderColor} px-3 sm:px-4 py-2.5 sm:py-3 z-10`}>
          <span className="text-[11px] sm:text-[13px] font-pixel text-slate-500 uppercase tracking-widest block mb-0.5 sm:mb-1">
            认知底层基因 · {guildInfo.name}
          </span>
          <p className={`text-xs sm:text-[13px] font-bold ${guildInfo.color} tracking-wide`}>
            {guildInfo.essence}
          </p>
        </div>
      )}

        {/* Middle Part: Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 mb-4 sm:mb-8 min-w-0">
          
          {/* Bento Card: Dimensional Details List */}
          <div className="lg:col-span-12 xl:col-span-5 bg-black p-4 sm:p-6 border-2 border-[#00f0ff]/70 shadow-[3px_3px_0px_rgba(255,0,127,0.25)] flex flex-col justify-between select-none min-w-0">
            <div>
              <h3 className="text-[13px] font-pixel text-[#00f0ff] tracking-widest uppercase mb-4 sm:mb-6 flex items-center gap-2 glow-cyan">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#00f0ff]" />
                 认知风格维度分布
              </h3>
              <div className="space-y-3 sm:space-y-5">
                {scores.map((score, idx) => {
                  const barColors = [
                    { bg: 'bg-[#00f0ff]', glow: 'shadow-[0_0_8px_rgba(0,240,255,0.6)]' },
                    { bg: 'bg-[#ff007f]', glow: 'shadow-[0_0_8px_rgba(255,0,127,0.6)]' },
                    { bg: 'bg-[#39ff14]', glow: 'shadow-[0_0_8px_rgba(57,255,20,0.6)]' },
                    { bg: 'bg-[#ffe600]', glow: 'shadow-[0_0_8px_rgba(255,230,0,0.6)]' }
                  ];
                  const barStyle = barColors[idx % barColors.length];
                  const percentVal = Math.round(Math.max(score.percentage, 100 - score.percentage));
                  const activeLabel = score.percentage >= 50 ? score.label.split('vs')[1].trim() : score.label.split('vs')[0].trim();
                  return (
                    <div key={score.id} className="flex flex-col gap-1.5 sm:gap-2">
                      <div className="flex justify-between items-baseline text-[13px]">   
                        <span className="text-[#00f0ff] font-bold font-mono text-xs sm:text-[13px] uppercase tracking-wide break-words">{score.label}</span>
                        <span className="text-xs sm:text-[13px] font-pixel font-bold text-slate-400 shrink-0 ml-1">
                          {activeLabel} <span className="text-[#00f0ff] font-pixel text-xs sm:text-[13px] glow-cyan">{percentVal}%</span>    
                        </span>
                      </div>
                      <p className="text-[10px] text-[#00f0ff]/60 font-mono tracking-wide ml-0.5">
                        {{ 'fieldIndepend_fieldDepend': '我依据什么判断', 'wholistic_analytic': '我如何理解世界', 'exploratory_directed': '我如何寻找答案', 'impulsive_reflective': '我如何付诸行动' }[score.id]}
                      </p>
                      <div className="relative h-4 sm:h-5 w-full bg-black/80 border border-[#00f0ff]/30 p-[2px] shadow-inner">
                        <div 
                          className={`h-full ${barStyle.bg} ${barStyle.glow} transition-all duration-1000 ease-out relative overflow-hidden`}
                          style={{ width: `${percentVal}%` }}
                        >
                          {/* 扫描线效果 */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                          {/* 内部高光 */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                        </div>
                        {/* 刻度线 */}
                        <div className="absolute inset-0 flex items-center pointer-events-none">
                          {[25, 50, 75].map(mark => (
                            <div 
                              key={mark}
                              className="absolute h-full w-[1px] bg-[#00f0ff]/20"
                              style={{ left: `${mark}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bento Card: Strengths & Weaknesses */}
          <div className="lg:col-span-12 xl:col-span-7 bg-black p-4 sm:p-6 md:p-8 border border-[#ff007f]/40 shadow-[3px_3px_0px_rgba(0,240,255,0.3)] select-none min-w-0">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Added Section: Cognitive Pattern [认知风格] */}
              {activeProfile.cognitivePattern && (
                <div className="border-b border-dashed border-[#ff007f]/30 pb-4 sm:pb-6">
                  <h3 className="text-sm sm:text-base font-black text-[#00f0ff] flex items-center gap-2 mb-3 sm:mb-4 font-display uppercase tracking-widest glow-cyan">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#00f0ff]" />
                    认知风格
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {activeProfile.cognitivePattern.map((trait, tIdx) => (
                      <div key={tIdx} className="bg-[#ff007f]/5 border border-[#ff007f]/20 p-3 sm:p-3.5 h-full flex flex-col justify-between">
                        <p className="text-xs sm:text-[13px] leading-relaxed sm:leading-loose text-slate-300 font-medium tracking-wide px-0.5">
                          {trait}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 bg-transparent">
                {/* Strengths Column */}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#39ff14] flex items-center gap-2 mb-3 sm:mb-4 font-display uppercase tracking-widest glow-green">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#39ff14]" />
                    思维优势
                  </h3>
                  <ul className="space-y-2.5 sm:space-y-3 font-sans">
                    {activeProfile.workplaceEdge.filter(e => e.startsWith('优势：')).map((str, sIdx) => (
                      <li key={sIdx} className="text-xs sm:text-[13px] leading-relaxed sm:leading-loose tracking-wide text-slate-300 flex items-start gap-2.5 sm:gap-3">
                        <CornerDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00f0ff] shrink-0 mt-0.5" />
                        <span>{str.replace(/^优势：/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses Column */}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#ffe600] flex items-center gap-2 mb-3 sm:mb-4 font-display uppercase tracking-widest glow-yellow">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffe600]" />
                    潜在盲区
                  </h3>
                  <ul className="space-y-2.5 sm:space-y-3 font-sans">
                    {activeProfile.workplaceEdge.filter(e => e.startsWith('边界：')).map((weak, wIdx) => (
                      <li key={wIdx} className="text-xs sm:text-[13px] leading-relaxed sm:leading-loose tracking-wide text-slate-300 flex items-start gap-2.5 sm:gap-3"> 
                        <CornerDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ff007f] shrink-0 mt-0.5" />
                        <span>{weak.replace(/^边界：/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Collaboration Style */}
              <div className="border-t border-dashed border-[#00f0ff]/30 pt-3 sm:pt-4">
                <h3 className="text-sm sm:text-base font-black text-[#ffe600] flex items-center gap-2 mb-2 sm:mb-3 font-display uppercase tracking-widest glow-yellow">
                  <CornerDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#ffe600]" />
                  协作风格
                </h3>
                <p className="text-xs sm:text-[13px] leading-relaxed sm:leading-loose tracking-wide text-slate-300 bg-[#070b19] p-3 sm:p-4 border border-dashed border-[#ffe600]/30 font-sans break-words">
                  {activeProfile.collaboration}
                </p>
              </div>

              {/* Growth Tip */}
              <div className="border-t border-dashed border-[#ff007f]/30 pt-3 sm:pt-4">
                <h3 className="text-sm sm:text-base font-black text-[#39ff14] flex items-center gap-2 mb-2 sm:mb-3 font-display uppercase tracking-widest glow-green">
                  <CornerDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#39ff14]" />
                  成长建议
                </h3>
                <p className="text-xs sm:text-[13px] leading-relaxed sm:leading-loose tracking-wide text-slate-300 bg-[#070b19] p-3 sm:p-4 border border-dashed border-[#39ff14]/30 font-sans break-words">  
                  {activeProfile.growthTip}
                </p>
              </div>

              {/* 第二身份切换 */}
              {otherProfile && (
                <div className="border-t border-dashed border-[#ffe600]/30 pt-4 sm:pt-6">
                  <button
                    onClick={() => setShowOtherMode(!showOtherMode)}
                    className="group relative w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-none bg-black border-2 border-[#ffe600]/70 text-[#ffe600] font-sans text-xs sm:text-[13px] flex items-center justify-center gap-2.5 shadow-[0_0_10px_rgba(255,230,0,0.15)] hover:shadow-[0_0_20px_rgba(255,230,0,0.3)] hover:border-[#ffe600] hover:bg-[#ffe600]/5 active:scale-[0.98] transition-all duration-200 cursor-pointer min-h-[44px] overflow-hidden"
                  >
                    <Repeat className="w-4 h-4 shrink-0" />
                    <span className="leading-tight tracking-wide font-medium">
                      {showOtherMode
                        ? <>返回主身份 <span className="text-[#ff007f] font-bold">【{profile.displayName}】</span></>
                        : <>发现第二身份 <span className="text-[#00f0ff] font-bold">【{otherProfile.displayName}】</span></>}
                    </span>
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>



      {/* Sharing and Action controls */}
      <div className="flex flex-col items-center gap-4 sm:gap-6 mt-4 sm:mt-8 relative z-20 font-mono select-none">
        <SingleReportActions
          snapshotRequest={snapshotRequest}
          onOpenDualReport={onOpenDualReport}
        />

        {/* 收藏测评结果提示 */}
        {resultLinkCopied && (
          <div className="w-full max-w-2xl text-xs sm:text-[13px] text-[#39ff14] bg-black border border-[#39ff14]/50 px-4 py-3 text-center shadow-[0_0_10px_rgba(57,255,20,0.15)] font-sans">
            <CheckCircle2 className="w-4 h-4 inline-block mr-2" />
            结果链接已复制，可粘贴到微信收藏、文件传输助手或浏览器书签中保存
          </div>
        )}

        {/* 操作按钮组 */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
          <button
            onClick={handleCopyResultLink}
            className="flex-1 px-5 py-3 rounded-none border border-dashed border-[#00f0ff]/50 bg-[#050814] text-[#00f0ff] text-xs sm:text-[13px] flex items-center justify-center gap-2 hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/70 transition-all cursor-pointer min-h-[44px] font-sans"
          >
            <Link className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">复制我的测评结果链接</span>
          </button>

          <button
            onClick={onReset}
            className="flex-1 px-5 py-3 rounded-none border border-dashed border-[#ff007f]/50 bg-[#050814] text-[#ff007f] text-xs sm:text-[13px] flex items-center justify-center gap-2 hover:bg-[#ff007f]/10 hover:border-[#ff007f]/70 transition-all cursor-pointer min-h-[44px] font-sans"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">重新测量</span>
          </button>
        </div>
      </div>
    </div>
  );
}
