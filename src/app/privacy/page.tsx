import Link from "next/link";
import { SITE } from "@/data/site";
import { ACTIVE_PARTNERS, PARTNER_READY } from "@/data/partners";

export const metadata = {
  title: `プライバシーポリシー | ${SITE.brand}`,
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <header>
          <Link href="/" className="text-sm text-blue-600 hover:underline">← トップに戻る</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">プライバシーポリシー</h1>
          <p className="text-xs text-gray-500 mt-1">最終更新日:2026年10月20日</p>
        </header>

        <section className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            {SITE.operator}(以下「運営者」)は、本サービス「リレキト」(以下「本サービス」)における個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">1. 取得する情報と利用目的</h2>
          <p>本サービスでは、以下の情報を取得します。このうち、自己診断の個別の回答と自己PR文章を除く情報（診断結果のタイプを含む）は、履歴書PDFをダウンロードする際に、本サービスのサーバー（Supabase）へ保存されます:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>氏名・フリガナ・生年月日・性別</li>
            <li>住所・電話番号・メールアドレス</li>
            <li>学歴・職歴・資格情報</li>
            <li>証明写真(任意)</li>
            <li>本人希望</li>
            <li>自己診断の回答・自己PR文章</li>
          </ul>
          <p className="text-gray-600 mt-2">
            <strong>利用目的:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>履歴書PDFの生成</li>
            <li>自己PR文章の最適化（AIブラッシュアップ機能）</li>
            <li>
              <strong>PDFダウンロード時にご登録いただいた電話番号・メールアドレス:</strong>
              連絡先として利用し、同意いただいた場合には、転職に役立つ情報の提供、および提携する有料職業紹介事業者からの求人案内の提供
            </li>
            <li>サービス改善のための統計分析</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">2. 情報の保存・保有期間</h2>
          <p>
            履歴書の入力中およびPDFの生成は、ブラウザ上で処理されます。ただし、履歴書PDFをダウンロードする際には、電話番号またはメールアドレス（いずれか1つ以上が必須です）、同意情報、アンケート回答、診断結果、および入力いただいた履歴書の情報（氏名・フリガナ・生年月日・性別・住所・電話番号・メールアドレス・証明写真・学歴・職歴・資格・本人希望）が、提携先への情報提供への同意の有無にかかわらず、本サービスのサーバーに保存されます。
          </p>
          <p>
            上記の情報は、本サービスのデータベース（Supabase）に保存されます。データの保存場所は日本国内（東京リージョン）です。
          </p>
          <p>
            <strong>保有期間:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>電話番号・メールアドレス・同意情報・アンケート回答・診断結果・履歴書データ: ユーザーからの削除請求があるまで、または本サービス終了時まで</li>
            <li>サーバログ(IPアドレス・アクセス時刻): 最大90日間</li>
            <li>外部AIサービスに送信されたテキスト: Anthropic社の規約に従う(最大30日間で削除)</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">3. 第三者への提供</h2>
          <p>
            本サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>法令に基づく場合</li>
            <li>
              <strong>提携先への求人紹介のための提供:</strong>
              PDFダウンロード時に提携先への情報提供に同意するチェックを入れた場合に限り、以下のとおり提供します。
              チェックはデフォルトOFF（未選択）であり、ご自身の意思でのみ有効になります。
              {PARTNER_READY ? (
                <ul className="list-[circle] list-inside pl-4 mt-1 space-y-1">
                  <li>
                    提供先: <Link href="/partners" className="text-blue-600 hover:underline">提携先一覧</Link>に記載の有料職業紹介事業者（現在: {ACTIVE_PARTNERS.map((p) => p.name).join("、")}）。各提携先には、その提携開始日以降に同意いただいた方の情報のみを提供します
                  </li>
                  <li>提供する情報: 氏名、電話番号・メールアドレス、履歴書の記載内容（写真を含む）、診断結果、アンケート回答（転職希望時期・雇用形態・希望勤務地）</li>
                  <li>提供の目的: 提供先から営業職の求人紹介を受けるため</li>
                </ul>
              ) : (
                <span className="block pl-4 mt-1">
                  現時点では提携先は未定です。提携先が決まり次第、本ポリシーを更新のうえ提携先名を明記し、提携先への情報提供を開始する前に改めてご確認いただける機会を設けます。
                </span>
              )}
            </li>
          </ul>
          <p>
            同意後でも、お問い合わせ窓口へご連絡いただければ、提携先への提供を停止します。
            提携先が追加・変更となる場合は、本ポリシーを更新のうえお知らせします。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">4. 外部サービスへの送信</h2>
          <p>
            自己PRブラッシュアップ機能利用時、入力テキストはAnthropic社（Claude）に送信されます。氏名・住所・電話番号などは送信されません。
          </p>
          <p>
            電話番号・メールアドレス・履歴書データは、Supabase, Inc.（米国の事業者）が提供するデータベースに保存されます。データの保存場所は日本国内（東京リージョン）です。
            Supabase のプライバシーポリシーは <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com/privacy</a> をご確認ください。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">5. Cookie・アクセス解析</h2>
          <p>
            本サービスでは、サービス改善のためアクセス解析ツールを利用する場合があります。取得データは匿名であり、個人を特定するものではありません。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">6. 開示・訂正・削除請求</h2>
          <p>
            個人情報保護法に基づき、ご自身の個人情報の開示・訂正・利用停止・削除を請求できます。
            メールに「データ削除請求」と明記のうえ、下記窓口までご連絡ください。原則として2週間以内に対応します。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">7. インシデント発生時の対応</h2>
          <p>
            個人情報の漏洩・滅失等が発生した場合、速やかに事実関係を調査し、本サービス上での公表および影響を受けるユーザーへの通知を行います。重大事案については個人情報保護委員会への報告も実施します。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">8. 改定について</h2>
          <p>
            本ポリシーは必要に応じて改定します。重要な変更がある場合は、本サービス上でお知らせします。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">9. お問い合わせ</h2>
          <p className="text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
            運営者:{SITE.operator}<br />
            住所:{SITE.operatorAddress}<br />
            代表者:{SITE.representative}<br />
            連絡先:<a href={`mailto:${SITE.contactEmail}`} className="text-blue-600 hover:underline">{SITE.contactEmail}</a><br />
            対応時間:平日10:00〜18:00(土日祝・年末年始を除く)
          </p>
        </section>
      </article>
    </main>
  );
}
