import React, { useEffect, useState } from 'react';
import { AlertCircle, Copy, LoaderCircle, Share2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import PixelAvatar from '../components/PixelAvatar';
import PatternBadgeIcon from '../components/PatternBadgeIcon';
import type { PublicCompatibilityReport, CompatibilityPairIdentity } from '../contracts/dualReport';
import { getPublicCompatibilityReport } from '../services/compatibilityService';
import { getLocalResultIdentity } from '../services/resultSnapshotService';
import { addDualReportHistory } from '../services/dualHistoryService';
import { formatExpiry, scoreTone } from '../utils/format';

interface PublicSharePageProps {
  token: string | null;
  onBack: () => void;
}

export default function PublicSharePage({ token, onBack }: PublicSharePageProps) {
  const [report, setReport] = useState<PublicCompatibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAllDimensions, setShowAllDimensions] = useState(false);

  const [showAllAdvice, setShowAllAdvice] = useState(false);

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

  useEffect(() => {
    if (!report) return;

    const localIdentity = getLocalResultIdentity();
    if (!localIdentity?.friendId) return;

    const myFriendId = localIdentity.friendId;
    let target: CompatibilityPairIdentity | null = null;

    if (report.pair.userA.friendId === myFriendId) {
      target = report.pair.userB;
    } else if (report.pair.userB.friendId === myFriendId) {
      target = report.pair.userA;
    }

    if (!target) return;

    addDualReportHistory(myFriendId, {
      targetFriendId: target.friendId,
      targetProfileId: target.profileId,
      targetDisplayName: target.displayName,
      targetCallSign: target.callSign,
      targetDepartment: target.department,
      overallScore: report.overall.score,
      pattern: report.overall.pattern,
      generatedAt: report.createdAt,
    });
  }, [report]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setError('复制分享链接失败，请手动复制地址栏。');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-8 select-none">
      <div className="relative bg-[#050814] border-2 border-[#00f0ff]/80 p-4 sm:p-6 md:p-8 shadow-[0_0_20px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Background Decorative Laser Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.04)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#ffe600]" />

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
              {(() => {
                const badge = report.overall.patternBadge;
                return (
                  <div className="text-center py-6 sm:py-10 border-2 bg-[#070b19]" style={{ borderColor: badge.color }}>
                    <div className="mb-3 flex justify-center">
                      <PatternBadgeIcon pattern={report.overall.pattern} size={64} />
                    </div>
                    <h2
                      className="text-3xl sm:text-5xl font-black font-display uppercase tracking-widest"
                      style={{ color: badge.color, textShadow: `0 0 20px ${badge.color}40` }}
                    >
                      {badge.label}
                    </h2>
                    <p className="mt-3 text-base sm:text-xl text-slate-300 font-mono italic px-4">
                      &ldquo;{badge.tagline}&rdquo;
                    </p>

                    <div className="mt-4 flex flex-col items-center gap-3">
                      <span className={`text-xs sm:text-sm font-black font-pixel ${scoreTone(report.overall.score).split(' ')[0]}`}>
                        搭档指数：{report.overall.score}
                      </span>
                      {(() => {
                        const tiers = ['挑战', '探索', '互补', '共振', '默契'] as const;
                        const current = report.overall.rating;
                        const idx = tiers.indexOf(current as (typeof tiers)[number]);
                        return (
                          <div className="flex items-center gap-1 sm:gap-2">
                            {tiers.map((tier, i) => {
                              const active = i === idx;
                              return (
                                <React.Fragment key={tier}>
                                  {i > 0 && (
                                    <span className="text-slate-700 font-pixel text-[10px] sm:text-xs">|</span>
                                  )}
                                  <span
                                    className={[
                                      'font-pixel tracking-widest transition-all',
                                      active
                                        ? `${scoreTone(report.overall.score).split(' ')[0]} text-xs sm:text-sm font-black`
                                        : 'text-[10px] sm:text-xs text-slate-600 font-normal',
                                    ].join(' ')}
                                  >
                                    {active ? `⭐${tier}` : tier}
                                  </span>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>


                    {/* <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${badge.label} · ${report.overall.score}分\n"${report.overall.shareCaption}"\n\n${window.location.href}`
                        ).catch(() => {});
                      }}
                      className="mt-5 px-4 py-2 rounded-none border font-pixel text-xs flex items-center gap-1.5 mx-auto hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ borderColor: badge.color, color: badge.color }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制朋友圈文案</span>
                    </button> */}
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-12 border-2 border-[#00f0ff]/60 bg-[#070b19] p-4 sm:p-5">
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
                  <div className="mt-5 border-t border-dashed border-[#00f0ff]/30 pt-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:text-[13px]">
                      {[
                        { key: 'cognitiveComplementarity' as const, label: '认知互补', color: 'text-[#00f0ff]' },
                        { key: 'rhythmSynergy' as const, label: '节奏协同', color: 'text-[#00f0ff]' },
                        { key: 'blindSpotCoverage' as const, label: '盲区覆盖', color: 'text-[#39ff14]' },
                        { key: 'frictionRisk' as const, label: '摩擦风险', color: 'text-[#ff007f]' },
                      ].map(({ key, label, color }) => {
                        return (
                        <div key={key}>
                          <span className={`${color} font-bold`}>
                            {label}（{report.breakdown[key]}）
                          </span>
                          {report.breakdownTooltips?.[key] && (
                            <p className="mt-0.5 font-pixel tracking-widest text-[10px] sm:text-xs text-slate-500">
                              {report.breakdownTooltips[key]}
                            </p>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  </div>
                  <div className="mt-4 border-l-[3px] border-[#ff007f]/70 pl-3 py-1">
                    <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200 font-sans font-semibold">
                      {report.overall.summary}
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] text-slate-500 font-sans">
                    分享有效期：{formatExpiry(report.expiresAt) || '7 天内有效'}
                  </div>
                </div>

              </div>

              {/* 四维拆解 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 border-2 border-[#00f0ff]/60 bg-[#070b19] p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#00f0ff]" />
                    <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#00f0ff] uppercase">
                      维度互补解析
                    </p>
                  </div>
                  <div className="mt-4 space-y-4">
                    {(() => {
                      const dimList = Object.entries(report.dimensions).map(([key, dim]) => ({
                        key,
                        label: dim.shortLabel,
                        description: dim.description,
                        dim,
                      }));
                      const highlights = dimList.filter((d) => d.dim.highlight);
                      const rest = dimList.filter((d) => !d.dim.highlight);

                      return (
                        <>
                          {highlights.map(({ label, description, dim }) => (
                            <div key={label} className="border-2 bg-black/60 px-3 py-3" style={{ borderColor: '#39ff14' }}>
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3 h-3 text-[#39ff14]" />
                                <span className="text-[10px] font-pixel text-[#39ff14] uppercase tracking-widest">亮点维度</span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <span className="text-xs sm:text-[13px] font-bold text-white">{label}</span>
                                  {description && (
                                    <span className="ml-1.5 text-[10px] sm:text-[11px] text-slate-500 font-sans">({description})</span>
                                  )}
                                </div>
                                <span className={`text-xs font-pixel ${scoreTone(dim.score).split(' ')[0]}`}>
                                  {dim.score}
                                </span>
                              </div>
                              <div className="mt-2 h-3 border border-[#00f0ff]/40 bg-black p-0.5">
                                <div
                                  className="h-full bg-gradient-to-r from-[#00f0ff] via-[#39ff14] to-[#ff007f]"
                                  style={{ width: `${Math.max(0, Math.min(100, dim.score))}%` }}
                                />
                              </div>
                              <p className="mt-2 text-[11px] sm:text-xs text-[#39ff14] font-sans font-bold">
                                {dim.oneLiner}
                              </p>
                            </div>
                          ))}
                          {showAllDimensions && rest.map(({ label, description, dim }) => (
                            <div key={label} className="border border-dashed border-[#00f0ff]/20 bg-black/40 px-3 py-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <span className="text-xs sm:text-[13px] font-bold text-white">{label}</span>
                                  {description && (
                                    <span className="ml-1.5 text-[10px] sm:text-[11px] text-slate-500 font-sans">({description})</span>
                                  )}
                                </div>
                                <span className={`text-xs font-pixel ${scoreTone(dim.score).split(' ')[0]}`}>
                                  {dim.score}
                                </span>
                              </div>
                              <div className="mt-2 h-3 border border-[#00f0ff]/40 bg-black p-0.5">
                                <div
                                  className="h-full bg-gradient-to-r from-[#00f0ff] via-[#39ff14] to-[#ff007f]"
                                  style={{ width: `${Math.max(0, Math.min(100, dim.score))}%` }}
                                />
                              </div>
                              <p className="mt-2 text-[11px] sm:text-xs text-slate-400 font-sans">
                                差异度 Δ = {dim.delta.toFixed(2)} · {dim.interpretation}
                              </p>
                            </div>
                          ))}
                          {rest.length > 0 && (
                            <button
                              onClick={() => setShowAllDimensions(!showAllDimensions)}
                              className="w-full py-2 border border-dashed border-[#00f0ff]/30 text-[#00f0ff] font-pixel text-xs flex items-center justify-center gap-1.5 hover:bg-[#00f0ff]/5 transition-colors cursor-pointer"
                            >
                              {showAllDimensions ? (
                                <><ChevronUp className="w-3.5 h-3.5" />收起</>
                              ) : (
                                <><ChevronDown className="w-3.5 h-3.5" />展开全部维度分析</>
                              )}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="lg:col-span-5 border-2 border-[#39ff14]/60 bg-[#070b19] p-4 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#39ff14] uppercase">
                    行动建议
                  </p>
                  <div className="mt-4 space-y-5 text-xs sm:text-[13px] font-sans">
                    <section>
                      <p className="text-[#39ff14] font-bold mb-2">适合一起做</p>
                      <ul className="space-y-3 text-slate-300">
                        {report.recommendations.bestFor.map((item) => (
                          <li key={item} className="leading-relaxed sm:leading-loose tracking-wide pl-3 border-l-2 border-[#39ff14]/25">{item}</li>
                        ))}
                      </ul>
                    </section>

                    {showAllAdvice && (
                      <>
                        <section>
                          <p className="text-[#ffe600] font-bold mb-2">容易卡住的场景</p>
                          <ul className="space-y-3 text-slate-300">
                            {report.recommendations.shouldAvoid.map((item) => (
                              <li key={item} className="leading-relaxed sm:leading-loose tracking-wide pl-3 border-l-2 border-[#ffe600]/25">{item}</li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <p className="text-[#00f0ff] font-bold mb-2">协作默契指南</p>
                          <ul className="space-y-3 text-slate-300">
                            {report.recommendations.communicationTips.map((item) => (
                              <li key={item} className="leading-relaxed sm:leading-loose tracking-wide pl-3 border-l-2 border-[#00f0ff]/25">{item}</li>
                            ))}
                          </ul>
                        </section>
                      </>
                    )}

                    <button
                      onClick={() => setShowAllAdvice(!showAllAdvice)}
                      className="w-full py-2 border border-dashed border-[#39ff14]/30 text-[#39ff14] font-pixel text-xs flex items-center justify-center gap-1.5 hover:bg-[#39ff14]/5 transition-colors cursor-pointer"
                    >
                      {showAllAdvice ? (
                        <><ChevronUp className="w-3.5 h-3.5" />收起</>
                      ) : (
                        <><ChevronDown className="w-3.5 h-3.5" />展开更多行动建议</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 任务推荐 */}
              <div className="border-2 border-[#ffe600]/60 bg-[#070b19] p-4 sm:p-5 pt-6 sm:pt-7">
                <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#ffe600] uppercase">
                  适合一起挑战的任务
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {report.recommendations.missionSuggestions.map((mission) => (
                    <div key={mission.name} className="border border-dashed border-[#ffe600]/30 bg-black/50 px-4 py-4">
                      <p className="text-sm sm:text-base text-white font-bold">{mission.name}</p>
                      <p className="mt-1 text-[11px] sm:text-xs text-[#ffe600] font-pixel">
                        {mission.department} · 协同度 {mission.fitScore}
                      </p>
                      {mission.reason && (
                        <p className="mt-2 text-[11px] sm:text-xs leading-relaxed sm:leading-loose tracking-wide text-slate-300 font-sans">
                          {mission.reason}
                        </p>
                      )}
                      {mission.role && (
                        <p className="mt-2 text-[11px] sm:text-xs leading-relaxed sm:leading-loose tracking-wide text-[#ff007f] font-sans font-bold bg-[#ff007f]/5 px-2 py-1.5 rounded">
                          {mission.role}
                        </p>
                      )}
                      {mission.warning && (
                        <p className="mt-2 text-[11px] sm:text-xs leading-relaxed sm:leading-loose tracking-wide text-[#ffb800]/80 font-sans flex items-start gap-1">
                          <span className="shrink-0 mt-[0.5px]">⚠</span>
                          <span>{mission.warning}</span>
                        </p>
                      )}
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
