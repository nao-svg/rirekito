import { SCREENS, type DiagnosisAnswer, type FreeAnswers, type Screen } from "@/types";
import { isExperienceAnswers, type ExperienceAnswers } from "@/data/experience";

export const FLOW_STORAGE_KEY = "rirekito_flow_v1";

export interface FlowState {
  screen: Screen;
  diagnosisAnswers: DiagnosisAnswer[];
  experience: ExperienceAnswers | null;
  freeAnswers: FreeAnswers;
  selfPR: string;
}

export const INITIAL_FLOW: FlowState = {
  screen: "landing",
  diagnosisAnswers: [],
  experience: null,
  freeAnswers: { passion: "", complaint: "", action: "" },
  selfPR: "",
};

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

export function loadFlow(storage: Pick<Storage, "getItem">): FlowState {
  try {
    const raw = storage.getItem(FLOW_STORAGE_KEY);
    if (!raw) return INITIAL_FLOW;
    const o = JSON.parse(raw) as Record<string, unknown> | null;
    if (typeof o !== "object" || o === null) return INITIAL_FLOW;
    if (
      !(SCREENS as readonly unknown[]).includes(o.screen) ||
      !isDiagnosisAnswers(o.diagnosisAnswers) ||
      !(o.experience === null || isExperienceAnswers(o.experience)) ||
      !isFreeAnswers(o.freeAnswers) ||
      typeof o.selfPR !== "string"
    ) {
      return INITIAL_FLOW;
    }
    return {
      screen: o.screen as Screen,
      diagnosisAnswers: o.diagnosisAnswers,
      experience: o.experience as ExperienceAnswers | null,
      freeAnswers: o.freeAnswers,
      selfPR: o.selfPR,
    };
  } catch {
    return INITIAL_FLOW;
  }
}

export function saveFlow(storage: Pick<Storage, "setItem">, state: FlowState): void {
  try {
    storage.setItem(FLOW_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // プライベートモードなどで保存できなくても、画面は動かし続ける
  }
}
