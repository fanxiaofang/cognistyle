import {
  buildCompatibilityReport,
  buildPublicCompatibilityReport,
  getSnapshotKv,
} from './compatibility-report.js';

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
};

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_KEY_PREFIX = 'rate-limit:share-report:';
const RESULT_KEY_PREFIX = 'result:';
const SHARE_KEY_PREFIX = 'share:';
const SHARE_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'POST') {
    return json(
      { error: 'Method Not Allowed', code: 'BAD_REQUEST' },
      { status: 405 }
    );
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    return json(
      { error: '结果存储未配置，请先绑定 KV。', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }

  try {
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('X-Forwarded-For') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown';

    const limited = await hitRateLimit(kv, clientIp);
    if (limited) {
      return json(
        { error: '请求过于频繁，请稍后重试。', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    const payload = await request.json();
    const validationError = validateSharePayload(payload);
    if (validationError) {
      return json({ error: validationError, code: 'BAD_REQUEST' }, { status: 400 });
    }

    if (payload.myFriendId === payload.targetFriendId) {
      return json(
        { error: '不能对自己的结果生成公开互补分享。', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const [myRaw, targetRaw] = await Promise.all([
      kv.get(`${RESULT_KEY_PREFIX}${payload.myFriendId}`),
      kv.get(`${RESULT_KEY_PREFIX}${payload.targetFriendId}`),
    ]);

    if (!myRaw || !targetRaw) {
      return json(
        { error: '用于分享的结果不存在，可能已过期，请重新生成。', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const report = buildCompatibilityReport(JSON.parse(myRaw), JSON.parse(targetRaw));
    const token = generateUrlSafeToken(12);
    const expiresAt = Date.now() + SHARE_TTL_SECONDS * 1000;
    const publicReport = buildPublicCompatibilityReport(report, token, expiresAt);

    await kv.put(`${SHARE_KEY_PREFIX}${token}`, JSON.stringify(publicReport), {
      expirationTtl: SHARE_TTL_SECONDS,
    });

    return json({
      token,
      shareUrl: `${getBaseUrl(request)}/share/${token}`,
      expiresAt,
    });
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : '服务器内部错误',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

async function hitRateLimit(kv, clientIp) {
  const minuteBucket = Math.floor(Date.now() / (RATE_LIMIT_WINDOW_SECONDS * 1000));
  const key = `${RATE_LIMIT_KEY_PREFIX}${clientIp}:${minuteBucket}`;
  const current = parseInt((await kv.get(key)) || '0', 10);

  if (current >= RATE_LIMIT_MAX) {
    return true;
  }

  await kv.put(key, String(current + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });

  return false;
}

function validateSharePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return '请求体必须为 JSON 对象。';
  }
  if (typeof payload.myFriendId !== 'string' || payload.myFriendId.length < 6) {
    return 'myFriendId 非法。';
  }
  if (typeof payload.targetFriendId !== 'string' || payload.targetFriendId.length < 6) {
    return 'targetFriendId 非法。';
  }
  return null;
}

function generateUrlSafeToken(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...COMMON_HEADERS,
      ...(init.headers || {}),
    },
  });
}
