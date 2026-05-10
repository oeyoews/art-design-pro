import {
  defineEventHandler,
  getHeader,
  getMethod,
  sendNoContent,
  setHeader
} from 'h3'

const ALLOW_HEADERS =
  'Accept, Authorization, Content-Length, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-CSRF-TOKEN, X-Requested-With'

export default defineEventHandler((event) => {
  const origin = getHeader(event, 'origin')

  // 浏览器不允许 credentials 与 * 同时出现；有 Origin 时回显并允许凭证（与前端 dev 跨端口一致）
  if (origin) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')
  } else {
    setHeader(event, 'Access-Control-Allow-Origin', '*')
  }

  setHeader(
    event,
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  )
  setHeader(event, 'Access-Control-Allow-Headers', ALLOW_HEADERS)
  setHeader(event, 'Access-Control-Expose-Headers', '*')

  if (getMethod(event) === 'OPTIONS') {
    return sendNoContent(event, 204)
  }
})
