const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
};

const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_KEY_PREFIX = 'rate-limit:share-read:';
const SHARE_KEY_PREFIX = 'share:';

export async function onRequest(context) {
  const { request, env, params } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'GET') {
    return json(
      { error: 'Method Not Allowed', code: 'BAD_REQUEST' },
      { status: 405 }
    );
  }

  const kv = env.RESULT_SNAPSHOT_KV || env.MY_KV || null;
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

    const token = typeof params?.token === 'string' ? params.token : '';
    if (!token || token.length < 8) {
      return json({ error: '分享 token 非法。', code: 'BAD_REQUEST' }, { status: 400 });
    }

    const raw = await kv.get(`${SHARE_KEY_PREFIX}${token}`);
    if (!raw) {
      return json(
        { error: '公开分享报告不存在或已过期。', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return json(JSON.parse(raw));
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

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...COMMON_HEADERS,
      ...(init.headers || {}),
    },
  });
}
