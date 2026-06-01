import {
  KV_KEY_PREFIXES,
  COMMON_HEADERS,
} from '../shared/api-constants.js';
import {
  getSnapshotKv,
  json,
  validateFriendIdFormat,
} from '../shared/api-utils.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  const friendId = params.friendId;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json(
      { error: 'Method Not Allowed', code: 'BAD_REQUEST' },
      COMMON_HEADERS,
      { status: 405 }
    );
  }

  if (!friendId || !validateFriendIdFormat(friendId)) {
    return json(
      { error: 'friendId 格式无效', code: 'BAD_REQUEST' },
      COMMON_HEADERS,
      { status: 400 }
    );
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    return json(
      { error: '存储服务未配置。', code: 'INTERNAL_ERROR' },
      COMMON_HEADERS,
      { status: 500 }
    );
  }

  const recordKey = `${KV_KEY_PREFIXES.RESULT}${friendId}`;
  const raw = await kv.get(recordKey);

  if (!raw) {
    return json(
      { exists: false },
      COMMON_HEADERS,
      { status: 404 }
    );
  }

  return json(
    { exists: true },
    COMMON_HEADERS
  );
}
