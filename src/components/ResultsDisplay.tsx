/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DimensionScore, Category, CognitiveProfile } from '../types';
import { cognitiveProfiles, buildProfileId } from '../data/suggestions';
import PixelAvatar from './PixelAvatar';
import SingleReportActions from './SingleReportActions';
import html2canvas from 'html2canvas';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  CornerDownRight, 
  RefreshCw,
  Repeat
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
  onReset: () => void;
  onOpenDualReport: (targetFriendId: string) => void;
}

export default function ResultsDisplay({
  scoreMap,
  scores,
  category,
  primaryArchetype,
  secondaryArchetype,
  onReset,
  onOpenDualReport,
}: ResultsDisplayProps) {
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState(false);
  const [showOtherMode, setShowOtherMode] = useState(false);

  const { matchedMode, profileId: profileKey, profile } = resolvePrimaryProfile({
    scoreMap,
    primaryArchetype,
  });
  const otherProfileKey = buildProfileId(secondaryArchetype.key as any, matchedMode);
  const otherProfile: CognitiveProfile | undefined = cognitiveProfiles[otherProfileKey];
  const snapshotRequest = buildResultSnapshot({
    category: 'general',
    scoreMap,
    scores,
    primaryArchetype,
    secondaryArchetype,
  });

  const activeProfile = showOtherMode && otherProfile ? otherProfile : profile;
  const activeProfileId = showOtherMode && otherProfile ? otherProfileKey : profileKey;
  const activeMatchScore = showOtherMode && otherProfile ? secondaryArchetype.matchScore : primaryArchetype.matchScore;

  const guildEssenceMap: Record<string, { essence: string; name: string; color: string; borderColor: string }> = {
    'C-W': { essence: '聚合 × 整体：用标准方案搭建宏观骨架', name: '筑基者', color: 'text-[#00f0ff]', borderColor: 'border-l-[#00f0ff]' },
    'C-A': { essence: '聚合 × 分析：用标准规范守护微观精度', name: '守门人', color: 'text-[#ffe600]', borderColor: 'border-l-[#ffe600]' },
    'D-W': { essence: '发散 × 整体：用创新探索突破宏观边界', name: '探路者', color: 'text-[#39ff14]', borderColor: 'border-l-[#39ff14]' },
    'D-A': { essence: '发散 × 分析：用创新突破微观极限', name: '炼金师', color: 'text-[#ff007f]', borderColor: 'border-l-[#ff007f]' },
  };
  const activeArchetypeKey = showOtherMode && otherProfile ? secondaryArchetype.key : primaryArchetype.key;
  const activeArchetypeParts = activeArchetypeKey.split('-');
  const guildKey = `${activeArchetypeParts[1]}-${activeArchetypeParts[2]}`;
  const guildInfo = guildEssenceMap[guildKey];

  const svgToImg = (svg: SVGSVGElement): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const rect = svg.getBoundingClientRect();
      const w = rect.width || parseInt(svg.getAttribute('width') || '0') || 52;
      const h = rect.height || parseInt(svg.getAttribute('height') || '0') || 52;

      const canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('no 2d context')); return; }

      const svgString = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);

        const pngUrl = canvas.toDataURL('image/png');
        const replacement = document.createElement('img');
        replacement.style.display = 'block';
        replacement.style.width = w + 'px';
        replacement.style.height = h + 'px';
        replacement.src = pngUrl;
        resolve(replacement);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('svg load fail')); };
      img.src = url;
    });
  };

  const resolveOklch = (() => {
    const cache: Record<string, string> = {};
    const probe = document.createElement('div');
    probe.style.display = 'none';
    document.body.appendChild(probe);

    return (oklchStr: string): string => {
      if (cache[oklchStr]) return cache[oklchStr];
      probe.style.color = oklchStr;
      const resolved = getComputedStyle(probe).color;
      cache[oklchStr] = resolved;
      return resolved;
    };
  })();

  const captureCanvas = async (el: HTMLElement): Promise<HTMLCanvasElement> => {
    const rect = el.getBoundingClientRect();
    return html2canvas(el, {
      useCORS: true,
      backgroundColor: '#050814',
      scale: 2,
      logging: false,
      width: Math.ceil(rect.width),
      height: Math.ceil(rect.height),
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('style').forEach(style => {
          const original = style.textContent || '';
          const replaced = original.replace(/oklch\([^)]+\)/g, resolveOklch);
          if (replaced !== original) {
            style.textContent = replaced;
          }
        });

        clonedDoc.querySelectorAll('*').forEach(el => {
          const s = (el as HTMLElement).style;
          for (let i = s.length - 1; i >= 0; i--) {
            const val = s.getPropertyValue(s[i]);
            if (val.includes('oklch(')) {
              s.setProperty(s[i], val.replace(/oklch\([^)]+\)/g, resolveOklch));
            }
          }
        });

        const scanlines = clonedDoc.querySelector('.scanlines') as HTMLElement | null;
        if (scanlines) scanlines.style.display = 'none';

        clonedDoc.querySelectorAll('.fixed').forEach(el => {
          (el as HTMLElement).style.display = 'none';
        });

        clonedDoc.querySelectorAll('.glow-cyan, .glow-magenta, .glow-yellow, .glow-green').forEach(el => {
          (el as HTMLElement).style.textShadow = 'none';
        });
      },
    });
  };

  // html2canvas handler
  const handleSaveImage = async () => {
    const captureArea = document.getElementById('cognistyle-share-card');
    if (!captureArea) {
      setCaptureError(true);
      return;
    }

    const filename = `CogniStyle_Result_${activeProfileId}_${category}.png`;
    const svgs = captureArea.querySelectorAll('svg');
    const replacements: { svg: SVGSVGElement; parent: Node; img: HTMLImageElement }[] = [];

    try {
      setCapturing(true);
      setCaptureError(false);

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise(resolve => setTimeout(resolve, 80));

      for (const svg of svgs) {
        try {
          const img = await svgToImg(svg as SVGSVGElement);
          replacements.push({ svg: svg as SVGSVGElement, parent: svg.parentNode!, img });
          svg.parentNode?.replaceChild(img, svg);
        } catch {
          // skip this svg if conversion fails
        }
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await captureCanvas(captureArea);

      for (const { svg, parent, img } of replacements) {
        try {
          if (parent.contains(img)) {
            parent.replaceChild(svg, img);
          }
        } catch { /* best effort restore */ }
      }

      if (canvas.toBlob) {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (!b) reject(new Error('Canvas export failed'));
            else resolve(b);
          }, 'image/png');
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('保存测评长图出现异常:', err);

      for (const { svg, parent, img } of replacements) {
        try {
          if (parent.contains(img)) parent.replaceChild(svg, img);
        } catch { /* ignore */ }
      }

      setCaptureError(true);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Save Area Wrapper */}
      <div id="cognistyle-share-card" className="bg-black border-2 border-[#00f0ff]/80 p-3 sm:p-6 md:p-10 shadow-[6px_6px_0px_rgba(255,0,127,0.6)] relative overflow-hidden font-mono min-w-0">
        {/* Abstract futuristic grid background layout for screenshot elegance - pixel laser bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#ffe600]" />
        <div className="absolute -top-[400px] -right-[200px] w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-none pointer-events-none" />
        <div className="absolute -bottom-[400px] -left-[200px] w-[600px] h-[600px] bg-[#ff007f]/5 rounded-none pointer-events-none" />

        {/* Upper Part: Bento Grid Layout */}
        <div className="mb-4 sm:mb-8">
          
          {/* Persona Descriptions */}
          <div className="bg-black p-4 sm:p-6 md:p-8 border-2 border-[#00f0ff]/70 shadow-[4px_4px_0px_rgba(255,0,127,0.5)] flex flex-col justify-center relative select-none">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4 sm:mb-8 z-10">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shrink-0">
                {/* 主头像：正常 */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 border-4 border-[#ff007f] shadow-[5px_5px_0px_rgba(0,240,255,0.5)] bg-black flex items-center justify-center shrink-0">
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
              <div className="text-xs sm:text-[13px] leading-relaxed text-slate-300 bg-[#070b19] p-3 sm:p-5 border-2 border-dashed border-[#ff007f]/45 z-10 font-sans shadow-inner break-words relative">
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
          <div className="lg:col-span-12 xl:col-span-5 bg-black p-4 sm:p-6 border-2 border-[#00f0ff]/70 shadow-[4px_4px_0px_rgba(255,0,127,0.5)] flex flex-col justify-between select-none min-w-0">
            <div>
              <h3 className="text-[13px] font-pixel text-[#00f0ff] tracking-widest uppercase mb-4 sm:mb-6 flex items-center gap-2 glow-cyan">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#00f0ff]" />
                维度平衡指数
              </h3>
              <div className="space-y-3 sm:space-y-5">
                {scores.map((score, idx) => {
                  const barColors = ['bg-[#00f0ff]', 'bg-[#ff007f]', 'bg-[#39ff14]', 'bg-[#ffe600]'];
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
                      <div className="h-3 sm:h-4 w-full bg-black border border-[#00f0ff] p-0.5 shadow-[1.5px_1.5px_0px_#ff007f]">
                        <div 
                          className={`h-full ${barColors[idx % barColors.length]} transition-all duration-1000 ease-out`}
                          style={{ width: `${percentVal}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bento Card: Strengths & Weaknesses */}
          <div className="lg:col-span-12 xl:col-span-7 bg-black p-4 sm:p-6 md:p-8 border-2 border-[#ff007f]/70 shadow-[4px_4px_0px_rgba(0,240,255,0.5)] select-none min-w-0">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Added Section: Cognitive Pattern [认知模式] */}
              {activeProfile.cognitivePattern && (
                <div className="border-b border-dashed border-[#ff007f]/30 pb-4 sm:pb-6">
                  <h3 className="text-sm sm:text-base font-black text-[#00f0ff] flex items-center gap-2 mb-3 sm:mb-4 font-display uppercase tracking-widest glow-cyan">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#00f0ff]" />
                    认知模式
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {activeProfile.cognitivePattern.map((trait, tIdx) => (
                      <div key={tIdx} className="bg-[#ff007f]/5 border border-[#ff007f]/20 p-2.5 sm:p-3 h-full flex flex-col justify-between">
                        <p className="text-xs sm:text-[13px] leading-relaxed text-slate-300 font-medium">
                          {trait}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 bg-transparent">
                {/* Strengths Column */}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#39ff14] flex items-center gap-2 mb-3 sm:mb-4 font-display uppercase tracking-widest glow-green">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#39ff14]" />
                    思维优势
                  </h3>
                  <ul className="space-y-2 sm:space-y-3 font-sans">
                    {activeProfile.workplaceEdge.filter(e => e.startsWith('优势：')).map((str, sIdx) => (
                      <li key={sIdx} className="text-xs sm:text-[13px] leading-relaxed text-slate-300 flex items-start gap-2 sm:gap-2.5">
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
                  <ul className="space-y-2 sm:space-y-3 font-sans">
                    {activeProfile.workplaceEdge.filter(e => e.startsWith('边界：')).map((weak, wIdx) => (
                      <li key={wIdx} className="text-xs sm:text-[13px] leading-relaxed text-slate-300 flex items-start gap-2 sm:gap-2.5"> 
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
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-300 bg-[#070b19] p-3 sm:p-4 border border-dashed border-[#ffe600]/30 font-sans break-words">
                  {activeProfile.collaboration}
                </p>
              </div>

              {/* Growth Tip */}
              <div className="border-t border-dashed border-[#ff007f]/30 pt-3 sm:pt-4">
                <h3 className="text-sm sm:text-base font-black text-[#39ff14] flex items-center gap-2 mb-2 sm:mb-3 font-display uppercase tracking-widest glow-green">
                  <CornerDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#39ff14]" />
                  成长建议
                </h3>
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-300 bg-[#070b19] p-3 sm:p-4 border border-dashed border-[#39ff14]/30 font-sans break-words">  
                  {activeProfile.growthTip}
                </p>
              </div>

                      {/* 第二身份切换 */}
        {otherProfile && (
          <button
            onClick={() => setShowOtherMode(!showOtherMode)}
            className="group relative w-full max-w-md px-5 py-4 rounded-none bg-gradient-to-r from-black via-[#0a0f1f] to-black border-2 border-[#ffe600]/80 text-[#ffe600] font-pixel text-sm flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,230,0,0.2)] hover:shadow-[0_0_25px_rgba(255,230,0,0.4)] hover:border-[#ffe600] active:scale-[0.98] transition-all duration-300 cursor-pointer min-h-[52px] sm:min-h-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffe600]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Repeat className="w-4 h-4 shrink-0" />
            <span className="text-left leading-tight tracking-wider">
              {showOtherMode
                ? <>返回主身份<span className="text-[#ff007f] font-bold">【{profile.displayName}】</span></>
                : <>发现你的第二身份<span className="text-[#00f0ff] font-bold">【{otherProfile.displayName}】</span></>}
            </span>
          </button>
        )}

            </div>

          </div>

        </div>
      </div>

      {/* Sharing and Action controls - OUTSIDE screenshot capture container */}
      <div className="flex flex-col items-center gap-4 sm:gap-8 mt-4 sm:mt-8 relative z-20 font-mono select-none">
        <SingleReportActions
          snapshotRequest={snapshotRequest}
          onOpenDualReport={onOpenDualReport}
        />




        {captureError && (
          <p className="text-[11px] sm:text-xs font-pixel text-[#ff007f] bg-black border border-[#ff007f] px-3 sm:px-4 py-2 glow-magenta text-center">
            [ SAVE ERROR ] 图片生成失败，请尝试滚动到页面顶部后重新保存
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">


          <button
            onClick={onReset}
            className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-none bg-black border-4 border-[#ff007f] text-[#ff007f] font-pixel text-xs sm:text-[13px] flex items-center justify-center gap-2 shadow-[5px_5px_0px_#050814] hover:shadow-[7px_7px_0px_#00f0ff] active:translate-x-1 active:translate-y-1 transition-all duration-100 select-none cursor-pointer tracking-wider font-bold min-h-[48px] sm:min-h-0"   
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>重新测量</span>
          </button>
        </div>
      </div>
    </div>
  );
}
