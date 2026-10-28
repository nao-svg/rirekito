import { describe, it, expect } from "vitest";
import { afterEach, vi } from "vitest";
import {
  FLOW_STORAGE_KEY,
  INITIAL_FLOW,
  loadFlow,
  saveFlow,
  resolveRestoredFlow,
  safeSessionStorage,
  isDiagnosisComplete,
  type FlowState,
} from "@/lib/flow-storage";
import { QUESTIONS } from "@/data/questions";

function memStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

const allAnswers = QUESTIONS.map((q) => ({ questionId: q.id, answer: "A" }));

const sample: FlowState = {
  screen: "exit",
  diagnosisAnswers: allAnswers,
  experience: { service: "1年以上", target: "あった" },
  experienceDraft: { service: "1年以上", target: "あった" },
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

  it("診断の途中（経験は1問だけ）も復元する", () => {
    const partial: FlowState = {
      ...INITIAL_FLOW,
      screen: "diagnosis",
      diagnosisAnswers: [{ questionId: 1, answer: "B" }],
      experienceDraft: { service: "ない" },
    };
    const s = memStorage();
    saveFlow(s, partial);
    expect(loadFlow(s)).toEqual(partial);
    expect(resolveRestoredFlow(loadFlow(s))).toEqual({ flow: partial, personalInputLost: false });
  });
  it("experienceDraft が無い古い保存データも読める", () => {
    const { experienceDraft: _omit, ...old } = sample;
    void _omit;
    expect(loadFlow(memStorage({ [FLOW_STORAGE_KEY]: JSON.stringify(old) }))).toEqual({ ...sample, experienceDraft: {} });
  });
  it("experienceDraft が不正なら入口に戻す（知らないキー・選択肢に無い値）", () => {
    for (const bad of [{ service: "たくさん" }, { foo: "x" }, ["1年以上"], "x", null]) {
      expect(loadFlow(memStorage({ [FLOW_STORAGE_KEY]: JSON.stringify({ ...sample, experienceDraft: bad }) }))).toEqual(INITIAL_FLOW);
    }
  });
  it("experience は2問とも答えたものしか認めない", () => {
    expect(loadFlow(memStorage({ [FLOW_STORAGE_KEY]: JSON.stringify({ ...sample, experience: { service: "1年以上" } }) }))).toEqual(INITIAL_FLOW);
  });
  it("結果以降の画面なのに診断が途中なら入口に戻す", () => {
    expect(isDiagnosisComplete(sample)).toBe(true);
    const partial = { ...sample, screen: "result" as const, diagnosisAnswers: allAnswers.slice(1) };
    expect(isDiagnosisComplete(partial)).toBe(false);
    expect(resolveRestoredFlow(partial).flow).toEqual(INITIAL_FLOW);
    expect(resolveRestoredFlow({ ...sample, experience: null }).flow).toEqual(INITIAL_FLOW);
  });
  it("職務経歴書・ダウンロード画面で再読み込みしたら、基本情報の入力に戻してお知らせを出す", () => {
    for (const screen of ["basic", "career", "download"] as const) {
      const r = resolveRestoredFlow({ ...sample, screen });
      expect(r.flow).toEqual({ ...sample, screen: "basic" });
      expect(r.personalInputLost).toBe(true);
    }
    expect(resolveRestoredFlow(sample)).toEqual({ flow: sample, personalInputLost: false });
  });
});

describe("safeSessionStorage", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("ブラウザ外では null", () => {
    expect(safeSessionStorage()).toBeNull();
  });
  it("sessionStorage に触れるだけで例外が出る環境でも null を返す", () => {
    const win = {};
    Object.defineProperty(win, "sessionStorage", { get: () => { throw new Error("SecurityError"); } });
    vi.stubGlobal("window", win);
    expect(safeSessionStorage()).toBeNull();
  });
  it("読み書きの例外は握りつぶす", () => {
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: () => { throw new Error("blocked"); },
        setItem: () => { throw new Error("quota"); },
      },
    });
    const s = safeSessionStorage()!;
    expect(s.getItem("ref_source")).toBeNull();
    expect(() => s.setItem("ref_source", "x")).not.toThrow();
  });
  it("使える環境ではそのまま読み書きする", () => {
    const m = memStorage();
    vi.stubGlobal("window", { sessionStorage: m });
    const s = safeSessionStorage()!;
    s.setItem("ref_source", "ig");
    expect(s.getItem("ref_source")).toBe("ig");
  });
});
