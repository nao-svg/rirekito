import { STAFF_TYPE_NAMES, type StaffType } from "@/types";
import { isExperienceAnswers } from "@/data/experience";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeUserInput } from "@/lib/sanitize";
import { buildSelfPRPrompt, FREE_ANSWER_MAX } from "@/lib/prompts";
import { jsonError, rateLimitedResponse, streamPlainText } from "@/lib/ai";

export async function POST(req: Request) {
  const rl = await rateLimit(getClientIp(req));
  if (!rl.ok) return rateLimitedResponse(rl);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "リクエスト形式が正しくありません");
  }
  const { staffType, answers, experience } = (body ?? {}) as {
    staffType?: unknown;
    answers?: unknown;
    experience?: unknown;
  };

  if (typeof staffType !== "string" || !(STAFF_TYPE_NAMES as readonly string[]).includes(staffType)) {
    return jsonError(400, "診断タイプが不正です");
  }
  if (!isExperienceAnswers(experience)) {
    return jsonError(400, "経験の回答が不正です");
  }
  const a = (answers ?? {}) as Record<string, unknown>;
  if (typeof a.passion !== "string" || typeof a.complaint !== "string" || typeof a.action !== "string") {
    return jsonError(400, "回答の形式が正しくありません");
  }
  if (sanitizeUserInput(a.passion, FREE_ANSWER_MAX).length === 0) {
    return jsonError(400, "熱中したことを入力してください");
  }

  const prompt = buildSelfPRPrompt({
    staffType: staffType as StaffType,
    answers: { passion: a.passion, complaint: a.complaint, action: a.action },
    experience,
  });
  return streamPlainText(prompt, { maxOutputTokens: 500, tag: "self-pr" });
}
