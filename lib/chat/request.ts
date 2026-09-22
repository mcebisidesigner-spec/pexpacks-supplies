import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_200),
}).strict();

export const PexEntitiesSchema = z
  .object({
    school: z.string().max(120).optional(),
    grade: z.string().max(40).optional(),
    pexcover: z.boolean().optional(),
    deliveryLocation: z.string().max(120).optional(),
    deliveryMethod: z.enum(["courier", "school_drop", "paxi"]).optional(),
  })
  .partial();

export type PexEntities = z.infer<typeof PexEntitiesSchema>;

export const ActiveSessionEntitiesSchema = z
  .object({
    schoolName: z.string().max(120).optional(),
    grade: z.string().max(40).optional(),
    serviceAddons: z.array(z.string().max(40)).default([]),
    deliveryMethod: z.enum(["courier", "school_drop", "paxi"]).optional(),
    deliveryLocation: z.string().max(120).optional(),
  })
  .partial();

export type ActiveSessionEntities = z.infer<typeof ActiveSessionEntitiesSchema>;

export const ActiveSessionSchema = z
  .object({
    turnsCount: z.number().int().nonnegative().default(1),
    greetingDelivered: z.boolean().default(false),
    sentiment: z.enum(["neutral", "frustrated", "confused"]).default("neutral"),
    knownEntities: ActiveSessionEntitiesSchema.default({}),
    unresolvedQuestions: z.array(z.string().max(200)).default([]),
    recentTopicsDiscussed: z.array(z.string().max(80)).default([]),
  })
  .partial();

export type ActiveSession = z.infer<typeof ActiveSessionSchema>;

export const PexChatRequestContextSchema = z
  .object({
    pathname: z.string().startsWith("/").max(250).optional(),
    greetingGiven: z.boolean().optional(),
    entities: PexEntitiesSchema.optional(),
    contextSummary: z.string().max(800).optional(),
    activeSession: ActiveSessionSchema.optional(),
  })
  .strict();

export type PexChatRequestContext = z.infer<typeof PexChatRequestContextSchema>;

export const PexChatRequestSchema = z
  .object({
    messages: z.array(MessageSchema).min(1).max(24),
    context: PexChatRequestContextSchema.optional(),
  })
  .strict();

export type PexChatRequest = z.infer<typeof PexChatRequestSchema>;

export function latestPexUserMessage(request: PexChatRequest): string {
  return [...request.messages].reverse().find((message) => message.role === "user")?.content ?? "";
}