import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

interface RegisterBody {
  phone: string;
  email: string;
  consentPartnerReferral: boolean;
  consentMarketing: boolean;
  resumeData: Record<string, unknown>;
  diagnosisType: string;
  refSource?: string | null;
  jobChangeTiming?: string | null;
  employmentType?: string | null;
  preferredLocation?: string | null;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // AI の作り直しと同じ枠で数えると、登録が黙って 429 になるので別枠にする
  const rl = await rateLimit(ip, "register");
  if (!rl.ok) {
    return NextResponse.json({ error: "リクエストが多すぎます。しばらくしてから再度お試しください。" }, { status: 429 });
  }

  let body: RegisterBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { phone, email, consentPartnerReferral, consentMarketing, resumeData, diagnosisType, refSource, jobChangeTiming, employmentType, preferredLocation } = body;

  if (!phone && !email) {
    return NextResponse.json({ error: "電話番号またはメールアドレスが必要です。" }, { status: 400 });
  }

  const { data: user, error: upsertError } = await supabaseAdmin
    .from("users")
    .insert({ phone: phone || null, email: email || null, consent_partner_referral: consentPartnerReferral, consent_marketing: consentMarketing, ref_source: refSource || null, job_change_timing: jobChangeTiming || null, employment_type: employmentType || null, preferred_location: preferredLocation || null })
    .select("id")
    .single();

  if (upsertError || !user) {
    console.error("register upsert error:", upsertError);
    return NextResponse.json({ error: "保存に失敗しました。" }, { status: 500 });
  }

  const { error: resumeError } = await supabaseAdmin.from("resumes").insert({
    user_id: user.id,
    data: resumeData,
    diagnosis_type: diagnosisType,
  });

  if (resumeError) {
    console.error("register resume insert error:", resumeError);
    // 履歴書保存失敗はユーザーには見せない（メアド登録は成功しているため）
  }

  return NextResponse.json({ ok: true });
}
