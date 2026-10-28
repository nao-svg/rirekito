"use client";

import { useEffect, useState } from "react";
import { DiagnosisAnswer } from "@/types";
import { QUESTIONS } from "@/data/questions";
import { EXPERIENCE_QUESTIONS, isExperienceAnswers, type ExperienceAnswers } from "@/data/experience";

interface Props {
  // 途中まで答えた内容（結果画面から戻ったとき・再読み込みしたときに復元する）
  initialAnswers: DiagnosisAnswer[];
  initialExperience: Partial<ExperienceAnswers>;
  // 1問選ぶたびに親へ知らせる（親が保存する）
  onAnswersChange: (answers: DiagnosisAnswer[]) => void;
  onExperienceChange: (experience: Partial<ExperienceAnswers>) => void;
  onNext: (answers: DiagnosisAnswer[], experience: ExperienceAnswers) => void;
  onBack: () => void;
}

const VALID_QUESTION_IDS = new Set(QUESTIONS.map((q) => q.id));

function toRecord(list: DiagnosisAnswer[]): Record<number, string> {
  const rec: Record<number, string> = {};
  for (const a of list) {
    const q = QUESTIONS.find((x) => x.id === a.questionId);
    // 今の質問・選択肢に無い答えは捨てる（質問を変えたあとの古い保存データ対策）
    if (q && q.options.some((o) => o.value === a.answer)) rec[a.questionId] = a.answer;
  }
  return rec;
}

function toList(rec: Record<number, string>): DiagnosisAnswer[] {
  return Object.entries(rec)
    .filter(([id]) => VALID_QUESTION_IDS.has(Number(id)))
    .map(([id, answer]) => ({ questionId: Number(id), answer }));
}

export default function Step2Diagnosis({
  initialAnswers,
  initialExperience,
  onAnswersChange,
  onExperienceChange,
  onNext,
  onBack,
}: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>(() => toRecord(initialAnswers));
  const [expAnswers, setExpAnswers] = useState<Partial<ExperienceAnswers>>(() => ({ ...initialExperience }));
  const [isNavigating, setIsNavigating] = useState(false);

  // 診断ページに遷移したら最上部にスクロール
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const setAnswer = (questionId: number, value: string) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    onAnswersChange(toList(next));
  };

  const setExperience = (key: keyof ExperienceAnswers, value: string) => {
    const next = { ...expAnswers, [key]: value } as Partial<ExperienceAnswers>;
    setExpAnswers(next);
    onExperienceChange(next);
  };

  const total = QUESTIONS.length + EXPERIENCE_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length + Object.keys(expAnswers).length;
  const allAnswered = answeredCount === total;

  const handleNext = () => {
    const result = toList(answers);
    // 経験の答えは採点には渡さない（結果画面の励ましの文にだけ使う）
    if (isExperienceAnswers(expAnswers)) onNext(result, expAnswers);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">自己診断</h2>
        <p className="text-sm text-gray-500">
          直感で答えてください。全{total}問（{answeredCount}/{total}
          問回答済み）
        </p>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {QUESTIONS.map((q, index) => (
          <div
            key={q.id}
            className={`rounded-xl border p-5 transition-all ${
              answers[q.id] ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-sm font-semibold text-gray-800 mb-3">
              <span className="text-blue-500 mr-2">Q{index + 1}</span>
              {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                    answers[q.id] === opt.value
                      ? "border-blue-500 bg-white shadow-sm"
                      : "border-transparent hover:border-gray-200 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q${q.id}`}
                    value={opt.value}
                    checked={answers[q.id] === opt.value}
                    onChange={() => setAnswer(q.id, opt.value)}
                    className="mt-0.5 accent-blue-600 shrink-0"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {EXPERIENCE_QUESTIONS.map((q, i) => (
          <div
            key={q.key}
            className={`rounded-xl border p-5 transition-all ${
              expAnswers[q.key] ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-sm font-semibold text-gray-800 mb-3">
              <span className="text-blue-500 mr-2">Q{QUESTIONS.length + i + 1}</span>
              {q.text}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <label
                  key={opt}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-all ${
                    expAnswers[q.key] === opt
                      ? "border-blue-500 bg-white shadow-sm"
                      : "border-transparent hover:border-gray-200 hover:bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name={`exp-${q.key}`}
                    value={opt}
                    checked={expAnswers[q.key] === opt}
                    onChange={() => setExperience(q.key, opt)}
                    className="mt-0.5 accent-blue-600 shrink-0"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          ← 戻る
        </button>
        <button
          onClick={() => { setIsNavigating(true); handleNext(); }}
          disabled={!allAnswered || isNavigating}
          className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isNavigating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              処理中...
            </>
          ) : "結果を見る →"}
        </button>
      </div>
    </div>
  );
}
