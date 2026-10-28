// 診断タイプ名の唯一の定義元。並び順は同点時の決め方にも使う
export const STAFF_TYPE_NAMES = [
  "信頼ビルダー",
  "開拓ハンター",
  "課題ソルバー",
  "数字ストラテジスト",
  "寄り添いカウンセラー",
  "チーム推進エンジン",
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
  | "pr"
  | "exit"
  | "lead"
  | "basic"
  | "career"
  | "download";

export const SCREENS: readonly Screen[] = [
  "landing",
  "diagnosis",
  "result",
  "pr",
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
