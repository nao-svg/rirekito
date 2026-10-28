"use client";

import { PARTNER_READY } from "@/data/partners";

interface ExitChoiceProps {
  selfPR: string;
  onSelfPRChange: (s: string) => void;
  onChooseLead: () => void;
  onChooseSelf: () => void;
  onRegenerate: () => void;
}

export default function ExitChoice({
  selfPR,
  onSelfPRChange,
  onChooseLead,
  onChooseSelf,
  onRegenerate,
}: ExitChoiceProps) {
  const isEmpty = selfPR.trim() === "";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">この自己PRで、応募書類を仕上げよう</h2>

      <div>
        <textarea
          value={selfPR}
          onChange={(e) => onSelfPRChange(e.target.value)}
          rows={10}
          maxLength={600}
          aria-label="自己PR"
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isEmpty && (
          <p role="alert" className="text-sm text-red-600 mt-1">
            自己PRが空です。作り直すか、入力してください。
          </p>
        )}
        <div className="flex items-start justify-between gap-3 mt-1">
          {PARTNER_READY ? (
            <button
              onClick={onChooseLead}
              disabled={isEmpty}
              className="text-left text-sm text-blue-600 underline disabled:opacity-40 disabled:cursor-not-allowed"
            >
              うまく直せない？プロに無料で相談 →
            </button>
          ) : (
            <span />
          )}
          <button onClick={onRegenerate} className="shrink-0 text-sm text-blue-600 underline">
            作り直す
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {PARTNER_READY && (
          <button
            onClick={onChooseLead}
            disabled={isEmpty}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="block font-bold text-lg">プロと一緒に仕上げる（無料）</span>
            <span className="block text-xs text-blue-100 mt-1">求人も一緒に探せます</span>
          </button>
        )}
        <button
          onClick={onChooseSelf}
          disabled={isEmpty}
          className="w-full border-2 border-blue-600 text-blue-700 bg-white py-4 rounded-2xl hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="block font-bold text-lg">自分で完成させる</span>
          <span className="block text-xs text-gray-500 mt-1">履歴書・職務経歴書をダウンロード</span>
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">どちらも、ここで初めて連絡先を入力します</p>
    </div>
  );
}
