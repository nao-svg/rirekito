import { z } from "zod";
import { STAFF_TYPE_NAMES } from "@/types";
import { FREE_ANSWER_MAX } from "@/lib/prompts";

export const CONTACT_METHODS = ["phone", "line"] as const;
export const CONTACT_METHOD_LABELS: Record<(typeof CONTACT_METHODS)[number], string> = {
  phone: "電話",
  line: "LINE",
};
export const CONTACT_TIMES = ["平日 午前", "平日 午後", "平日 夜（18時以降）", "土日祝", "いつでも"] as const;

// 全角数字を半角にし、数字以外（ハイフン・空白など）を取り除く
function normalizePhone(v: string): string {
  return v
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, "");
}

const trimmed = (max: number) => z.string().trim().min(1).max(max);
const freeAnswer = z.string().trim().max(FREE_ANSWER_MAX);

export const leadSchema = z.object({
  displayName: trimmed(30),
  phone: z.string().transform(normalizePhone).pipe(z.string().regex(/^\d{10,11}$/)),
  contactMethod: z.enum(CONTACT_METHODS),
  contactTime: z.enum(CONTACT_TIMES),
  currentJob: trimmed(50),
  desiredJob: trimmed(50),
  consent: z.literal(true),
  diagnosisType: z.enum(STAFF_TYPE_NAMES),
  freeAnswers: z.object({ passion: freeAnswer, complaint: freeAnswer, action: freeAnswer }),
  selfPR: z.string().trim().min(1).max(600),
  refSource: z.string().trim().max(100).nullable(),
});

export type LeadInput = z.output<typeof leadSchema>;

export function leadConsentText(partnerNames: string[]): string {
  return `入力した内容・診断結果・自己PRを、提携先一覧に記載の人材紹介会社（${partnerNames.join("、")}）に提供し、連絡を受けることに同意します`;
}

export function buildLeadEmail(lead: LeadInput, leadId: string, partnerNames: string[]): { subject: string; text: string } {
  const subject = `【リレキト】面談希望の申し込み（${lead.displayName}さん）`;
  const text = [
    "面談希望の申し込みがありました。",
    "",
    `申し込みID: ${leadId}`,
    `呼ばれたい名前: ${lead.displayName}`,
    `電話: ${lead.phone}`,
    `連絡方法: ${CONTACT_METHOD_LABELS[lead.contactMethod]}`,
    `つながりやすい時間帯: ${lead.contactTime}`,
    `現在の職業: ${lead.currentJob}`,
    `希望の職業: ${lead.desiredJob}`,
    `診断タイプ: ${lead.diagnosisType}`,
    `提供先候補: ${partnerNames.join("、")}`,
    "",
    "自由回答と自己PRは Supabase の leads テーブルで確認してください。BEPRIDE に渡したら provided_at と provided_to を記入してください。",
  ].join("\n");
  return { subject, text };
}

export async function sendLeadNotification(args: {
  lead: LeadInput;
  leadId: string;
  partnerNames: string[];
  apiKey: string | undefined;
  from: string;
  to: string;
  fetchImpl?: typeof fetch;
}): Promise<"sent" | "skipped" | "failed"> {
  const { lead, leadId, partnerNames, apiKey, from, to, fetchImpl = fetch } = args;
  if (!apiKey) return "skipped";
  try {
    const { subject, text } = buildLeadEmail(lead, leadId, partnerNames);
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text }),
    });
    if (!res.ok) {
      console.error("lead notification failed: status", res.status, "lead", leadId);
      return "failed";
    }
    return "sent";
  } catch (e) {
    console.error("lead notification error:", e instanceof Error ? e.message : "unknown", "lead", leadId);
    return "failed";
  }
}
