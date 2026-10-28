import { describe, it, expect } from "vitest";
import { STAFF_TYPE_NAMES } from "@/types";
import { STAFF_TYPES } from "@/data/types";
import { SERVICE_OPTIONS, TARGET_OPTIONS, EXPERIENCE_QUESTIONS, encouragementReasons, isExperienceAnswers } from "@/data/experience";

const FORBIDDEN = ["向いていない", "向いてない", "無理", "難しい", "厳しい"];
const ALL = SERVICE_OPTIONS.flatMap((service) => TARGET_OPTIONS.map((target) => ({ service, target })));

describe("経験の質問", () => {
  it("2問で、キーと選択肢が決まっている", () => {
    expect(EXPERIENCE_QUESTIONS.map((q) => q.key)).toEqual(["service", "target"]);
    expect(EXPERIENCE_QUESTIONS[0].options).toEqual(["1年以上", "1年未満", "ない"]);
    expect(EXPERIENCE_QUESTIONS[1].options).toEqual(["あった", "なかった"]);
  });

  it.each(STAFF_TYPE_NAMES.flatMap((t) => ALL.map((e) => [t, e] as const)))("%s × %o でも理由が1つ以上あり、突き放す言葉が無い", (type, exp) => {
    const reasons = encouragementReasons(exp, type);
    expect(reasons.length).toBeGreaterThanOrEqual(1);
    reasons.forEach((r) => {
      expect(r.trim().length).toBeGreaterThan(0);
      FORBIDDEN.forEach((w) => expect(r).not.toContain(w));
      expect(r).not.toMatch(/[0-9０-９]/);
    });
  });

  it("接客経験があれば、コミュニケーション力を理由にする", () => {
    expect(encouragementReasons({ service: "1年以上", target: "なかった" }, "信頼ビルダー")[0]).toContain("コミュニケーション");
    expect(encouragementReasons({ service: "1年未満", target: "なかった" }, "信頼ビルダー")[0]).toContain("コミュニケーション");
  });

  it("接客経験がなければ、タイプの強みを理由にする", () => {
    const t = STAFF_TYPES.find((x) => x.name === "開拓ハンター")!;
    expect(encouragementReasons({ service: "ない", target: "なかった" }, "開拓ハンター")[0]).toContain(t.traits[0]);
  });

  it("目標があった人には、目標に向かう経験も理由に足す", () => {
    expect(encouragementReasons({ service: "ない", target: "あった" }, "課題ソルバー").join("")).toContain("目標");
  });

  it("isExperienceAnswers は決まった値だけ通す", () => {
    expect(isExperienceAnswers({ service: "ない", target: "あった" })).toBe(true);
    expect(isExperienceAnswers({ service: "少し", target: "あった" })).toBe(false);
    expect(isExperienceAnswers(null)).toBe(false);
  });
});
