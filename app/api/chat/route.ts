import { NextRequest, NextResponse } from "next/server";
import { buildPexReply, PexChatResponseSchema, resolvePexIntent } from "@/lib/chat/pex";
import { latestPexUserMessage, PexChatRequestSchema, type PexChatRequest } from "@/lib/chat/request";
import { getPexLiveCards } from "@/lib/chat/live-data";
import { getPexKnowledgeCards } from "@/lib/chat/knowledge";
import { isSameOriginRequest, rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

function hasPriorGreeting(messages: PexChatRequest["messages"]): boolean {
  return messages.some(
    (m) => m.role === "assistant" && /^(?:hi|hello|welcome|howzit|sawubona)/i.test(m.content),
  );
}

function summarizePriorTurns(
  messages: PexChatRequest["messages"],
  existingSummary?: string,
): string | undefined {
  if (messages.length <= 8) return existingSummary;

  const olderMessages = messages.slice(0, messages.length - 8);
  const userQueries = olderMessages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .slice(-3)
    .join(" | ");

  if (!userQueries) return existingSummary;

  const combined = existingSummary
    ? `${existingSummary}; Earlier: ${userQueries}`
    : `Earlier topics: ${userQueries}`;

  return combined.slice(0, 500);
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const limit = await rateLimitRequest(request, { keyPrefix: "pex-chat", windowMs: 5 * 60 * 1000, max: 30 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Bro Pex is receiving too many messages. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const payload = PexChatRequestSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
    }

    const { messages, context } = payload.data;
    const query = latestPexUserMessage(payload.data);
    const incomingSession = context?.activeSession;
    const intent = await resolvePexIntent(query, incomingSession);
    const [liveCards, knowledgeCards] = await Promise.all([
      getPexLiveCards(intent, query),
      getPexKnowledgeCards(query, context?.pathname),
    ]);
    const previousAssistantText = latestPexAssistantMessage(payload.data);

    // Dialogue history truncation & summarisation
    const greetingGiven =
      context?.greetingGiven ||
      incomingSession?.greetingDelivered ||
      hasPriorGreeting(messages);
    const contextSummary = summarizePriorTurns(messages, context?.contextSummary);

    const reply = buildPexReply(query, intent, {
      previousAssistantText,
      greetingGiven,
      entities: context?.entities,
      contextSummary,
      activeSession: incomingSession,
    });

    return NextResponse.json(
      PexChatResponseSchema.parse({
        ...reply,
        ...liveCards,
        knowledgeCards,
      }),
      {
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    console.error("[pex-chat] Request failed:", error);
    return NextResponse.json(
      { error: "Bro Pex is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}

function latestPexAssistantMessage(request: PexChatRequest) {
  const previous = [...request.messages]
    .reverse()
    .find((message) => message.role === "assistant");
  return previous?.content;
}
