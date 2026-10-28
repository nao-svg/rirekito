import { describe, it, expect } from "vitest";
import { careerSummaryRequestSchema, formatPeriod, EMPTY_JOB, MAX_JOBS, ACHIEVEMENT_MAX } from "@/data/career";
const job = { ...EMPTY_JOB, start: "2022-04", end: "", workplaceType: "飲食店" as const, employment: "アルバイト・パート" as const, duties: ["接客" as const], achievement: "新人教育を任された" };
describe("職務経歴書", () => {
  it("期間を日本語にする（終わりが空なら現在）", () => {
    expect(formatPeriod("2022-04", "")).toBe("2022年4月〜現在");
    expect(formatPeriod("2020-10", "2022-03")).toBe("2020年10月〜2022年3月");
  });
  it("正しい入力は通る", () => expect(careerSummaryRequestSchema.safeParse({ jobs: [job], skills: ["接客"] }).success).toBe(true));
  it("決まっていない雇用形態・多すぎる勤務先・長すぎる文は通さない", () => {
    expect(careerSummaryRequestSchema.safeParse({ jobs: [{ ...job, employment: "社長" }], skills: [] }).success).toBe(false);
    expect(careerSummaryRequestSchema.safeParse({ jobs: Array(MAX_JOBS + 1).fill(job), skills: [] }).success).toBe(false);
    expect(careerSummaryRequestSchema.safeParse({ jobs: [{ ...job, achievement: "あ".repeat(ACHIEVEMENT_MAX + 1) }], skills: [] }).success).toBe(false);
    expect(careerSummaryRequestSchema.safeParse({ jobs: [], skills: [] }).success).toBe(false);
  });
});
