import type { StaffType } from "@/types";
import { STAFF_TYPES } from "@/data/types";

export const SERVICE_OPTIONS = ["1年以上", "1年未満", "ない"] as const;
export const TARGET_OPTIONS = ["あった", "なかった"] as const;

export type ServiceExperience = (typeof SERVICE_OPTIONS)[number];
export type TargetExperience = (typeof TARGET_OPTIONS)[number];

export interface ExperienceAnswers {
  service: ServiceExperience;
  target: TargetExperience;
}

export const EXPERIENCE_QUESTIONS: { key: keyof ExperienceAnswers; text: string; options: readonly string[] }[] = [
  { key: "service", text: "接客のアルバイトや仕事をしたことはある？", options: SERVICE_OPTIONS },
  { key: "target", text: "仕事で目標やノルマはあった？", options: TARGET_OPTIONS },
];

// 経験の有無にかかわらず、必ず前向きな理由を1つ以上返す
export function encouragementReasons(exp: ExperienceAnswers, type: StaffType): string[] {
  const reasons: string[] = [];

  if (exp.service !== "ない") {
    reasons.push("お客さんと話してきた経験は、営業でいちばん大事なコミュニケーション力そのものです。");
  } else {
    const trait = STAFF_TYPES.find((t) => t.name === type)?.traits[0] ?? "強み";
    reasons.push(`接客の経験がなくても大丈夫。あなたの「${trait}」は、営業でそのまま活きる強みです。`);
  }

  if (exp.target === "あった") {
    reasons.push("目標に向かって働いた経験は、営業の現場でも頼れる土台になります。");
  }

  return reasons;
}

export function isExperienceAnswers(v: unknown): v is ExperienceAnswers {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (SERVICE_OPTIONS as readonly unknown[]).includes(o.service) &&
    (TARGET_OPTIONS as readonly unknown[]).includes(o.target)
  );
}
