import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { env } from '@typebot.io/env'

export const createAgentBot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/neoleads/agentbot/create',
      protect: true,
      summary:
        'Create agent bot in neoleads with inbox',
      tags: ['Neoleads'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      inboxIds: z.array(z.number()),
    })
  )
  .output(
    z.object({
      agentbotId: z.number(),
    })
  )
  .mutation(
    async ({ input: { typebotId, inboxIds }, ctx: { user } }) => {

      const account = await prisma.account.findFirst({
        where: {userId: user.id},
        select: { providerAccountId: true, access_token: true },
      })

      if (!account?.access_token)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Account not found',
        })

      let response;
      try {
        const typebot = await prisma.typebot.findFirst({
          where: { id: typebotId },
        })
        let url = `${env.NEOLEADS_OAUTH_URL}/api/v1/accounts/${account.providerAccountId}/agent_bots`
        let method = 'POST'
        if (typebot?.agentbot){
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          url = `${env.NEOLEADS_OAUTH_URL}/api/v1/accounts/${account.providerAccountId}/agent_bots/${typebot.agentbot.id}`
          method = 'PUT'
        }

        response = await fetch(url,
          {
            method: method,
            headers: {
              "content-type": "application/json",
              "api_access_token": account.access_token,
            },
            body: JSON.stringify({
              name: typebotId,
              description: "Typebot description",
              outgoing_url: env.NEXT_PUBLIC_VIEWER_URL + "/neoleads/callback",
              inboxes: inboxIds
            })
          });

        response = await response.json();

        await prisma.typebot.update({
          where: { id: typebotId },
          data: {
            agentbot: {
              id: response.id,
              inboxes: inboxIds
            }
          }
        });

      } catch (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Failed fetching data from Neoleads endpoint',
        });
      }
      return {
        agentbotId: response.id,
      }
    }
  )
