import { NextRequest, NextResponse } from "next/server";
import { buildPexReply, PexChatResponseSchema, resolvePexIntent } from "@/lib/chat/pex";
import { latestPexUserMessage, PexChatRequestSchema } from "@/lib/chat/request";
import { getPexLiveCards } from "@/lib/chat/live-data";
import { getPexKnowledgeCards } from "@/lib/chat/knowledge";
import { isSameOriginRequest, rateLimitRequest } from "@/lib/security/requestGuards";

export const runtime = "nodejs";

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
    const payload = PexChatRequestSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
    }

    const query = latestPexUserMessage(payload.data);
    const intent = await resolvePexIntent(query);
    const [liveCards, knowledgeCards] = await Promise.all([
      getPexLiveCards(intent, query),
      getPexKnowledgeCards(query, payload.data.context?.pathname),
    ]);
    return NextResponse.json(PexChatResponseSchema.parse({ ...buildPexReply(query, intent), ...liveCards, knowledgeCards }), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[pex-chat] Request failed:", error);
    return NextResponse.json(
      { error: "Pex is temporarily unavailable. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}