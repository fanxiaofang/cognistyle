import {
  KV_KEY_PREFIXES,
  DEFAULT_RATE_LIMIT,
  COMMON_HEADERS_GET,
} from '../shared/api-constants.js';
import {
  getSnapshotKv,
  hitRateLimit,
  extractClientIp,
  json,
} from '../shared/api-utils.js';
import { getSharedCopy } from '../shared/api-copy.js';

const sharedCopy = getSharedCopy();

export async function onRequest(context) {
  const { request, env, params } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS_GET });
  }

  if (request.method !== 'GET') {
    return json(
      { error: sharedCopy.errors.methodNotAllowed, code: 'BAD_REQUEST' },
      COMMON_HEADERS_GET,
      { status: 405 }
    );
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    return json(
      { error: sharedCopy.errors.storageMissing, code: 'INTERNAL_ERROR' },
      COMMON_HEADERS_GET,
      { status: 500 }
    );
  }

  try {
    const clientIp = extractClientIp(request);
    const limited = await hitRateLimit(
      kv,
      clientIp,
      KV_KEY_PREFIXES.RATE_LIMIT.SHARE_READ,
      DEFAULT_RATE_LIMIT.SHARE_READ_MAX
    );
    if (limited) {
      return json(
        { error: sharedCopy.errors.rateLimited, code: 'RATE_LIMITED' },
        COMMON_HEADERS_GET,
        { status: 429 }
      );
    }

    const token = typeof params?.token === 'string' ? params.token : '';
    if (!token || token.length < 8) {
      return json(
        { error: sharedCopy.errors.invalidToken, code: 'BAD_REQUEST' },
        COMMON_HEADERS_GET,
        { status: 400 }
      );
    }

    const raw = await kv.get(`${KV_KEY_PREFIXES.SHARE}${token}`);
    if (!raw) {
      return json(
        { error: sharedCopy.errors.shareNotFound, code: 'NOT_FOUND' },
        COMMON_HEADERS_GET,
        { status: 404 }
      );
    }

    return json(JSON.parse(raw), COMMON_HEADERS_GET);
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : sharedCopy.errors.internalError,
        code: 'INTERNAL_ERROR',
      },
      COMMON_HEADERS_GET,
      { status: 500 }
    );
  }
}
