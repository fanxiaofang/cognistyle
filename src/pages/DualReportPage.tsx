import React, { useEffect, useState } from 'react';
import { AlertCircle, Copy, LoaderCircle, Radar, RefreshCw, ShieldAlert, Share2, ThumbsUp, Meh, ThumbsDown, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import PixelAvatar from '../components/PixelAvatar';
import PatternBadgeIcon from '../components/PatternBadgeIcon';
import type { CompatibilityReport } from '../contracts/dualReport';
import { getLocalResultIdentity, clearLocalResultIdentity } from '../services/resultSnapshotService';
import { createCompatibilityReport, createPublicShare, submitFeedback } from '../services/compatibilityService';
import { addDualReportHistory } from '../services/dualHistoryService';
import { scoreTone } from '../utils/format';

interface DualReportPageProps {
  targetFriendId: string | null;
  onBack: () => void;
}

export default function DualReportPage({ targetFriendId, onBack }: DualReportPageProps) {
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocalIdentity, setHasLocalIdentity] = useState<boolean>(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [showAllDimensions, setShowAllDimensions] = useState(false);
  const [showAllAdvice, setShowAllAdvice] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const fullShareUrl = shareUrl
    ? shareUrl.startsWith('/')
      ? `${window.location.origin}${shareUrl}`
      : shareUrl
    : null;

  const loadReport = async () => {
    if (!targetFriendId) {
      setError('缺少识别码，请从单人结果页重新进入。');
      return;
    }

    const localIdentity = getLocalResultIdentity();
    setHasLocalIdentity(!!localIdentity);

    if (!localIdentity?.friendId) {
      setReport(null);
      setError('当前设备还没有保存自己的识别码，请先完成测评并保存结果。');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShareError(null);
      const nextReport = await createCompatibilityReport({
        myFriendId: localIdentity.friendId,
        targetFriendId,
      });
      setReport(nextReport);
    } catch (err) {
      setReport(null);
      const message = err instanceof Error ? err.message : '';

      if (message.includes('当前设备的结果未找到') || message.includes('结果快照')) {
        clearLocalResultIdentity();
        setHasLocalIdentity(false);
        setError('你的云端结果已失效（可能已过期或服务重启后清除），请返回结果页重新保存。');
      } else {
        setError(message || '互补报告生成失败，请稍后重试。');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [targetFriendId]);

  useEffect(() => {
    if (!report || !targetFriendId) return;

    const targetUser = report.pair.userA.friendId === targetFriendId
      ? report.pair.userA
      : report.pair.userB;

    const localIdentity = getLocalResultIdentity();
    const myFriendId = localIdentity?.friendId;

    if (myFriendId) {
      addDualReportHistory(myFriendId, {
        targetFriendId,
        targetProfileId: targetUser.profileId,
        targetDisplayName: targetUser.displayName,
        targetCallSign: targetUser.callSign,
        targetDepartment: targetUser.department,
        overallScore: report.overall.score,
        pattern: report.overall.pattern,
        generatedAt: report.generatedAt,
      });
    }
  }, [report, targetFriendId]);

  const handleCreatePublicShare = async () => {
    if (!targetFriendId) {
      setShareError('缺少识别码，无法生成公开分享。');
      return;
    }

    const localIdentity = getLocalResultIdentity();
    if (!localIdentity?.friendId) {
      setShareError('当前设备还没有保存自己的识别码，无法生成公开分享。');
      return;
    }

    try {
      setShareLoading(true);
      setShareError(null);
      setShareCopied(false);

      const response = await createPublicShare({
        myFriendId: localIdentity.friendId,
        targetFriendId,
      });

      setShareUrl(response.shareUrl);
    } catch (err) {
      setShareError(err instanceof Error ? err.message : '公开分享生成失败，请稍后重试。');
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyShareUrl = async () => {
    if (!fullShareUrl) return;

    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setShareCopied(true);
    } catch {
      setShareError('复制分享链接失败，请手动复制。');
    }
  };

  const handleFeedbackSubmit = async (rating: string) => {
    if (!report?.reportId || feedbackRating) return;

    setFeedbackRating(rating);
    setFeedbackSubmitting(true);

    const FEEDBACK_STORAGE_KEY = `cognistyle_feedback_${report.reportId}`;
    localStorage.setItem(FEEDBACK_STORAGE_KEY, rating);

    try {
      await submitFeedback({ reportId: report.reportId, rating: rating as 'accurate' | 'neutral' | 'inaccurate' });
    } catch {
      localStorage.removeItem(FEEDBACK_STORAGE_KEY);
      setFeedbackRating(null);
    } finally {
      setFeedbackSubmitting(false);
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
                双人认知互补度报告
              </p>
              {/* <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-300 font-sans">
                该报告完全基于双方保存的结果快照生成，不复用单人结果页中的第二身份逻辑。
              </p> */}
            </div>
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-4 py-3 rounded-none bg-black border-2 border-[#ff007f] text-[#ff007f] font-pixel text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_#050814] hover:shadow-[5px_5px_0px_#00f0ff] transition-all cursor-pointer min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>返回我的结果</span>
            </button>
          </div>

          {loading && (
            <div className="border border-dashed border-[#00f0ff]/40 bg-[#070b19] px-4 py-8 text-center">
              <LoaderCircle className="w-6 h-6 mx-auto text-[#00f0ff] animate-spin" />
              <p className="mt-3 text-xs sm:text-sm text-slate-300 font-sans">
                正在生成双人互补报告，如果你刚刚保存结果，系统会自动进行短暂重试。
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="border border-dashed border-[#ff007f]/40 bg-[#070b19] px-4 py-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#ff007f] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-pixel text-[#ff007f] tracking-widest uppercase">
                    报告生成失败
                  </p>
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-300 font-sans">
                    {error}
                  </p>
                  {!hasLocalIdentity && (
                    <p className="mt-2 text-[11px] sm:text-xs text-slate-400 font-sans">
                      请返回结果页，点击"保存并生成我的识别码"后再试。
                    </p>
                  )}
                  {hasLocalIdentity ? (
                    <button
                      onClick={loadReport}
                      className="mt-4 px-4 py-2 rounded-none border border-[#ff007f] text-[#ff007f] bg-black font-pixel text-xs flex items-center gap-2 hover:bg-[#ff007f]/10 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>重新尝试</span>
                    </button>
                  ) : (
                    <button
                      onClick={onBack}
                      className="mt-4 px-4 py-2 rounded-none border border-[#ff007f] text-[#ff007f] bg-black font-pixel text-xs flex items-center gap-2 hover:bg-[#ff007f]/10 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>返回结果页</span>
                    </button>
                  )}
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

                  </div>
                );
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-12 border-2 border-[#00f0ff]/60 bg-[#070b19] p-4 sm:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[report.pair.userA, report.pair.userB].map((user, index) => (
                      <div
                        key={user.friendId}
                        className="border border-dashed border-[#00f0ff]/30 bg-black/60 px-4 py-4"
                      >
                        <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-slate-500 uppercase">
                          {index === 0 ? '你的身份卡' : '好友身份卡'}
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
                    ))}
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
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 border-2 border-[#00f0ff]/60 bg-[#070b19] p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Radar className="w-4 h-4 text-[#00f0ff]" />
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

                <div className="lg:col-span-5 border-2 border-[#ff007f]/60 bg-[#070b19] p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#ff007f]" />
                    <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#ff007f] uppercase">
                      行动建议
                    </p>
                  </div>

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
                      className="w-full py-2 border border-dashed border-[#ff007f]/30 text-[#ff007f] font-pixel text-xs flex items-center justify-center gap-1.5 hover:bg-[#ff007f]/5 transition-colors cursor-pointer"
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

              <div className="border-2 border-[#39ff14]/60 bg-[#070b19] p-4 sm:p-5 pt-6 sm:pt-7">
                <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#39ff14] uppercase">
                  适合一起挑战的任务
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {report.recommendations.missionSuggestions.map((mission) => (
                    <div
                      key={mission.name}
                      className="border border-dashed border-[#39ff14]/30 bg-black/50 px-4 py-4"
                    >
                      <p className="text-sm sm:text-base text-white font-bold">{mission.name}</p>
                      <p className="mt-1 text-[11px] sm:text-xs text-[#39ff14] font-pixel">
                        {mission.department} · 协同度 {mission.fitScore}
                      </p>
                      {mission.reason && (
                        <p className="mt-2 text-[11px] sm:text-xs leading-relaxed sm:leading-loose tracking-wide text-slate-300 font-sans">
                          {mission.reason}
                        </p>
                      )}
                      {mission.role && (
                        <p className="mt-2 text-[11px] sm:text-xs leading-relaxed sm:leading-loose tracking-wide text-[#ffe600] font-sans font-bold bg-[#ffe600]/5 px-2 py-1.5 rounded">
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

              <div className="border-2 border-[#ffe600]/60 bg-[#070b19] p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#ffe600] uppercase">
                      公开分享
                    </p>
                    <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-300 font-sans">
                      公开分享包含双方身份卡、互补得分和任务推荐，分享给任何人查看。
                    </p>
                  </div>
                  <button
                    onClick={handleCreatePublicShare}
                    disabled={shareLoading}
                    className="w-full sm:w-auto px-4 py-3 rounded-none border-2 border-[#ffe600] text-[#ffe600] bg-black font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#ffe600]/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[44px]"
                  >
                    {shareLoading ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    <span>{shareLoading ? '生成中...' : '生成公开分享链接'}</span>
                  </button>
                </div>

                {fullShareUrl && (
                  <div className="mt-4 border border-dashed border-[#ffe600]/35 bg-black/50 px-3 py-3">
                    <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#ffe600] uppercase">
                      当前公开链接
                    </p>
                    <p className="mt-2 break-all text-xs sm:text-[13px] text-white font-mono">
                      {fullShareUrl}
                    </p>
                    <button
                      onClick={handleCopyShareUrl}
                      className="mt-3 px-4 py-2 rounded-none border border-[#39ff14] text-[#39ff14] bg-black font-pixel text-xs flex items-center gap-2 hover:bg-[#39ff14]/10 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{shareCopied ? '已复制链接' : '复制公开链接'}</span>
                    </button>
                  </div>
                )}

                {shareError && (
                  <p className="mt-4 text-[11px] sm:text-xs font-pixel text-[#ff007f] bg-black border border-[#ff007f] px-3 py-2 text-center">
                    {shareError}
                  </p>
                )}
              </div>

              {report.reportId && (
                <div className="border-2 border-[#39ff14]/40 bg-[#070b19] p-4 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#39ff14] uppercase mb-3">
                    这个结果像你们吗？
                  </p>
                  {feedbackRating ? (
                    <p className="text-xs sm:text-sm text-[#39ff14] font-sans text-center py-2">
                      ✓ 感谢反馈！{feedbackRating === 'accurate' ? '🎯' : feedbackRating === 'neutral' ? '🤔' : '💡'}
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => handleFeedbackSubmit('accurate')}
                        disabled={feedbackSubmitting}
                        className="flex-1 px-4 py-4 rounded-none border border-[#39ff14]/60 bg-black text-[#39ff14] font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#39ff14]/10 transition-colors cursor-pointer disabled:opacity-50 min-h-[48px]"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>很准</span>
                      </button>
                      <button
                        onClick={() => handleFeedbackSubmit('neutral')}
                        disabled={feedbackSubmitting}
                        className="flex-1 px-4 py-4 rounded-none border border-[#ffe600]/60 bg-black text-[#ffe600] font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#ffe600]/10 transition-colors cursor-pointer disabled:opacity-50 min-h-[48px]"
                      >
                        <Meh className="w-4 h-4" />
                        <span>一般</span>
                      </button>
                      <button
                        onClick={() => handleFeedbackSubmit('inaccurate')}
                        disabled={feedbackSubmitting}
                        className="flex-1 px-4 py-4 rounded-none border border-[#ff007f]/60 bg-black text-[#ff007f] font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#ff007f]/10 transition-colors cursor-pointer disabled:opacity-50 min-h-[48px]"
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>不像</span>
                      </button>
                    </div>
                  )}
                  <p className="mt-2 text-[10px] text-slate-500 text-center font-sans">
                    匿名反馈，用于改进模型准确度
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
