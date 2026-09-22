import { z } from "zod";

export const chatCardActionSchema = z.object({
  label: z.string(),
  url: z.string(),
  variant: z.enum(["primary", "secondary", "outline"]).default("primary"),
});

export const chatCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  badge: z.string().optional(),
  price: z.string().optional(),
  actions: z.array(chatCardActionSchema).default([]),
});

export const chatQuickReplySchema = z.object({
  id: z.string(),
  label: z.string(),
  query: z.string(),
  message: z.string().optional(),
});

export const chatResponseSchema = z.object({
  reply: z
    .string()
    .describe("Conversational, direct, natural response. Never repeat greetings."),
  text: z.string().optional(),
  intent: z.string().optional().default("general_help"),
  cards: z.array(chatCardSchema).optional().default([]),
  quickReplies: z.array(chatQuickReplySchema),
  actions: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string(),
        href: z.string(),
      })
    )
    .optional()
    .default([]),
  handoffRecommended: z.boolean().optional().default(false),
});

export type ChatCardAction = z.infer<typeof chatCardActionSchema>;
export type ChatCard = z.infer<typeof chatCardSchema>;
export type ChatQuickReply = z.infer<typeof chatQuickReplySchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
