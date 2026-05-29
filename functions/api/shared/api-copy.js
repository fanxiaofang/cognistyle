export const SHARED_COPY = {
  'zh-CN': {
    errors: {
      storageMissing: '结果存储未配置，请先绑定 KV。',
      rateLimited: '请求过于频繁，请稍后重试。',
      methodNotAllowed: 'Method Not Allowed',
      requestBodyMustBeObject: '请求体必须为 JSON 对象。',
      jsonParseFailed: '请求体 JSON 解析失败',
      internalError: '服务器内部错误',
      resultNotFound: '未找到该结果，可能已过期或已删除。',
      shareNotFound: '公开分享报告不存在或已过期。',
      invalidResultForShare: '用于分享的结果不存在，可能已过期，请重新生成。',
      selfPairShare: '不能对自己的结果生成公开互补分享。',
      invalidToken: '分享 token 非法。',
      deleteTokenInvalid: '删除凭证无效，无法删除该结果。',
    },
  },
};

export function getSharedCopy(locale = 'zh-CN') {
  return SHARED_COPY[locale] || SHARED_COPY['zh-CN'];
}
