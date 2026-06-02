import type { ProfileId } from '../types';
import type { CompatibilityPairPattern } from '../contracts/dualReport';
import {
  DUAL_HISTORY_ENDPOINTS,
  type AddHistoryEntryRequest,
  type AddHistoryEntryResponse,
  type GetHistoryResponse,
  type DeleteHistoryRequest,
  type DeleteHistoryResponse,
  type BatchHistoryEntryRequest,
} from '../contracts/dualReport';

export interface DualReportHistoryEntry {
  version: 'history-v1';
  targetFriendId: string;
  targetProfileId: ProfileId;
  targetDisplayName: string;
  targetCallSign: string;
  targetDepartment: string;
  overallScore: number;
  pattern: CompatibilityPairPattern;
  generatedAt: number;
  syncedAt?: number;
  localOnly?: boolean;
}

interface HistoryCacheMeta {
  fetchedAt: number;
  friendId: string;
  version: 'history-v1';
}

interface SyncQueueEntry {
  type: 'add' | 'delete';
  payload: Record<string, unknown>;
  timestamp: number;
}

const CACHE_KEY = 'cognistyle_dual_history_v2';
const CACHE_META_KEY = 'cognistyle_dual_history_meta_v2';
const OLD_STORAGE_KEY = 'cognistyle_dual_history_v1';
const SYNC_QUEUE_KEY = 'cognistyle_history_sync_queue';

const MAX_HISTORY_ENTRIES = 50;
const CACHE_VALIDITY_MS = 5 * 60 * 1000;
const MAX_RETRIES = 3;
const DEBOUNCE_MS = 500;
const SYNC_QUEUE_MAX = 20;
const SYNC_QUEUE_STALE_DAYS = 7;
const HEALTH_CHECK_INTERVAL_MS = 60000;
const BATCH_SIZE = 8;
const BATCH_INTERVAL_MS = 60000;

let isOfflineMode = false;
let lastServerCheckAt = 0;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingAdd: (() => Promise<void>) | null = null;

function getCacheMeta(): HistoryCacheMeta | null {
  try {
    const raw = localStorage.getItem(CACHE_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HistoryCacheMeta;
    if (
      typeof parsed.fetchedAt === 'number' &&
      typeof parsed.friendId === 'string' &&
      parsed.version === 'history-v1'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function setCacheMeta(friendId: string): void {
  const meta: HistoryCacheMeta = {
    fetchedAt: Date.now(),
    friendId,
    version: 'history-v1',
  };
  localStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
}

function getCachedEntries(): DualReportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return [];
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    return entries as DualReportHistoryEntry[];
  } catch {
    return [];
  }
}

function setCachedEntries(friendId: string, entries: DualReportHistoryEntry[]): void {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ version: 'history-v1', friendId, entries })
  );
  setCacheMeta(friendId);
}

function getSyncQueue(): SyncQueueEntry[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    const staleThreshold = SYNC_QUEUE_STALE_DAYS * 24 * 60 * 60 * 1000;
    const valid = parsed.filter(
      (e: SyncQueueEntry) =>
        e && typeof e.type === 'string' && typeof e.timestamp === 'number' &&
        now - e.timestamp < staleThreshold
    );

    if (valid.length < parsed.length) {
      setSyncQueue(valid);
    }
    return valid;
  } catch {
    return [];
  }
}

function setSyncQueue(queue: SyncQueueEntry[]): void {
  const capped = queue.slice(-SYNC_QUEUE_MAX);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(capped));
}

function addToSyncQueue(entry: SyncQueueEntry): void {
  const queue = getSyncQueue();
  queue.push(entry);
  setSyncQueue(queue);
}

