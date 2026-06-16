import {
  DUAL_REPORT_ENDPOINTS,
  type ApiErrorResponse,
  type CompatibilityReport,
  type CreateCompatibilityReportRequest,
  type CreatePublicShareRequest,
  type CreatePublicShareResponse,
  type FeedbackRating,
  type PublicCompatibilityReport,
  type SubmitFeedbackRequest,
  type SubmitFeedbackResponse,
} from '../contracts/dualReport';

const RETRY_DELAYS_MS = [1000, 2000, 4000];

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return !!value && typeof value === 'object' && 'error' in value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createCompatibilityReport(
  request: CreateCompatibilityReportRequest
): Promise<CompatibilityReport> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await fetch(DUAL_REPORT_ENDPOINTS.createCompatibilityReport, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json().catch(() => null);
      if (response.ok) {
        return data as CompatibilityReport;
      }

      const message = isApiErrorResponse(data)
        ? data.error
        : '互补报告生成失败，请稍后重试。';

      const shouldRetryNotFound =
        response.status === 404 && attempt < RETRY_DELAYS_MS.length;

      if (shouldRetryNotFound) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      throw new Error(message);
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error('互补报告生成失败，请稍后重试。');
      lastError = normalizedError;

      const isLikelyNetworkError =
        normalizedError instanceof TypeError && attempt < RETRY_DELAYS_MS.length;

      if (isLikelyNetworkError) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      break;
    }
  }

  throw lastError || new Error('互补报告生成失败，请稍后重试。');
}

export async function submitFeedback(
  request: SubmitFeedbackRequest
): Promise<SubmitFeedbackResponse> {
  const response = await fetch(DUAL_REPORT_ENDPOINTS.submitFeedback, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (isApiErrorResponse(data)) {
      throw new Error(data.error);
    }
    throw new Error('反馈提交失败');
  }

  return response.json();
}

export async function createPublicShare(
  request: CreatePublicShareRequest
): Promise<CreatePublicShareResponse> {
  const response = await fetch(DUAL_REPORT_ENDPOINTS.createPublicShare, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorResponse(data)) {
      throw new Error(data.error);
    }
    throw new Error('公开分享生成失败，请稍后重试。');
  }

  return data as CreatePublicShareResponse;
}

export async function getPublicCompatibilityReport(
  token: string
): Promise<PublicCompatibilityReport> {
  const path = DUAL_REPORT_ENDPOINTS.readPublicShare.replace(':token', encodeURIComponent(token));
  const response = await fetch(path);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiErrorResponse(data)) {
      throw new Error(data.error);
    }
    throw new Error('公开分享报告读取失败，请稍后重试。');
  }

  return data as PublicCompatibilityReport;
}
