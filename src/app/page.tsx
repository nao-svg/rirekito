"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SITE } from "@/data/site";
import { BasicInfo, DiagnosisAnswer, DiagnosisResult, Step } from "@/types";
import Step1BasicInfo from "@/components/steps/Step1BasicInfo";
import Step2Diagnosis from "@/components/steps/Step2Diagnosis";
import Step3Result from "@/components/steps/Step3Result";
import Step4Resume from "@/components/steps/Step4Resume";
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

const STEP_LABELS = ["基本情報", "自己診断", "診断結果", "履歴書作成"];

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [started, setStarted] = useState(false);
  const [basicInfo, setBasicInfo] = useState<BasicInfo>(DEFAULT_BASIC_INFO);
  const [diagnosisAnswers, setDiagnosisAnswers] = useState<DiagnosisAnswer[]>([]);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);

  // URLの ?ref= をsessionStorageに保存（ページ遷移後も保持）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) sessionStorage.setItem("ref_source", ref);
  }, []);

  if (!started) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
              <LogoMark className="w-8 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {SITE.brand}
            </h1>
            <p className="text-base text-gray-700 leading-relaxed mb-2">
              営業への転職書類、<br />5分で完成。
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              強みを診断するだけで、営業向けの自己PRが完成。<br />
              そのまま履歴書PDFで出力できます。
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left space-y-3">
            {[
              { icon: "📝", text: "基本情報を入力（5分）" },
              { icon: "🧠", text: "10問の自己診断に答える" },
              { icon: "✨", text: "AIがあなたのタイプを診断" },
              { icon: "📄", text: "自己PR入り履歴書をPDF出力" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            無料ではじめる →
          </button>
          <p className="text-xs text-gray-400">完全無料・5分で完成</p>
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

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800 text-sm">{SITE.brand}</span>
            <span className="text-xs text-gray-400">STEP {step} / 4</span>
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
        {step === 1 && (
          <Step1BasicInfo
            data={basicInfo}
            onChange={setBasicInfo}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Diagnosis
            onNext={(answers) => {
              setDiagnosisAnswers(answers);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Result
            answers={diagnosisAnswers}
            onNext={(result) => {
              setDiagnosisResult(result);
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && diagnosisResult && (
          <Step4Resume
            basicInfo={basicInfo}
            diagnosisResult={diagnosisResult}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </main>
  );
}
