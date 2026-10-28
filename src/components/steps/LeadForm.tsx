"use client";

import { useState } from "react";
import Link from "next/link";
import type { FreeAnswers, StaffType } from "@/types";
import { ACTIVE_PARTNERS } from "@/data/partners";
import { safeSessionStorage } from "@/lib/flow-storage";
import {
  CONTACT_METHODS,
  CONTACT_METHOD_LABELS,
  CONTACT_TIMES,
  leadConsentText,
  leadSchema,
} from "@/lib/lead";

interface LeadFormProps {
  diagnosisType: StaffType;
  freeAnswers: FreeAnswers;
  selfPR: string;
  onBack: () => void;
}

type FieldKey = "displayName" | "phone" | "contactMethod" | "contactTime" | "currentJob" | "desiredJob" | "consent";

const FIELD_MESSAGES: Record<FieldKey, string> = {
  displayName: "お名前を30文字以内で入力してください。",
  phone: "10〜11桁で入力してください。",
  contactMethod: "連絡方法を選んでください。",
  contactTime: "つながりやすい時間帯を選んでください。",
  currentJob: "今のお仕事を50文字以内で入力してください。",
  desiredJob: "希望のお仕事を50文字以内で入力してください。",
  consent: "同意にチェックを入れてください。",
};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function LeadForm({ diagnosisType, freeAnswers, selfPR, onBack }: LeadFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactMethod, setContactMethod] = useState<(typeof CONTACT_METHODS)[number]>("phone");
  const [contactTime, setContactTime] = useState<string>(CONTACT_TIMES[0]);
  const [currentJob, setCurrentJob] = useState("");
  const [desiredJob, setDesiredJob] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // 同意文に表示する提携先名（送信する shownPartners もこれと同じ）
  const partnerNames = ACTIVE_PARTNERS.map((p) => p.name);
  const partnerNamesLabel = partnerNames.join("、");
  const lineUrl = ACTIVE_PARTNERS.find((p) => p.lineUrl)?.lineUrl;

  const handleSubmit = async () => {
    if (submitting) return;
    setFormError("");
    const payload = {
      displayName,
      phone,
      contactMethod,
      contactTime,
      currentJob,
      desiredJob,
      consent,
      diagnosisType,
      freeAnswers,
      selfPR,
      refSource: safeSessionStorage()?.getItem("ref_source") ?? null,
      shownPartners: partnerNames,
    };
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (key in FIELD_MESSAGES && !errs[key as FieldKey]) errs[key as FieldKey] = FIELD_MESSAGES[key as FieldKey];
      }
      setFieldErrors(errs);
      if (Object.keys(errs).length === 0) setFormError("入力内容を確認してください。");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setFormError(data?.error || "送信に失敗しました。しばらくしてからもう一度お試しください。");
    } catch {
      setFormError("通信に失敗しました。電波の良い場所でもう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-6 text-center py-8">
        <h2 className="text-xl font-bold text-gray-900">申し込みを受け付けました</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {partnerNamesLabel} の担当者から、ご希望の方法でご連絡します。
        </p>
        {contactMethod === "line" &&
          (lineUrl ? (
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition shadow-md"
            >
              LINEで友だち追加する
            </a>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">
              担当者からまずお電話（またはSMS）で、LINE のご案内をします。
            </p>
          ))}
      </div>
    );
  }

  const errorText = (key: FieldKey) =>
    fieldErrors[key] ? (
      <p role="alert" className="text-sm text-red-600 mt-1">
        {fieldErrors[key]}
      </p>
    ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">プロと一緒に仕上げる</h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          営業職専門のキャリアアドバイザーが、書類の仕上げと求人探しを無料でお手伝いします。
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="lead-name" className="block text-sm font-bold text-gray-800 mb-1">
            お名前
          </label>
          <input
            id="lead-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="例：山田太郎"
            maxLength={30}
            className={inputClass}
          />
          {errorText("displayName")}
        </div>

        <div>
          <label htmlFor="lead-phone" className="block text-sm font-bold text-gray-800 mb-1">
            電話番号
          </label>
          <input
            id="lead-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="例：09012345678"
            maxLength={30}
            className={inputClass}
          />
          {errorText("phone")}
        </div>

        <fieldset>
          <legend className="block text-sm font-bold text-gray-800 mb-1">連絡方法</legend>
          <div className="flex gap-4">
            {CONTACT_METHODS.map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="radio"
                  name="contactMethod"
                  value={m}
                  checked={contactMethod === m}
                  onChange={() => setContactMethod(m)}
                />
                {CONTACT_METHOD_LABELS[m]}
              </label>
            ))}
          </div>
          {errorText("contactMethod")}
        </fieldset>

        <div>
          <label htmlFor="lead-time" className="block text-sm font-bold text-gray-800 mb-1">
            つながりやすい時間帯
          </label>
          <select
            id="lead-time"
            value={contactTime}
            onChange={(e) => setContactTime(e.target.value)}
            className={inputClass}
          >
            {CONTACT_TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errorText("contactTime")}
        </div>

        <div>
          <label htmlFor="lead-current" className="block text-sm font-bold text-gray-800 mb-1">
            今のお仕事
          </label>
          <input
            id="lead-current"
            type="text"
            value={currentJob}
            onChange={(e) => setCurrentJob(e.target.value)}
            placeholder="例：飲食店のアルバイト"
            maxLength={50}
            className={inputClass}
          />
          {errorText("currentJob")}
        </div>

        <div>
          <label htmlFor="lead-desired" className="block text-sm font-bold text-gray-800 mb-1">
            希望のお仕事
          </label>
          <input
            id="lead-desired"
            type="text"
            value={desiredJob}
            onChange={(e) => setDesiredJob(e.target.value)}
            placeholder="例：営業職"
            maxLength={50}
            className={inputClass}
          />
          {errorText("desiredJob")}
        </div>
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm text-gray-800 leading-relaxed">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1"
          />
          <span>
            {leadConsentText(partnerNames)}（
            <Link href="/partners" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              提携先一覧
            </Link>
            ）
          </span>
        </label>
        {errorText("consent")}
      </div>

      {formError && (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      )}

      <div className="space-y-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "送信中…" : "無料で申し込む"}
        </button>
        <div className="text-center">
          <button onClick={onBack} disabled={submitting} className="text-sm text-gray-500 underline">
            ← 戻る
          </button>
        </div>
      </div>
    </div>
  );
}
