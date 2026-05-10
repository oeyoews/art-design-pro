import { defineEventHandler } from 'h3'
import { handleUserInfo } from '#mock-handlers'

export default defineEventHandler(() => handleUserInfo())
