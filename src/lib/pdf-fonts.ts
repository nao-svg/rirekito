import { Font } from "@react-pdf/renderer";

// import するだけでフォントが登録される（履歴書・職務経歴書で共有）
export const PDF_FONT_FAMILY = "SawarabiMincho";

Font.register({
  family: PDF_FONT_FAMILY,
  fonts: [{ src: "/SawarabiMincho.ttf" }],
});

// 日本語（全角）を含む語は1文字ずつ改行できる位置に分ける。
// 区切りに "" を挟むと react-pdf が改行位置に「-」を付けない。
// 英数字だけの語（メールアドレスなど）は分けない（以前と同じ）
const WIDE_CHARS = /[\u3000-\u9FFF\uFF00-\uFFEF]/;
Font.registerHyphenationCallback((word) =>
  WIDE_CHARS.test(word) ? Array.from(word).flatMap((ch) => [ch, ""]) : [word],
);

// ソフトハイフン・各種ハイフン類（AI出力に混入することがある）
const HYPHENS = /[­‐‑‒–—―]/g;

// 日本語テキストの改行を自然にするため、各文字間にゼロ幅スペースを挿入
// これによりreact-pdfのテキストエンジンが任意の文字位置で改行でき、
// ハイフン挿入や不自然な改行を防ぐ。改行文字はそのまま残す
export function injectBreakPoints(text: string): string {
  return text
    .replace(HYPHENS, "")
    .split("\n")
    .map((line) => Array.from(line).join("​"))
    .join("\n");
}
