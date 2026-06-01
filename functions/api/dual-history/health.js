import { COMMON_HEADERS } from '../shared/api-constants.js';
import { getSnapshotKv } from '../shared/api-utils.js';

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: COMMON_HEADERS });
  }

  if (request.method !== 'HEAD') {
    return new Response(null, {
      status: 405,
      headers: COMMON_HEADERS,
    });
  }

  const kv = getSnapshotKv(env);
  if (!kv) {
    return new Response(null, {
      status: 500,
      headers: COMMON_HEADERS,
    });
  }

  return new Response(null, {
    status: 204,
    headers: COMMON_HEADERS,
  });
}
