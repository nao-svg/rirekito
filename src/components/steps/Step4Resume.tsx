"use client";

import { useState } from "react";
import { BasicInfo, DiagnosisResult } from "@/types";
import { formatPeriod, type CareerSheet } from "@/data/career";
import { STAFF_TYPES } from "@/data/types";
import dynamic from "next/dynamic";

const ResumePDFDownload = dynamic(() => import("@/components/ResumePDFDownload"), {
  ssr: false,
  loading: () => (
    <button className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed">
      PDFを準備中...
    </button>
  ),
});

interface Props {
  basicInfo: BasicInfo;
  diagnosisResult: DiagnosisResult;
  careerSheet: CareerSheet;
  onBack: () => void;
}

export default function Step4Resume({ basicInfo, diagnosisResult, careerSheet, onBack }: Props) {
  const typeDef = STAFF_TYPES.find((t) => t.name === diagnosisResult.type)!;
  // 出口画面で作った自己PRを初期値にする（ここでも直せる）。
  // タイプの見本文は例のエピソードを含むので、空でも代わりに入れない
  const [selfPR, setSelfPR] = useState(diagnosisResult.selfPR);

  const age = basicInfo.birthDate
    ? Math.floor(
        (new Date().getTime() - new Date(basicInfo.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">履歴書・職務経歴書</h2>
        <p className="text-sm text-gray-500">内容を確認してPDFをダウンロードしてください</p>
      </div>

      {/* タイプバッジ */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: `${typeDef.color}15` }}
      >
        <div className="w-2 h-8 rounded-full" style={{ background: typeDef.color }} />
        <div>
          <p className="text-xs text-gray-500">あなたのタイプ</p>
          <p className="font-bold" style={{ color: typeDef.color }}>
            {diagnosisResult.type}
          </p>
        </div>
      </div>

      {/* 基本情報プレビュー */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">基本情報</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 text-xs">氏名</span>
            <p className="font-medium">{basicInfo.name}（{basicInfo.nameKana}）</p>
          </div>
          {age && (
            <div>
              <span className="text-gray-500 text-xs">年齢</span>
              <p className="font-medium">{age}歳</p>
            </div>
          )}
          {basicInfo.address && (
            <div className="col-span-2">
              <span className="text-gray-500 text-xs">住所</span>
              <p className="font-medium">{basicInfo.address}</p>
            </div>
          )}
          {basicInfo.email && (
            <div>
              <span className="text-gray-500 text-xs">メール</span>
              <p className="font-medium">{basicInfo.email}</p>
            </div>
          )}
          {basicInfo.phone && (
            <div>
              <span className="text-gray-500 text-xs">電話</span>
              <p className="font-medium">{basicInfo.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* 学歴・職歴 */}
      {(basicInfo.education.some((e) => e.description) ||
        basicInfo.workHistory.some((w) => w.description)) && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">学歴・職歴</h3>
          </div>
          <div className="p-4 space-y-2">
            {basicInfo.education
              .filter((e) => e.description)
              .map((e, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-gray-400 shrink-0">{e.year}年{e.month}月</span>
                  <span>{e.description}{e.label !== "──" ? ` ${e.label}` : ""}</span>
                </div>
              ))}
            {basicInfo.workHistory
              .filter((w) => w.description)
              .map((w, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-gray-400 shrink-0">{w.year}年{w.month}月</span>
                  <span>{w.description}{w.label !== "──" ? ` ${w.label}` : ""}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 職務経歴書 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">職務経歴書</h3>
        </div>
        <div className="p-4 space-y-2">
          {careerSheet.jobs.map((job, i) => (
            <div key={i} className="flex flex-wrap gap-x-3 text-sm">
              <span className="text-gray-400 shrink-0">
                {job.start ? formatPeriod(job.start, job.end) : "期間未入力"}
              </span>
              <span>
                {job.workplaceType}（{job.employment}）
              </span>
            </div>
          ))}
          {careerSheet.summary.trim() === "" && (
            <p className="text-xs text-gray-400">職務要約は空のため、PDFには載りません</p>
          )}
        </div>
      </div>

      {/* 自己PR */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">自己PR（履歴書・職務経歴書の両方に載ります）</h3>
        </div>
        <div className="p-4">
          <textarea
            aria-label="自己PR"
            value={selfPR}
            onChange={(e) => setSelfPR(e.target.value)}
            rows={6}
            maxLength={600}
            className="w-full text-sm text-gray-700 leading-relaxed resize-none focus:outline-none"
          />
          {selfPR && (
            <p className="text-xs text-gray-400 text-right mt-1">{selfPR.length}字</p>
          )}
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          ← 戻る
        </button>
        <div className="flex-[2]">
          <ResumePDFDownload
            basicInfo={basicInfo}
            diagnosisResult={{ ...diagnosisResult, selfPR }}
            careerSheet={careerSheet}
          />
        </div>
      </div>
    </div>
  );
}
