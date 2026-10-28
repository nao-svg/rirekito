import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { jsonError, rateLimitedResponse } from "@/lib/ai";
import { ACTIVE_PARTNERS, PARTNER_READY } from "@/data/partners";
import { SITE } from "@/data/site";
import { leadSchema, leadConsentText, partnersMatch, sendLeadNotification } from "@/lib/lead";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(getClientIp(req), "lead");
  if (!rl.ok) return rateLimitedResponse(rl);

  if (!PARTNER_READY) return jsonError(403, "現在お申し込みを受け付けていません");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "入力内容を確認してください");
  }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "入力内容を確認してください");
  const lead = parsed.data;

  const partnerNames = ACTIVE_PARTNERS.map((p) => p.name);
  // 同意画面で見せた提携先と今の提携先が違うなら、同意が成立していないので受け付けない
  if (!partnersMatch(lead.shownPartners, partnerNames)) {
    return jsonError(409, "提携先の情報が更新されました。ページを再読み込みしてからお申し込みください。");
  }
  const { data, error } = await supabaseAdmin
    .from("leads")
    .insert({
      display_name: lead.displayName,
      phone: lead.phone,
      contact_method: lead.contactMethod,
      contact_time: lead.contactTime,
      current_job: lead.currentJob,
      desired_job: lead.desiredJob,
      diagnosis_type: lead.diagnosisType,
      free_answers: lead.freeAnswers,
      self_pr: lead.selfPR,
      consent_text: leadConsentText(partnerNames),
      partners_at_consent: partnerNames,
      ref_source: lead.refSource,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("leads insert error:", error?.message);
    return jsonError(500, "保存に失敗しました。時間をおいて再度お試しください。");
  }

  // 通知メールの成否にかかわらず、申し込みは受け付け済み（DB に保存できている）
  await sendLeadNotification({
    lead,
    leadId: data.id,
    partnerNames,
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.LEAD_NOTIFY_FROM ?? "リレキト <onboarding@resend.dev>",
    to: SITE.contactEmail,
  });

  return Response.json({ ok: true });
}
