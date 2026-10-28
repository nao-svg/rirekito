// 診断タイプ名の唯一の定義元。並び順は同点時の決め方にも使う
export const STAFF_TYPE_NAMES = [
  "コツコツ信頼型",
  "どんどん行動型",
  "聞き上手の提案型",
  "計画・改善型",
  "寄り添い安心型",
  "チームまとめ役型",
] as const;

export type StaffType = (typeof STAFF_TYPE_NAMES)[number];

export interface BasicInfo {
  name: string;
  nameKana: string;
  birthDate: string;
  gender: string;
  postalCode: string;
  address: string;
  addressKana: string;
  phone: string;
  email: string;
  photo: string;
  wishes: string;
  education: EducationEntry[];
  workHistory: WorkHistoryEntry[];
  certifications: CertificationEntry[];
}

export interface EducationEntry {
  year: string;
  month: string;
  description: string;
  label: string;
}

export interface WorkHistoryEntry {
  year: string;
  month: string;
  description: string;
  label: string;
}

export interface CertificationEntry {
  name: string;
  year: string;
  month: string;
}

export interface DiagnosisAnswer {
  questionId: number;
  answer: string; // A | B | C
}

export interface DiagnosisResult {
  type: StaffType;
  description: string;
  selfPR: string;
}

export type Screen =
  | "landing"
  | "diagnosis"
  | "result"
  | "exit"
  | "lead"
  | "basic"
  | "career"
  | "download";

export const SCREENS: readonly Screen[] = [
  "landing",
  "diagnosis",
  "result",
  "exit",
  "lead",
  "basic",
  "career",
  "download",
];

export interface FreeAnswers {
  passion: string;
  complaint: string;
  action: string;
}
