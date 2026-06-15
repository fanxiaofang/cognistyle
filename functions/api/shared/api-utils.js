import { DEFAULT_RATE_LIMIT } from './api-constants.js';

// EdgeOne Pages / Cloudflare Workers KV 绑定名称候选列表
// 注意：此处只匹配已知命名，不做全局 fallback 扫描
// 全局扫描可能误匹配非持久化的内存对象（如 polyfill、runtime 内部缓存），
// 导致数据在函数实例回收后丢失
const KNOWN_KV_BINDINGS = [
  'RESULT_SNAPSHOT_KV',
  'MY_KV',
  'KV',           // EdgeOne Pages 默认绑定名
  'kv',
  'KV_STORE',
  'kv_store',
  'my_kv',        // EdgeOne Pages 文档示例变量名
];

/**
 * 获取 KV 存储实例
 *
 * 查找顺序：
 * 1. 先查 globalThis（某些平台将 KV 注入全局作用域）
 * 2. 再查 env（Cloudflare Workers / EdgeOne Pages 标准方式）
 *
 * 返回值增加 .__source 标记，便于诊断线上实际使用的绑定名。
 */
export function getSnapshotKv(env) {
  for (const name of KNOWN_KV_BINDINGS) {
    const global = globalThis[name];
    if (global && typeof global.get === 'function' && typeof global.put === 'function') {
      global.__source = `globalThis.${name}`;
      return global;
    }
    const candidate = env[name];
    if (candidate && typeof candidate.get === 'function' && typeof candidate.put === 'function') {
      candidate.__source = `env.${name}`;
      return candidate;
    }
  }

  // 不再遍历 env / globalThis 的所有 key 做模糊匹配
  // 此举在部分平台会误匹配到非持久化的内存对象（如 dev-server 的 MemoryKV），
  // 导致线上数据"几小时后失效"
  return null;
}

export async function hitRateLimit(kv, clientIp, keyPrefix, max = DEFAULT_RATE_LIMIT.COMPATIBILITY_MAX) {
  const minuteBucket = Math.floor(
    Date.now() / (DEFAULT_RATE_LIMIT.WINDOW_SECONDS * 1000)
  );
  const key = `${keyPrefix}${clientIp}:${minuteBucket}`;
  const current = parseInt((await kv.get(key)) || '0', 10);

  if (current >= max) {
    return true;
  }

  await kv.put(key, String(current + 1), {
    expirationTtl: DEFAULT_RATE_LIMIT.WINDOW_SECONDS,
  });

  return false;
}

export function extractClientIp(request) {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('X-Forwarded-For') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

export function generateUrlSafeToken(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export function toBase64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function sha256Hex(input) {
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function json(body, headers, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  });
}

export function safeParseJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function validateFriendIdFormat(id) {
  return typeof id === 'string' && id.length >= 6 && id.length <= 32 && /^[a-zA-Z0-9_-]+$/.test(id);
}
