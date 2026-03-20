import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "gemini-1.5-flash", apiKey } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing Gemini API Key." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Filter project context / system messages
    const systemInstruction = messages
      .filter((m: any) => m.role === "system")
      .map((m: any) => m.content)
      .join("\n");

    const historyMsgs = messages.filter((m: any) => m.role !== "system");
    
    // The last message is the user's prompt
    const lastMsg = historyMsgs.pop();
    if (!lastMsg) {
      return new Response(JSON.stringify({ error: "No user message provided." }), { status: 400 });
    }

    // Convert OpenAI format to Gemini format
    const history = historyMsgs.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const genModel = genAI.getGenerativeModel({
      model: model,
      systemInstruction: systemInstruction ? systemInstruction : undefined,
    });

    const chat = genModel.startChat({ history });
    const result = await chat.sendMessageStream(lastMsg.content);

    // Stream the result as Server-Sent Events (SSE) to maintain compatibility with the client code
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const token = chunk.text();
            if (token) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (e: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: "\n[Error streaming response: " + e.message + "]" })}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
