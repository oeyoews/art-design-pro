import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNitroConfig } from 'nitropack/config'

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

process.env.COMPATIBILITY_DATE = new Date().toISOString()

export default defineNitroConfig({
  alias: {
    '@': resolve(workspaceRoot, 'src'),
    '#mock-handlers': resolve(workspaceRoot, 'mock/api-handlers.ts')
  }
  // 跨域见 middleware/00-cors.ts（处理 OPTIONS 预检，且避免 Allow-Credentials 与 * 冲突）
})
