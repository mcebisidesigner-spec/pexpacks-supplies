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

  if (/find|pack|grade|school|search/i.test(q)) {
    return (
      "To find your child's stationery pack, head over to the **Packs Finder** on our homepage or navigation menu. You can filter by school and grade. Every pack is teacher-approved and allows you to untick items you already own at home."
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

    // If no API key is configured in this environment, provide an intelligent instant fallback
    if (!apiKey) {
      const lastMessage = messages[messages.length - 1];
      const query =
        typeof lastMessage?.content === "string"
          ? lastMessage.content
          : Array.isArray(lastMessage?.parts)
            ? lastMessage.parts
                .filter((p: { type: string; text?: string }) => p.type === "text")
                .map((p: { text: string }) => p.text)
                .join("")
            : "";

      const fallbackText = getFallbackResponse(query);

      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({
            type: "text-delta",
            delta: fallbackText,
            id: "fallback-part-1",
          });
        },
      });

      return createUIMessageStreamResponse({ stream });
    }

    // Official Vercel AI SDK Google Generative AI Provider
    const google = createGoogleGenerativeAI({ apiKey });
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: PEXPACKS_SYSTEM_PROMPT,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[ChatAPI Error]:", error);
    return new Response(
      JSON.stringify({
        error: "Unable to process chat message at this time.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
