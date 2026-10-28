"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SITE } from "@/data/site";
import { BasicInfo, DiagnosisResult, Screen } from "@/types";
import { STAFF_TYPES } from "@/data/types";
import { calcDiagnosis } from "@/data/scoring";
import {
  INITIAL_FLOW,
  loadFlow,
  resolveRestoredFlow,
  safeSessionStorage,
  saveFlow,
  type FlowState,
} from "@/lib/flow-storage";
import Step1BasicInfo from "@/components/steps/Step1BasicInfo";
import Step2Diagnosis from "@/components/steps/Step2Diagnosis";
import Step3Result from "@/components/steps/Step3Result";
import Step4Resume from "@/components/steps/Step4Resume";
import ExitChoice from "@/components/steps/ExitChoice";
import LeadForm from "@/components/steps/LeadForm";
import { PARTNER_READY } from "@/data/partners";
import CareerInput from "@/components/steps/CareerInput";
import { EMPTY_JOB, type CareerSheet } from "@/data/career";
import LogoMark from "@/components/LogoMark";

const DEFAULT_BASIC_INFO: BasicInfo = {
  name: "",
  nameKana: "",
  birthDate: "",
  gender: "",
  postalCode: "",
  address: "",
  addressKana: "",
  phone: "",
  email: "",
  photo: "",
  wishes: "貴社の規定に従います。",
  education: [{ year: "", month: "", description: "", label: "卒業" }],
  workHistory: [{ year: "", month: "", description: "", label: "入社" }],
  certifications: [{ name: "", year: "", month: "" }],
};

const STEP_LABELS = ["診断", "結果", "仕上げ"];

const SCREEN_STEP: Partial<Record<Screen, number>> = {
  diagnosis: 1,
  result: 2,
  exit: 3,
  lead: 3,
  basic: 3,
  career: 3,
  download: 3,
};

