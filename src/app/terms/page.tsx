import Link from "next/link";
import { SITE } from "@/data/site";

export const metadata = {
  title: `利用規約 | ${SITE.brand}`,
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <header>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← トップに戻る</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">利用規約</h1>
          <p className="text-xs text-gray-500 mt-1">最終更新日：2026年10月28日</p>
        </header>

        <section className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            本利用規約（以下「本規約」）は、{SITE.operator}（以下「運営者」）が提供する本サービス「リレキト」（以下「本サービス」）の利用条件を定めるものです。ユーザーは本サービスを利用することにより、本規約に同意したものとみなされます。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">第1条（適用）</h2>
          <p>
            本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されます。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">第2条（利用登録）</h2>
          <p>
            本サービスは会員登録なしで利用を開始できます。ただし、履歴書PDFを出力する際には、電話番号またはメールアドレスと、入力いただいた履歴書の情報を本サービスに登録していただきます。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">第3条（禁止事項）</h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスのサーバーやネットワークの機能を破壊・妨害する行為</li>
            <li>他者の情報を無断で入力・登録する行為</li>
            <li>本サービスを通じて生成された履歴書を、虚偽の内容で第三者に提示する行為</li>
            <li>過度な頻度でAI機能を利用するなど、本サービスの運営を妨げる行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">第4条（本サービスの提供の停止等）</h2>
          <p>
            運営者は、システムメンテナンス、障害、不可抗力等により、ユーザーへの事前通知なく本サービスの提供を停止または中断することができるものとします。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">第5条（生成コンテンツについて）</h2>
          <p>
            本サービスがAIで作成する職務要約は、参考情報として提供されるものです。最終的な内容の確認・修正は、ユーザーご自身の責任において行ってください。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">第6条（免責事項）</h2>
          <p>
            運営者は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しません。本サービスの利用により発生したトラブル・損害について、運営者は一切の責任を負わないものとします。
          </p>
          <p>
            本サービスを通じて作成された履歴書を用いた就職・転職活動の結果について、運営者は一切の責任を負いません。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">第7条（規約の変更）</h2>
          <p>
            運営者は、必要と判断した場合には、ユーザーへの通知なく本規約を変更することができるものとします。変更後の規約は、本サービス上に掲載した時点から効力を生じるものとします。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">第8条（準拠法・裁判管轄）</h2>
          <p>
            本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">お問い合わせ</h2>
          <p>
            本規約に関するお問い合わせ、ご意見・ご要望は以下までご連絡ください。原則として5営業日以内に一次回答いたします。
          </p>
          <p className="text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
            運営者：{SITE.operator}<br />
            住所：{SITE.operatorAddress}<br />
            代表者：{SITE.representative}<br />
            連絡先：<a href={`mailto:${SITE.contactEmail}`} className="text-blue-600 hover:underline">{SITE.contactEmail}</a><br />
            対応時間：平日10:00〜18:00（土日祝・年末年始を除く）
          </p>
        </section>
      </article>
    </main>
  );
}
