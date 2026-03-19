import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { messages, model = "qwen2.5-coder:1.5b" } = await req.json();

  const ollamaRes = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        num_ctx: 2048,        // halve context window: saves RAM + speeds compute
        num_thread: 8,        // use all 8 CPU cores
        num_predict: 1024,    // cap output to avoid runaway generation
        temperature: 0.7,
      },
    }),
  });

  if (!ollamaRes.ok) {
    return new Response(
      JSON.stringify({ error: `Ollama error: ${ollamaRes.status}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Stream Ollama's NDJSON response directly to the client as SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              const token = json?.message?.content ?? "";
              if (token) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
              }
              if (json?.done) {
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              }
            } catch {
              // skip malformed line
            }
          }
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
