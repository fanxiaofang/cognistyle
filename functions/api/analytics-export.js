import { KV_KEY_PREFIXES, COMMON_HEADERS_GET } from './shared/api-constants.js';
import { getSnapshotKv, json } from './shared/api-utils.js';

// Admin 导出端点：分页列出 analytics:single:* 键值
// 认证：Bearer token，token 来自环境变量 ANALYTICS_EXPORT_SECRET
// 用法：GET /api/analytics-export?cursor=<base64>&limit=<n>
// 返回：{ records: [...], cursor: <base64>|null, count: number }

const DEFAULT_PAGE_LIMIT = 100;
const MAX_PAGE_LIMIT = 1000;

function isAuthenticated(request, env) {
  const secret = env.ANALYTICS_EXPORT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.length < 16) {
    return false;
  }
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  return auth.slice(7) === secret;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS_GET });
  }

  if (request.method !== 'GET') {
    return json(
      { error: 'Method Not Allowed', code: 'BAD_REQUEST' },
      COMMON_HEADERS_GET,
      { status: 405 }
    );
  }

  if (!isAuthenticated(request, env)) {
    return json(
      { error: '未授权', code: 'UNAUTHORIZED' },
      COMMON_HEADERS_GET,
      { status: 401 }
    );
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    return json(
      { error: 'KV 存储未配置', code: 'INTERNAL_ERROR' },
      COMMON_HEADERS_GET,
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const cursorRaw = url.searchParams.get('cursor');
  const limitRaw = parseInt(url.searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT), 10);
  const limit = Math.min(Math.max(1, limitRaw), MAX_PAGE_LIMIT);

  try {
    // KV list 返回 { keys: [{ name, expiration, metadata }], list_complete, cursor }
    // 注意：EdgeOne KV 的 cursor 字段严格要求 string，undefined 会触发类型校验错误
    // 因此首屏查询（无 cursor）时不传该字段，仅在有游标时传入
    const prefix = KV_KEY_PREFIXES.ANALYTICS.SINGLE;
    const listArgs = { prefix, limit };
    if (cursorRaw) listArgs.cursor = cursorRaw;
    const listResult = await kv.list(listArgs);

    const records = [];
    for (const key of listResult.keys || []) {
      const raw = await kv.get(key.name);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        records.push(parsed);
      } catch {
        // 跳过损坏的记录
      }
    }

    return json(
      {
        records,
        cursor: listResult.list_complete ? null : listResult.cursor,
        count: records.length,
        prefix,
      },
      COMMON_HEADERS_GET
    );
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : '导出失败',
        code: 'INTERNAL_ERROR',
      },
      COMMON_HEADERS_GET,
      { status: 500 }
    );
  }
}