function getPendingDeleteIds(friendId: string): Set<string> {
  const ids = new Set<string>();
  const queue = getSyncQueue();
  for (const entry of queue) {
    if (entry.type === 'delete' && entry.payload && typeof entry.payload === 'object') {
      const payload = entry.payload as { friendId?: string; targetFriendId?: string };
      if (payload.friendId === friendId && payload.targetFriendId) {
        ids.add(payload.targetFriendId);
      }
      if (payload.friendId === friendId && !payload.targetFriendId) {
        return new Set(['__CLEAR_ALL__']);
      }
    }
  }
  return ids;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof TypeError) {
        if (i < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000)
          );
          continue;
        }
      }
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new Error('Max retries exceeded');
}

async function checkServerAvailability(): Promise<boolean> {
  if (Date.now() - lastServerCheckAt < HEALTH_CHECK_INTERVAL_MS) {
    return !isOfflineMode;
  }

  try {
    const response = await fetch(DUAL_HISTORY_ENDPOINTS.health, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    isOfflineMode = !response.ok;
  } catch {
    isOfflineMode = true;
  }

  lastServerCheckAt = Date.now();
  return !isOfflineMode;
}

async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const available = await checkServerAvailability();
  if (!available) return;

  const remaining: SyncQueueEntry[] = [];

  for (const entry of queue) {
    try {
      if (entry.type === 'add') {
        await fetch(DUAL_HISTORY_ENDPOINTS.addOrUpdate, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.payload),
        });
      } else if (entry.type === 'delete') {
        await fetch(DUAL_HISTORY_ENDPOINTS.delete, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.payload),
        });
      }
    } catch {
      remaining.push(entry);
    }
  }

  setSyncQueue(remaining);
}

window.addEventListener('online', () => {
  if (isOfflineMode) {
    processSyncQueue();
  }
});

setInterval(async () => {
  const wasOffline = isOfflineMode;
  const available = await checkServerAvailability();
  if (wasOffline && available) {
    processSyncQueue();
  }
}, HEALTH_CHECK_INTERVAL_MS);

function hasOldLocalData(): boolean {
  try {
    const raw = localStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function getOldLocalEntries(): DualReportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(
      (e: {
        targetFriendId: string;
        targetProfileId: ProfileId;
        targetDisplayName: string;
        targetCallSign: string;
        targetDepartment: string;
        overallScore: number;
        pattern: CompatibilityPairPattern;
        generatedAt: number;
      }) => ({
        ...e,
        version: 'history-v1' as const,
        localOnly: true,
      })
    );
  } catch {
    return [];
  }
}

export function isOnlineMode(): boolean {
  return !isOfflineMode;
}

export function getCachedHistoryFriendId(): string | null {
  const meta = getCacheMeta();
  return meta?.friendId || null;
}

export async function getDualReportHistory(
  friendId: string,
  options?: { forceRefresh?: boolean }
): Promise<DualReportHistoryEntry[]> {
  if (!friendId) return [];

  const meta = getCacheMeta();
  const cached = getCachedEntries();

  const cacheValid =
    !options?.forceRefresh &&
    meta &&
    meta.friendId === friendId &&
    Date.now() - meta.fetchedAt < CACHE_VALIDITY_MS;

  if (cacheValid) return cached;

  const available = await checkServerAvailability();

  if (!available) {
    isOfflineMode = true;
    if (cached.length > 0) return cached;
    return [];
  }

  try {
    const response = await retryWithBackoff(() =>
      fetch(`${DUAL_HISTORY_ENDPOINTS.read}${encodeURIComponent(friendId)}`)
    );

    if (!response.ok) {
      if (cached.length > 0) return cached;
      return [];
    }

    const data: GetHistoryResponse = await response.json();
    const pendingDeletes = getPendingDeleteIds(friendId);

    let entries: DualReportHistoryEntry[];

    if (pendingDeletes.has('__CLEAR_ALL__')) {
      entries = [];
    } else if (pendingDeletes.size > 0) {
      entries = (data.data.entries || [])
        .filter((e) => !pendingDeletes.has(e.targetFriendId))
        .map((e) => ({
          ...e,
          version: 'history-v1' as const,
          syncedAt: data.data.fetchedAt,
        }));
    } else {
      entries = (data.data.entries || []).map((e) => ({
        ...e,
        version: 'history-v1' as const,
        syncedAt: data.data.fetchedAt,
      }));
    }

    entries.sort((a, b) => b.generatedAt - a.generatedAt);
    setCachedEntries(friendId, entries);
    isOfflineMode = false;
    return entries;
  } catch {
    if (cached.length > 0) return cached;
    return [];
  }
}

