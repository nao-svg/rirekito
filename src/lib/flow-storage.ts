import { SCREENS, type DiagnosisAnswer, type FreeAnswers, type Screen } from "@/types";
import {
  isExperienceAnswers,
  SERVICE_OPTIONS,
  TARGET_OPTIONS,
  type ExperienceAnswers,
} from "@/data/experience";
import { QUESTIONS } from "@/data/questions";

export const FLOW_STORAGE_KEY = "rirekito_flow_v1";

export interface FlowState {
  screen: Screen;
  diagnosisAnswers: DiagnosisAnswer[];
  // 2問とも答えたときだけ入る（結果画面以降で使う）
  experience: ExperienceAnswers | null;
  // 診断の途中で選んだ経験の答え（1問だけでも残す。再読み込み・戻る対策）
  experienceDraft: Partial<ExperienceAnswers>;
  freeAnswers: FreeAnswers;
  selfPR: string;
}

export const INITIAL_FLOW: FlowState = {
  screen: "landing",
  diagnosisAnswers: [],
  experience: null,
  experienceDraft: {},
  freeAnswers: { passion: "", complaint: "", action: "" },
  selfPR: "",
};

type SafeStorage = Pick<Storage, "getItem" | "setItem">;

// sessionStorage が使えない環境（設定でブロック・一部のプライベートモード）でも
// 画面を止めないための入口。使えなければ null、使えても読み書きの失敗は握りつぶす。
export function safeSessionStorage(): SafeStorage | null {
  let s: Storage | undefined;
  try {
    if (typeof window === "undefined") return null;
    s = window.sessionStorage;
  } catch {
    return null;
  }
  if (!s) return null;
  const storage = s;
  return {
    getItem: (key) => {
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        storage.setItem(key, value);
      } catch {
        // 保存できなくても画面は動かし続ける
      }
    },
  };
}

function isDiagnosisAnswers(v: unknown): v is DiagnosisAnswer[] {
  return (
    Array.isArray(v) &&
    v.every(
      (a) =>
        typeof a === "object" &&
        a !== null &&
        typeof (a as Record<string, unknown>).questionId === "number" &&
        typeof (a as Record<string, unknown>).answer === "string",
    )
  );
}

function isFreeAnswers(v: unknown): v is FreeAnswers {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.passion === "string" && typeof o.complaint === "string" && typeof o.action === "string";
}

// 途中の経験の答え: service / target 以外のキーは認めず、入っている値は選択肢のどれかであること
export function isExperienceDraft(v: unknown): v is Partial<ExperienceAnswers> {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  if (Object.keys(o).some((k) => k !== "service" && k !== "target")) return false;
  if ("service" in o && !(SERVICE_OPTIONS as readonly unknown[]).includes(o.service)) return false;
  if ("target" in o && !(TARGET_OPTIONS as readonly unknown[]).includes(o.target)) return false;
  return true;
}

// 10問すべてに答え、経験の2問も答え終わっているか
export function isDiagnosisComplete(flow: Pick<FlowState, "diagnosisAnswers" | "experience">): boolean {
  if (flow.experience === null) return false;
  const answered = new Set(flow.diagnosisAnswers.map((a) => a.questionId));
  return QUESTIONS.every((q) => answered.has(q.id));
}

export function loadFlow(storage: Pick<Storage, "getItem">): FlowState {
  try {
    const raw = storage.getItem(FLOW_STORAGE_KEY);
    if (!raw) return INITIAL_FLOW;
    const o = JSON.parse(raw) as Record<string, unknown> | null;
    if (typeof o !== "object" || o === null) return INITIAL_FLOW;
    // experienceDraft は後から足した項目なので、無ければ空として扱う（あれば厳しく確認）
    const draft = o.experienceDraft === undefined ? {} : o.experienceDraft;
    // 自己PRづくりの画面は廃止したので、そこで止まっていた人は次の選択画面から再開する
    const screen = o.screen === "pr" ? "exit" : o.screen;
    if (
      !(SCREENS as readonly unknown[]).includes(screen) ||
      !isDiagnosisAnswers(o.diagnosisAnswers) ||
      !(o.experience === null || isExperienceAnswers(o.experience)) ||
      !isExperienceDraft(draft) ||
      !isFreeAnswers(o.freeAnswers) ||
      typeof o.selfPR !== "string"
    ) {
      return INITIAL_FLOW;
    }
    return {
      screen: screen as Screen,
      diagnosisAnswers: o.diagnosisAnswers,
      experience: o.experience as ExperienceAnswers | null,
      experienceDraft: draft,
      freeAnswers: o.freeAnswers,
      selfPR: o.selfPR,
    };
  } catch {
    return INITIAL_FLOW;
  }
}

// 再読み込み後に、どの画面から再開するかを決める。
// - 入口・診断中はそのまま（途中の答えも残す）
// - 結果以降なのに診断が終わっていなければ入口へ
// - 基本情報・職務経歴書は保存しないので、それを使う画面は基本情報の入力からやり直す
export function resolveRestoredFlow(restored: FlowState): { flow: FlowState; personalInputLost: boolean } {
  if (restored.screen === "landing" || restored.screen === "diagnosis") {
    return { flow: restored, personalInputLost: false };
  }
  if (!isDiagnosisComplete(restored)) {
    return { flow: INITIAL_FLOW, personalInputLost: false };
  }
  if (restored.screen === "basic" || restored.screen === "career" || restored.screen === "download") {
    return { flow: { ...restored, screen: "basic" }, personalInputLost: true };
  }
  return { flow: restored, personalInputLost: false };
}

export function saveFlow(storage: Pick<Storage, "setItem">, state: FlowState): void {
  try {
    storage.setItem(FLOW_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // プライベートモードなどで保存できなくても、画面は動かし続ける
  }
}
