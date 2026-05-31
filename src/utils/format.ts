/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function scoreTone(score: number): string {
  if (score >= 75) return 'text-[#39ff14] border-[#39ff14]/40';
  if (score >= 50) return 'text-[#00f0ff] border-[#00f0ff]/40';
  if (score >= 35) return 'text-[#ffe600] border-[#ffe600]/40';
  return 'text-[#ff007f] border-[#ff007f]/40';
}

export function formatExpiry(expiresAt: number): string {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(expiresAt);
  } catch {
    return '';
  }
}

export function formatDate(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  } catch {
    return '';
  }
}
