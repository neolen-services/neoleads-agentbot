import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { inboxSchema } from '@typebot.io/schemas/features/neoleads/inbox'
import { env } from '@typebot.io/env'

export const listInboxes = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/neoleads/listInboxes',
      protect: true,
      summary: 'List All Inbox',
      tags: ['neoleads'],
    },
  })
  .output(z.object({ inboxes: z.array(inboxSchema) }))
  .query(async ({ctx: { user } }) => {
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
      response = await fetch(`${env.NEOLEADS_OAUTH_URL}/api/v1/accounts/${account.providerAccountId}/inboxes`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "api_access_token": account.access_token,
          },
        });
      response = await response.json();
    } catch (error) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Failed fetching data from Neoleads endpoint',
      });
    }

    return {
      inboxes: response.payload,
    }
  })
