"use client";

import { useEffect, useRef, useState } from "react";
import type { FreeAnswers, StaffType } from "@/types";
import type { ExperienceAnswers } from "@/data/experience";
import { FREE_ANSWER_MAX } from "@/lib/prompts";

interface PRStepProps {
  staffType: StaffType;
  experience: ExperienceAnswers;
  answers: FreeAnswers;
  onAnswersChange: (a: FreeAnswers) => void;
  onGenerated: (selfPR: string) => void;
  onBack: () => void;
}

const QUESTIONS: { key: keyof FreeAnswers; label: string; placeholder: string; required: boolean }[] = [
  { key: "passion", label: "熱中したことは？", placeholder: "例：バイトで新人教育を任されて、教え方を工夫した", required: true },
  { key: "complaint", label: "仕事で不満に思ったことは？", placeholder: "例：忙しい時間に注文ミスが多かった", required: false },
  { key: "action", label: "その不満に、自分で何かした？", placeholder: "例：注文の聞き方をそろえようと店長に提案した", required: false },
];

export default function PRStep({
  staffType,
  experience,
  answers,
  onAnswersChange,
  onGenerated,
  onBack,
}: PRStepProps) {
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const generate = async () => {
    if (!answers.passion.trim() || generating) return;
    setGenerating(true);
    setError("");
    setStreamText("");
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/self-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffType, answers, experience }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "" as string }));
        if (res.status === 429) {
          setError(data.error || "利用上限に達しました。しばらく経ってから再度お試しください。");
          return;
        }
        if (res.status === 400) {
          setError(data.error || "入力内容を確認してください。");
          return;
        }
        console.error("self-pr failed:", res.status, data);
        throw new Error("server_error");
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setStreamText(text);
      }
      if (!text.trim()) {
        console.error("self-pr returned empty stream");
        throw new Error("empty_response");
      }
      onGenerated(text.trim());
    } catch (e) {
      const err = e as Error;
      if (err.name === "AbortError") return;
      setError(
        err.message === "empty_response"
          ? "AIからの応答がありませんでした。少し時間をおいて再度お試しください。"
          : "AIが今使えません。しばらく経ってからもう一度お試しください。入力した内容は残っています。",
      );
      setStreamText("");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">自己PRを作ろう</h2>
        <p className="text-sm text-gray-600">
          あなたの言葉で答えてください。短くてOK。数字（人数・期間など）があれば書いてね。
        </p>
      </div>

      {QUESTIONS.map((q, i) => (
        <div key={q.key}>
          <label htmlFor={`pr-${q.key}`} className="block text-sm font-bold text-gray-800 mb-2">
            {i + 1}. {q.label}
            <span className={`ml-2 text-xs font-normal ${q.required ? "text-red-500" : "text-gray-400"}`}>
              {q.required ? "必須" : "任意"}
            </span>
          </label>
          <textarea
            id={`pr-${q.key}`}
            value={answers[q.key]}
            onChange={(e) => onAnswersChange({ ...answers, [q.key]: e.target.value })}
            maxLength={FREE_ANSWER_MAX}
            rows={3}
            disabled={generating}
            placeholder={q.placeholder}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p className="text-right text-xs text-gray-400">
            {answers[q.key].length} / {FREE_ANSWER_MAX}
          </p>
        </div>
      ))}

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {generating && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-blue-700">自己PRを作っています...</p>
          </div>
          {streamText && (
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{streamText}</p>
          )}
        </div>
      )}

      <div>
        <button
          onClick={generate}
          disabled={generating || !answers.passion.trim()}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          AIに自己PRを作ってもらう →
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">※答えに無い数字や実績は作りません</p>
      </div>

      <button
        onClick={onBack}
        disabled={generating}
        className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-40"
      >
        ← 戻る
      </button>
    </div>
  );
}
