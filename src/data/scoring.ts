import { STAFF_TYPE_NAMES, type DiagnosisAnswer, type StaffType } from "@/types";

// 各回答がどのタイプに何点加算するか（メイン2点・関連1点）
// A=0, B=1, C=2 のインデックスで管理
type ScoreMap = Partial<Record<StaffType, number>>;

export const SCORE_TABLE: ScoreMap[][] = [
  // Q1: 友達に好きなお店を勧めるとき
  [
    { 聞き上手の提案型: 2, 寄り添い安心型: 1 },         // A
    { どんどん行動型: 2, チームまとめ役型: 1 },           // B
    { "計画・改善型": 2, コツコツ信頼型: 1 },           // C
  ],
  // Q2: 初対面の人が多い場では
  [
    { どんどん行動型: 2, チームまとめ役型: 1 },           // A
    { コツコツ信頼型: 2, 寄り添い安心型: 1 },         // B
    { チームまとめ役型: 2, どんどん行動型: 1 },           // C
  ],
  // Q3: 仕事やバイトで褒められたこと
  [
    { コツコツ信頼型: 2, 寄り添い安心型: 1 },         // A
    { 聞き上手の提案型: 2, "計画・改善型": 1 },           // B
    { "計画・改善型": 2, どんどん行動型: 1 },           // C
  ],
  // Q4: 目標が達成できそうにないとき
  [
    { どんどん行動型: 2, "計画・改善型": 1 },           // A
    { "計画・改善型": 2, 聞き上手の提案型: 1 },           // B
    { チームまとめ役型: 2, コツコツ信頼型: 1 },           // C
  ],
  // Q5: 「考えておきます」と言われたら
  [
    { 聞き上手の提案型: 2, "計画・改善型": 1 },           // A
    { 寄り添い安心型: 2, コツコツ信頼型: 1 },         // B
    { コツコツ信頼型: 2, どんどん行動型: 1 },                 // C
  ],
  // Q6: やりがいを感じる瞬間
  [
    { 寄り添い安心型: 2, コツコツ信頼型: 1 },         // A
    { どんどん行動型: 2, 聞き上手の提案型: 1 },                 // B
    { チームまとめ役型: 2, "計画・改善型": 1 },     // C
  ],
  // Q7: 好きな仕事の進め方
  [
    { コツコツ信頼型: 2, "計画・改善型": 1 },           // A
    { どんどん行動型: 2, チームまとめ役型: 1 },           // B
    { 聞き上手の提案型: 2, 寄り添い安心型: 1 },         // C
  ],
  // Q8: 周りからよく言われること
  [
    { 寄り添い安心型: 2, チームまとめ役型: 1 },   // A
    { コツコツ信頼型: 2, 寄り添い安心型: 1 },         // B
    { 聞き上手の提案型: 2, チームまとめ役型: 1 },           // C
  ],
  // Q9: 苦手なこと
  [
    { チームまとめ役型: 2, どんどん行動型: 1 },           // A
    { 寄り添い安心型: 2, 聞き上手の提案型: 1 },         // B
    { "計画・改善型": 2, 聞き上手の提案型: 1 },           // C
  ],
  // Q10: チームでの理想の役割
  [
    { チームまとめ役型: 2, どんどん行動型: 1 },           // A
    { 寄り添い安心型: 2, コツコツ信頼型: 1 },         // B
    { "計画・改善型": 2, 聞き上手の提案型: 1 },           // C
  ],
];

const ANSWER_LETTERS = ["A", "B", "C"];

export function calcDiagnosis(answers: DiagnosisAnswer[]): StaffType {
  const scores = Object.fromEntries(STAFF_TYPE_NAMES.map((n) => [n, 0])) as Record<StaffType, number>;
  const primaryHits = { ...scores };
  // 同点時に使う値。同じ回答なら必ず同じ値になる
  let hash = 0;

  for (const { questionId, answer } of answers) {
    const qIndex = questionId - 1;
    const aIndex = ANSWER_LETTERS.indexOf(answer);
    if (aIndex < 0 || qIndex < 0 || qIndex >= SCORE_TABLE.length) continue;
    hash += (aIndex + 1) * questionId;
    for (const [type, pts] of Object.entries(SCORE_TABLE[qIndex][aIndex]) as [StaffType, number][]) {
      scores[type] += pts;
      if (pts === 2) primaryHits[type] += 1;
    }
  }

  // 1. 合計点が最高 → 2. メイン加点の回数が最多 → 3. 回答から決まる値で1つに絞る
  const best = Math.max(...STAFF_TYPE_NAMES.map((n) => scores[n]));
  let tied = STAFF_TYPE_NAMES.filter((n) => scores[n] === best);
  const bestHits = Math.max(...tied.map((n) => primaryHits[n]));
  tied = tied.filter((n) => primaryHits[n] === bestHits);
  return tied[hash % tied.length];
}
