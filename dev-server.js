/**
 * 本地 API 模拟层
 *
 * 用途：
 * - 在本地开发时模拟 EdgeOne Pages / Cloudflare Workers Functions 运行时与 KV 存储
 * - 读取 functions/api/ 下的所有函数并挂载为 Express 路由
 * - 通过 Vite proxy 将前端的 /api/* 请求转发至此
 * - KV 同时注入 env（兼容 Cloudflare）与 globalThis（兼容 EdgeOne），供 getSnapshotKv 自动检测
 *
 * 使用方式：
 *   node dev-server.js          # 默认端口 8788
 *   PORT=8888 node dev-server.js
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

/* ------- 内存 KV（兼容 EdgeOne / Cloudflare KV 接口）------- */
class MemoryKV {
  constructor() {
    this._store = new Map();
  }

  async get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return null;
    }
    return entry.value;
  }

  async put(key, value, options = {}) {
    const expiresAt =
      options.expirationTtl != null
        ? Date.now() + options.expirationTtl * 1000
        : null;
    this._store.set(key, { value: String(value), expiresAt });
  }

  async delete(key) {
    this._store.delete(key);
  }

  list() {
    const entries = [];
    const now = Date.now();
    for (const [key, entry] of this._store.entries()) {
      entries.push({
        key,
        value: entry.value,
        expiresAt: entry.expiresAt,
        expired: entry.expiresAt !== null && now > entry.expiresAt,
      });
    }
    return entries;
  }

  reset() {
    this._store.clear();
  }
}

/* ------- 全局 KV 注入（兼容 EdgeOne 全局变量 + Cloudflare env）------- */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kv = new MemoryKV();
globalThis.RESULT_SNAPSHOT_KV = kv;
globalThis.MY_KV = kv;

function toWebRequest(expressReq) {
  const url = `http://127.0.0.1:${PORT}${expressReq.originalUrl}`;
  const headers = new Headers();

  Object.entries(expressReq.headers).forEach(([k, v]) => {
    if (v !== undefined && k !== 'host') {
      if (Array.isArray(v)) {
        v.forEach((item) => headers.append(k, item));
      } else {
        headers.set(k, v);
      }
    }
  });

  const init = { method: expressReq.method, headers };

  if (expressReq.method !== 'GET' && expressReq.method !== 'HEAD') {
    const contentType = expressReq.headers['content-type'] || '';
    if (
      contentType.includes('application/json') &&
      expressReq.body !== undefined
    ) {
      init.body = JSON.stringify(expressReq.body);
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
      }
    } else if (expressReq.body !== undefined) {
      init.body =
        typeof expressReq.body === 'string'
          ? expressReq.body
          : JSON.stringify(expressReq.body);
    }
  }

  return new Request(url, init);
}

async function sendWebResponse(webRes, expressRes) {
  expressRes.status(webRes.status);
  webRes.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower !== 'content-encoding') {
      expressRes.setHeader(key, value);
    }
  });

  const contentType = webRes.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const text = await webRes.text();
    try {
      expressRes.json(JSON.parse(text));
    } catch {
      expressRes.send(text);
    }
  } else {
    const buffer = await webRes.arrayBuffer();
    expressRes.send(Buffer.from(buffer));
  }
}

