/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DimensionScore, Category, CognitiveProfile } from '../types';
import { cognitiveProfiles, buildProfileId } from '../data/suggestions';
import PixelAvatar from './PixelAvatar';
import html2canvas from 'html2canvas';
import { 
  Download, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  CornerDownRight, 
  RefreshCw,
  ArrowLeftRight
} from 'lucide-react';

interface DisplayDimensionScore extends DimensionScore {
  percentage: number;
}

interface ResultsDisplayProps {
  scoreMap: Record<string, number>;
  scores: DisplayDimensionScore[];
  category: Category;
  onReset: () => void;
}

export default function ResultsDisplay({
  scoreMap,
  scores,
  category,
  onReset,
}: ResultsDisplayProps) {
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState(false);
  const [showOtherMode, setShowOtherMode] = useState(false);

  // 1. Identify User's Profile Key
  // Based on score map of 4 dimensions: score < 12.5 means Left, score >= 12.5 means Right
  const d1 = (scoreMap['impulsive_reflective'] ?? 12.5) >= 12.5 ? 'R' : 'I';
  const d2 = (scoreMap['convergent_divergent'] ?? 12.5) >= 12.5 ? 'D' : 'C';
  const d3 = (scoreMap['wholistic_analytic'] ?? 12.5) >= 12.5 ? 'A' : 'W';
  const d4 = (scoreMap['solo_team'] ?? 12.5) >= 12.5 ? 'T' : 'S';
  
  const profileKey = `${d1}-${d2}-${d3}-${d4}`;
  const matchedMode = d4 as 'S' | 'T';
  const otherMode = matchedMode === 'S' ? 'T' : 'S';
  const otherProfileKey = buildProfileId(profileKey.split('-').slice(0, 3).join('-') as any, otherMode);
  
  const fallbackProfile: CognitiveProfile = {
    id: profileKey as any,
    archetype: profileKey.split('-').slice(0, 3).join('-') as any,
    mode: matchedMode,
    displayName: '多维综合思考型',
    callSign: '均衡',
    department: 'emergency' as any,
    rank: '综合特勤',
    avatar: '🧩',
    visual: {
      pose: '',
      background: '',
      lighting: '',
      atmosphere: '',
      colorTone: 'slate-900',
      accent: 'neutral'
    },
    essence: '你的测试结果展现了极具平衡的认知张力。你并没有极端地倒向任意一极，而是能在具体的业务决策、日常生活中根据情境自如切换模式。你是个出色的多面思考者。',
    cognitivePattern: [
      '兼修动静、思维如流水般善于变化与适应，极具兼容并蓄的认知包容力',
      '兼备宏观俯瞰的高度与微观点状的精度，在各类极端视角的冲突中自如中和调停',
      '内源秩序与外部共振交织平衡，无成规执念，纯以客观务实的理智度量全局'
    ],
    collaboration: '你的平衡型认知让你成为团队中的天然粘合剂，能理解不同风格成员的诉求，但也需注意避免在两种极端之间反复摇摆消耗决策时间。',
    workplaceEdge: [
      '优势：高灵活度，能根据环境难易调整个人风格',
      '优势：善于化解技术纷争，充当组织缓冲阀',
      '边界：在核心极偏门路线上可能少了一些标志性的爆发力',
      '边界：对极致完美的边界追求不够决断'
    ],
    growthTip: '尝试在关键时刻明确表达自己的立场——保持中立是美德，但有时鲜明的观点更能推动团队前进。',
    flavorText: '你是团队中的"万能接口"——适配所有人，但别忘记定义自己的协议。'
  };
  
  const profile: CognitiveProfile = cognitiveProfiles[profileKey] || fallbackProfile;
  const otherProfile: CognitiveProfile | undefined = cognitiveProfiles[otherProfileKey];

  const activeProfile = showOtherMode && otherProfile ? otherProfile : profile;
  const activeProfileId = showOtherMode && otherProfile ? otherProfileKey : profileKey;

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
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Save Area Wrapper */}
      <div id="cognistyle-share-card" className="bg-black border-2 border-[#00f0ff]/80 p-6 md:p-10 shadow-[6px_6px_0px_rgba(255,0,127,0.6)] relative overflow-hidden font-mono">
        {/* Abstract futuristic grid background layout for screenshot elegance - pixel laser bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#ffe600]" />
        <div className="absolute -top-[400px] -right-[200px] w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-none pointer-events-none" />
        <div className="absolute -bottom-[400px] -left-[200px] w-[600px] h-[600px] bg-[#ff007f]/5 rounded-none pointer-events-none" />

        {/* Upper Part: Bento Grid Layout */}
        <div className="mb-8">
          
          {/* Persona Descriptions */}
          <div className="bg-black p-6 md:p-8 border-2 border-[#00f0ff]/70 shadow-[4px_4px_0px_rgba(255,0,127,0.5)] flex flex-col justify-center relative select-none">
            <div className="flex items-center gap-6 mb-8 z-10">
              <div className="w-32 h-32 rounded-none bg-black flex items-center justify-center shadow-md border-4 border-[#ff007f] shadow-[5px_5px_0px_rgba(0,240,255,0.5)] p-1.5">
                <PixelAvatar id={activeProfileId} size={104} />
              </div>
              <div className="z-10">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-pixel px-2 py-0.5 bg-black text-[#ffe600] border border-[#ffe600] uppercase">
                    {category === 'programmer' ? '🖥️ CODING SYS' : '💼 LIFE WORK'}
                  </span>
                  <span className="text-[13px] font-pixel text-[#00f0ff] glow-cyan">    
                    IDX: {activeProfileId}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-widest text-[#00f0ff] mt-2 font-display uppercase glow-cyan">
                  {activeProfile.displayName}
                </h2>
                {activeProfile.callSign && (
                  <span className="text-[13px] font-pixel text-[#ffe600] bg-black border border-[#ffe600] px-2 py-0.5 ml-2">
                    {activeProfile.callSign}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm font-bold text-[#ff007f] tracking-wide italic mb-4 leading-none select-none z-10 font-mono glow-magenta">
              「 {activeProfile.flavorText} 」
            </p>

            {otherProfile && (
              <button
                onClick={() => setShowOtherMode(!showOtherMode)}
                className="mb-4 flex items-center gap-2 px-3 py-1.5 border-2 border-[#ffe600] bg-black text-[#ffe600] font-pixel text-[13px] hover:bg-[#ffe600]/10 transition-colors cursor-pointer z-10"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>
                  {showOtherMode
                    ? `返回匹配模式：${profile.displayName}`
                    : `切换视角：${otherProfile.displayName}`}
                </span>
              </button>
            )}

            <p className="text-[13px] leading-relaxed text-slate-300 bg-[#070b19] p-5 border-2 border-dashed border-[#ff007f]/45 z-10 font-sans shadow-inner">
              {activeProfile.essence}
            </p>
          </div>
        </div>

        {/* Middle Part: Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Bento Card: Dimensional Details List (col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-12 xl:col-span-5 bg-black p-6 border-2 border-[#00f0ff]/70 shadow-[4px_4px_0px_rgba(255,0,127,0.5)] flex flex-col justify-between select-none">
            <div>
              <h3 className="text-[13px] font-pixel text-[#00f0ff] tracking-widest uppercase mb-6 flex items-center gap-2 glow-cyan">
                <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                维度平衡指数
              </h3>
              <div className="space-y-5">
                {scores.map((score, idx) => {
                  const barColors = ['bg-[#00f0ff]', 'bg-[#ff007f]', 'bg-[#39ff14]', 'bg-[#ffe600]'];
                  const percentVal = Math.round(Math.max(score.percentage, 100 - score.percentage));
                  const activeLabel = score.percentage >= 50 ? score.label.split('vs')[1].trim() : score.label.split('vs')[0].trim();
                  return (
                    <div key={score.id} className="flex flex-col gap-2">
                      <div className="flex justify-between items-baseline text-[13px]">   
                        <span className="text-[#00f0ff] font-bold font-mono text-[13px] uppercase tracking-wide">{score.label}</span>
                        <span className="text-[13px] font-pixel font-bold text-slate-400">
                          {activeLabel} <span className="text-[#00f0ff] font-pixel text-[13px] glow-cyan">{percentVal}%</span>    
                        </span>
                      </div>
                      <div className="h-4 w-full bg-black border border-[#00f0ff] p-0.5 shadow-[1.5px_1.5px_0px_#ff007f]">
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

          {/* Bento Card: Strengths & Weaknesses (col-span-12 lg:col-span-7) */}
          <div className="lg:col-span-12 xl:col-span-7 bg-black p-6 md:p-8 border-2 border-[#ff007f]/70 shadow-[4px_4px_0px_rgba(0,240,255,0.5)] select-none">
            <div className="flex flex-col gap-6">
              {/* Added Section: Cognitive Pattern [认知模式] */}
              {activeProfile.cognitivePattern && (
                <div className="border-b border-dashed border-[#ff007f]/30 pb-6">
                  <h3 className="text-base font-black text-[#00f0ff] flex items-center gap-2 mb-4 font-display uppercase tracking-widest glow-cyan">
                    <Sparkles className="w-4 h-4 text-[#00f0ff]" />
                    认知模式
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeProfile.cognitivePattern.map((trait, tIdx) => (
                      <div key={tIdx} className="bg-[#ff007f]/5 border border-[#ff007f]/20 p-3 h-full flex flex-col justify-between">
                        <p className="text-[13px] leading-relaxed text-slate-300 font-medium">
                          {trait}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-transparent">
                {/* Strengths Column */}
                <div>
                  <h3 className="text-base font-black text-[#39ff14] flex items-center gap-2 mb-4 font-display uppercase tracking-widest glow-green">
                    <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
                    思维优势
                  </h3>
                  <ul className="space-y-3 font-sans">
                    {activeProfile.workplaceEdge.filter(e => e.startsWith('优势：')).map((str, sIdx) => (
                      <li key={sIdx} className="text-[13px] leading-relaxed text-slate-300 flex items-start gap-2.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#00f0ff] shrink-0 mt-0.5" />
                        <span>{str.replace(/^优势：/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses Column */}
                <div>
                  <h3 className="text-base font-black text-[#ffe600] flex items-center gap-2 mb-4 font-display uppercase tracking-widest glow-yellow">
                    <AlertCircle className="w-4 h-4 text-[#ffe600]" />
                    潜在盲区
                  </h3>
                  <ul className="space-y-3 font-sans">
                    {activeProfile.workplaceEdge.filter(e => e.startsWith('边界：')).map((weak, wIdx) => (
                      <li key={wIdx} className="text-[13px] leading-relaxed text-slate-300 flex items-start gap-2.5"> 
                        <CornerDownRight className="w-3.5 h-3.5 text-[#ff007f] shrink-0 mt-0.5" />
                        <span>{weak.replace(/^边界：/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Collaboration Style */}
              <div className="border-t border-dashed border-[#00f0ff]/30 pt-4">
                <h3 className="text-base font-black text-[#ffe600] flex items-center gap-2 mb-3 font-display uppercase tracking-widest glow-yellow">
                  <CornerDownRight className="w-4 h-4 text-[#ffe600]" />
                  协作风格
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-300 bg-[#070b19] p-4 border border-dashed border-[#ffe600]/30 font-sans">
                  {activeProfile.collaboration}
                </p>
              </div>

              {/* Growth Tip */}
              <div className="border-t border-dashed border-[#ff007f]/30 pt-4">
                <h3 className="text-base font-black text-[#39ff14] flex items-center gap-2 mb-3 font-display uppercase tracking-widest glow-green">
                  <CornerDownRight className="w-4 h-4 text-[#39ff14]" />
                  成长建议
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-300 bg-[#070b19] p-4 border border-dashed border-[#39ff14]/30 font-sans">  
                  {activeProfile.growthTip}
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Sharing and Action controls - OUTSIDE screenshot capture container */}
      <div className="flex flex-col items-center gap-4 mt-12 pt-4 relative z-20 font-mono select-none">
        {captureError && (
          <p className="text-[10px] font-pixel text-[#ff007f] bg-black border border-[#ff007f] px-4 py-2 glow-magenta">
            [ SAVE ERROR ] 图片生成失败，请尝试滚动到页面顶部后重新保存
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">


          <button
            onClick={onReset}
            className="w-full sm:w-auto px-7 py-4 rounded-none bg-black border-4 border-[#ff007f] text-[#ff007f] font-pixel text-[13px] flex items-center justify-center gap-2 shadow-[5px_5px_0px_#050814] hover:shadow-[7px_7px_0px_#00f0ff] active:translate-x-1 active:translate-y-1 transition-all duration-100 select-none cursor-pointer tracking-wider font-bold"   
          >
            <RefreshCw className="w-4 h-4" />
            <span>重新测量</span>
          </button>
        </div>
      </div>
    </div>
  );
}
