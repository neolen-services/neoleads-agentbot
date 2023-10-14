import { sendMessage } from '@/features/chat/api/sendMessage'
import { whatsAppRouter } from '@/features/whatsapp/api/router'
import { router } from '../../trpc'
import { updateTypebotInSession } from '@/features/chat/api/updateTypebotInSession'
import { getUploadUrl } from '@/features/fileUpload/api/deprecated/getUploadUrl'
import { generateUploadUrl } from '@/features/fileUpload/api/generateUploadUrl'
import {neoleadsWebhook} from "@/features/neoleads/webhook/neoleadsWebhook";

export const appRouter = router({
  sendMessage,
  neoleadsWebhook,
  getUploadUrl,
  generateUploadUrl,
  updateTypebotInSession,
  whatsAppRouter,
})

export type AppRouter = typeof appRouter
