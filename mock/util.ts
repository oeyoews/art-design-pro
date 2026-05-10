/** 与业务一致的 HTTP 成功码（见 src/utils/http/status.ts） */
export const MOCK_SUCCESS_CODE = 200

export function ok<T>(data: T, msg = 'ok') {
  return { code: MOCK_SUCCESS_CODE, msg, data }
}
