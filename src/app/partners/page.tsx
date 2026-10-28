import Link from "next/link";
import { SITE } from "@/data/site";
import { PARTNERS, formatJaDate } from "@/data/partners";

export const metadata = {
  title: `提携先一覧 | ${SITE.brand}`,
};

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <header>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← トップに戻る</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">提携先一覧</h1>
        </header>

        <section className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            PDFダウンロード時に「提携先への情報提供」に同意いただいた場合、以下の提携先（有料職業紹介事業者）に
            氏名・連絡先・履歴書の記載内容（写真を含む）・診断結果・アンケート回答を提供し、営業職の求人をご紹介します。
          </p>
          <p>
            また、LINE公式アカウントで面接練習・転職相談をお申し込みいただき、トーク上で同意いただいた場合は、
            お名前とトークでお送りいただいた内容（希望日程・ご相談内容など）を以下の提携先に提供し、日程調整を行います。
          </p>
          <p>
            各提携先には、その提携開始日以降に同意いただいた方の情報のみを提供します。
            提携先が追加・変更となる場合は、本ページを更新します。
          </p>
        </section>

        <ul className="space-y-3">
          {PARTNERS.map((p) => (
            <li key={p.name} className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{p.name}</p>
              <dl className="mt-2 space-y-2 text-sm">
                <dt className="text-xs text-gray-500">有料職業紹介事業許可番号</dt>
                <dd className="text-gray-800 whitespace-nowrap">{p.licenseNumber}</dd>
                <dt className="text-xs text-gray-500">提携期間</dt>
                <dd className="text-gray-800 whitespace-nowrap">
                  {formatJaDate(p.startDate)}〜{p.endDate ? formatJaDate(p.endDate) : ""}
                </dd>
              </dl>
            </li>
          ))}
        </ul>

        <p className="text-xs text-gray-500">
          同意後でも、お問い合わせ窓口へご連絡いただければ、提携先への提供を停止します。詳しくは
          <Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>
          をご確認ください。
        </p>
      </article>
    </main>
  );
}
