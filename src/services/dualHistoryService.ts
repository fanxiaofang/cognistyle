import type { CompatibilityPairPattern } from '../contracts/dualReport';
import type { ProfileId } from '../types';

export interface DualReportHistoryEntry {
  targetFriendId: string;
  targetProfileId: ProfileId;
  targetDisplayName: string;
  targetCallSign: string;
  targetDepartment: string;
  overallScore: number;
  pattern: CompatibilityPairPattern;
  generatedAt: number;
}

const HISTORY_STORAGE_KEY = 'cognistyle_dual_history_v1';
const MAX_HISTORY_ENTRIES = 50;

export function getDualReportHistory(): DualReportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DualReportHistoryEntry[];
  } catch {
    return [];
  }
}

export function addDualReportHistory(entry: DualReportHistoryEntry): void {
  const history = getDualReportHistory();
  const existingIdx = history.findIndex(
    (e) => e.targetFriendId === entry.targetFriendId
  );
  if (existingIdx !== -1) {
    history[existingIdx] = entry;
  } else {
    history.unshift(entry);
  }
  if (history.length > MAX_HISTORY_ENTRIES) {
    history.length = MAX_HISTORY_ENTRIES;
  }
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function removeDualReportHistory(targetFriendId: string): void {
  const history = getDualReportHistory().filter(
    (e) => e.targetFriendId !== targetFriendId
  );
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function clearDualReportHistory(): void {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}
