import { describe, it, expect } from "vitest";
import { FLOW_STORAGE_KEY, INITIAL_FLOW, loadFlow, saveFlow, type FlowState } from "@/lib/flow-storage";

function memStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

const sample: FlowState = {
  screen: "exit",
  diagnosisAnswers: [{ questionId: 1, answer: "A" }],
  experience: { service: "1年以上", target: "あった" },
  freeAnswers: { passion: "新人教育", complaint: "", action: "" },
  selfPR: "私は…",
};

describe("flow-storage", () => {
  it("保存したものをそのまま復元する（再読み込み対策）", () => {
    const s = memStorage();
    saveFlow(s, sample);
    expect(loadFlow(s)).toEqual(sample);
  });
  it("何も無ければ入口から", () => {
    expect(loadFlow(memStorage())).toEqual(INITIAL_FLOW);
    expect(INITIAL_FLOW.screen).toBe("landing");
  });
  it("壊れた JSON・知らない画面名は入口に戻す", () => {
    expect(loadFlow(memStorage({ [FLOW_STORAGE_KEY]: "{" }))).toEqual(INITIAL_FLOW);
    expect(loadFlow(memStorage({ [FLOW_STORAGE_KEY]: JSON.stringify({ ...sample, screen: "x" }) }))).toEqual(INITIAL_FLOW);
  });
  it("保存できない環境でも例外を出さない", () => {
    expect(() => saveFlow({ setItem: () => { throw new Error("quota"); } }, sample)).not.toThrow();
  });
});
