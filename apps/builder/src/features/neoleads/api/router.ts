import { router } from '@/helpers/server/trpc'
import { listInboxes } from './inbox'


export const neoleadsRouter = router({
  listInboxes,
})
