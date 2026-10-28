import Link from "next/link";
import { SITE } from "@/data/site";
import { BOOKABLE_PARTNERS } from "@/data/partners";
import LogoMark from "@/components/LogoMark";

export const metadata = {
  title: `オンライン面接練習・転職相談（無料） | ${SITE.brand}`,
};

// LINE公式アカウントのリッチメニューから案内するページ。予約は提携先の予約ページで本人が直接行う
export default function ConsultPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <header>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← トップに戻る</Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shrink-0">
              <LogoMark className="w-6 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">オンライン面接練習・転職相談（無料）</h1>
          </div>
        </header>

        <section className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            営業職への転職に詳しい提携先の担当者と、オンラインで話せます。模擬面接で受け答えを練習したり、
            未経験から応募できる営業職の求人について相談したりできます。費用はかかりません。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>面接練習・転職相談は、下記の提携先（有料職業紹介事業者）が担当します</li>
            <li>予約フォームに入力した情報は、提携先に直接届きます（{SITE.operator}を経由しません）</li>
            <li>予約後の日程変更・キャンセルは、提携先からの案内に沿って行ってください</li>
          </ul>
        </section>

        {BOOKABLE_PARTNERS.length > 0 ? (
          <ul className="space-y-3">
            {BOOKABLE_PARTNERS.map((p) => (
              <li key={p.name} className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-1">有料職業紹介事業許可番号 {p.licenseNumber}</p>
                </div>
                <a
                  href={p.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
                >
                  予約ページへ進む
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
            現在、予約の受付を準備中です。しばらくしてから再度お試しください。
          </p>
        )}

        <p className="text-xs text-gray-500">
          提携先について詳しくは<Link href="/partners" className="text-blue-600 hover:underline">提携先一覧</Link>を、
          ご不明な点は{SITE.contactEmail}までお問い合わせください。
        </p>
      </article>
    </main>
  );
}
