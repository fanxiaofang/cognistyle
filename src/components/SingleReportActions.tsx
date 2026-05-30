import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Copy, LoaderCircle, Save, Trash2 } from 'lucide-react';
import type { CreateResultSnapshotRequest, LocalResultIdentity } from '../contracts/dualReport';
import {
  clearLocalResultIdentity,
  createResultSnapshot,
  deleteResultSnapshot,
  getLocalResultIdentity,
  saveLocalResultIdentity,
} from '../services/resultSnapshotService';

interface SingleReportActionsProps {
  snapshotRequest: CreateResultSnapshotRequest;
  onOpenDualReport: (targetFriendId: string) => void;
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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setIdentity(getLocalResultIdentity());
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

      const response = await createResultSnapshot(snapshotRequest);
      const nextIdentity = saveLocalResultIdentity(response);

      setIdentity(nextIdentity);
      setSaveMessage('好友 ID 已生成并保存在当前设备。');
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
      setSaveError('复制失败，请手动记录你的好友 ID。');
    }
  };

  const handleOpenDualReport = () => {
    const nextTargetFriendId = targetFriendId.trim();

    if (!identity?.friendId) {
      setSaveError('请先保存当前结果并生成自己的好友 ID。');
      return;
    }

    if (!nextTargetFriendId) {
      setSaveError('请输入好友 ID。');
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
      setSaveMessage('当前设备保存的结果已删除，旧好友 ID 已失效。');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '结果删除失败，请稍后重试。');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full border-2 border-[#00f0ff]/60 bg-black/80 px-4 py-4 sm:px-5 sm:py-5 shadow-[4px_4px_0px_rgba(255,0,127,0.35)]">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#00f0ff] uppercase">
              双人互补报告准备
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-3 rounded-none bg-black border-2 border-[#00f0ff] text-[#00f0ff] font-pixel text-xs sm:text-[13px] flex items-center justify-center gap-2 shadow-[4px_4px_0px_#050814] hover:shadow-[5px_5px_0px_#ff007f] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer min-h-[46px]"
          >
            {saving ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? '保存中...' : '保存并生成我的好友 ID'}</span>
          </button>
        </div>

        {identity && (
          <div className="border border-dashed border-[#39ff14]/40 bg-[#070b19] px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#39ff14] uppercase">
                  当前好友 ID
                </p>
                <p className="mt-1 break-all font-mono text-sm sm:text-base text-white">
                  {identity.friendId}
                </p>
                <p className="mt-1 text-[11px] sm:text-xs text-slate-400 font-sans">
                  有效期至 {expiresText || '已生成'}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto px-4 py-2 rounded-none border border-[#39ff14] text-[#39ff14] bg-black font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#39ff14]/10 transition-colors cursor-pointer min-h-[40px]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? '已复制' : '复制 ID'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="border border-dashed border-[#ffe600]/35 bg-[#070b19] px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffe600] shrink-0" />
            <p className="text-[11px] sm:text-xs text-slate-400 font-sans">
              friendId 用于生成互补报告，删除凭证仅保存在当前设备。
            </p>
          </div>
        </div>

        <div className="border border-dashed border-[#00f0ff]/35 bg-[#070b19] px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex flex-col gap-3">
            <label className="block text-[11px] sm:text-xs font-pixel tracking-widest text-[#00f0ff] uppercase">
              输入好友 ID
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <input
                value={targetFriendId}
                onChange={(event) => setTargetFriendId(event.target.value)}
                placeholder="例如 abc123xyz789"
                className="flex-1 w-full rounded-none border-2 border-[#00f0ff]/60 bg-black px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#00f0ff] font-mono"
              />
              <button
                onClick={handleOpenDualReport}
                className="w-full sm:w-auto px-5 py-3 rounded-none border-2 border-[#ffe600] bg-black text-[#ffe600] font-pixel text-xs sm:text-[13px] flex items-center justify-center gap-2 hover:bg-[#ffe600]/10 transition-colors cursor-pointer min-h-[46px]"
              >
                <ArrowRight className="w-4 h-4" />
                <span>生成认知互补度报告</span>
              </button>
            </div>
          </div>
        </div>

        {identity && (
          <div className="border border-dashed border-[#ff007f]/35 bg-[#070b19] px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-pixel tracking-widest text-[#ff007f] uppercase">
                  删除我的结果
                </p>
                <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-slate-400 font-sans">
                  删除后旧好友 ID 立即失效。
                </p>
              </div>
              <div className="flex w-full sm:w-auto gap-2">
                {!confirmDelete ? (
                  <button
                    onClick={() => {
                      setConfirmDelete(true);
                      setSaveError(null);
                      setSaveMessage(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-none border border-[#ff007f] text-[#ff007f] bg-black font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#ff007f]/10 transition-colors cursor-pointer min-h-[40px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除我的结果</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="w-full sm:w-auto px-4 py-2 rounded-none border border-slate-500 text-slate-300 bg-black font-pixel text-xs hover:bg-slate-500/10 transition-colors cursor-pointer min-h-[40px]"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full sm:w-auto px-4 py-2 rounded-none border border-[#ff007f] text-[#ff007f] bg-black font-pixel text-xs flex items-center justify-center gap-2 hover:bg-[#ff007f]/10 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer min-h-[40px]"
                    >
                      {deleting ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      <span>{deleting ? '删除中...' : '确认删除'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {saveMessage && (
          <p className="text-[11px] sm:text-xs font-pixel text-[#39ff14] bg-black border border-[#39ff14] px-3 py-2 text-center">
            {saveMessage}
          </p>
        )}

        {saveError && (
          <p className="text-[11px] sm:text-xs font-pixel text-[#ff007f] bg-black border border-[#ff007f] px-3 py-2 text-center">
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}
