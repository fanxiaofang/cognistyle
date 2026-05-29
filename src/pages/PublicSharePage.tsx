import React, { useEffect, useState } from 'react';
import { AlertCircle, Copy, LoaderCircle, Share2 } from 'lucide-react';
import PixelAvatar from '../components/PixelAvatar';
import type { PublicCompatibilityReport } from '../contracts/dualReport';
import { getPublicCompatibilityReport } from '../services/compatibilityService';

interface PublicSharePageProps {
  token: string | null;
  onBack: () => void;
}

function scoreTone(score: number) {
  if (score >= 75) return 'text-[#39ff14] border-[#39ff14]/40';
  if (score >= 50) return 'text-[#00f0ff] border-[#00f0ff]/40';
  if (score >= 35) return 'text-[#ffe600] border-[#ffe600]/40';
  return 'text-[#ff007f] border-[#ff007f]/40';
}

function formatExpiry(expiresAt: number) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(expiresAt);
  } catch {
    return '';
  }
}

export default function PublicSharePage({ token, onBack }: PublicSharePageProps) {
  const [report, setReport] = useState<PublicCompatibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('缺少公开分享 token。');
      return;
    }

    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const nextReport = await getPublicCompatibilityReport(token);
        if (active) {
          setReport(nextReport);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : '公开分享报告读取失败，请稍后重试。');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [token]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setError('复制分享链接失败，请手动复制地址栏。');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-black border-2 border-[#00f0ff]/80 p-4 sm:p-6 md:p-8 shadow-[6px_6px_0px_rgba(255,0,127,0.45)]">
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#00f0ff] uppercase">
                公开互补报告
              </p>
              {/* <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-widest text-white font-display uppercase">
                Public Share
              </h2>
              <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-300 font-sans">
                该报告由双方共同生成，展示双方身份卡与互补分析结果。
              </p> */}
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto px-4 py-3 rounded-none bg-black border-2 border-[#39ff14] text-[#39ff14] font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#39ff14]/10 transition-colors cursor-pointer min-h-[44px]"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? '已复制链接' : '复制分享链接'}</span>
              </button>
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-4 py-3 rounded-none bg-black border-2 border-[#ff007f] text-[#ff007f] font-pixel text-xs hover:bg-[#ff007f]/10 transition-colors cursor-pointer min-h-[44px]"
              >
                返回首页
              </button>
            </div>
          </div>

          {loading && (
            <div className="border border-dashed border-[#00f0ff]/40 bg-[#070b19] px-4 py-8 text-center">
              <LoaderCircle className="w-6 h-6 mx-auto text-[#00f0ff] animate-spin" />
              <p className="mt-3 text-xs sm:text-sm text-slate-300 font-sans">
                正在读取公开分享报告...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="border border-dashed border-[#ff007f]/40 bg-[#070b19] px-4 py-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#ff007f] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-pixel text-[#ff007f] tracking-widest uppercase">
                    公开报告不可用
                  </p>
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-300 font-sans">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && report && (
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* 双方身份卡 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 border-2 border-[#00f0ff]/60 bg-[#070b19] p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.pair ? [report.pair.userA, report.pair.userB].map((user, index) => (
                      <div
                        key={user.friendId}
                        className="border border-dashed border-[#00f0ff]/30 bg-black/60 px-4 py-4"
                      >
                        <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-slate-500 uppercase">
                          {index === 0 ? '用户 A' : '用户 B'}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="w-12 h-12 border-2 border-[#ff007f] bg-black flex items-center justify-center shrink-0">
                            <PixelAvatar id={user.profileId} size={46} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base sm:text-lg text-[#00f0ff] font-black break-words">
                              {user.displayName}
                            </p>
                            <p className="text-[11px] sm:text-xs text-[#ffe600] font-pixel">
                              {user.callSign} / {user.profileId}
                            </p>
                            <p className="mt-1 text-[11px] sm:text-xs text-slate-400 font-sans">
                              {user.department} · {user.rank}
                            </p>
                          </div>
                        </div>
                      </div>
                    )): null}
                  </div>
                </div>

                <div className="lg:col-span-4 border-2 border-[#ff007f]/60 bg-[#070b19] p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#ff007f] uppercase">
                      总互补度
                    </p>
                    <div className="mt-3 flex items-end gap-3">
                      <span className={`text-5xl sm:text-6xl font-black ${scoreTone(report.overall.score).split(' ')[0]}`}>
                        {report.overall.score}
                      </span>
                      <span className="text-sm font-pixel text-slate-400 pb-2">/ 100</span>
                    </div>
                    <p className={`mt-3 inline-flex px-3 py-1 border text-xs font-pixel uppercase tracking-widest ${scoreTone(report.overall.score)}`}>
                      {report.overall.rating}
                    </p>
                    <p className="mt-4 text-xs sm:text-[13px] leading-relaxed text-slate-300 font-sans">
                      {report.overall.summary}
                    </p>
                  </div>
                  <div className="mt-5 border-t border-dashed border-[#ff007f]/30 pt-4">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-[13px]">
                      <div>
                        <p className="text-slate-500">认知互补</p>
                        <p className="text-[#00f0ff] font-bold">{report.breakdown.cognitiveComplementarity}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">协作兼容</p>
                        <p className="text-[#00f0ff] font-bold">{report.breakdown.collaborationCompatibility}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">盲区覆盖</p>
                        <p className="text-[#39ff14] font-bold">{report.breakdown.blindSpotCoverage}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">摩擦风险</p>
                        <p className="text-[#ff007f] font-bold">{report.breakdown.frictionRisk}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-dashed border-[#00f0ff]/30 pt-3">
                    <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#00f0ff] uppercase">
                      分享有效期
                    </p>
                    <p className="mt-1 text-sm text-white font-mono">
                      {formatExpiry(report.expiresAt) || '7 天内有效'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 四维拆解 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 border-2 border-[#00f0ff]/60 bg-[#070b19] p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#00f0ff]" />
                    <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#00f0ff] uppercase">
                      四维拆解
                    </p>
                  </div>
                  <div className="mt-4 space-y-4">
                    {[
                      ['节奏适配', report.dimensions.rhythm],
                      ['策略互补', report.dimensions.strategy],
                      ['视野互补', report.dimensions.vision],
                      ['协作兼容', report.dimensions.collaboration],
                    ].map(([label, item]) => (
                      <div key={label} className="border border-dashed border-[#00f0ff]/20 bg-black/40 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs sm:text-[13px] font-bold text-white">{label}</span>
                          <span className={`text-xs font-pixel ${scoreTone(item.score).split(' ')[0]}`}>
                            {item.score}
                          </span>
                        </div>
                        <div className="mt-2 h-3 border border-[#00f0ff]/40 bg-black p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-[#00f0ff] via-[#39ff14] to-[#ff007f]"
                            style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }}
                          />
                        </div>
                        <p className="mt-2 text-[11px] sm:text-xs text-slate-400 font-sans">
                          差异度 Δ = {item.delta.toFixed(2)} · {item.interpretation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 border-2 border-[#39ff14]/60 bg-[#070b19] p-4 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#39ff14] uppercase">
                    行动建议
                  </p>
                  <div className="mt-4 space-y-4 text-xs sm:text-[13px] font-sans">
                    <section>
                      <p className="text-[#39ff14] font-bold mb-2">适合一起做</p>
                      <ul className="space-y-2 text-slate-300">
                        {report.recommendations.bestFor.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <p className="text-[#ffe600] font-bold mb-2">优先规避</p>
                      <ul className="space-y-2 text-slate-300">
                        {report.recommendations.shouldAvoid.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <p className="text-[#00f0ff] font-bold mb-2">沟通建议</p>
                      <ul className="space-y-2 text-slate-300">
                        {report.recommendations.communicationTips.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              </div>

              {/* 任务推荐 */}
              <div className="border-2 border-[#ffe600]/60 bg-[#070b19] p-4 sm:p-5">
                <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#ffe600] uppercase">
                  第七区任务推荐
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.recommendations.missionSuggestions.map((mission) => (
                    <div key={mission.name} className="border border-dashed border-[#ffe600]/30 bg-black/50 px-4 py-4">
                      <p className="text-sm sm:text-base text-white font-bold">{mission.name}</p>
                      <p className="mt-1 text-[11px] sm:text-xs text-[#ffe600] font-pixel">
                        {mission.department} · 拟合度 {mission.fitScore}
                      </p>
                      <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-slate-400 font-sans">
                        {mission.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
