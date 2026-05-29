import {
  KV_KEY_PREFIXES,
  DEFAULT_RATE_LIMIT,
  COMMON_HEADERS,
} from '../shared/api-constants.js';
import {
  getSnapshotKv,
  hitRateLimit,
  extractClientIp,
  sha256Hex,
  json,
  safeParseJson,
} from '../shared/api-utils.js';
import { getSharedCopy } from '../shared/api-copy.js';

const sharedCopy = getSharedCopy();

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'POST') {
    return json(
      { error: sharedCopy.errors.methodNotAllowed, code: 'BAD_REQUEST' },
      COMMON_HEADERS,
      { status: 405 }
    );
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    return json(
      { error: sharedCopy.errors.storageMissing, code: 'INTERNAL_ERROR' },
      COMMON_HEADERS,
      { status: 500 }
    );
  }

  try {
    const clientIp = extractClientIp(request);
    const limited = await hitRateLimit(
      kv,
      clientIp,
      KV_KEY_PREFIXES.RATE_LIMIT.RESULTS_DELETE,
      DEFAULT_RATE_LIMIT.RESULTS_DELETE_MAX
    );
    if (limited) {
      return json(
        { error: sharedCopy.errors.rateLimited, code: 'RATE_LIMITED' },
        COMMON_HEADERS,
        { status: 429 }
      );
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(
        { error: sharedCopy.errors.jsonParseFailed, code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    const validationError = validateDeletePayload(payload);
    if (validationError) {
      return json(
        { error: validationError, code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    const recordKey = `${KV_KEY_PREFIXES.RESULT}${payload.friendId}`;
    const raw = await kv.get(recordKey);
    if (!raw) {
      return json(
        { error: sharedCopy.errors.resultNotFound, code: 'NOT_FOUND' },
        COMMON_HEADERS,
        { status: 404 }
      );
    }

    const record = safeParseJson(raw);
    if (!record) {
      return json(
        { error: sharedCopy.errors.resultNotFound, code: 'NOT_FOUND' },
        COMMON_HEADERS,
        { status: 404 }
      );
    }

    const deleteTokenHash = await sha256Hex(payload.deleteToken);
    if (record.deleteTokenHash !== deleteTokenHash) {
      return json(
        { error: sharedCopy.errors.deleteTokenInvalid, code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    await kv.delete(recordKey);
    return json({ success: true }, COMMON_HEADERS);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : sharedCopy.errors.internalError,
        code: 'INTERNAL_ERROR',
      },
      COMMON_HEADERS,
      { status: 500 }
    );
  }
}

function validateDeletePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return sharedCopy.errors.requestBodyMustBeObject;
  }
  if (typeof payload.friendId !== 'string' || payload.friendId.length < 6) {
    return 'friendId 非法。';
  }
  if (typeof payload.deleteToken !== 'string' || payload.deleteToken.length < 16) {
    return 'deleteToken 非法。';
  }
  return null;
}
