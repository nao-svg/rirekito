"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DiagnosisAnswer, DiagnosisResult, StaffType } from "@/types";
import { STAFF_TYPES } from "@/data/types";
import { JOBS_BY_TYPE } from "@/data/jobs";
import { calcDiagnosis } from "@/data/scoring";
import { ACTIVE_PARTNERS, PARTNER_READY } from "@/data/partners";

interface Props {
  answers: DiagnosisAnswer[];
  onNext: (result: DiagnosisResult) => void;
  onBack: () => void;
}

export default function Step3Result({ answers, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ type: StaffType; reason: string } | null>(null);
  const [error, setError] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const diagnose = async () => {
      try {
        const type = calcDiagnosis(answers);
        setResult({ type, reason: "" });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    diagnose();
  }, [answers]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">AIが診断中です...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm">診断に失敗しました。もう一度お試しください。</p>
        <button
          onClick={onBack}
          className="mt-4 text-blue-600 underline text-sm"
        >
          戻る
        </button>
      </div>
    );
  }

  const typeDef = STAFF_TYPES.find((t) => t.name === result.type)!;
  const job = JOBS_BY_TYPE[result.type];

  const handleNext = () => {
    onNext({
      type: result.type,
      description: typeDef.description,
      selfPR: "",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">診断結果</h2>
        <p className="text-sm text-gray-500">あなたのタイプが判明しました</p>
      </div>

      {/* タイプカード */}
      <div
        className="rounded-2xl p-6 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${typeDef.color}, ${typeDef.color}cc)` }}
      >
        <p className="text-sm font-medium opacity-80 mb-1">あなたのタイプ</p>
        <h3 className="text-3xl font-bold mb-2">{result.type}</h3>
        <p className="text-sm opacity-90">{typeDef.tagline}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {typeDef.traits.map((t) => (
            <span
              key={t}
              className="bg-white/20 text-white text-xs px-3 py-1 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 詳細 */}
      <div className="bg-gray-50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">あなたの特徴</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{typeDef.description}</p>
        <p className="text-xs text-gray-400 mt-3 leading-relaxed">{result.reason}</p>
      </div>

      {/* 向いている職種 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">向いている営業スタイル</h4>
        <div className="flex flex-wrap gap-2">
          {typeDef.recommendedJobs.map((job) => (
            <span
              key={job}
              className="border text-sm px-3 py-1 rounded-full"
              style={{ borderColor: typeDef.color, color: typeDef.color }}
            >
              {job}
            </span>
          ))}
        </div>
      </div>

      {/* おすすめ求人 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">このタイプが狙える求人例</h4>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500">{job.company}</p>
                <p className="font-semibold text-gray-800 mt-0.5">{job.title}</p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full text-white shrink-0"
                style={{ background: typeDef.color }}
              >
                イメージ
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <div>💰 {job.salary}</div>
              <div>📍 {job.location}</div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {job.features.map((f) => (
                <span key={f} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">※掲載内容はイメージです。実在の求人ではありません。</p>
        {PARTNER_READY && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-900 leading-relaxed">
              {`💼 実際の求人は、提携する人材紹介会社（${ACTIVE_PARTNERS.map((p) => p.name).join("、")}）が無料でご紹介します。履歴書のダウンロード時に希望できます。`}
              <Link href="/partners" target="_blank" className="ml-1 text-xs text-blue-600 underline">提携先一覧</Link>
            </p>
          </div>
        )}
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
          disabled={isNavigating}
          className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isNavigating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              処理中...
            </>
          ) : "履歴書を完成させる →"}
        </button>
      </div>
    </div>
  );
}
