import { DEFAULT_RATE_LIMIT } from './api-constants.js';

const KNOWN_KV_BINDINGS = ['RESULT_SNAPSHOT_KV', 'MY_KV', 'KV', 'kv', 'KV_STORE', 'kv_store'];

export function getSnapshotKv(env) {
  for (const name of KNOWN_KV_BINDINGS) {
    const global = globalThis[name];
    if (global && typeof global.get === 'function' && typeof global.put === 'function') {
      return global;
    }
    const candidate = env[name];
    if (candidate && typeof candidate.get === 'function' && typeof candidate.put === 'function') {
      return candidate;
    }
  }

  const envKeys = Object.keys(env);
  for (const key of envKeys) {
    const candidate = env[key];
    if (
      candidate &&
      typeof candidate === 'object' &&
      typeof candidate.get === 'function' &&
      typeof candidate.put === 'function'
    ) {
      return candidate;
    }
  }

  for (const key of Object.keys(globalThis)) {
    const candidate = globalThis[key];
    if (
      candidate &&
      typeof candidate === 'object' &&
      typeof candidate.get === 'function' &&
      typeof candidate.put === 'function'
    ) {
      return candidate;
    }
  }

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
