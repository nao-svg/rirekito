"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { SITE } from "@/data/site";
import { BasicInfo, DiagnosisResult, Screen } from "@/types";
import { STAFF_TYPES } from "@/data/types";
import { calcDiagnosis } from "@/data/scoring";
import { INITIAL_FLOW, loadFlow, saveFlow, type FlowState } from "@/lib/flow-storage";
import Step1BasicInfo from "@/components/steps/Step1BasicInfo";
import Step2Diagnosis from "@/components/steps/Step2Diagnosis";
import Step3Result from "@/components/steps/Step3Result";
import Step4Resume from "@/components/steps/Step4Resume";
import PRStep from "@/components/steps/PRStep";
import ExitChoice from "@/components/steps/ExitChoice";
import LeadForm from "@/components/steps/LeadForm";
import { PARTNER_READY } from "@/data/partners";
import CareerInput from "@/components/steps/CareerInput";
import { ACHIEVEMENT_MAX, EMPTY_JOB, type CareerSheet } from "@/data/career";

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

const STEP_LABELS = ["診断", "結果", "自己PR", "仕上げ"];

const SCREEN_STEP: Partial<Record<Screen, number>> = {
  diagnosis: 1,
  result: 2,
  pr: 3,
  exit: 3,
  lead: 4,
  basic: 4,
  career: 4,
  download: 4,
};

export default function Home() {
  const [flow, setFlow] = useState<FlowState>(INITIAL_FLOW);
  const [hydrated, setHydrated] = useState(false);
  // 連絡先・基本情報は保存しない（再読み込みで消える）
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(DEFAULT_BASIC_INFO);
  // 職務経歴書も保存しない（基本情報と同じ扱い）
  const [careerSheet, setCareerSheet] = useState<CareerSheet>({
    summary: "",
    jobs: [{ ...EMPTY_JOB }],
    skills: [],
  });

  // 初回マウント時に途中経過を復元し、?ref= を保存
  useEffect(() => {
    const restored = loadFlow(sessionStorage);
    // 結果以降の画面なのに診断データが無い場合は入口に戻す
    const needsData = restored.screen !== "landing" && restored.screen !== "diagnosis";
    const broken =
      needsData && (restored.diagnosisAnswers.length === 0 || restored.experience === null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlow(broken ? INITIAL_FLOW : restored);
    setHydrated(true);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) sessionStorage.setItem("ref_source", ref);
  }, []);

  useEffect(() => {
    if (hydrated) saveFlow(sessionStorage, flow);
  }, [flow, hydrated]);

  const goTo = (screen: Screen) => {
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
            onNext={(answers, experience) => {
              setFlow((f) => ({ ...f, diagnosisAnswers: answers, experience, screen: "result" }));
              window.scrollTo({ top: 0, behavior: "auto" });
            }}
            onBack={() => goTo("landing")}
          />
        )}
        {screen === "result" && flow.experience && (
          <Step3Result
            answers={flow.diagnosisAnswers}
            experience={flow.experience}
            onNext={() => goTo("pr")}
            onBack={() => goTo("diagnosis")}
          />
        )}
        {screen === "basic" && (
          <Step1BasicInfo
            data={basicInfo}
            onChange={setBasicInfo}
            nextLabel="次へ：職務経歴書へ →"
            onNext={() => {
              // 最初の勤務先の「頑張ったこと」が空なら、自己PRづくりの「熱中したこと」を入れておく
              const passion = flow.freeAnswers.passion.trim();
              setCareerSheet((c) =>
                passion && c.jobs[0] && c.jobs[0].achievement === ""
                  ? { ...c, jobs: [{ ...c.jobs[0], achievement: passion.slice(0, ACHIEVEMENT_MAX) }, ...c.jobs.slice(1)] }
                  : c,
              );
              goTo("career");
            }}
          />
        )}
        {screen === "career" && (
          <CareerInput
            value={careerSheet}
            onChange={setCareerSheet}
            passionHint={flow.freeAnswers.passion.trim().slice(0, ACHIEVEMENT_MAX)}
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
          />
        )}
        {screen === "pr" && flow.experience && diagnosisResult && (
          <PRStep
            staffType={diagnosisResult.type}
            experience={flow.experience}
            answers={flow.freeAnswers}
            onAnswersChange={(a) => setFlow((f) => ({ ...f, freeAnswers: a }))}
            onGenerated={(selfPR) => {
              setFlow((f) => ({ ...f, selfPR, screen: "exit" }));
              window.scrollTo({ top: 0, behavior: "auto" });
            }}
            onBack={() => goTo("result")}
          />
        )}
        {screen === "exit" && (
          <ExitChoice
            selfPR={flow.selfPR}
            onSelfPRChange={(s) => setFlow((f) => ({ ...f, selfPR: s }))}
            onChooseLead={() => goTo("lead")}
            onChooseSelf={() => goTo("basic")}
            onRegenerate={() => goTo("pr")}
          />
        )}
        {screen === "lead" && diagnosisResult && PARTNER_READY && (
          <LeadForm
            diagnosisType={diagnosisResult.type}
            freeAnswers={flow.freeAnswers}
            selfPR={flow.selfPR}
            onBack={() => goTo("exit")}
          />
        )}
      </div>
    </main>
  );
}
