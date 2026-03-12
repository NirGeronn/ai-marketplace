import { NextRequest } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { findSolutionsWithRelations } from "@/lib/queries";
import { formatSolutionCatalog, buildSystemPrompt } from "@/lib/ai-prompt";
import type { SolutionWithTags } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (message.length > 500) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch all solutions (small catalog, ~15 rows)
    const solutions = await findSolutionsWithRelations({
      orderBy: { mau: "desc" },
    });

    const catalog = formatSolutionCatalog(solutions as SolutionWithTags[]);
    const systemPrompt = buildSystemPrompt(catalog);

    const openai = getOpenAI();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