export async function addDualReportHistory(
  friendId: string,
  entry: Omit<DualReportHistoryEntry, 'version' | 'syncedAt' | 'localOnly'>
): Promise<void> {
  if (!friendId) return;

  const fullEntry: DualReportHistoryEntry = {
    ...entry,
    version: 'history-v1',
    localOnly: false,
  };

  const cached = getCachedEntries();
  const existingIdx = cached.findIndex(
    (e) => e.targetFriendId === entry.targetFriendId
  );
  if (existingIdx !== -1) {
    cached[existingIdx] = fullEntry;
  } else {
    cached.unshift(fullEntry);
  }
  if (cached.length > MAX_HISTORY_ENTRIES) {
    cached.length = MAX_HISTORY_ENTRIES;
  }
  setCachedEntries(friendId, cached);

  pendingAdd = async () => {
    const request: AddHistoryEntryRequest = {
      friendId,
      version: 'history-v1',
      entry: {
        targetFriendId: entry.targetFriendId,
        targetProfileId: entry.targetProfileId,
        targetDisplayName: entry.targetDisplayName,
        targetCallSign: entry.targetCallSign,
        targetDepartment: entry.targetDepartment,
        overallScore: entry.overallScore,
        pattern: entry.pattern,
        generatedAt: entry.generatedAt,
      },
    };

    try {
      const available = await checkServerAvailability();
      if (!available) {
        fullEntry.localOnly = true;
        const updated = getCachedEntries();
        const idx = updated.findIndex(
          (e) => e.targetFriendId === entry.targetFriendId
        );
        if (idx !== -1) {
          updated[idx] = fullEntry;
        }
        setCachedEntries(friendId, updated);

        addToSyncQueue({
          type: 'add',
          payload: request as unknown as Record<string, unknown>,
          timestamp: Date.now(),
        });
        return;
      }

      const response = await retryWithBackoff(() =>
        fetch(DUAL_HISTORY_ENDPOINTS.addOrUpdate, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
      );

      if (!response.ok) {
        fullEntry.localOnly = true;
        const updated = getCachedEntries();
        const idx = updated.findIndex(
          (e) => e.targetFriendId === entry.targetFriendId
        );
        if (idx !== -1) {
          updated[idx] = fullEntry;
        }
        setCachedEntries(friendId, updated);

        addToSyncQueue({
          type: 'add',
          payload: request as unknown as Record<string, unknown>,
          timestamp: Date.now(),
        });
        return;
      }

      const data: AddHistoryEntryResponse = await response.json();
      fullEntry.syncedAt = data.data.syncedAt;
      fullEntry.localOnly = false;

      const updated = getCachedEntries();
      const idx = updated.findIndex(
        (e) => e.targetFriendId === entry.targetFriendId
      );
      if (idx !== -1) {
        updated[idx] = fullEntry;
      }
      setCachedEntries(friendId, updated);
    } catch {
      fullEntry.localOnly = true;
      const updated = getCachedEntries();
      const idx = updated.findIndex(
        (e) => e.targetFriendId === entry.targetFriendId
      );
      if (idx !== -1) {
        updated[idx] = fullEntry;
      }
      setCachedEntries(friendId, updated);

      addToSyncQueue({
        type: 'add',
        payload: request as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      });
    }
  };

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    if (pendingAdd) {
      pendingAdd();
      pendingAdd = null;
    }
    debounceTimer = null;
  }, DEBOUNCE_MS);
}

