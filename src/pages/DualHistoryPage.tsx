import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Eye, Trash2, AlertTriangle, Users } from 'lucide-react';
import PixelAvatar from '../components/PixelAvatar';
import PatternBadgeIcon from '../components/PatternBadgeIcon';
import { PATTERN_BADGE_MAP } from '../contracts/dualReport';
import type { DualReportHistoryEntry } from '../services/dualHistoryService';
import { clearDualReportHistory,
  getDualReportHistory,
  removeDualReportHistory,
} from '../services/dualHistoryService';
import { formatDate, scoreTone } from '../utils/format';

interface DualHistoryPageProps {
  onBack: () => void;
  onOpenReport: (targetFriendId: string) => void;
}

export default function DualHistoryPage({ onBack, onOpenReport }: DualHistoryPageProps) {
  const [history, setHistory] = useState<DualReportHistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setHistory(getDualReportHistory());
  }, []);

  const handleDelete = (targetFriendId: string) => {
    removeDualReportHistory(targetFriendId);
    setHistory((prev) => prev.filter((e) => e.targetFriendId !== targetFriendId));
  };

  const handleClearAll = () => {
    clearDualReportHistory();
    setHistory([]);
    setConfirmClear(false);
  };

  const handleOpen = (targetFriendId: string) => {
    onOpenReport(targetFriendId);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-8 font-mono select-none">
      <div className="relative bg-[#050814] border-2 border-[#00f0ff]/80 p-4 sm:p-6 md:p-8 shadow-[0_0_20px_rgba(0,240,255,0.15)] overflow-hidden">
        {/* Background Decorative Laser Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.04)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#ffe600]" />

        <div className="flex flex-col gap-4">
          {/* Terminal Header */}
          <div className="flex justify-between items-center bg-[#070b19] border-b-2 border-dashed border-[#00f0ff]/40 -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 px-4 sm:px-6 md:px-8 py-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#ffe600] bg-black flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#ffe600]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-white tracking-widest font-display leading-none">
                  适配历史记录
                </h2>
                <p className="text-[10px] text-slate-500 font-mono mt-1.5">
                  所有与你进行过认知互补测试的对象
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 border-2 border-[#ff007f] hover:bg-[#ff007f] hover:text-white text-[#ff007f] bg-black font-pixel text-xs flex items-center gap-2 transition-colors pointer-events-auto cursor-pointer min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回</span>
            </button>
          </div>

          {history.length === 0 && (
            <div className="border border-dashed border-[#00f0ff]/40 bg-[#070b19] px-4 py-10 text-center">
              <Users className="w-10 h-10 mx-auto text-slate-600" />
              <p className="mt-4 text-sm text-slate-400 font-sans">
                暂无适配记录
              </p>
              <p className="mt-1 text-xs text-slate-500 font-mono">
                完成测评保存结果后，输入他人的好友 ID 即可生成双人互补报告，记录将自动出现在这里。
              </p>
            </div>
          )}

          {history.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-pixel text-slate-500 uppercase tracking-widest">
                  共 {history.length} 条记录
                </span>
                {!confirmClear ? (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="text-[10px] font-pixel text-[#ff007f]/60 hover:text-[#ff007f] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                  >
                    <Trash2 className="w-3 h-3" />
                    清空全部
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle className="w-3 h-3 text-[#ffe600] shrink-0" />
                    <span className="text-[10px] font-pixel text-[#ffe600] whitespace-nowrap">确认清空？</span>
                    <button
                      onClick={handleClearAll}
                      className="px-2 py-1 border border-[#ff007f] text-[#ff007f] font-pixel text-[10px] hover:bg-[#ff007f]/10 transition-colors cursor-pointer min-h-[36px]"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 border border-[#00f0ff]/40 text-[#00f0ff]/60 font-pixel text-[10px] hover:bg-[#00f0ff]/5 transition-colors cursor-pointer min-h-[36px]"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {history.map((entry) => {
                  const badge = PATTERN_BADGE_MAP[entry.pattern];
                  const scoreClass = scoreTone(entry.overallScore);
                  return (
                    <div
                      key={entry.targetFriendId}
                      className="bg-[#070b19] border border-[#00f0ff]/30 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:border-[#00f0ff]/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-[#ff007f]/60 bg-black flex items-center justify-center shrink-0">
                          <PixelAvatar id={entry.targetProfileId} size={44} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-bold text-white truncate">
                              {entry.targetDisplayName}
                            </span>
                            {entry.targetCallSign && (
                              <span className="text-[10px] font-pixel text-[#ffe600] bg-black border border-[#ffe600]/40 px-1.5 py-0.5">
                                {entry.targetCallSign}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap text-[10px]">
                            <span className="text-slate-500 font-mono whitespace-nowrap">
                              {entry.targetDepartment}
                            </span>
                            <span className="text-slate-600 font-mono hidden sm:inline">·</span>
                            <span className="text-slate-500 font-mono whitespace-nowrap">
                              ID: <span className="text-slate-600">{entry.targetFriendId}</span>
                            </span>
                            <span className="text-slate-600 font-mono hidden sm:inline">·</span>
                            <span className="text-slate-600 font-mono whitespace-nowrap">
                              {formatDate(entry.generatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4 shrink-0 w-full sm:w-auto">
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <PatternBadgeIcon pattern={entry.pattern} size={36} />
                            <div className="hidden sm:block">
                              <span className="text-[10px] font-pixel" style={{ color: badge.color }}>
                                {badge.label}
                              </span>
                            </div>
                          </div>

                          <div className={`text-xl sm:text-xl font-black font-display ${scoreClass} min-w-[2.5rem] text-right`}>
                            {entry.overallScore}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-1.5">
                          <button
                            onClick={() => handleOpen(entry.targetFriendId)}
                            className="flex-1 sm:flex-none px-3 py-2.5 border border-[#00f0ff] text-[#00f0ff] bg-black font-pixel text-[10px] flex items-center justify-center gap-1 hover:bg-[#00f0ff]/10 transition-colors cursor-pointer min-h-[44px]"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">重新查看</span>
                          </button>
                          <button
                            onClick={() => handleDelete(entry.targetFriendId)}
                            className="px-3 py-2.5 border border-[#ff007f]/40 text-[#ff007f]/50 bg-black font-pixel text-[10px] flex items-center justify-center gap-1 hover:border-[#ff007f] hover:text-[#ff007f] transition-colors cursor-pointer min-h-[44px]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
