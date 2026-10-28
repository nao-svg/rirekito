// Upstash の環境変数が無い＝インメモリで動く
import { describe, it, expect, beforeAll } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

beforeAll(() => {
  // 万一シェルに Upstash の設定があっても、このテストはインメモリで動かす
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.UPSTASH_REDIS_KV_REST_API_URL;
  delete process.env.UPSTASH_REDIS_KV_REST_API_TOKEN;
});

describe("rateLimit のスコープ", () => {
  it("AI を使い切っても、申し込みは別に数える", async () => {
    for (let i = 0; i < 5; i++) expect((await rateLimit("1.1.1.1")).ok).toBe(true);
    expect((await rateLimit("1.1.1.1")).ok).toBe(false);
    expect((await rateLimit("1.1.1.1", "lead")).ok).toBe(true);
  });
});