export default function Home() {
  const [flow, setFlow] = useState<FlowState>(INITIAL_FLOW);
  const [hydrated, setHydrated] = useState(false);
  // 申し込みフォームの「戻る」の行き先（ダウンロード画面から相談に来た人はそこへ戻す）
  const [leadBackTo, setLeadBackTo] = useState<Screen>("exit");
  // 連絡先・基本情報は保存しない（再読み込みで消える）
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(DEFAULT_BASIC_INFO);
  // 職務経歴書も保存しない（基本情報と同じ扱い）
  const [careerSheet, setCareerSheet] = useState<CareerSheet>({
    summary: "",
    jobs: [{ ...EMPTY_JOB }],
    skills: [],
  });

  // 再読み込みで基本情報・職務経歴書が消えたことを、基本情報の画面で1回だけ知らせる
  const [inputLostNotice, setInputLostNotice] = useState(false);

  // 初回マウント時に途中経過を復元し、?ref= を保存
  useEffect(() => {
    const storage = safeSessionStorage();
    const { flow: resumed, personalInputLost } = resolveRestoredFlow(
      storage ? loadFlow(storage) : INITIAL_FLOW,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlow(resumed);
    setInputLostNotice(personalInputLost);
    setHydrated(true);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) storage?.setItem("ref_source", ref);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const storage = safeSessionStorage();
    if (storage) saveFlow(storage, flow);
  }, [flow, hydrated]);

  const goTo = (screen: Screen) => {
    setInputLostNotice(false);
    setFlow((f) => ({ ...f, screen }));
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const diagnosisResult = useMemo<DiagnosisResult | null>(() => {
    if (flow.diagnosisAnswers.length === 0) return null;
    try {
      const type = calcDiagnosis(flow.diagnosisAnswers);
      const def = STAFF_TYPES.find((t) => t.name === type)!;
      return { type, description: def.description, selfPR: flow.selfPR };
    } catch {
      return null;
    }
  }, [flow.diagnosisAnswers, flow.selfPR]);

  const { screen } = flow;

  if (!hydrated) {
    return <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" />;
  }

  if (screen === "landing") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-5 shadow-lg">
              <LogoMark className="w-8 h-10" />
            </div>
            <br />
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-5">
              学歴・職歴は関係なし
            </span>
            <p className="text-sm font-bold text-blue-600 mb-3">{SITE.brand}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-snug">
              フリーターだった私でも、営業マンになれる？
            </h1>
            <p className="text-base text-gray-700 leading-relaxed">
              12問に答えるだけで、あなたの『営業マン適性』と強みがわかります。
            </p>
          </div>

          <div>
            <button
              onClick={() => goTo("diagnosis")}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              無料で診断してみる →
            </button>
            <p className="text-xs text-gray-500 mt-3">登録なしで結果まで見られます</p>
          </div>

          <div className="flex justify-center gap-4 text-xs text-gray-400 pt-4">
            <Link href="/privacy" className="hover:text-blue-600 hover:underline">プライバシーポリシー</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-blue-600 hover:underline">利用規約</Link>
            <span>·</span>
            <Link href="/partners" className="hover:text-blue-600 hover:underline">提携先一覧</Link>
          </div>
          <p className="text-xs text-gray-400">運営：{SITE.operator}</p>
        </div>
      </main>
    );
  }

  const step = SCREEN_STEP[screen] ?? 1;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800 text-sm">{SITE.brand}</span>
            <span className="text-xs text-gray-400">STEP {step} / {STEP_LABELS.length}</span>
          </div>
          <div className="flex gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    i + 1 <= step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
                <p
                  className={`text-center text-xs mt-1 ${
                    i + 1 === step ? "text-blue-600 font-medium" : "text-gray-400"
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8">
        {screen === "diagnosis" && (
          <Step2Diagnosis
            initialAnswers={flow.diagnosisAnswers}
            // 途中の選択（experienceDraft）を優先。古い保存データで空なら確定済みの答えを使う
            initialExperience={{ ...(flow.experience ?? {}), ...flow.experienceDraft }}
            onAnswersChange={(answers) => setFlow((f) => ({ ...f, diagnosisAnswers: answers }))}
            onExperienceChange={(draft) => setFlow((f) => ({ ...f, experienceDraft: draft }))}
            onNext={(answers, experience) => {
              setFlow((f) => ({
                ...f,
                diagnosisAnswers: answers,
                experience,
                experienceDraft: experience,
                screen: "result",
              }));
              window.scrollTo({ top: 0, behavior: "auto" });
            }}
            onBack={() => goTo("landing")}
          />
        )}
        {screen === "result" && flow.experience && (
          <Step3Result
            answers={flow.diagnosisAnswers}
            experience={flow.experience}
            onNext={() => goTo("exit")}
            onBack={() => goTo("diagnosis")}
          />
        )}
        {screen === "basic" && inputLostNotice && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
          >
            安全のため、氏名などの入力内容は保存していません。お手数ですが、もう一度入力してください。
          </p>
        )}
        {screen === "basic" && (
          <Step1BasicInfo
            data={basicInfo}
            onChange={setBasicInfo}
            nextLabel="次へ：職務経歴書へ →"
            onNext={() => goTo("career")}
          />
        )}
        {screen === "career" && (
          <CareerInput
            value={careerSheet}
            onChange={setCareerSheet}
            onNext={() => goTo("download")}
            onBack={() => goTo("basic")}
          />
        )}
        {screen === "download" && diagnosisResult && (
          <Step4Resume
            basicInfo={basicInfo}
            diagnosisResult={diagnosisResult}
            careerSheet={careerSheet}
            onBack={() => goTo("career")}
            onConsult={(pr) => {
              // ダウンロード画面で書いた自己PRを申し込みに添える（空でもよい）
              setFlow((f) => ({ ...f, selfPR: pr }));
              setLeadBackTo("download");
              goTo("lead");
            }}
          />
        )}
        {screen === "exit" && (
          <ExitChoice
            onChooseLead={() => {
              setLeadBackTo("exit");
              goTo("lead");
            }}
            onChooseSelf={() => goTo("basic")}
            onBack={() => goTo("result")}
          />
        )}
        {screen === "lead" && diagnosisResult && PARTNER_READY && (
          <LeadForm
            diagnosisType={diagnosisResult.type}
            freeAnswers={flow.freeAnswers}
            selfPR={flow.selfPR}
            onBack={() => goTo(leadBackTo)}
          />
        )}
      </div>
    </main>
  );
}
