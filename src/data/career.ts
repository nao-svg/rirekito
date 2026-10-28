import { z } from "zod";

export const EMPLOYMENT_TYPES = ["正社員", "契約社員", "派遣社員", "アルバイト・パート"] as const;
export const WORKPLACE_TYPES = ["飲食店", "小売・販売店", "コンビニ・スーパー", "アパレル", "美容・サロン", "ホテル・レジャー", "コールセンター", "介護・医療", "倉庫・物流", "その他"] as const;
export const DUTY_OPTIONS = ["接客", "レジ・会計", "商品の提案・販売", "売上・在庫管理", "新人教育", "シフト管理", "クレーム対応", "電話対応", "調理・仕込み", "品出し・清掃"] as const;
export const SKILL_OPTIONS = ["接客", "クレーム対応", "新人教育", "レジ・売上管理", "提案・販売", "電話対応", "チームワーク", "シフト・スケジュール管理"] as const;
export const MAX_JOBS = 5;
export const ACHIEVEMENT_MAX = 200;

// start/end は "YYYY-MM"。end が "" なら現在
export interface CareerJob {
  start: string;
  end: string;
  workplaceType: (typeof WORKPLACE_TYPES)[number];
  employment: (typeof EMPLOYMENT_TYPES)[number];
  duties: (typeof DUTY_OPTIONS)[number][];
  dutiesNote: string;
  achievement: string;
}

export interface CareerSheet {
  summary: string;
  jobs: CareerJob[];
  skills: (typeof SKILL_OPTIONS)[number][];
}

export const EMPTY_JOB: CareerJob = {
  start: "",
  end: "",
  workplaceType: "その他",
  employment: "アルバイト・パート",
  duties: [],
  dutiesNote: "",
  achievement: "",
};

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const careerJobSchema = z.object({
  start: yearMonth,
  end: z.union([z.literal(""), yearMonth]),
  workplaceType: z.enum(WORKPLACE_TYPES),
  employment: z.enum(EMPLOYMENT_TYPES),
  duties: z.array(z.enum(DUTY_OPTIONS)).max(DUTY_OPTIONS.length),
  dutiesNote: z.string().max(ACHIEVEMENT_MAX),
  achievement: z.string().max(ACHIEVEMENT_MAX),
});

export const careerSummaryRequestSchema = z.object({
  jobs: z.array(careerJobSchema).min(1).max(MAX_JOBS),
  skills: z.array(z.enum(SKILL_OPTIONS)).max(SKILL_OPTIONS.length),
});

function formatYearMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${Number(y)}年${Number(m)}月`;
}

export function formatPeriod(start: string, end: string): string {
  return `${formatYearMonth(start)}〜${end === "" ? "現在" : formatYearMonth(end)}`;
}
