import { publicProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { getSession } from '@typebot.io/bot-engine/queries/getSession'
import { startSession } from '@typebot.io/bot-engine/startSession'
import { saveStateToDatabase } from '@typebot.io/bot-engine/saveStateToDatabase'
import { restartSession } from '@typebot.io/bot-engine/queries/restartSession'
import { continueBotFlow } from '@typebot.io/bot-engine/continueBotFlow'
import {z} from 'zod';
import { isDefined } from '@typebot.io/lib/utils'
import {neoleadsContentResponseOutput, neoleadsWebhookSchema} from "@typebot.io/schemas/features/neoleads/webhook";
import prisma from '@typebot.io/lib/prisma'
import {BubbleBlockType, InputBlockType} from "@typebot.io/schemas";
import {env} from "@typebot.io/env";

// eslint-disable-next-line
function extractTextFromRichText(richText: any) {
  // eslint-disable-next-line
  return richText.map((block: { children: any[] }) => block.children.map(child => child.text).join(' ')).join('\n');
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function convertToNeoleadsOutput(messages, input) {
  const output: neoleadsContentResponseOutput = [];

  for (const message of messages) {
    switch (message.type) {
      case BubbleBlockType.TEXT:
        output.push({
          content: message.content.plainText || extractTextFromRichText(message.content.richText),
          content_type: "text",
          private: false
        });
        break;

      case BubbleBlockType.IMAGE:
        output.push({
          content: "card message",
          content_type: "cards",
          content_attributes: {
            items: [{
              media_url: message.content.url || "",
              title: "",
              description: "",
              actions: [{
                type: "link",
                text: "View More",
                uri: message.content.clickLink?.url || ""
              }]
            }]
          },
          private: false
        });
        break;

      default:
        break;
    }
  }

  // Process input if it's available
  if (input) {
    switch (input.type) {
      case InputBlockType.TEXT:
        output.push({
          content: "form",
          content_type: "form",
          content_attributes: {
            items: [{
              name: "text",
              placeholder: "Please enter text",
              type: "text",
              label: "text",
              default: input.prefilledValue || ""
            }]
          },
          private: false
        });
        break;

      case InputBlockType.CHOICE:
        // eslint-disable-next-line
        const items = input.items.map((item: { content: any }) => {
          return ({
            title: item.content,
            value: item.content
          });
        });
        output.push({
          content: "Select one of the items below",
          content_type: "input_select",
          content_attributes: {
            items: items
          },
          private: false
        });
        break;

      case InputBlockType.EMAIL:
        output.push({
          content: "form",
          content_type: "form",
          content_attributes: {
            items: [{
              name: "email",
              placeholder: "Please enter your email",
              type: "email",
              label: "Email",
              default: input.prefilledValue || ""
            }]
          },
          private: false
        });
        break;

      case InputBlockType.NUMBER:
        output.push({
          content: "form",
          content_type: "form",
          content_attributes: {
            items: [{
              name: "number",
              placeholder: "Please enter a number",
              type: "number",
              label: "Number",
              default: input.prefilledValue || ""
            }]
          },
          private: false
        });
        break;

      case InputBlockType.URL:
        output.push({
          content: "form",
          content_type: "form",
          content_attributes: {
            items: [{
              name: "url",
              placeholder: "Please enter a URL",
              type: "url",
              label: "URL",
              default: input.prefilledValue || ""
            }]
          },
          private: false
        });
        break;

      case InputBlockType.PHONE:
        output.push({
          content: "form",
          content_type: "form",
          content_attributes: {
            items: [{
              name: "phone",
              placeholder: "Please enter a phone number",
              type: "tel",
              label: "Phone",
              default: input.prefilledValue || ""
            }]
          },
          private: false
        });
        break;

      default:
        break;
    }
  }

  return output;
}


export const neoleadsWebhook = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/neoleads/webhook',
      summary: 'Send a message',
      description:
        'To initiate a chat, do not provide a `sessionId` nor a `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.',
    },
  })
  .input(neoleadsWebhookSchema)
  .output(z.object({
    message: z.string()
  }))
  .mutation(
    async ({
      input: {
        event,
        message_type,
        content: message,
        current_conversation,
        conversation,
        inbox,
        account
      },
      ctx: { user },
    }) => {

      // check for event type
      if (!(message_type === 'incoming' || event === 'webwidget_triggered')) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Not Supported Event',
        })
      }

      const conversationId = conversation?.id || current_conversation?.id || 0
      // get the data for sendMessage API
      // eslint-disable-next-line prefer-const,@typescript-eslint/ban-ts-comment
      let {sessionId, typebotId} = await prisma.neoleadsWebhook.findFirst({
        where: {conversationId},
        select: {
          typebotId: true,
          sessionId: true
        }
      }) || {}

      if (!typebotId){
        const result = await prisma.typebot.findFirst({
          where: {
            agentbot: {
              path: ['inboxes'],
              array_contains: inbox?.id.toString()
            }
          }
        });
        if (!result?.publicId){
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Not Found Typebot',
          })
        }
        typebotId = result.publicId
      }

      const startParams = {typebot: typebotId || '0', isOnlyRegistering: false}
      const clientLogs = null

      const session = sessionId ? await getSession(sessionId) : null

      const isSessionExpired =
        session &&
        isDefined(session.state.expiryTimeout) &&
        session.updatedAt.getTime() + session.state.expiryTimeout < Date.now()

      if (isSessionExpired)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session expired. You need to start a new session.',
        })

      let response:  neoleadsContentResponseOutput = [];
      if (!session) {
        if (!startParams)
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Missing startParams',
          })

        const {
          messages,
          input,
          logs,
          clientSideActions,
          newSessionState,
        } = await startSession({ startParams, userId: user?.id })

        const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs

        const session = startParams?.isOnlyRegistering
          ? await restartSession({
              state: newSessionState,
            })
          : await saveStateToDatabase({
              isFirstSave: true,
              session: {
                state: newSessionState,
              },
              input,
              logs: allLogs,
              clientSideActions,
            })


        // save to prisma
        await prisma.neoleadsWebhook.create({
          data: {
            sessionId: session.id,
            typebotId,
            conversationId
          }
        })

        // convert the output
        response = convertToNeoleadsOutput(messages, input)
      } else if (message) {
        const {
          messages,
          input,
          clientSideActions,
          newSessionState,
          logs,
        } = await continueBotFlow(session.state)(message)

        const allLogs = clientLogs ? [...(logs ?? []), ...clientLogs] : logs

        if (newSessionState)
          await saveStateToDatabase({
            session: {
              id: session.id,
              state: newSessionState,
            },
            input,
            logs: allLogs,
            clientSideActions,
          })

        // convert the output
        response = convertToNeoleadsOutput(messages, input)
      }

      // send the output
      for (const message of response) {
        const temp = await fetch(`${env.NEOLEADS_OAUTH_URL}/api/v1/accounts/${account.id}/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "api_access_token": "ucMSLXLP87vUob2pT144VNG4" // todo: It should be agent bot token,
            },
            body: JSON.stringify({
              message_type: 'outgoing',
              ...message,
            })
          });
        console.log(await temp.json())
      }


      return {
        message: 'Success'
      }
    }
  )
