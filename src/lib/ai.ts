import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export function jsonError(status: number, message: string, extra?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function rateLimitedResponse(rl: { retryAfterSec: number; reason: "minute" | "hour" | "day" }): Response {
  const labels = { minute: "1分", hour: "1時間", day: "1日" } as const;
  return new Response(
    JSON.stringify({
      error: `${labels[rl.reason]}あたりの利用上限に達しました。${rl.retryAfterSec}秒後に再度お試しください。`,
      retryAfterSec: rl.retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": String(rl.retryAfterSec),
      },
    }
  );
}

export function streamPlainText(prompt: string, opts: { maxOutputTokens: number; tag: string }): Response {
  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    maxOutputTokens: opts.maxOutputTokens,
    onError: ({ error }) => {
      const e = error as { message?: string; statusCode?: number };
      console.error(`[${opts.tag}] streamText error:`, { message: e.message, statusCode: e.statusCode });
    },
    prompt,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of result.textStream) {
          const clean = chunk
            .replace(/```[\s\S]*?```/g, "")
            .replace(/`/g, "")
            .replace(/<[^>]+>/g, "");
          controller.enqueue(encoder.encode(clean));
        }
        controller.close();
      } catch (e) {
        console.error(`[${opts.tag}] stream error:`, e);
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
