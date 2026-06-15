import {
  buildCompatibilityReport,
  buildPublicCompatibilityReport,
  getSnapshotKv,
} from './compatibility-report.js';
import {
  KV_KEY_PREFIXES,
  DEFAULT_RATE_LIMIT,
  TTL,
  COMMON_HEADERS,
  VALIDATION_RULES,
} from './shared/api-constants.js';
import {
  hitRateLimit,
  extractClientIp,
  generateUrlSafeToken,
  json,
  safeParseJson,
  validateFriendIdFormat,
} from './shared/api-utils.js';
import { getSharedCopy } from './shared/api-copy.js';

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
    console.warn('[share-report] KV 存储未绑定');
    return json(
      { error: sharedCopy.errors.storageMissing, code: 'INTERNAL_ERROR' },
      COMMON_HEADERS,
      { status: 500 }
    );
  }

  console.log('[share-report] KV 来源:', kv.__source || 'unknown');

  try {
    const clientIp = extractClientIp(request);
    const limited = await hitRateLimit(
      kv,
      clientIp,
      KV_KEY_PREFIXES.RATE_LIMIT.SHARE_REPORT,
      DEFAULT_RATE_LIMIT.SHARE_REPORT_MAX
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

    const validationError = validateSharePayload(payload);
    if (validationError) {
      return json(
        { error: validationError, code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    if (payload.myFriendId === payload.targetFriendId) {
      return json(
        { error: sharedCopy.errors.selfPairShare, code: 'BAD_REQUEST' },
        COMMON_HEADERS,
        { status: 400 }
      );
    }

    const [myRaw, targetRaw] = await Promise.all([
      kv.get(`${KV_KEY_PREFIXES.RESULT}${payload.myFriendId}`),
      kv.get(`${KV_KEY_PREFIXES.RESULT}${payload.targetFriendId}`),
    ]);

    if (!myRaw || !targetRaw) {
      return json(
        { error: sharedCopy.errors.invalidResultForShare, code: 'NOT_FOUND' },
        COMMON_HEADERS,
        { status: 404 }
      );
    }

    const mySnapshot = safeParseJson(myRaw);
    const targetSnapshot = safeParseJson(targetRaw);

    if (!mySnapshot || !targetSnapshot) {
      return json(
        { error: sharedCopy.errors.invalidResultForShare, code: 'NOT_FOUND' },
        COMMON_HEADERS,
        { status: 404 }
      );
    }

    const report = buildCompatibilityReport(mySnapshot, targetSnapshot);
    const token = generateUrlSafeToken(12);
    const expiresAt = Date.now() + TTL.SHARE_SECONDS * 1000;
    const publicReport = buildPublicCompatibilityReport(report, token, expiresAt);

    await kv.put(`${KV_KEY_PREFIXES.SHARE}${token}`, JSON.stringify(publicReport), {
      expirationTtl: TTL.SHARE_SECONDS,
    });

    return json(
      {
        token,
        shareUrl: `/share/${token}`,
        expiresAt,
      },
      COMMON_HEADERS
    );
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

function validateSharePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return sharedCopy.errors.requestBodyMustBeObject;
  }
  if (!validateFriendIdFormat(payload.myFriendId)) {
    return `${sharedCopy.errors.jsonParseFailed} (myFriendId)`;
  }
  if (!validateFriendIdFormat(payload.targetFriendId)) {
    return `${sharedCopy.errors.jsonParseFailed} (targetFriendId)`;
  }
  return null;
}
