import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { buildCareerSummaryPrompt } from "@/lib/prompts";
import { careerSummaryRequestSchema } from "@/data/career";
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
  const parsed = careerSummaryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "入力内容を確認してください");
  }

  const prompt = buildCareerSummaryPrompt(parsed.data);
  return streamPlainText(prompt, { maxOutputTokens: 300, tag: "career-summary" });
}
