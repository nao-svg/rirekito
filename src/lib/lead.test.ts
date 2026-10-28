import { describe, it, expect, vi } from "vitest";
import { leadSchema, buildLeadEmail, sendLeadNotification, leadConsentText, partnersMatch } from "@/lib/lead";
const valid = {
  displayName: "なお", phone: "09012345678", contactMethod: "line", contactTime: "平日 夜（18時以降）",
  currentJob: "飲食店アルバイト", desiredJob: "営業職", consent: true, diagnosisType: "信頼ビルダー",
  freeAnswers: { passion: "新人教育", complaint: "", action: "" }, selfPR: "私は自己PR本文です", refSource: null, shownPartners: ["株式会社BEPRIDE"],
};
describe("leadSchema", () => {
  it("全角・ハイフン入りの電話を数字だけにして通す", () => {
    const r = leadSchema.safeParse({ ...valid, phone: "０９０-1234-5678" });
    expect(r.success && r.data.phone).toBe("09012345678");
  });
  it("同意が無い・桁数が違う・知らない連絡方法は通さない", () => {
    expect(leadSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, phone: "12345" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, contactMethod: "mail" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, displayName: " " }).success).toBe(false);
  });
});
describe("通知メール", () => {
  const lead = leadSchema.parse(valid);
  it("申し込みIDと連絡先が入り、自己PR本文は入らない", () => {
    const { subject, text } = buildLeadEmail(lead, "abc-123", ["株式会社BEPRIDE"]);
    expect(subject).toContain("なお");
    ["abc-123", "09012345678", "LINE", "平日 夜（18時以降）", "株式会社BEPRIDE", "provided_at"].forEach((s) => expect(text).toContain(s));
    expect(text).not.toContain("私は自己PR本文です");
  });
  it("鍵が無ければ送らずに skipped", async () => {
    const f = vi.fn();
    expect(await sendLeadNotification({ lead, leadId: "x", partnerNames: [], apiKey: undefined, from: "a", to: "b", fetchImpl: f })).toBe("skipped");
    expect(f).not.toHaveBeenCalled();
  });
  it("送信に失敗しても例外を出さず failed", async () => {
    const f = vi.fn().mockRejectedValue(new Error("down"));
    expect(await sendLeadNotification({ lead, leadId: "x", partnerNames: [], apiKey: "k", from: "a", to: "b", fetchImpl: f })).toBe("failed");
    const g = vi.fn().mockResolvedValue(new Response("", { status: 500 }));
    expect(await sendLeadNotification({ lead, leadId: "x", partnerNames: [], apiKey: "k", from: "a", to: "b", fetchImpl: g })).toBe("failed");
  });
  it("成功なら sent", async () => {
    const f = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    expect(await sendLeadNotification({ lead, leadId: "x", partnerNames: [], apiKey: "k", from: "a", to: "b", fetchImpl: f })).toBe("sent");
    expect(f.mock.calls[0][0]).toBe("https://api.resend.com/emails");
  });
  it("同意文に提携先名が入る", () => expect(leadConsentText(["株式会社BEPRIDE"])).toContain("（株式会社BEPRIDE）"));
  it("同意文に自己PRづくりの回答も提供すると書く", () =>
    expect(leadConsentText(["株式会社BEPRIDE"])).toContain("入力した内容（自己PRづくりの回答を含む）・診断結果・自己PRを"));
});
describe("通知メールのタイムアウト", () => {
  it("応答が返らなければ中断して failed", async () => {
    const lead = leadSchema.parse(valid);
    const hang = vi.fn((_u: unknown, init?: RequestInit) => new Promise<Response>((_, rej) => {
      init?.signal?.addEventListener("abort", () => rej(new Error("aborted")));
    }));
    expect(await sendLeadNotification({ lead, leadId: "x", partnerNames: [], apiKey: "k", from: "a", to: "b", fetchImpl: hang as unknown as typeof fetch, timeoutMs: 20 })).toBe("failed");
  });
});
describe("partnersMatch", () => {
  it("同じ並びだけ true", () => {
    expect(partnersMatch(["A", "B"], ["A", "B"])).toBe(true);
    expect(partnersMatch(["B", "A"], ["A", "B"])).toBe(false);
    expect(partnersMatch(["A", "B", "C"], ["A", "B"])).toBe(false);
    expect(partnersMatch(["A"], ["A", "B"])).toBe(false);
  });
});
