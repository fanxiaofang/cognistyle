import {
  DUAL_REPORT_ENDPOINTS,
  DUAL_REPORT_VERSIONS,
  type ApiErrorResponse,
  type CreateResultSnapshotRequest,
  type CreateResultSnapshotResponse,
  type DeleteResultSnapshotRequest,
  type DeleteResultSnapshotResponse,
  type LocalResultIdentity,
} from '../contracts/dualReport';

const LOCAL_IDENTITY_STORAGE_KEY = 'cognistyle_result_identity_v1';

export class ApiResultError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'ApiResultError';
    this.code = code;
  }
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return !!value && typeof value === 'object' && 'error' in value;
}

export function getLocalResultIdentity(): LocalResultIdentity | null {
  try {
    const raw = localStorage.getItem(LOCAL_IDENTITY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LocalResultIdentity;
    if (
      typeof parsed?.friendId !== 'string' ||
      typeof parsed?.deleteToken !== 'string' ||
      typeof parsed?.createdAt !== 'number' ||
      typeof parsed?.expiresAt !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveLocalResultIdentity(
  payload: CreateResultSnapshotResponse
): LocalResultIdentity {
  const identity: LocalResultIdentity = {
    friendId: payload.friendId,
    deleteToken: payload.deleteToken,
    createdAt: Date.now(),
    expiresAt: payload.expiresAt,
    snapshotVersion: DUAL_REPORT_VERSIONS.snapshotVersion,
  };

  localStorage.setItem(LOCAL_IDENTITY_STORAGE_KEY, JSON.stringify(identity));
  return identity;
}

export function clearLocalResultIdentity(): void {
  localStorage.removeItem(LOCAL_IDENTITY_STORAGE_KEY);
}

export async function deleteResultSnapshot(
  request: DeleteResultSnapshotRequest
): Promise<DeleteResultSnapshotResponse> {
  const response = await fetch(DUAL_REPORT_ENDPOINTS.deleteSnapshot, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorResponse(data)) {
      throw new ApiResultError(data.error, data.code);
    }

    throw new ApiResultError('结果删除失败，请稍后重试。', 'UNKNOWN');
  }

  return data as DeleteResultSnapshotResponse;
}

export async function createResultSnapshot(
  request: CreateResultSnapshotRequest
): Promise<CreateResultSnapshotResponse> {
  const response = await fetch(DUAL_REPORT_ENDPOINTS.createSnapshot, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorResponse(data)) {
      throw new ApiResultError(data.error, data.code);
    }

    throw new ApiResultError('结果保存失败，请稍后重试。', 'UNKNOWN');
  }

  return data as CreateResultSnapshotResponse;
}

export type FriendIdCheckResult = 'ok' | 'notFound' | 'error';

export async function checkFriendIdExists(friendId: string): Promise<FriendIdCheckResult> {
  try {
    const response = await fetch(
      `${DUAL_REPORT_ENDPOINTS.createSnapshot}/${encodeURIComponent(friendId)}`,
      { method: 'HEAD', signal: AbortSignal.timeout(5000) }
    );
    if (response.ok) return 'ok';
    if (response.status === 404) return 'notFound';
    return 'error';
  } catch {
    return 'error';
  }
}
