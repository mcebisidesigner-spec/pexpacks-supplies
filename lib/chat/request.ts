import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_200),
}).strict();

export const PexChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(12),
  context: z.object({ pathname: z.string().startsWith("/").max(250).optional() }).strict().optional(),
}).strict();

export type PexChatRequest = z.infer<typeof PexChatRequestSchema>;

export function latestPexUserMessage(request: PexChatRequest): string {
  return [...request.messages].reverse().find((message) => message.role === "user")?.content ?? "";
}