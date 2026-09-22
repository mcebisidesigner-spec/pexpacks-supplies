import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamObject, generateObject } from "ai";
import { chatResponseSchema } from "@/lib/schemas/chat";
import { pexTools } from "@/lib/chat/tools";
import { buildPexReply, PexChatResponseSchema, resolvePexIntent, PexIntent } from "@/lib/chat/pex";
import { latestPexUserMessage, PexChatRequestSchema, type PexChatRequest } from "@/lib/chat/request";
import { getPexLiveCards } from "@/lib/chat/live-data";
import { getPexKnowledgeCards } from "@/lib/chat/knowledge";
import { isSameOriginRequest, rateLimitRequest } from "@/lib/security/requestGuards";

export const maxDuration = 30; // Prevents serverless timeout
export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are "Bro Pex", the authentic, hyper-competent AI shopping coordinator for Pexpacks Supplies in South Africa.

CORE BEHAVIOR:
- READ INTENT OVER TYPOS: Phonetically decode informal phrasing, typos, and abbreviations (e.g., "st bents" -> St Benedict's, "covr" -> Pexcover, "st marys klrkdrp" -> St Mary's Klerksdorp). Never point out spelling errors or ask "did you mean".
- MULTI-INTENT RESOLUTION: Address every part of compound inquiries sequentially and clearly (e.g., price + covering + delivery).
- ONE GREETING RULE: If greeting was already delivered, NEVER say "Hi", "Hello", or re-introduce your name. Lead directly with the immediate answer.
- CONVERSATIONAL FLOW: Sound pragmatic, supportive, and grounded with natural South African warmth. No robotic filler like "Certainly!" or "Great question!".
- ACTION ORIENTED: Always provide logical forward steps using structured cards and quickReplies.

