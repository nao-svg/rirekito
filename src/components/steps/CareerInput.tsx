"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACHIEVEMENT_MAX,
  DUTY_OPTIONS,
  EMPLOYMENT_TYPES,
  EMPTY_JOB,
  MAX_JOBS,
  SKILL_OPTIONS,
  WORKPLACE_TYPES,
  type CareerJob,
  type CareerSheet,
} from "@/data/career";

interface CareerInputProps {
  value: CareerSheet;
  onChange: (v: CareerSheet) => void;
  onNext: () => void;
  onBack: () => void;
}

const INPUT =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100";

// 期間が入っていない勤務先の番号（1始まり）
function missingPeriodJobs(jobs: CareerJob[]): number[] {
  return jobs.flatMap((j, i) => (j.start === "" ? [i + 1] : []));
}

// やめた月がはじめた月より前になっている勤務先の番号（1始まり）
function reversedPeriodJobs(jobs: CareerJob[]): number[] {
  return jobs.flatMap((j, i) => (j.start !== "" && j.end !== "" && j.end < j.start ? [i + 1] : []));
}

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export default function CareerInput({ value, onChange, onNext, onBack }: CareerInputProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [periodError, setPeriodError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const updateJob = (index: number, patch: Partial<CareerJob>) => {
    onChange({
      ...value,
      jobs: value.jobs.map((j, i) => (i === index ? { ...j, ...patch } : j)),
    });
  };

  const addJob = () => {
    if (value.jobs.length >= MAX_JOBS) return;
    onChange({ ...value, jobs: [...value.jobs, { ...EMPTY_JOB }] });
  };

  const removeJob = (index: number) => {
    if (value.jobs.length <= 1) return;
    onChange({ ...value, jobs: value.jobs.filter((_, i) => i !== index) });
  };

  const checkPeriods = (): boolean => {
    const missing = missingPeriodJobs(value.jobs);
    if (missing.length > 0) {
      setPeriodError(`${missing.map((n) => `勤務先${n}`).join("・")}の「はじめた月」を入れてください。`);
      return false;
    }
    const reversed = reversedPeriodJobs(value.jobs);
    if (reversed.length > 0) {
      setPeriodError(`${reversed.map((n) => `勤務先${n}`).join("・")}の「やめた月」が「はじめた月」より前になっています。`);
      return false;
    }
    setPeriodError("");
    return true;
  };

  const generateSummary = async () => {
    if (generating) return;
    if (!checkPeriods()) return;
    setGenerating(true);
    setError("");
    abortRef.current = new AbortController();
    const before = value;
    try {
      const res = await fetch("/api/career-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: value.jobs, skills: value.skills }),
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
        console.error("career-summary failed:", res.status, data);
        throw new Error("server_error");
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        text += decoder.decode(chunk, { stream: true });
        onChange({ ...before, summary: text });
      }
      if (!text.trim()) {
        console.error("career-summary returned empty stream");
        throw new Error("empty_response");
      }
      onChange({ ...before, summary: text.trim() });
    } catch (e) {
      const err = e as Error;
      if (err.name === "AbortError") return;
      setError(
        err.message === "empty_response"
          ? "AIからの応答がありませんでした。少し時間をおいて再度お試しください。"
          : "AIが今使えません。しばらく経ってからもう一度お試しください。職務要約は自分で書いても大丈夫です。",
      );
      onChange({ ...before });
    } finally {
      setGenerating(false);
    }
  };

  const handleNext = () => {
    if (!checkPeriods()) return;
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">職務経歴書を作ろう</h2>
        <p className="text-sm text-gray-600">
          バイトやパートの経験もしっかり書けます。新しい順でも古い順でもOK。
        </p>
      </div>

      {value.jobs.map((job, i) => (
        <fieldset
          key={i}
          disabled={generating}
          aria-label={`勤務先${i + 1}`}
          className="rounded-xl border border-gray-200 bg-white p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">勤務先{i + 1}</h3>
            {value.jobs.length > 1 && (
              <button
                type="button"
                onClick={() => removeJob(i)}
                className="text-xs text-red-500 hover:underline"
              >
                この勤務先を削除
              </button>
            )}
          </div>

          {/* 期間 */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">
              期間 <span className="text-xs text-red-500">必須</span>
            </p>
            <div className="flex items-center gap-2">
              <input
                type="month"
                aria-label={`勤務先${i + 1}のはじめた月`}
                value={job.start}
                onChange={(e) => updateJob(i, { start: e.target.value })}
                className={INPUT}
              />
              <span className="text-sm text-gray-500 shrink-0">〜</span>
              <input
                type="month"
                aria-label={`勤務先${i + 1}のやめた月`}
                value={job.end}
                onChange={(e) => updateJob(i, { end: e.target.value })}
                disabled={job.end === ""}
                className={INPUT}
              />
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={job.end === ""}
                onChange={(e) =>
                  // チェックを外したら、やめた月を入れられるよう今月を仮に入れる
                  updateJob(i, { end: e.target.checked ? "" : currentYearMonth() })
                }
              />
              現在も働いている
            </label>
          </div>

          {/* 種類・雇用形態 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`career-type-${i}`} className="block text-sm font-medium text-gray-700 mb-1">
                お店・会社の種類
              </label>
              <select
                id={`career-type-${i}`}
                value={job.workplaceType}
                onChange={(e) => updateJob(i, { workplaceType: e.target.value as CareerJob["workplaceType"] })}
                className={INPUT}
              >
                {WORKPLACE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`career-employment-${i}`} className="block text-sm font-medium text-gray-700 mb-1">
                雇用形態
              </label>
              <select
                id={`career-employment-${i}`}
                value={job.employment}
                onChange={(e) => updateJob(i, { employment: e.target.value as CareerJob["employment"] })}
                className={INPUT}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 何をしていたか */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">何をしていたか（いくつでも）</p>
            <div className="flex flex-wrap gap-2">
              {DUTY_OPTIONS.map((d) => {
                const checked = job.duties.includes(d);
                return (
                  <label
                    key={d}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition ${
                      checked ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => updateJob(i, { duties: toggle(job.duties, d) })}
                      className="sr-only"
                    />
                    {d}
                  </label>
                );
              })}
            </div>
            <input
              type="text"
              aria-label={`勤務先${i + 1}の業務のひとこと`}
              value={job.dutiesNote}
              onChange={(e) => updateJob(i, { dutiesNote: e.target.value })}
              maxLength={ACHIEVEMENT_MAX}
              placeholder="ひとこと（任意）例：ランチの時間はホールを1人で回していた"
              className={`${INPUT} mt-2`}
            />
          </div>

          {/* 頑張ったこと */}
          <div>
            <label htmlFor={`career-achievement-${i}`} className="block text-sm font-medium text-gray-700 mb-1">
              頑張ったこと・うまくいったこと
            </label>
            <textarea
              id={`career-achievement-${i}`}
              value={job.achievement}
              onChange={(e) => updateJob(i, { achievement: e.target.value })}
              maxLength={ACHIEVEMENT_MAX}
              rows={3}
              className={`${INPUT} resize-none`}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>人数や期間など、数字があれば書いてね</span>
              <span>{job.achievement.length} / {ACHIEVEMENT_MAX}</span>
            </div>
          </div>
        </fieldset>
      ))}

      {value.jobs.length < MAX_JOBS && (
        <button
          type="button"
          onClick={addJob}
          disabled={generating}
          className="w-full border border-dashed border-blue-300 text-blue-600 py-3 rounded-xl text-sm font-medium hover:bg-blue-50 transition disabled:opacity-40"
        >
          ＋ 勤務先を追加する（最大{MAX_JOBS}つ）
        </button>
      )}

      {/* 活かせる経験・スキル */}
      <fieldset disabled={generating} className="rounded-xl border border-gray-200 bg-white p-4">
        <legend className="px-1 text-sm font-bold text-gray-800">活かせる経験・スキル（いくつでも）</legend>
        <div className="flex flex-wrap gap-2 mt-2">
          {SKILL_OPTIONS.map((sk) => {
            const checked = value.skills.includes(sk);
            return (
              <label
                key={sk}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition ${
                  checked ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange({ ...value, skills: toggle(value.skills, sk) })}
                  className="sr-only"
                />
                {sk}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* 職務要約 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div>
          <p className="text-sm font-bold text-gray-800">職務要約（任意）</p>
          <p className="text-xs text-gray-500 mt-0.5">
            上の内容から、AIが3〜4行のまとめを作ります。あとから自由に直せます。
          </p>
        </div>
        <button
          type="button"
          onClick={generateSummary}
          disabled={generating}
          className="w-full border border-blue-600 text-blue-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {generating ? "職務要約を作っています..." : "✨ 職務要約をAIで作る"}
        </button>
        <textarea
          aria-label="職務要約"
          value={value.summary}
          onChange={(e) => onChange({ ...value, summary: e.target.value })}
          readOnly={generating}
          rows={5}
          placeholder="ボタンを押すとここに入ります。自分で書いてもOK。空のままでも次へ進めます。"
          className={`${INPUT} resize-none leading-relaxed`}
        />
        <p className="text-xs text-gray-500">※入力に無い数字や実績は作りません</p>
      </div>

      {(error || periodError) && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {periodError || error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={generating}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition disabled:opacity-40"
        >
          ← 戻る
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={generating}
          className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          次へ：PDFを作る →
        </button>
      </div>
    </div>
  );
}
