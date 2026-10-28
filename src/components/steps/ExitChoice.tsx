"use client";

import { PARTNER_READY } from "@/data/partners";

interface ExitChoiceProps {
  onChooseLead: () => void;
  onChooseSelf: () => void;
  onBack: () => void;
}

export default function ExitChoice({ onChooseLead, onChooseSelf, onBack }: ExitChoiceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">この強みで、応募書類を仕上げよう</h2>
        <p className="text-sm text-gray-600">履歴書・職務経歴書は、プロと一緒にも、自分ひとりでも作れます。</p>
      </div>

      <div className="space-y-3">
        {PARTNER_READY && (
          <button
            onClick={onChooseLead}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition shadow-md"
          >
            <span className="block font-bold text-lg">プロと一緒に仕上げる（無料）</span>
            <span className="block text-xs text-blue-100 mt-1">自己PRも求人も一緒に考えます</span>
          </button>
        )}
        <button
          onClick={onChooseSelf}
          className="w-full border-2 border-blue-600 text-blue-700 bg-white py-4 rounded-2xl hover:bg-blue-50 transition"
        >
          <span className="block font-bold text-lg">自分で完成させる</span>
          <span className="block text-xs text-gray-500 mt-1">履歴書・職務経歴書をダウンロード</span>
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">どちらも、ここで初めて連絡先を入力します</p>

      <button
        onClick={onBack}
        className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
      >
        ← 戻る
      </button>
    </div>
  );
}
