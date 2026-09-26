import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamObject, generateObject, streamText } from "ai";
import { chatResponseSchema } from "@/lib/schemas/chat";
import { pexTools } from "@/lib/chat/tools";
import { buildPexReply, detectPexIntent, extractPexEntities, PEX_INTENTS, PexChatResponseSchema, resolvePexIntent, PexIntent } from "@/lib/chat/pex";
import { latestPexUserMessage, PexChatRequestSchema } from "@/lib/chat/request";
import { getPexLiveCards } from "@/lib/chat/live-data";
import { getPexKnowledgeCards } from "@/lib/chat/knowledge";
import { PEX_ROUTES, sanitizePexActions } from "@/lib/chat/links";
import { isSameOriginRequest, rateLimitRequest } from "@/lib/security/requestGuards";

export const maxDuration = 30; // Prevents serverless timeout
export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are "Pex", the authentic, hyper-competent AI shopping coordinator for Pexpacks Supplies in South Africa.

CORE BEHAVIOR:
- READ INTENT OVER TYPOS: Phonetically decode informal phrasing, typos, and abbreviations (e.g., "st bents" -> St Benedict's, "covr" -> Pexcover, "primrose hill" -> Primrose Hill Primary School). Never point out spelling errors or ask "did you mean".
- MULTI-INTENT RESOLUTION: Address every part of compound inquiries sequentially and clearly (e.g., price + covering + delivery).
- ONE GREETING RULE: If greeting was already delivered, NEVER say "Hi", "Hello", or re-introduce your name. Lead directly with the immediate answer.
- CONVERSATIONAL FLOW: Sound pragmatic, supportive, and grounded with natural South African warmth. No robotic filler like "Certainly!" or "Great question!".
- ACTION ORIENTED: Always provide logical forward steps using structured cards and quickReplies.
- HUMAN CONVERSATION: Answer the user's actual question first, then give one clear next step. Use short, warm sentences and natural wording. A simple greeting should receive a warm greeting and an offer to help; a greeting followed by a question should answer the question instead of restarting the conversation.
- BROAD SUPPORT: Handle everyday wording, spelling mistakes, abbreviations, follow-up questions, thanks, confirmations, and multi-part requests. Use the previous messages and session context so the user does not need to repeat themselves.
- UNCERTAINTY: If the request is unclear, ask one focused clarifying question and offer relevant quick replies. Never send the same fallback wording twice in a row. For questions outside Pexpacks, be honest and offer WhatsApp human support.
- UI COPY: Keep reply text concise because navigation is rendered separately in links, cards, and quickReplies. Do not invent order statuses, prices, school listings, or credentials.
- TOOL-GROUNDED ANSWERS: When a question needs a live school, pack, product, or delivery detail, use the available tool or live cards before answering. If the data is unavailable, say so clearly and guide the user to the correct page.
- ANTICIPATE THE NEXT STEP: Notice useful context such as school, grade, learner count, delivery area, or Pexcover interest, and ask only for the one detail needed to continue.

SCHOOL AVAILABILITY QUERIES — CRITICAL:
When a user asks "Do you have [school name]?", "Is [school] on your site?", "Do you offer [school]?" or any school existence question:
1. ALWAYS assume they are asking about stationery packs for that school.
2. ALWAYS reply affirmatively if the school sounds like a real SA school or suburb ("Yes, Primrose Hill Primary is on Pexpacks...").
3. ALWAYS include a direct action card linking to /schools/[slug] where slug = the school name lowercased with hyphens.
4. For suburb names like "Primrose", "Bedfordview", "Germiston", infer the most likely school (e.g., "Primrose Hill Primary School" for Primrose).
5. NEVER respond with "I am not quite sure what you mean" to a school availability question.

HOW TO ORDER QUERIES — CRITICAL:
When a user asks "How do I order?", "How do I get stationery?", "How do I place an order?", "How can I buy a pack?":
1. Answer the process clearly in 2–3 sentences: find your school -> pick grade -> add to cart -> checkout.
2. Include a direct link to /schools to start searching.
3. Mention Upload a List as the fallback if their school isn't listed.

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

function defaultActionsForIntent(intent: PexIntent) {
  switch (intent) {
    case "find_school":
    case "find_school_pack":
      return [{ id: "browse-schools", label: "Find my school", description: "Search schools and grade packs", href: PEX_ROUTES.schools }];
    case "upload_stationery_list":
      return [{ id: "upload-list", label: "Upload a list", description: "Submit a PDF or clear photo of a school list", href: PEX_ROUTES.uploadList }];
    case "pexcover_information":
      return [{ id: "pexcover-guide", label: "Learn about Pexcover", description: "See how book covering works", href: PEX_ROUTES.pexcover }];
    case "delivery_information":
    case "order_tracking":
      return [{ id: "track-order", label: "Track an order", description: "Open Track Your Pack", href: PEX_ROUTES.track }];
    case "payment_information":
    case "checkout_help":
      return [{ id: "checkout", label: "View checkout", description: "Review your order and payment options", href: PEX_ROUTES.checkout }];
    case "school_partnership":
      return [{ id: "partner", label: "Partner with us", description: "See school partnership options", href: PEX_ROUTES.partner }];
    default:
      return [];
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const limit = await rateLimitRequest(request, { keyPrefix: "pex-chat", windowMs: 5 * 60 * 1000, max: 30 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Pex is receiving too many messages. Please try again shortly." },
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
    const detectedIntent = detectPexIntent(query);
    const detectedEntities = extractPexEntities(query, entities as never);
    const knowledgeCards = await getPexKnowledgeCards(query, pathname);
    const previousAssistantText = historyList
      .slice()
      .reverse()
      .find((m) => m.role === "assistant")?.content;
    const sessionReply = buildPexReply(query, detectedIntent, {
      previousAssistantText,
      greetingGiven: priorGreetingDetected,
      entities: detectedEntities,
      contextSummary: resolvedContextSummary,
      activeSession: activeSession as never,
    });
    const nextActiveSession = sessionReply.activeSession;

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
          - Deterministic Intent Hint: ${detectedIntent}
          - Detected Entities: ${JSON.stringify(detectedEntities)}
          - Relevant Published FAQ Knowledge: ${JSON.stringify(knowledgeCards)}
        `;

        const messagesForAi = [
          ...historyList.slice(0, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user" as const, content: query },
        ];

        // 1. Text stream with native tool-calling (useChat / streamText)
        if (rawBody.mode === "text" || rawBody.stream === "text" || rawBody.mode === "chat") {
          const textStreamResult = streamText({
            model: google("gemini-2.5-flash"),
            system: dynamicSystem,
            messages: messagesForAi,
            tools: pexTools,
          });
          return textStreamResult.toTextStreamResponse();
        }

        // 2. Structured streaming response for useObject / streamObject clients
        if (isStreaming) {
          const streamResult = streamObject({
            model: google("gemini-2.5-flash"),
            schema: chatResponseSchema,
            system: dynamicSystem,
            messages: messagesForAi,
          });
          return streamResult.toTextStreamResponse();
        }

        // 3. Direct validated object response via generateObject
        const genResult = await generateObject({
          model: google("gemini-2.5-flash"),
          schema: chatResponseSchema,
          system: dynamicSystem,
          messages: messagesForAi,
        });

        const generatedIntent = genResult.object.intent as PexIntent | undefined;
        const resolvedIntent = generatedIntent && PEX_INTENTS.includes(generatedIntent) ? generatedIntent : detectedIntent;
        const replyText = previousAssistantText?.trim().toLowerCase() === genResult.object.reply.trim().toLowerCase()
          ? sessionReply.text
          : genResult.object.reply;

        const liveCards = await getPexLiveCards(resolvedIntent, query);

        const mappedActions = (genResult.object.cards || []).flatMap((c) =>
          (c.actions || []).map((a, idx) => ({
            id: `card-action-${idx}`,
            label: a.label,
            description: a.label,
            href: a.url,
          }))
        );

        const deterministicActions = sanitizePexActions(sessionReply.actions);
        const modelActions = sanitizePexActions(mappedActions);

        return NextResponse.json(
          {
            ...genResult.object,
            reply: replyText,
            text: replyText,
            intent: resolvedIntent,
            actions: deterministicActions.length > 0
              ? deterministicActions
              : modelActions.length > 0
                ? modelActions
                : defaultActionsForIntent(resolvedIntent),
            handoffRecommended: resolvedIntent === "human_support",
            entities: detectedEntities,
            contextSummary: resolvedContextSummary,
            activeSession: nextActiveSession,
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
    const liveCards = await getPexLiveCards(intent, query);
    const reply = buildPexReply(query, intent, {
      previousAssistantText,
      greetingGiven: priorGreetingDetected,
      entities: detectedEntities,
      contextSummary: resolvedContextSummary,
      activeSession: activeSession as never,
    });

    const groundedReply = reply.intent === "unknown_intent" && knowledgeCards[0]?.answer
      ? knowledgeCards[0].answer
      : reply.text;

    const standardQuickReplies = reply.quickReplies.map((qr) => ({
      id: qr.id,
      label: qr.label,
      message: qr.message,
      query: qr.message,
    }));

    const result = {
      ...reply,
      reply: groundedReply,
      quickReplies: standardQuickReplies,
      text: groundedReply,
      cards: [],
      actions: sanitizePexActions(reply.actions),
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
