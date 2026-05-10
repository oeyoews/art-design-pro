import { defineEventHandler } from 'h3'
import { handleMenus } from '#mock-handlers'

export default defineEventHandler(() => handleMenus())
