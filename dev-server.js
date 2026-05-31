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
  /* POST /api/results */
  app.post('/api/results', async (req, res) => {
    try {
      const mod = await import('./functions/api/results.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/results error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* POST /api/compatibility-report */
  app.post('/api/compatibility-report', async (req, res) => {
    try {
      const mod = await import('./functions/api/compatibility-report.js');
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
      const mod = await import('./functions/api/results/delete.js');
      const webReq = toWebRequest(req);
      const ctx = { request: webReq, env: { RESULT_SNAPSHOT_KV: kv, MY_KV: kv } };
      const webRes = await mod.onRequest(ctx);
      await sendWebResponse(webRes, res);
    } catch (err) {
      console.error('[dev-server] /api/results/delete error:', err);
      res.status(500).json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' });
    }
  });

  /* POST /api/share-report */
  app.post('/api/share-report', async (req, res) => {
    try {
      const mod = await import('./functions/api/share-report.js');
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
      const mod = await import('./functions/api/share/[token].js');
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
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
