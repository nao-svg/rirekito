import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis が未設定の場合（ローカル開発等）はインメモリフォールバック
function createLimiters() {
  // 手動設定の名前に加え、Vercel Marketplace 連携（プレフィックス UPSTASH_REDIS）が作る名前も読む
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_REDIS_KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = new Redis({ url, token });

  return {
    minute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:min",
    }),
    hour: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "rl:hr",
    }),
    day: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 d"),
      prefix: "rl:day",
    }),
  };
}

// インメモリフォールバック（ローカル開発用・Vercelでは使われない）
type Window = { count: number; resetAt: number };
const memStore = {
  minute: new Map<string, Window>(),
  hour: new Map<string, Window>(),
  day: new Map<string, Window>(),
};
const MEM_LIMITS = {
  minute: { max: 5, windowMs: 60 * 1000 },
  hour: { max: 10, windowMs: 60 * 60 * 1000 },
  day: { max: 20, windowMs: 24 * 60 * 60 * 1000 },
};
function memCheck(store: Map<string, Window>, key: string, max: number, windowMs: number) {
  const now = Date.now();
  const w = store.get(key);
  if (!w || w.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, resetAt: now + windowMs };
  }
  if (w.count >= max) return { ok: false, resetAt: w.resetAt };
  w.count++;
  return { ok: true, resetAt: w.resetAt };
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; reason: "minute" | "hour" | "day" };

function memRateLimit(ip: string): RateLimitResult {
  for (const [key, { max, windowMs }] of Object.entries(MEM_LIMITS) as [keyof typeof MEM_LIMITS, { max: number; windowMs: number }][]) {
    const r = memCheck(memStore[key], ip, max, windowMs);
    if (!r.ok) return { ok: false, retryAfterSec: Math.ceil((r.resetAt - Date.now()) / 1000), reason: key };
  }
  return { ok: true };
}

export async function rateLimit(ip: string): Promise<RateLimitResult> {
  const limiters = createLimiters();

  if (!limiters) {
    // フォールバック：インメモリ
    return memRateLimit(ip);
  }

  // Upstash Redis
  try {
    const [m, h, d] = await Promise.all([
      limiters.minute.limit(ip),
      limiters.hour.limit(ip),
      limiters.day.limit(ip),
    ]);

    if (!m.success) return { ok: false, retryAfterSec: Math.ceil((m.reset - Date.now()) / 1000), reason: "minute" };
    if (!h.success) return { ok: false, retryAfterSec: Math.ceil((h.reset - Date.now()) / 1000), reason: "hour" };
    if (!d.success) return { ok: false, retryAfterSec: Math.ceil((d.reset - Date.now()) / 1000), reason: "day" };

    return { ok: true };
  } catch (e) {
    // Upstash 障害時に登録・AI機能まで止めない：インメモリ制限に切り替える
    console.error("[rate-limit] Upstash error, falling back to in-memory:", e);
    return memRateLimit(ip);
  }
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}
