import { router } from '@/helpers/server/trpc'
import { listInboxes } from './inbox'
import {createAgentBot} from "@/features/neoleads/api/agentbot";


export const neoleadsRouter = router({
  listInboxes,
  createAgentBot
})
