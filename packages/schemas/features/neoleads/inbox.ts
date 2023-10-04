import { z } from 'zod';

const WorkingHourSchema = z.object({
  day_of_week: z.number().optional(),
  closed_all_day: z.boolean().optional(),
  open_hour: z.number().nullable().optional(),
  open_minutes: z.number().nullable().optional(),
  close_hour: z.number().nullable().optional(),
  close_minutes: z.number().nullable().optional(),
  open_all_day: z.boolean().optional(),
});

const PreChatFieldSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  label: z.string().optional(),
  enabled: z.boolean().optional(),
  required: z.boolean().optional(),
  field_type: z.string().optional(),
});

const PreChatFormOptionSchema = z.object({
  pre_chat_fields: z.array(PreChatFieldSchema).optional(),
  pre_chat_message: z.string().optional(),
});

export const inboxSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar_url: z.string().optional(),
  channel_id: z.number().optional(),
  channel_type: z.string().optional(),
  greeting_enabled: z.boolean().optional(),
  greeting_message: z.string().optional(),
  working_hours_enabled: z.boolean().optional(),
  enable_email_collect: z.boolean().optional(),
  csat_survey_enabled: z.boolean().optional(),
  enable_auto_assignment: z.boolean().optional(),
  auto_assignment_config: z.record(z.any()).optional(),
  out_of_office_message: z.string().nullable().optional(),
  working_hours: z.array(WorkingHourSchema).optional(),
  timezone: z.string().optional(),
  callback_webhook_url: z.string().nullable().optional(),
  allow_messages_after_resolved: z.boolean().optional(),
  lock_to_single_conversation: z.boolean().optional(),
  sender_name_type: z.string().optional(),
  business_name: z.string().nullable().optional(),
  widget_color: z.string().optional(),
  website_url: z.string().optional(),
  hmac_mandatory: z.boolean().optional(),
  welcome_title: z.string().optional(),
  welcome_tagline: z.string().optional(),
  web_widget_script: z.string().optional(),
  website_token: z.string().optional(),
  selected_feature_flags: z.array(z.string()).optional(),
  reply_time: z.string().optional(),
  hmac_token: z.string().optional(),
  pre_chat_form_enabled: z.boolean().optional(),
  pre_chat_form_options: PreChatFormOptionSchema.optional(),
  continuity_via_email: z.boolean().optional(),
  messaging_service_sid: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
});
