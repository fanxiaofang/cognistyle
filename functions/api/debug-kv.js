/**
 * 调试接口：检查 KV 存储绑定状态
 *
 * 访问方式：浏览器打开 https://你的域名/api/debug-kv
 * 会返回当前 KV 绑定的变量名和来源（env 还是 globalThis）
 */

import { getSnapshotKv } from './shared/api-utils.js';
import { COMMON_HEADERS_GET } from './shared/api-constants.js';

export async function onRequest(context) {
  const { env } = context;

  const kv = getSnapshotKv(env);

  const result = {
    kvBound: !!kv,
    kvSource: kv?.__source || null,
    kvHasGet: kv ? typeof kv.get === 'function' : false,
    kvHasPut: kv ? typeof kv.put === 'function' : false,
    envKeys: Object.keys(env).filter(k =>
      env[k] && typeof env[k] === 'object'
    ).map(k => ({
      key: k,
      type: typeof env[k],
      hasGet: typeof env[k]?.get === 'function',
      hasPut: typeof env[k]?.put === 'function',
    })),
    globalThisKvKeys: Object.keys(globalThis).filter(k =>
      globalThis[k] && typeof globalThis[k] === 'object' && typeof globalThis[k].get === 'function' && typeof globalThis[k].put === 'function'
    ),
  };

  return new Response(JSON.stringify(result, null, 2), {
    status: 200,
    headers: COMMON_HEADERS_GET,
  });
}
