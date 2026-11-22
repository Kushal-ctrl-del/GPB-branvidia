import { NextRequest, NextResponse } from "next/server";
import { ChatRequestSchema, PartialBusinessIntake } from "@/lib/types/contracts";
import { createGroqChatStream, generateFallbackChatResponse, GroqMessage } from "@/lib/ai/groq";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parseResult = ChatRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { messages, currentIntake } = parseResult.data;
    const latestUserMessage = messages[messages.length - 1]?.content || "";

    const groqMessages: GroqMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      // Attempt live Groq streaming
      const rawStream = await createGroqChatStream(groqMessages, currentIntake);

      // Transform raw OpenAI SSE stream into a clean text stream
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk);
          const lines = text.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;

            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                const content = data.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        },
      });

      return new Response(rawStream.pipeThrough(transformStream), {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-AI-Provider": "GroqCloud",
        },
      });
    } catch (groqError: any) {
      console.warn("Groq API streaming failed or unconfigured, engaging fallback:", groqError?.message);

      // Fallback: Rule-based deterministic response
      const fallback = generateFallbackChatResponse(latestUserMessage, currentIntake);
      
      // Append extraction tag so frontend parser works identically
      const fullFallbackText = `${fallback.reply}\n\n<!--INTAKE:${JSON.stringify(fallback.extracted)}-->`;

      return new Response(fullFallbackText, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-AI-Provider": "DeterministicFallback",
        },
      });
    }
  } catch (error: any) {
    console.error("Unhandled error in /api/chat:", error);
    return NextResponse.json(
      { error: "Internal server error while processing chat" },
      { status: 500 }
    );
  }
}
