/**
 * 答题数据导出脚本
 *
 * 通过线上 admin 端点 GET /api/analytics-export 分页读取所有 analytics:single:* 记录，
 * 合并保存为本地 NDJSON 文件，供 question-analysis.ts 分析使用。
 *
 * 用法：
 *   ANALYTICS_EXPORT_SECRET=xxx npm run export:analytics -- --origin=https://your.domain
 *
 * 必需环境变量：
 *   ANALYTICS_EXPORT_SECRET  与线上环境变量同名的 Bearer token（>=16 字符）
 *
 * 可选参数：
 *   --origin=<url>   线上站点 origin，默认 http://localhost:3000
 *   --limit=<n>      每页拉取数（1-1000），默认 100
 *   --out=<path>     输出文件路径，默认 analytics-export-YYYYMMDD.ndjson
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface AnalyticsRecord {
  friendId: string;
  createdAt: number;
  profileId: string;
  scores: {
    fieldIndependFieldDepend: number;
    wholisticAnalytic: number;
    exploratoryDirected: number;
    impulsiveReflective: number;
  };
  reportVersion: string;
  rawAnswers?: Record<number, number>;
  analyticsConsent?: boolean;
}

interface ExportPageResponse {
  records: AnalyticsRecord[];
  cursor: string | null;
  count: number;
  prefix?: string;
}

function parseArgs(argv: string[]): {
  origin: string;
  limit: number;
  outPath: string;
} {
  const args = argv.slice(2);
  let origin = 'http://localhost:3000';
  let limit = 100;
  let outPath = '';

  for (const arg of args) {
    if (arg.startsWith('--origin=')) {
      origin = arg.slice('--origin='.length).replace(/\/+$/, '');
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.slice('--limit='.length), 10);
      if (Number.isNaN(limit) || limit < 1 || limit > 1000) {
        throw new Error(`--limit 必须为 1-1000 的整数，收到: ${arg}`);
      }
    } else if (arg.startsWith('--out=')) {
      outPath = arg.slice('--out='.length);
    }
  }

  if (!outPath) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    outPath = `analytics-export-${date}.ndjson`;
  }

  return { origin, limit, outPath };
}

async function fetchPage(
  origin: string,
  secret: string,
  limit: number,
  cursor?: string
): Promise<ExportPageResponse> {
  const url = new URL('/api/analytics-export', origin);
  url.searchParams.set('limit', String(limit));
  if (cursor) url.searchParams.set('cursor', cursor);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }

  return (await response.json()) as ExportPageResponse;
}

async function main(): Promise<void> {
  const secret = process.env.ANALYTICS_EXPORT_SECRET;
  if (!secret || secret.length < 16) {
    console.error('错误：环境变量 ANALYTICS_EXPORT_SECRET 缺失或长度不足 16');
    console.error('请在 EdgeOne Pages 控制台设置同名环境变量，并本地导出后运行本脚本。');
    process.exit(1);
  }

  const { origin, limit, outPath } = parseArgs(process.argv);
  console.log(`开始导出：origin=${origin} limit=${limit}`);

  const allRecords: AnalyticsRecord[] = [];
  let cursor: string | undefined = undefined;
  let pageIndex = 0;
  let totalSkipped = 0;

  while (true) {
    pageIndex += 1;
    const page = await fetchPage(origin, secret, limit, cursor);
    console.log(
      `  页 ${pageIndex}: 拉取 ${page.count} 条，cursor=${page.cursor ? '(有后续)' : '(结束)'}`
    );

    for (const record of page.records) {
      // 仅保留同意且含 rawAnswers 的记录
      if (record.analyticsConsent !== true) {
        totalSkipped += 1;
        continue;
      }
      if (!record.rawAnswers || Object.keys(record.rawAnswers).length === 0) {
        totalSkipped += 1;
        continue;
      }
      allRecords.push(record);
    }

    if (!page.cursor) break;
    cursor = page.cursor;

    // 安全上限：避免异常情况下无限循环
    if (pageIndex > 1000) {
      console.warn('已拉取超过 1000 页，强制停止');
      break;
    }
  }

  console.log(`\n导出完成：有效 ${allRecords.length} 条，跳过 ${totalSkipped} 条`);

  // 写入 NDJSON（每行一条 JSON）
  const lines = allRecords.map((r) => JSON.stringify(r));
  const absPath = resolve(process.cwd(), outPath);
  writeFileSync(absPath, lines.join('\n') + (lines.length > 0 ? '\n' : ''), 'utf8');
  console.log(`已写入: ${absPath}`);

  // 简要统计
  if (allRecords.length > 0) {
    const profileCount = new Set(allRecords.map((r) => r.profileId)).size;
    const dateMin = new Date(Math.min(...allRecords.map((r) => r.createdAt))).toISOString();
    const dateMax = new Date(Math.max(...allRecords.map((r) => r.createdAt))).toISOString();
    console.log(`\n=== 摘要 ===`);
    console.log(`  样本数: ${allRecords.length}`);
    console.log(`  身份数: ${profileCount}`);
    console.log(`  时间范围: ${dateMin} ~ ${dateMax}`);
  }
}

main().catch((err) => {
  console.error('导出失败:', err);
  process.exit(1);
});
