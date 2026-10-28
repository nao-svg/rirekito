// プロンプトインジェクション抑制：指示語・制御文字・コードブロック等を除去し、長さを切る
export function sanitizeUserInput(input: string, maxLen: number): string {
  const cleaned = input
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f]/g, " ") // 制御文字
    .replace(/```[\s\S]*?```/g, " ") // コードブロック
    .replace(/```/g, " ") // 閉じていないコードブロック記号
    .replace(/<\|[^|]*\|>/g, " ") // モデル制御トークン風
    .replace(/(?:ignore|disregard|forget|override)\s+(?:(?:the|above|previous|prior|all)\s+)+(?:instructions?|prompts?|system)/gi, "")
    .replace(/(?:無視|忘れて|破棄)\s*(?:して|してください)?(?:、|。|\s)*(?:上記|これまで|以前|システム|前提)/g, "")
    .replace(/(?:上記|これまで|以前|システム|前提)\s*(?:の|を)?\s*(?:指示|命令|内容|プロンプト)?\s*(?:を|は)?\s*(?:無視|忘れ|破棄)\s*(?:して|しろ|してください)?/g, "")
    .replace(/system\s*(?:prompt|message|role)\s*[:：]/gi, "");
  return [...cleaned].slice(0, maxLen).join("").trim();
}