/* ------- 函数加载与挂载 ------- */
async function mountFunctions(app) {
  // 注意: 修改 functions/ 代码后需重启 dev-server（Ctrl+C 重新运行）
  // import() 的 ?t 参数只能刷新顶层模块，传递导入（如 config.js）仍走缓存
  function freshImport(p) { return import(`${p}?t=${Date.now()}`); }

  /* POST /api/results */
  app.post('/api/results', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/results.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/results error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* GET | HEAD /api/results/:friendId — 验证 friendId 是否仍有效 */
  app.get('/api/results/:friendId', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/results/[friendId].js');
      const webReq = toWebRequest(req);
      const ctx = {
        request: webReq,
        env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv },
        params: req.params,
      };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/results/:friendId error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  app.head('/api/results/:friendId', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/results/[friendId].js');
      const webReq = toWebRequest(req);
      const ctx = {
        request: webReq,
        env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv },
        params: req.params,
      };
      const webRes = await mod.onRequest(ctx);
      res.status(webRes.status);
      webRes.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, value);
        }
      });
      res.end();
    } catch (err) {
      console.error('[dev-server] /api/results/:friendId HEAD error:', err);
      res.status(500).end();
    }
  });

  /* POST /api/compatibility-report */
  app.post('/api/compatibility-report', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/compatibility-report.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/compatibility-report error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* POST /api/results/delete */
  app.post('/api/results/delete', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/results/delete.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/results/delete error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* POST /api/dual-history */
  app.post('/api/dual-history', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/dual-history.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/dual-history POST error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* DELETE /api/dual-history */
  app.delete('/api/dual-history', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/dual-history.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/dual-history DELETE error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* HEAD /api/dual-history/health */
  app.head('/api/dual-history/health', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/dual-history/health.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      res.status(webRes.status);
      webRes.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, value);
        }
      });
      res.end();
    } catch (err) {
      console.error('[dev-server] /api/dual-history/health error:', err);
      res.status(500).end();
    }
  });

  /* GET /api/dual-history/:friendId */
  app.get('/api/dual-history/:friendId', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/dual-history/[friendId].js');
      const webReq = toWebRequest(req);
      const ctx = {
        request: webReq,
        env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv },
        params: req.params,
      };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/dual-history/:friendId error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* POST /api/dual-history/batch */
  app.post('/api/dual-history/batch', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/dual-history/batch.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/dual-history/batch error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* POST /api/share-report */
  app.post('/api/share-report', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/share-report.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/share-report error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* GET /api/share/:token */
  app.get('/api/share/:token', async (req, res) => {
    try {
      const mod = await freshImport('./functions/api/share/[token].js');
      const webReq = toWebRequest(req);
      const ctx = {
        request: webReq,
        env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv },
        params: req.params,
      };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/share/:token error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });
}

/* ------- 启动 ------- */
const PORT = parseInt(process.env.PORT || '8788', 10);
const app = express();

app.use(express.json({ limit: '1mb' }));

// CORS 本地宽松（生产由边缘函数自行设置）
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,HEAD,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

/* OPTIONS 预检 */
app.options('/api/*', (_req, res) => {
  res.status(204).end();
});

/* ------- 调试端点：查看/重置 KV 内容 ------- */
app.get('/api/debug/kv', (_req, res) => {
  const entries = kv.list();
  res.json({
    total: entries.length,
    entries: entries.map((e) => {
      let parsed = e.value;
      try {
        parsed = JSON.parse(e.value);
      } catch { /* keep raw */ }
      return {
        key: e.key,
        value: parsed,
        expired: e.expired,
      };
    }),
  });
});

app.get('/api/debug/kv/:key', (req, res) => {
  const entries = kv.list();
  const match = entries.filter((e) => e.key.includes(req.params.key));
  res.json({
    count: match.length,
    keys: match.map((e) => e.key),
  });
});

app.post('/api/debug/kv/reset', (_req, res) => {
  kv.reset();
  res.json({ reset: true });
});

await mountFunctions(app);

const server = app.listen(PORT, () => {
  console.log(`\n[dev-server] EdgeOne Functions 模拟层已启动`);
  console.log(`[dev-server] 地址  : http://127.0.0.1:${PORT}`);
  console.log(`[dev-server] KV 模式: 内存（重启重置）\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[dev-server] 端口 ${PORT} 已被占用，请先关闭占用该端口的进程，或使用其他端口：`);
    console.error(`[dev-server]   $env:PORT=8789; node dev-server.js\n`);
  } else {
    console.error('[dev-server] 启动失败:', err.message);
  }
  process.exit(1);
});
