import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { PEXPACKS_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export const runtime = "nodejs";

function getFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (/delivery|how long|courier|paxi|pep|shipping|arrive/i.test(q)) {
    return (
      "Pexpacks offers two fulfillment streams:\n\n" +
      "• **Year-Round Orders**: 24–48h processing. Doorstep courier takes 2–4 business days nationwide, while Paxi / PEP collection takes 3–5 business days at over 2,800 points.\n" +
      "• **Back-to-School Pre-Orders**: Packed in December and delivered before the first day of the school term in January.\n\n" +
      "You can also track any active parcel at pexpacks.co.za/track-order."
    );
  }

  if (/happy\s*pay|pay\s*later|instalment|split|deposit/i.test(q)) {
    return (
      "Happy Pay lets you split your stationery total across 2 payments with **0% interest** and no fees:\n\n" +
      "• Pay 50% today at checkout to secure your pack immediately.\n" +
      "• Pay the remaining 50% in 30 days.\n\n" +
      "Simply select **Happy Pay** during checkout."
    );
  }

  if (/custom|unlisted|not listed|upload|list|photo|whatsapp/i.test(q)) {
    return (
      "If your child's school is not yet listed, you don't have to run from store to store!\n\n" +
      "You can upload your school stationery list or send a photo of it via WhatsApp. Our team will pack every item with our **100% list match guarantee** and send you a direct checkout link."
    );
  }

  if (/find|pack|grade|school|search|primrose/i.test(q)) {
    return (
      "To find your child's stationery pack, head over to the **Packs Finder** in our Schools directory. You can search by school name (like Primrose Hill Primary) and select your grade. Every pack is teacher-approved and lets you untick items you already have at home to save."
    );
  }

  if (/price|pricing|cost|quote|quotation|discount|bulk/i.test(q)) {
    return (
      "Pexpacks stationery packs are competitively priced and customized by grade. For specific quotations, bulk quantities, or custom lists, please use the WhatsApp option below to connect directly with our team for an exact breakdown."
    );
  }

  return (
    "Hi there! I'm Pex your assistant, at your service. How can I help you today?"
  );
}

function createFallbackStreamResponse(query: string) {
  const fallbackText = getFallbackResponse(query);

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: "part-1" });
      writer.write({
        type: "text-delta",
        id: "part-1",
        delta: fallbackText,
      });
      writer.write({ type: "text-end", id: "part-1" });
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function extractLastQuery(messages: unknown[]): string {
  if (!Array.isArray(messages) || messages.length === 0) return "";
  const last = messages[messages.length - 1] as {
    content?: string;
    parts?: Array<{ type: string; text?: string }>;
  };
  if (typeof last?.content === "string") return last.content;
  if (Array.isArray(last?.parts)) {
    return last.parts
      .filter((p) => p.type === "text" && typeof p.text === "string")
      .map((p) => p.text)
      .join("");
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY;

    // If no API key is configured in this environment, provide an intelligent instant stream
    if (!apiKey) {
      const query = extractLastQuery(messages);
      return createFallbackStreamResponse(query);
    }

    try {
      // Official Vercel AI SDK Google Generative AI Provider
      const google = createGoogleGenerativeAI({ apiKey });
      const modelMessages = await convertToModelMessages(messages);

      const result = streamText({
        model: google("gemini-2.5-flash"),
        system: PEXPACKS_SYSTEM_PROMPT,
        messages: modelMessages,
      });

      return result.toUIMessageStreamResponse();
    } catch (modelError) {
      console.warn("[ChatAPI Model Fallback]:", modelError);
      const query = extractLastQuery(messages);
      return createFallbackStreamResponse(query);
    }
  } catch (error) {
    console.error("[ChatAPI Error]:", error);
    return createFallbackStreamResponse("");
  }
}
