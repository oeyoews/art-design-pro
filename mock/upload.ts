import type { MockMethod } from 'vite-plugin-mock'
import { ok } from './util'

const placeholderImage = 'https://picsum.photos/id/237/800/600'

export default [
  {
    url: '/api/common/upload',
    method: 'post',
    response: () => ok({ url: placeholderImage })
  },
  {
    url: '/api/common/upload/wangeditor',
    method: 'post',
    response: () => ok({ url: placeholderImage, alt: '', href: '' })
  }
] as MockMethod[]
