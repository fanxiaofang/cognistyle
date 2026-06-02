import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Copy, LoaderCircle, Save, Trash2 } from 'lucide-react';
import type { CreateResultSnapshotRequest, LocalResultIdentity } from '../contracts/dualReport';
import {
  clearLocalResultIdentity,
  createResultSnapshot,
  deleteResultSnapshot,
  getLocalResultIdentity,
  saveLocalResultIdentity,
  ApiResultError,
} from '../services/resultSnapshotService';
import { formatExpiry } from '../utils/format';

interface SingleReportActionsProps {
  snapshotRequest: CreateResultSnapshotRequest;
  onOpenDualReport: (targetFriendId: string) => void;
}

export default function SingleReportActions({
  snapshotRequest,
  onOpenDualReport,
}: SingleReportActionsProps) {
  const [identity, setIdentity] = useState<LocalResultIdentity | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [targetFriendId, setTargetFriendId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [forceClear, setForceClear] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const local = getLocalResultIdentity();
    if (!local) {
      setIdentity(null);
      return;
    }

    if (Date.now() > local.expiresAt) {
      clearLocalResultIdentity();
      setIdentity(null);
      setSaveMessage('云端记录已过期（90 天有效期），请重新保存结果。');
      return;
    }

    setIdentity(local);
  }, []);

  const expiresText = useMemo(
    () => (identity ? formatExpiry(identity.expiresAt) : ''),
    [identity]
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveMessage(null);
      setCopied(false);
      setConfirmDelete(false);
      setForceClear(false);

      const response = await createResultSnapshot(snapshotRequest);
      const nextIdentity = saveLocalResultIdentity(response);

      setIdentity(nextIdentity);
      setSaveMessage('识别码已生成并保存在当前设备。');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '结果保存失败，请稍后重试。');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!identity?.friendId) return;

    try {
      await navigator.clipboard.writeText(identity.friendId);
      setCopied(true);
    } catch {
      setSaveError('复制失败，请手动记录你的识别码。');
    }
  };

  const handleOpenDualReport = () => {
    const nextTargetFriendId = targetFriendId.trim();

    if (!identity?.friendId) {
      setSaveError('请先保存当前结果并生成自己的识别码。');
      return;
    }

    if (!nextTargetFriendId) {
      setSaveError('请输入好友识别码。');
      return;
    }

    if (nextTargetFriendId === identity.friendId) {
      setSaveError('不能和自己的结果生成互补报告。');
      return;
    }

    setSaveError(null);
    onOpenDualReport(nextTargetFriendId);
  };

  const handleDelete = async () => {
    if (!identity) {
      setSaveError('当前设备没有可删除的结果。');
      return;
    }

    try {
      setDeleting(true);
      setSaveError(null);
      setSaveMessage(null);

      await deleteResultSnapshot({
        friendId: identity.friendId,
        deleteToken: identity.deleteToken,
      });

      clearLocalResultIdentity();
      setIdentity(null);
      setConfirmDelete(false);
      setCopied(false);
      setSaveMessage('当前设备保存的结果已删除，旧识别码已失效。');
    } catch (error) {
      if (error instanceof ApiResultError && error.code === 'NOT_FOUND') {
        clearLocalResultIdentity();
        setIdentity(null);
        setConfirmDelete(false);
        setForceClear(false);
        setCopied(false);
        setSaveMessage('云端记录已过期或不存在，本地凭证已清除，可重新保存结果。');
      } else {
        const message = error instanceof Error ? error.message : '';
        setSaveError(message || '结果删除失败，请稍后重试。');
        setForceClear(true);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleForceClear = () => {
    clearLocalResultIdentity();
    setIdentity(null);
    setConfirmDelete(false);
    setForceClear(false);
    setCopied(false);
    setSaveMessage('识别码已强制清除，可重新保存结果。');
    setSaveError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 font-mono select-none">
      {/* Action panel container */}
      <div className="relative bg-[#050814]/95 border-2 border-[#00f0ff]/50 p-4 sm:p-6 md:p-8 shadow-[0_0_20px_rgba(0,240,255,0.12)] overflow-hidden">
        {/* Grids / Lines decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.03)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#ff007f] to-[#ffe600]/80" />

        {/* Section title */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#00f0ff]/20 pb-3">
          <span className="w-2 h-2 bg-[#00f0ff] animate-pulse" />
          <h3 className="text-xs sm:text-sm font-black text-[#00f0ff] uppercase tracking-widest font-display">
            认知适配协作终端
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10">

          {/* Card 1: My Identity (我的身份凭证) */}
          <div className="border border-[#00f0ff]/25 bg-black/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <h4 className="text-xs font-pixel text-[#00f0ff] uppercase tracking-wider">
                  [ 第一步：你的识别码 ]
                </h4>
                {identity && (
                  <span className="text-[10px] text-slate-500 font-sans">
                    有效期: 7天
                  </span>
                )}
              </div>

              {!identity ? (
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full px-4 py-3 rounded-none bg-black border border-[#00f0ff] text-[#00f0ff] font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#00f0ff]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer min-h-[44px]"
                  >
                    {saving ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? '正在写入云端...' : '保存并生成识别码'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#070b19]/80 border border-[#39ff14]/30 px-3 py-3 relative">
                    <p className="font-mono text-sm sm:text-base text-white tracking-widest break-all pt-1 select-all selection:bg-[#39ff14]/30">
                      {identity.friendId}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex-1 px-3 py-2 rounded-none border border-[#39ff14] text-[#39ff14] bg-black font-pixel text-xs flex items-center justify-center gap-1.5 hover:bg-[#39ff14]/10 transition-colors cursor-pointer min-h-[38px]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? '已复制' : '复制识别码'}</span>
                    </button>

                    {/* Delete entry */}
                    {!confirmDelete ? (
                      <button
                        onClick={() => {
                          setConfirmDelete(true);
                          setForceClear(false);
                          setSaveError(null);
                          setSaveMessage(null);
                        }}
                        className="px-3 py-2 rounded-none border border-[#ff007f]/40 text-[#ff007f]/60 bg-black font-pixel text-xs flex items-center justify-center gap-1.5 hover:border-[#ff007f] hover:text-[#ff007f] transition-colors cursor-pointer min-h-[38px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setConfirmDelete(false); setForceClear(false); }}
                            className="flex-1 px-2 py-1 border border-slate-700 text-slate-400 bg-black font-pixel text-[10px] hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            取消
                          </button>
                          <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 px-2 py-1 border border-[#ff007f] text-[#ff007f] bg-[#ff007f]/10 font-pixel text-[10px] hover:bg-[#ff007f]/20 transition-colors cursor-pointer"
                          >
                            {deleting ? '...' : '确认'}
                          </button>
                        </div>
                        {forceClear && (
                          <button
                            onClick={handleForceClear}
                            className="px-2 py-1 border border-dashed border-[#ffe600] text-[#ffe600] bg-black font-pixel text-[9px] hover:bg-[#ffe600]/10 transition-colors cursor-pointer"
                          >
                            强制清除识别码（跳过云端）  
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-[#00f0ff]/10 pt-3 flex items-start gap-1.5">
              {/* <AlertTriangle className="w-3.5 h-3.5 text-[#ffe600] shrink-0 mt-0.5" /> */}
              <p className="text-[10px] text-slate-500 leading-normal font-sans">
                注意：识别码用于生成互补度报告。
              </p>
            </div>
          </div>

          {/* Card 2: Dual Connection (输入好友配对) */}
          <div className="border border-[#00f0ff]/25 bg-black/40 p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-pixel text-[#00f0ff] uppercase tracking-wider">
                [ 第二步：开启认知同步 ]
              </h4>

              <div className="space-y-3">
                <input
                  value={targetFriendId}
                  onChange={(event) => setTargetFriendId(event.target.value)}
                  placeholder="请输入好友的识别码 (例如 abc123xyz)"
                  className="w-full rounded-none border border-[#00f0ff]/40 bg-[#070b19] px-3 py-2.5 text-xs sm:text-sm text-white outline-none placeholder:text-slate-650 focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] font-mono transition-all"
                />

                <button
                  onClick={handleOpenDualReport}
                  className="w-full px-5 py-3 rounded-none border border-[#ffe600] bg-black text-[#ffe600] font-pixel text-xs sm:text-[13px] flex items-center justify-center gap-2 hover:bg-[#ffe600]/10 transition-colors cursor-pointer min-h-[44px]"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>生成认知互补度报告</span>
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-[#00f0ff]/10 pt-3">
              <p className="text-[10px] text-slate-500 leading-normal font-sans">
                注意：生成双人报告需要您先完成 Step 1 ，并拥有好友的识别码。
              </p>
            </div>
          </div>

        </div>

        {/* Global Terminal Logs / Message boxes */}
        {(saveMessage || saveError) && (
          <div className="mt-4 relative z-10">
            {saveMessage && (
              <p className="text-[11px] sm:text-xs font-pixel text-[#39ff14] bg-black border border-[#39ff14]/50 px-3 py-2 text-center shadow-[0_0_8px_rgba(57,255,20,0.1)]">
                &gt; {saveMessage}
              </p>
            )}
            {saveError && (
              <p className="text-[11px] sm:text-xs font-pixel text-[#ff007f] bg-black border border-[#ff007f]/50 px-3 py-2 text-center shadow-[0_0_8px_rgba(255,0,127,0.1)]">
                &gt; SYSTEM ERROR: {saveError}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
