"use client";

import { useEffect, useRef, useState } from "react";
import { BasicInfo, DiagnosisResult } from "@/types";
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

type BrushupState = "idle" | "input" | "processing" | "done";

interface Props {
  basicInfo: BasicInfo;
  diagnosisResult: DiagnosisResult;
  onBack: () => void;
}

export default function Step4Resume({ basicInfo, diagnosisResult, onBack }: Props) {
  const typeDef = STAFF_TYPES.find((t) => t.name === diagnosisResult.type)!;
  const [selfPR, setSelfPR] = useState(typeDef.selfPR);
  const [generating, setGenerating] = useState(false);
  const [generated] = useState(true);
  const [brushupState, setBrushupState] = useState<BrushupState>("idle");
  const [userStrengths, setUserStrengths] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const brushupPR = async () => {
    if (!userStrengths.trim()) return;
    setBrushupState("processing");
    setSelfPR("");
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/brushup-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userStrengths, staffType: diagnosisResult.type }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        // 構造化エラーレスポンスの読み取り
        const data = await res.json().catch(() => ({ error: "" as string }));
        if (res.status === 429) {
          alert(data.error || "利用上限に達しました。しばらく経ってから再度お試しください。");
          setBrushupState("input");
          setSelfPR(typeDef.selfPR);
          return;
        }
        if (res.status === 400) {
          alert(data.error || "入力内容を確認してください。");
          setBrushupState("input");
          setSelfPR(typeDef.selfPR);
          return;
        }
        // 5xxサーバエラー（AI障害含む）
        console.error("brushup-pr failed:", res.status, data);
        throw new Error("server_error");
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setSelfPR(text);
      }
      if (!text.trim()) {
        console.error("brushup-pr returned empty stream");
        throw new Error("empty_response");
      }
      setBrushupState("done");
    } catch (e) {
      const err = e as Error;
      if (err.name === "AbortError") return;
      // ネットワーク障害 / AI障害 / 空レスポンス
      const msg =
        err.message === "empty_response"
          ? "AIからの応答がありませんでした。少し時間をおいて再度お試しください。"
          : "AIブラッシュアップが利用できません。しばらく経ってから再度お試しいただくか、テンプレートのままご利用ください。";
      alert(msg);
      setSelfPR(typeDef.selfPR);
      setBrushupState("input");
    }
  };

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const age = basicInfo.birthDate
    ? Math.floor(
        (new Date().getTime() - new Date(basicInfo.birthDate).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  const isBusy = generating || brushupState === "processing";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">履歴書プレビュー</h2>
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

      {/* 自己PR */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            自己PR
            {brushupState === "done" && (
              <span className="ml-2 text-xs text-green-600 font-normal">ブラッシュアップ済み</span>
            )}
          </h3>
        </div>
        <div className="p-4">
          {isBusy && !selfPR ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              {brushupState === "processing" ? "ブラッシュアップ中..." : "自己PRを生成中..."}
            </div>
          ) : (
            <textarea
              value={selfPR}
              onChange={(e) => setSelfPR(e.target.value)}
              rows={6}
              className="w-full text-sm text-gray-700 leading-relaxed resize-none focus:outline-none"
            />
          )}
          {selfPR && (
            <p className="text-xs text-gray-400 text-right mt-1">{selfPR.length}字</p>
          )}
        </div>
      </div>

      {/* ブラッシュアップ */}
      {generated && !generating && brushupState === "idle" && (
        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-blue-800">もっと自分らしくしたい方へ</p>
            <p className="text-xs text-blue-600 mt-0.5">
              あなたの具体的な経験を追加して、自己PRをさらに磨けます
            </p>
          </div>
          <button
            onClick={() => setBrushupState("input")}
            className="text-sm text-blue-700 font-medium border border-blue-300 bg-white px-4 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            ✨ 強みを追加してブラッシュアップする
          </button>
        </div>
      )}

      {brushupState === "input" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-blue-800">あなたの強み・経験を入力してください</p>
            <p className="text-xs text-blue-600 mt-0.5">
              具体的なエピソードや数字があるとより効果的です
            </p>
          </div>
          <textarea
            value={userStrengths}
            onChange={(e) => setUserStrengths(e.target.value)}
            placeholder="例：アパレル販売で月の売上目標を6か月連続で達成。常連のお客様を30人以上担当していました。"
            rows={4}
            className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setBrushupState("idle")}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              キャンセル
            </button>
            <button
              onClick={brushupPR}
              disabled={!userStrengths.trim()}
              className="flex-[2] bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✨ ブラッシュアップする
            </button>
          </div>
        </div>
      )}

      {brushupState === "processing" && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-blue-700">あなたの強みを自己PRに反映しています...</p>
        </div>
      )}

      {brushupState === "done" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center justify-between">
          <p className="text-sm text-green-700">ブラッシュアップが完了しました</p>
          <button
            onClick={() => { setBrushupState("input"); }}
            className="text-xs text-green-700 underline"
          >
            もう一度変更する
          </button>
        </div>
      )}

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
            disabled={isBusy || !generated}
          />
        </div>
      </div>
    </div>
  );
}
