import { describe, it, expect } from "vitest";
import { buildCareerSummaryPrompt, NO_FABRICATION_RULE, NO_DURATION_CALC_RULE } from "@/lib/prompts";
describe("buildCareerSummaryPrompt", () => {
  it("数字を作らないルール・アルバイトを正直に書く指示・本人の入力を含む", () => {
    const p = buildCareerSummaryPrompt({ jobs: [{ start: "2022-04", end: "", workplaceType: "飲食店", employment: "アルバイト・パート", duties: ["接客"], dutiesNote: "", achievement: "新人教育を任された" }], skills: ["接客"] });
    expect(p).toContain(NO_FABRICATION_RULE);
    expect(p).toContain("アルバイト・パート");
    expect(p).toContain("新人教育を任された");
    expect(p).toContain("2022年4月〜現在");
  });
  it("期間から年数・月数を計算して書かないよう指示する", () => {
    expect(NO_DURATION_CALC_RULE).toBe("期間から年数や月数を計算して書かない（期間はそのまま使ってよい）。");
    const p = buildCareerSummaryPrompt({ jobs: [{ start: "2022-04", end: "", workplaceType: "飲食店", employment: "アルバイト・パート", duties: ["接客"], dutiesNote: "", achievement: "" }], skills: [] });
    expect(p).toContain(NO_DURATION_CALC_RULE);
  });
});
