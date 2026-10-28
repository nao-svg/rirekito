import { describe, it, expect } from "vitest";
import { STAFF_TYPE_NAMES, type DiagnosisAnswer, type StaffType } from "@/types";
import { STAFF_TYPES } from "@/data/types";
import { QUESTIONS } from "@/data/questions";
import { SCORE_TABLE, calcDiagnosis } from "@/data/scoring";
import { JOBS_BY_TYPE } from "@/data/jobs";

const LETTERS = ["A", "B", "C"] as const;

describe("診断タイプ", () => {
  it("6タイプが決まった順で定義されている", () => {
    expect(STAFF_TYPE_NAMES).toEqual([
      "コツコツ信頼型",
      "どんどん行動型",
      "聞き上手の提案型",
      "計画・改善型",
      "寄り添い安心型",
      "チームまとめ役型",
    ]);
    expect(STAFF_TYPES.map((t) => t.name)).toEqual([...STAFF_TYPE_NAMES]);
  });

  it.each(STAFF_TYPES.map((t) => [t.name, t] as const))("%s の自己PR例文が要件どおり", (_, t) => {
    const len = [...t.selfPR].length;
    expect(len).toBeGreaterThanOrEqual(200);
    expect(len).toBeLessThanOrEqual(250);
    expect(t.selfPR.startsWith("私は")).toBe(true);
    expect(t.selfPR).toContain("貴社でも");
  });

  it.each(STAFF_TYPES.map((t) => [t.name, t] as const))("%s の例文に数字・架空の実績が無い", (_, t) => {
    expect(t.selfPR).not.toMatch(/[0-9０-９]/);
    expect(t.selfPR).not.toMatch(/[一二三四五六七八九十百千万]+(か月|ヶ月|カ月|人|件|位|倍|割|年)/);
    ["1位", "トップ", "連続", "達成しました", "獲得", "学歴", "誰にも"].forEach((w) => expect(t.selfPR).not.toContain(w));
  });

  it("事務職向けの文言が残っていない", () => {
    const text = JSON.stringify({ STAFF_TYPES, QUESTIONS, JOBS_BY_TYPE });
    expect(text).not.toContain("事務");
  });
});

describe("質問と配点", () => {
  it("10問・各3択で、配点表と数が一致する", () => {
    expect(QUESTIONS).toHaveLength(10);
    QUESTIONS.forEach((q, i) => {
      expect(q.id).toBe(i + 1);
      expect(q.options.map((o) => o.value)).toEqual(["A", "B", "C"]);
    });
    expect(SCORE_TABLE).toHaveLength(10);
    SCORE_TABLE.forEach((row) => expect(row).toHaveLength(3));
  });

  it("各選択肢は「2点1つ・1点1つ」で、各タイプはメイン5回・関連5回", () => {
    const primary: Record<string, number> = {};
    const secondary: Record<string, number> = {};
    for (const row of SCORE_TABLE) {
      for (const opt of row) {
        expect(Object.values(opt).sort()).toEqual([1, 2]);
        for (const [type, pts] of Object.entries(opt)) {
          const bucket = pts === 2 ? primary : secondary;
          bucket[type] = (bucket[type] ?? 0) + 1;
        }
      }
    }
    for (const name of STAFF_TYPE_NAMES) {
      expect(primary[name]).toBe(5);
      expect(secondary[name]).toBe(5);
    }
  });
});

function answersFromIndex(i: number): DiagnosisAnswer[] {
  const answers: DiagnosisAnswer[] = [];
  let x = i;
  for (let q = 1; q <= 10; q++) {
    answers.push({ questionId: q, answer: LETTERS[x % 3] });
    x = Math.floor(x / 3);
  }
  return answers;
}

describe("calcDiagnosis", () => {
  it("全59,049通りの回答で、各タイプの出現率が15〜18%", () => {
    const total = 3 ** 10;
    const counts = Object.fromEntries(STAFF_TYPE_NAMES.map((n) => [n, 0])) as Record<StaffType, number>;
    for (let i = 0; i < total; i++) counts[calcDiagnosis(answersFromIndex(i))]++;
    for (const name of STAFF_TYPE_NAMES) {
      const rate = counts[name] / total;
      expect(rate).toBeGreaterThanOrEqual(0.15);
      expect(rate).toBeLessThanOrEqual(0.18);
    }
  });

  it("全部Aと答えたとき、何度呼んでも同じタイプが返る", () => {
    const answers = QUESTIONS.map((q) => ({ questionId: q.id, answer: "A" }));
    const first = calcDiagnosis(answers);
    expect(STAFF_TYPE_NAMES).toContain(first);
    expect(calcDiagnosis(answers)).toBe(first);
  });

  it("メインの選択肢だけ選べば、そのタイプになる（聞き上手の提案型）", () => {
    // 聞き上手の提案型が2点になる選択肢：Q1A, Q3B, Q5A, Q7C, Q8C
    const answers: DiagnosisAnswer[] = [
      { questionId: 1, answer: "A" },
      { questionId: 3, answer: "B" },
      { questionId: 5, answer: "A" },
      { questionId: 7, answer: "C" },
      { questionId: 8, answer: "C" },
    ];
    expect(calcDiagnosis(answers)).toBe("聞き上手の提案型");
  });

  it("回答0件でも例外を出さず、先頭のタイプを返す", () => {
    expect(calcDiagnosis([])).toBe("コツコツ信頼型");
  });

  it("想定外の回答値や範囲外の質問番号は無視する", () => {
    const answers: DiagnosisAnswer[] = [
      { questionId: 1, answer: "D" },
      { questionId: 2, answer: "" },
      { questionId: 4, answer: "toString" },
      { questionId: 0, answer: "A" },
      { questionId: 11, answer: "A" },
      { questionId: 6, answer: "A" }, // 寄り添い安心型2点・コツコツ信頼型1点
    ];
    expect(calcDiagnosis(answers)).toBe("寄り添い安心型");
  });
});

describe("求人例", () => {
  it("6タイプすべてに求人例があり、会社名は「求人例」で給与は目安表記", () => {
    for (const name of STAFF_TYPE_NAMES) {
      const job = JOBS_BY_TYPE[name];
      expect(job.company).toBe("求人例");
      expect(job.salary).toContain("（目安）");
      expect(job.title).toContain("営業");
    }
  });
});
