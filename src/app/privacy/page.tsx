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
          <p className="text-xs text-gray-500 mt-1">最終更新日:2026年10月28日</p>
        </header>

        <section className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            {SITE.operator}(以下「運営者」)は、本サービス「リレキト」(以下「本サービス」)における個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">1. 取得する情報と利用目的</h2>
          <p>本サービスでは、以下の情報を取得します。診断の回答・自由回答・自己PR・職務経歴の入力内容は、「履歴書・職務経歴書をダウンロードする」か「面談を申し込む」のどちらかを選ぶまでは、お使いのブラウザの中だけで扱い、本サービスのサーバーには保存しません（AIによる文章づくりのために送信する場合を除きます。第4章をご覧ください）。診断の個別の回答（各質問で選んだ選択肢）は、どちらを選んでもサーバーには保存しません。どちらかを選んだときに保存する内容は次のとおりです（保存先はサーバー（Supabase））:</p>
          <p className="font-medium text-gray-800">履歴書・職務経歴書をダウンロードするとき</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>氏名・フリガナ・生年月日・性別、住所・電話番号・メールアドレス、学歴・職歴・資格情報、証明写真(任意)、本人希望</li>
            <li>職務経歴（期間・お店や会社の種類・雇用形態・仕事内容・頑張ったこと・活かせるスキル・職務要約）</li>
            <li>診断結果のタイプ、できあがった自己PR文章（自由回答そのものは保存しません）</li>
            <li>同意の内容、アンケート回答（転職希望時期・雇用形態・希望勤務地）、流入元（URLの参照元情報）</li>
          </ul>
          <p className="font-medium text-gray-800">面談を申し込むとき</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>氏名・電話番号・連絡方法・つながりやすい時間帯・現在と希望のお仕事</li>
            <li>診断結果のタイプ、自己PRづくりの自由回答（熱中したこと・仕事での不満とその行動）、できあがった自己PR文章</li>
            <li>同意いただいた文面、同意時点の提携先名、流入元（URLの参照元情報）</li>
          </ul>
          <p className="text-gray-600 mt-2">
            <strong>利用目的:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-gray-600">
            <li>履歴書PDFの生成</li>
            <li>自己PR文章・職務要約の作成（AI機能）</li>
            <li>面談のお申し込みへの対応（運営者からのご連絡、提携先へのお取り次ぎ）</li>
            <li>
              <strong>PDFダウンロード時にご登録いただいた電話番号・メールアドレス:</strong>
              連絡先として利用し、同意いただいた場合には、転職に役立つ情報の提供、および提携する有料職業紹介事業者からの求人案内の提供
            </li>
            <li>サービス改善のための統計分析</li>
          </ul>
          <p className="text-gray-600 mt-2">
            <strong>LINE公式アカウントで取得する情報:</strong>
            本サービスのLINE公式アカウントでは、LINEの表示名と、トークでお送りいただいた内容（お名前、面接練習・転職相談の希望日程、ご相談内容など）を取得し、
            お問い合わせへの回答、および提携先が行う面接練習・転職相談の日程調整に利用します。これらはLINE公式アカウントの管理画面（LINEヤフー株式会社のサービス）上に保存されます。
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-lg font-semibold text-gray-900">2. 情報の保存・保有期間</h2>
          <p>
            診断・自己PRづくり・履歴書や職務経歴書の入力、およびPDFの生成は、ブラウザ上で処理されます。サーバーへの保存は、次の2つのタイミングに限ります。
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <strong>履歴書・職務経歴書のダウンロード時:</strong>
              電話番号またはメールアドレス（いずれか1つ以上が必須です）、同意情報、アンケート回答、診断結果、および入力いただいた履歴書・職務経歴書の情報が、提携先への情報提供への同意の有無にかかわらず保存されます。
            </li>
            <li>
              <strong>面談の申し込み時:</strong>
              申し込みフォームに入力いただいた内容、診断結果、自由回答、自己PR文章、同意いただいた文面と同意時点の提携先名が保存されます。
            </li>
          </ul>
          <p>
            上記の情報は、本サービスのデータベース（Supabase）に保存されます。データの保存場所は日本国内（東京リージョン）です。
          </p>
          <p>
            <strong>保有期間:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>電話番号・メールアドレス・同意情報・アンケート回答・診断結果・履歴書・職務経歴書データ・面談申し込みの内容: ユーザーからの削除請求があるまで、または本サービス終了時まで</li>
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
              次の2つの場合に限り、以下のとおり提供します。
              (1) 履歴書・職務経歴書のダウンロード時に、氏名・連絡先・履歴書・職務経歴書の記載内容（写真・自己PRを含む）・診断結果・アンケート回答を提携先に提供することに同意するチェックを入れた場合。チェックはデフォルトOFF（未選択）であり、ご自身の意思でのみ有効になります。
              (2) 「プロと一緒に仕上げる」から面談を申し込む場合。申し込みフォームの同意（必須）にチェックを入れ、入力した内容（自己PRづくりの回答を含む）・診断結果・自己PR文章を提携先に提供することに同意いただいた場合に限ります。提供の前に、運営者が内容を確認します。
              {PARTNER_READY ? (
                <ul className="list-[circle] list-inside pl-4 mt-1 space-y-1">
                  <li>
                    提供先: <Link href="/partners" className="text-blue-600 hover:underline">提携先一覧</Link>に記載の有料職業紹介事業者（現在: {ACTIVE_PARTNERS.map((p) => p.name).join("、")}）。各提携先には、その提携開始日以降に同意いただいた方の情報のみを提供します
                  </li>
                  <li>提供する情報: 氏名、電話番号・メールアドレス、連絡方法・つながりやすい時間帯、現在と希望のお仕事、履歴書・職務経歴書の記載内容（写真・自己PRを含む）、診断結果、自由回答（自己PRづくりの回答）、自己PR文章、アンケート回答（転職希望時期・雇用形態・希望勤務地）。いずれも、上記(1)(2)のうちご自身が選んだ方法で入力・同意された範囲に限ります</li>
                  <li>提供の目的: 提供先から営業職の求人紹介を受けるため</li>
                </ul>
              ) : (
                <span className="block pl-4 mt-1">
                  現時点では提携先は未定です。提携先が決まり次第、本ポリシーを更新のうえ提携先名を明記し、提携先への情報提供を開始する前に改めてご確認いただける機会を設けます。
                </span>
              )}
            </li>
            <li>
              <strong>LINEでお申し込みいただいた面接練習・転職相談のための提供:</strong>
              LINE公式アカウントで面接練習・転職相談をお申し込みいただき、トーク上で提携先への情報提供に同意いただいた場合に限り、以下のとおり提供します。
              {PARTNER_READY ? (
                <ul className="list-[circle] list-inside pl-4 mt-1 space-y-1">
                  <li>
                    提供先: <Link href="/partners" className="text-blue-600 hover:underline">提携先一覧</Link>に記載の有料職業紹介事業者（現在: {ACTIVE_PARTNERS.map((p) => p.name).join("、")}）
                  </li>
                  <li>提供する情報: お名前、LINEのトークでお送りいただいた内容（希望日程・ご相談内容など）</li>
                  <li>提供の目的: 提供先による面接練習・転職相談の日程調整と実施、および営業職の求人紹介</li>
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
            自己PRや職務要約をAIで作る際、次の内容がAnthropic社（Claude、米国の事業者）に送信されます。自己PRの作成: 自由回答（熱中したこと・仕事での不満とその行動）、診断結果のタイプ名、経験に関する回答（接客経験・目標やノルマの有無）。職務要約の作成: 職務経歴の入力内容（期間・お店や会社の種類・雇用形態・仕事内容・補足・頑張ったこと・活かせるスキル）。入力内容にお店の名前などが含まれる場合は、そのまま送信されます。氏名・住所・電話番号などは送信されません。
          </p>
          <p>
            電話番号・メールアドレス・履歴書データは、Supabase, Inc.（米国の事業者）が提供するデータベースに保存されます。データの保存場所は日本国内（東京リージョン）です。
            Supabase のプライバシーポリシーは <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com/privacy</a> をご確認ください。
          </p>
          <p>
            面談の申し込みがあったことを運営者へ知らせるメールは、メール配信サービス（Resend, Inc.、米国の事業者）を通じて送信します。そのため、申し込みをされた方の氏名・電話番号・連絡方法・つながりやすい時間帯などが、運営者への通知を目的として米国にある同社に送信（提供・委託）されます。
            Resend のプライバシーポリシーは <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">resend.com/legal/privacy-policy</a> をご確認ください。
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
            メールに「データ削除請求」と明記のうえ、下記窓口までご連絡ください。原則として2週間以内に対応します。面談の申し込みの取り消し、および申し込み内容の削除も、同じ窓口（{SITE.contactEmail}）で受け付けます。
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
