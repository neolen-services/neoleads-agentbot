import { z } from 'zod';

const browserSchema = z.object({
  device_name: z.string().nullable(),
  browser_name: z.string().nullable(),
  platform_name: z.string().nullable(),
  browser_version: z.string().nullable(),
  platform_version: z.string().nullable(),
});

const additionalAttributesSchema = z.object({
  browser: browserSchema.optional(),
  referer: z.string().nullable(),
  initiated_at: z.object({
    timestamp: z.string().nullable(),
  }).optional(),
  browser_language: z.string().nullable(),
});

const contactInboxSchema = z.object({
  id: z.number().nullable(),
  contact_id: z.number().nullable(),
  inbox_id: z.number().nullable(),
  source_id: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  hmac_verified: z.boolean().nullable(),
  pubsub_token: z.string().nullable(),
});

const messageSchema = z.object({
  id: z.number().nullable(),
  content: z.string().nullable(),
  account_id: z.number().nullable(),
  inbox_id: z.number().nullable(),
  conversation_id: z.number().nullable(),
  message_type: z.number().nullable(),
  created_at: z.union([z.number(), z.string()]).nullable(),
  updated_at: z.string().nullable(),
  private: z.boolean().nullable(),
  status: z.string().nullable(),
  source_id: z.string().nullable(),
  content_type: z.string().nullable(),
  content_attributes: z.record(z.unknown()).nullable(),
  sender_type: z.string().nullable(),
  sender_id: z.number().nullable(),
  external_source_ids: z.record(z.unknown()).nullable(),
  additional_attributes: z.record(z.unknown()).nullable(),
  processed_message_content: z.string().nullable(),
  sentiment: z.record(z.unknown()).nullable(),
  conversation: z.object({
    assignee_id: z.number().nullable(),
    unread_count: z.number().nullable(),
    last_activity_at: z.number().nullable(),
    contact_inbox: z.object({
      source_id: z.string().nullable(),
    }).optional(),
  }).optional(),
  sender: z.object({
    additional_attributes: z.record(z.unknown()).nullable(),
    custom_attributes: z.record(z.unknown()).nullable(),
    email: z.string().nullable(),
    id: z.number().nullable(),
    identifier: z.string().nullable(),
    name: z.string().nullable(),
    phone_number: z.string().nullable(),
    thumbnail: z.string().nullable(),
    type: z.string().nullable(),
  }).optional(),
});

const accountSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
});

const conversationSchema = z.object({
  additional_attributes: additionalAttributesSchema.optional(),
  can_reply: z.boolean().nullable(),
  channel: z.string().nullable(),
  contact_inbox: contactInboxSchema.optional(),
  id: z.number(),
  inbox_id: z.number().nullable(),
  messages: z.array(messageSchema).optional(),
  labels: z.array(z.unknown()).optional(),
  meta: z.object({
    sender: z.object({
      additional_attributes: z.record(z.unknown()).nullable(),
      custom_attributes: z.record(z.unknown()).nullable(),
      email: z.string().nullable(),
      id: z.number().nullable(),
      identifier: z.string().nullable(),
      name: z.string().nullable(),
      phone_number: z.string().nullable(),
      thumbnail: z.string().nullable(),
      type: z.string().nullable(),
    }).optional(),
    assignee: z.unknown().nullable(),
    team: z.unknown().nullable(),
    hmac_verified: z.boolean().nullable(),
  }).optional(),
  status: z.string().nullable(),
  custom_attributes: z.record(z.unknown()).nullable(),
  snoozed_until: z.unknown().nullable(),
  unread_count: z.number().nullable(),
  first_reply_created_at: z.unknown().nullable(),
  priority: z.unknown().nullable(),
  waiting_since: z.number().nullable(),
  agent_last_seen_at: z.number().nullable(),
  contact_last_seen_at: z.number().nullable(),
  timestamp: z.number().nullable(),
  created_at: z.number().nullable(),
});

export const neoleadsWebhookSchema = z.object({
  account: accountSchema,
  additional_attributes: z.record(z.unknown()).nullable(),
  content_attributes: z.record(z.unknown()).nullable(),
  content_type: z.string().nullable(),
  content: z.string().nullable(),
  conversation: conversationSchema.optional(),
  current_conversation: conversationSchema.optional(),
  created_at: z.string().nullable(),
  id: z.number().nullable(),
  inbox: z.object({
    id: z.number(),
    name: z.string().nullable(),
  }).optional(),
  message_type: z.string().nullable(),
  private: z.boolean().nullable(),
  sender: z.object({
    account: accountSchema.optional(),
    additional_attributes: z.record(z.unknown()).nullable(),
    avatar: z.string().nullable(),
    custom_attributes: z.record(z.unknown()).nullable(),
    email: z.string().nullable(),
    id: z.number().nullable(),
    identifier: z.string().nullable(),
    name: z.string().nullable(),
    phone_number: z.string().nullable(),
    thumbnail: z.string().nullable(),
  }).optional(),
  source_id: z.string().nullable(),
  event: z.string(),
});

// Define individual building blocks
const selectItemSchema = z.object({
  title: z.string(),
  value: z.string(),
});

const formItemBaseSchema = z.object({
  name: z.string(),
  placeholder: z.string().optional(),
  type: z.string(),
  label: z.string(),
  default: z.string().optional(),
});

const formItemSelectSchema = formItemBaseSchema.merge(
  z.object({
    options: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    ),
  })
);

const formItemSchema = z.union([
  formItemBaseSchema,
  formItemSelectSchema,
]);

const cardItemActionSchema = z.object({
  type: z.string(),
  text: z.string(),
  uri: z.string().optional(),
  payload: z.string().optional(),
});

const cardItemSchema = z.object({
  media_url: z.string(),
  title: z.string(),
  description: z.string(),
  actions: z.array(cardItemActionSchema),
});

const articleItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  link: z.string(),
});

// Main response schema
const neoleadsContentResponseSchema = z.array(z.object({
  content: z.string(),
  content_type: z.string(),
  content_attributes: z.object({
    items: z.array(
      z.union([
        selectItemSchema,
        formItemSchema,
        cardItemSchema,
        articleItemSchema,
      ])
    ),
  }).optional(),
  private: z.boolean(),
}).optional());


export type neoleadsWebhookInput = z.infer<typeof neoleadsWebhookSchema>
export type neoleadsContentResponseOutput = z.infer<typeof neoleadsContentResponseSchema>