Allowed system intents: greeting, general_help, find_school, find_school_pack, upload_stationery_list, product_search, pexcover_information, delivery_information, order_tracking, payment_information, checkout_help, human_support, school_partnership, compound_query, entity_correction, implicit_entity_query, unknown_intent.
`;

function hasPriorGreeting(messages: Array<{ role?: string; sender?: string; content: string }>): boolean {
  return messages.some(
    (m) => (m.role === "assistant" || m.sender === "model" || m.sender === "assistant") &&
      /^(?:hi|hello|welcome|howzit|sawubona)/i.test(m.content),
  );
}

function summarizePriorTurns(
  messages: Array<{ role?: string; sender?: string; content: string }>,
  existingSummary?: string,
): string | undefined {
  if (messages.length <= 8) return existingSummary;

  const olderMessages = messages.slice(0, messages.length - 8);
  const userQueries = olderMessages
    .filter((m) => m.role === "user" || m.sender === "user")
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
    const rawBody = await request.json();

    // Support both schema formats: { messages, context } and { message, history, sessionState }
    let query = "";
    let historyList: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
    let pathname = "/";
    let greetingGiven = false;
    let entities: Record<string, unknown> | undefined = undefined;
    let contextSummary: string | undefined = undefined;
    let activeSession: Record<string, unknown> | undefined = undefined;

    if ("messages" in rawBody && Array.isArray(rawBody.messages)) {
      const parsedLegacy = PexChatRequestSchema.safeParse(rawBody);
      if (!parsedLegacy.success) {
        return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
      }
      historyList = parsedLegacy.data.messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      query = latestPexUserMessage(parsedLegacy.data);
      pathname = parsedLegacy.data.context?.pathname ?? "/";
      greetingGiven = Boolean(parsedLegacy.data.context?.greetingGiven);
      entities = parsedLegacy.data.context?.entities;
      contextSummary = parsedLegacy.data.context?.contextSummary;
      activeSession = parsedLegacy.data.context?.activeSession;
    } else if ("message" in rawBody && typeof rawBody.message === "string") {
      const trimmed = rawBody.message.trim();
      if (!trimmed || trimmed.length > 1200) {
        return NextResponse.json({ error: "Invalid message length." }, { status: 400 });
      }
      query = trimmed;
      const historyRaw = Array.isArray(rawBody.history) ? rawBody.history : [];
      historyList = historyRaw.map((h: { sender?: string; role?: string; content: string }) => ({
        role: (h.role === "user" || h.sender === "user") ? ("user" as const) : ("assistant" as const),
        content: String(h.content || ""),
      }));
      activeSession = rawBody.sessionState;
    } else {
      return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
    }

    if (!query) {
      return NextResponse.json({ error: "Message query is required." }, { status: 400 });
    }

    const turnsCount = historyList.length;
    const isFirstTurn = turnsCount <= 1;
    const priorGreetingDetected = greetingGiven || hasPriorGreeting(historyList);
    const resolvedContextSummary = summarizePriorTurns(historyList, contextSummary);

    const isStreaming =
      request.headers.get("accept")?.includes("text/event-stream") ||
      rawBody.stream === true;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY;

    // Vercel AI SDK Integration
    if (apiKey) {
      try {
        const dynamicSystem = `
          ${SYSTEM_PROMPT}

          RUNTIME SESSION TELEMETRY:
          - Turn Count: ${turnsCount}
          - Greeting Already Delivered: ${priorGreetingDetected || !isFirstTurn}
          - Known Session Context: ${JSON.stringify(activeSession || {})}
        `;

        const messagesForAi = [
          ...historyList.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user" as const, content: query },
        ];

        // 1. Streaming response for useObject / streamObject clients
        if (isStreaming) {
          const streamResult = streamObject({
            model: google("gemini-2.5-flash"),
            schema: chatResponseSchema,
            system: dynamicSystem,
            messages: messagesForAi,
          });
          return streamResult.toTextStreamResponse();
        }

        // 2. Direct validated object response via generateObject
        const genResult = await generateObject({
          model: google("gemini-2.5-flash"),
          schema: chatResponseSchema,
          system: dynamicSystem,
          messages: messagesForAi,
        });

        const resolvedIntent = (genResult.object.intent as PexIntent) || (await resolvePexIntent(query, activeSession as never));

        const [liveCards, knowledgeCards] = await Promise.all([
          getPexLiveCards(resolvedIntent, query),
          getPexKnowledgeCards(query, pathname),
        ]);

        const mappedActions = (genResult.object.cards || []).flatMap((c) =>
          (c.actions || []).map((a, idx) => ({
            id: `card-action-${idx}`,
            label: a.label,
            description: a.label,
            href: a.url,
          }))
        );

        return NextResponse.json(
          {
            ...genResult.object,
            text: genResult.object.reply,
            intent: resolvedIntent,
            actions: mappedActions.length > 0 ? mappedActions : [{ id: "open-tray", label: "Open order tray", description: "Review saved packs", href: "/checkout" }],
            handoffRecommended: resolvedIntent === "human_support",
            entities,
            contextSummary: resolvedContextSummary,
            activeSession,
            ...liveCards,
            knowledgeCards,
          },
          {
            status: 200,
            headers: { "Cache-Control": "private, no-store" },
          }
        );
      } catch (aiError) {
        console.warn("[pex-chat] Vercel AI SDK generateObject failed, using deterministic engine:", aiError);
      }
    }

    // 3. Fallback deterministic path (offline / tests / fallback)
    const intent = await resolvePexIntent(query, activeSession as never);
    const [liveCards, knowledgeCards] = await Promise.all([
      getPexLiveCards(intent, query),
      getPexKnowledgeCards(query, pathname),
    ]);
    const previousAssistantText = historyList
      .slice()
      .reverse()
      .find((m) => m.role === "assistant")?.content;

    const reply = buildPexReply(query, intent, {
      previousAssistantText,
      greetingGiven: priorGreetingDetected,
      entities: entities as never,
      contextSummary: resolvedContextSummary,
      activeSession: activeSession as never,
    });

    const standardQuickReplies = reply.quickReplies.map((qr) => ({
      id: qr.id,
      label: qr.label,
      message: qr.message,
      query: qr.message,
    }));

    const result = {
      ...reply,
      reply: reply.text,
      quickReplies: standardQuickReplies,
      cards: [],
      ...liveCards,
      knowledgeCards,
    };

    return NextResponse.json(
      PexChatResponseSchema.parse(result),
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    console.error("[pex-chat] Request error:", error);
    return NextResponse.json(
      {
        reply: "Eish, my connection stuttered for a second. Drop your message again or ping us on WhatsApp below.",
        text: "Eish, my connection stuttered for a second. Drop your message again or ping us on WhatsApp below.",
        intent: "human_support",
        actions: [],
        quickReplies: [
          { id: "qr-retry", label: "Try again", query: "Can you help me?" },
          { id: "qr-whatsapp", label: "WhatsApp Support", query: "I want to chat on WhatsApp" },
        ],
        handoffRecommended: true,
      },
      { status: 200, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