export async function removeDualReportHistory(
  friendId: string,
  targetFriendId: string
): Promise<void> {
  if (!friendId || !targetFriendId) return;

  const removed = getCachedEntries().filter((e) => e.targetFriendId !== targetFriendId);
  setCachedEntries(friendId, removed);

  const request: DeleteHistoryRequest = {
    friendId,
    targetFriendId,
  };

  try {
    const available = await checkServerAvailability();
    if (!available) {
      addToSyncQueue({ type: 'delete', payload: request as unknown as Record<string, unknown>, timestamp: Date.now() });
      return;
    }

    const response = await retryWithBackoff(() =>
      fetch(DUAL_HISTORY_ENDPOINTS.delete, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    );

    if (!response.ok) {
      addToSyncQueue({ type: 'delete', payload: request as unknown as Record<string, unknown>, timestamp: Date.now() });
    }
  } catch {
    addToSyncQueue({ type: 'delete', payload: request as unknown as Record<string, unknown>, timestamp: Date.now() });
  }
}

export async function clearDualReportHistory(friendId: string): Promise<void> {
  if (!friendId) return;

  setCachedEntries(friendId, []);

  const request: DeleteHistoryRequest = { friendId };

  try {
    const available = await checkServerAvailability();
    if (!available) {
      addToSyncQueue({ type: 'delete', payload: request as unknown as Record<string, unknown>, timestamp: Date.now() });
      return;
    }

    const response = await retryWithBackoff(() =>
      fetch(DUAL_HISTORY_ENDPOINTS.delete, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    );

    if (!response.ok) {
      addToSyncQueue({ type: 'delete', payload: request as unknown as Record<string, unknown>, timestamp: Date.now() });
    }
  } catch {
    addToSyncQueue({ type: 'delete', payload: request as unknown as Record<string, unknown>, timestamp: Date.now() });
  }
}

export async function migrateLocalHistoryToServer(friendId: string): Promise<{
  migrated: number;
  failed: number;
}> {
  if (!friendId) return { migrated: 0, failed: 0 };

  const oldEntries = getOldLocalEntries();
  if (oldEntries.length === 0) {
    return { migrated: 0, failed: 0 };
  }

  const available = await checkServerAvailability();
  if (!available) {
    return { migrated: 0, failed: oldEntries.length };
  }

  let migrated = 0;
  let failed = 0;

  for (let i = 0; i < oldEntries.length; i += BATCH_SIZE) {
    const batch = oldEntries.slice(i, i + BATCH_SIZE);
    const batchRequest: BatchHistoryEntryRequest = {
      friendId,
      version: 'history-v1',
      entries: batch.map((e) => ({
        targetFriendId: e.targetFriendId,
        targetProfileId: e.targetProfileId,
        targetDisplayName: e.targetDisplayName,
        targetCallSign: e.targetCallSign,
        targetDepartment: e.targetDepartment,
        overallScore: e.overallScore,
        pattern: e.pattern,
        generatedAt: e.generatedAt,
      })),
    };

    try {
      const response = await fetch(DUAL_HISTORY_ENDPOINTS.batch, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchRequest),
      });

      if (response.ok) {
        migrated += batch.length;
      } else {
        failed += batch.length;
      }
    } catch {
      failed += batch.length;
    }

    if (i + BATCH_SIZE < oldEntries.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_INTERVAL_MS));
    }
  }

  if (migrated > 0) {
    const meta = getCacheMeta();
    if (meta && meta.friendId === friendId) {
      setCacheMeta(friendId);
    }
    localStorage.removeItem(OLD_STORAGE_KEY);
  }

  return { migrated, failed };
}

export function shouldMigrate(): boolean {
  const meta = getCacheMeta();
  if (meta?.fetchedAt && Date.now() - meta.fetchedAt > CACHE_VALIDITY_MS) {
    return hasOldLocalData();
  }
  return !meta && hasOldLocalData();
}
