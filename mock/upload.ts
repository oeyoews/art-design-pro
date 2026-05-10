import type { MockMethod } from 'vite-plugin-mock'
import { handleCommonUpload, handleWangEditorUpload } from './api-handlers'

export default [
  {
    url: '/api/common/upload',
    method: 'post',
    response: () => handleCommonUpload()
  },
  {
    url: '/api/common/upload/wangeditor',
    method: 'post',
    response: () => handleWangEditorUpload()
  }
] as MockMethod[]
