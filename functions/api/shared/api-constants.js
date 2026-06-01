export const API_VERSIONS = {
  QUESTION_VERSION: 'questions-general-2026-06',
  SNAPSHOT_VERSION: 'snapshot-v1',
  COMPATIBILITY_REPORT_VERSION: 'compatibility-v1',
  PUBLIC_SHARE_VERSION: 'public-share-v1',
  DUAL_HISTORY_VERSION: 'history-v1',
};

export const KV_KEY_PREFIXES = {
  RESULT: 'result:',
  SHARE: 'share:',
  HISTORY: 'history:',
  RATE_LIMIT: {
    COMPATIBILITY: 'rate-limit:compatibility:',
    SHARE_REPORT: 'rate-limit:share-report:',
    SHARE_READ: 'rate-limit:share-read:',
    RESULTS: 'rate-limit:results:',
    RESULTS_DELETE: 'rate-limit:results-delete:',
    HISTORY_READ: 'rate-limit:history-read:',
    HISTORY_WRITE: 'rate-limit:history-write:',
    HISTORY_DELETE: 'rate-limit:history-delete:',
  },
};

export const DEFAULT_RATE_LIMIT = {
  WINDOW_SECONDS: 60,
  COMPATIBILITY_MAX: 30,
  SHARE_REPORT_MAX: 20,
  SHARE_READ_MAX: 60,
  RESULTS_MAX: 10,
  RESULTS_DELETE_MAX: 5,
  HISTORY_READ_MAX: 30,
  HISTORY_WRITE_MAX: 10,
  HISTORY_DELETE_MAX: 5,
  MAX_HISTORY_ENTRIES: 50,
  SYNC_QUEUE_MAX: 20,
  SYNC_QUEUE_STALE_DAYS: 7,
};

export const TTL = {
  SNAPSHOT_SECONDS: 90 * 24 * 60 * 60,
  SHARE_SECONDS: 7 * 24 * 60 * 60,
};

export const VALIDATION_RULES = {
  FRIEND_ID_MIN_LENGTH: 6,
  FRIEND_ID_MAX_LENGTH: 32,
  SHARE_TOKEN_MIN_LENGTH: 8,
  DELETE_TOKEN_MIN_LENGTH: 16,
  NORMALIZED_SCORE_MIN: 0,
  NORMALIZED_SCORE_MAX: 1,
  DISPLAY_MAX_LENGTH: 50,
  AVATAR_MAX_LENGTH: 10,
  PROFILE_ID_MAX_LENGTH: 20,
  BODY_MAX_SIZE_BYTES: 1024 * 64,
};

export const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
};

export const COMMON_HEADERS_GET = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type',
  'X-Content-Type-Options': 'nosniff',
};
