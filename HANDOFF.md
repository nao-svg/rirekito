# リレキト ハンドオフメモ

最終更新: 2026-10-28

このドキュメントは、新しいセッションに作業を引き継ぐためのメモです。仕組みの詳細は `SYSTEM.md` を参照。

---

## アプリ概要

- **名称**: リレキト for 営業職（文言は `src/data/site.ts` の `SITE` に集約）
- **本番URL**: https://rirekito.vercel.app/
- **リポジトリ**: https://github.com/nao-svg/rirekito（public）
- **ローカルパス**: `~/resume-app`
- **運営**: 株式会社kanata（神奈川県横浜市南区新川町5-30-2／代表取締役 土元直／info@kanata.careers）
- **概要**: 営業職への転職（特に未経験から営業）向けの履歴書作成ツール。診断 → 自己PRづくり → 2つの出口（自分で完成／プロと一緒に仕上げる）。
- **状態**: 本番デプロイ済み。営業職版・提携先への送客の同意取得まで稼働中。

## 技術スタック

- Next.js 16.4.2 (App Router, Turbopack) / React 19 / TypeScript / Tailwind CSS
- @react-pdf/renderer（PDF生成）、Sawarabi Mincho フォント（履歴書PDF用）
- AI SDK + @ai-sdk/anthropic、Claude Haiku 4.5（自己PR・職務要約の生成）
- Resend（面談申し込みの通知メール。HTTP API を fetch で呼ぶ。追加パッケージなし）
- Supabase（PostgreSQL、ap-northeast-1 = 東京）
- Upstash Redis（レート制限。未設定時はインメモリにフォールバック）
- vitest（`npm test`）
- Vercel ホスティング（チーム: kanata、Node.js 24.x）

---

## 事業モデル（決定済み）

```
[無料の履歴書ツール] ← SNS/インフルエンサー集客
       ↓
   診断・履歴書作成（営業職志望者）
       ↓  PDFダウンロード時に連絡先＋同意を取得
[提携エージェントへ送客] → 1面談あたりで課金
```

- ユーザーには完全無料で提供する。
- 自社では有料職業紹介事業の許可は取らない。許可を持つ提携先に送客する。
- 提携先は `src/data/partners.ts` で管理する。現在は株式会社BEPRIDE（許可番号 14-ユ-302337、2026-10-20〜）。
- 提携先が得意な職種は営業・施工管理。将来は同じ仕組みで「for 施工管理」版を作る構想がある。

### 個人情報・法務

- PDFダウンロード時に、連絡先（電話番号またはメール）と履歴書の情報を Supabase に保存する。これは送客の同意の有無にかかわらず行う。
- 提携先への情報提供には、**明示的なオプトイン同意**（チェックボックス・デフォルトOFF）が必須。同意文は `/partners`（提携先一覧）へのリンクつき。
- 利用規約・プライバシーポリシーへの同意が必須（PDFダウンロードの条件）。
- 同意文言・プライバシーポリシーは社労士・弁護士などの確認を受けること。

---

## 送客データの扱い（重要）

1. 送客してよいのは、`users.created_at` が営業版のデプロイ時刻より後で、かつ `consent_partner_referral = true` のユーザーのみ。それ以前の行は提供先を明記しない別の文言で同意を取っており、事務職版のユーザーでもあるため送客しない。
2. `resumes.diagnosis_type` は、デプロイ前は旧タイプ名（事務職版）、デプロイ後は新タイプ名（営業職版）が入っている。
3. 送客先は `src/data/partners.ts` の `PARTNERS` で管理し、`/partners`（提携先一覧）・同意文・プライバシーポリシー・出口画面の「プロと一緒に仕上げる」ボタン（面談申し込みフォーム）に反映される。提携中の会社が0社のときは同意チェックボックスと出口Aのボタンが非表示になる（`PARTNER_READY`）。結果画面には提携先の案内を出さない。
4. ある提携先に送ってよいのは、`users.created_at` がその提携先の `startDate` 以降のユーザーのみ（同意時点の一覧に載っていなかった会社には送らない）。
5. 提携先を追加するときは `PARTNERS` に1行足し、`startDate` を本番公開日にする。提携をやめるときは行を消さず `endDate` を入れる（過去の同意内容を説明できるようにするため）。
6. 提携先に情報を渡したら、提供日・提供先・本人・提供項目を記録して保管する（個人情報保護法の第三者提供記録）。

---

## データベース（Supabase）

- リージョン: ap-northeast-1（東京）。データは日本国内に保存している。
- Row Level Security 有効。アクセスは service_role（サーバーのみ）から。
- プロジェクトIDなどの接続情報は、Supabase の管理画面と Vercel の環境変数を参照する（このリポジトリは public なので書かない）。

```sql
users:
  id                       UUID PRIMARY KEY
  phone                    TEXT
  email                    TEXT
  created_at               TIMESTAMPTZ
  consent_partner_referral BOOLEAN DEFAULT FALSE  -- 提携先への提供同意
  consent_marketing        BOOLEAN DEFAULT FALSE  -- メルマガ等
  ref_source               TEXT                   -- 流入元（URLの ?ref=）
  job_change_timing        TEXT                   -- アンケート：転職希望時期
  employment_type          TEXT                   -- アンケート：現在の雇用形態
  preferred_location       TEXT                   -- アンケート：希望勤務地

resumes:
  id             UUID PRIMARY KEY
  user_id        UUID REFERENCES users(id)
  data           JSONB  -- BasicInfo 全項目（証明写真を含む）
  diagnosis_type TEXT
  created_at     TIMESTAMPTZ
```

---

### sales_leads テーブル（面談の申し込み）

- 定義: `supabase/migrations/20261028_create_sales_leads.sql`（Supabase の SQL エディタで実行する）
- 主な列: お名前・電話番号・連絡方法（phone/line）・つながりやすい時間帯・現在と希望の仕事・診断タイプ・自由回答（jsonb）・自己PR・同意文面（`consent_text`）・同意時点の提携先名（`partners_at_consent`）・流入元
- `provided_at`（渡した日時）・`provided_to`（渡した会社名）は kanata が手で記入する
- 注意: 同じ Supabase プロジェクトに、このアプリが作ったものではない `leads` テーブル（氏名・生年月日・住所などの列あり）が元からある。名前がぶつかるため申し込みは `sales_leads` に保存する。`leads` には触らない
- RLS 有効・ポリシーなし（service_role のみ）

## 面談の申し込みが来たときの運用

1. info@kanata.careers に届く通知メールを確認する
2. Supabase の `sales_leads` テーブルで内容を確認する（提携先に渡す前に、運営者が内容を確認する約束をプライバシーポリシーに書いている）
3. BEPRIDE に渡す（申し込んだ人には完了画面で BEPRIDE の LINE https://lin.ee/6kE4RIX も案内している。`src/data/partners.ts` に設定済み）
4. 渡したら `provided_at` と `provided_to` を記入する（第三者提供の記録を兼ねる）
5. 取り消し・削除の依頼は info@kanata.careers で受け付ける（プライバシーポリシー6章）

## 本番公開前のチェックリスト（main への push の前に）

- [ ] `supabase/migrations/20261028_create_sales_leads.sql` を Supabase の SQL エディタで実行する
- [ ] `RESEND_API_KEY` を Vercel と `.env.local` に設定する
- [ ] 当面はドメイン認証をせず、`LEAD_NOTIFY_TO=nao@kanata.careers`（Resend の登録アドレス）を設定して通知を受け取る。info@ に届けたくなったら、kanata.careers を Resend で認証してから下の `LEAD_NOTIFY_FROM` を設定し、`LEAD_NOTIFY_TO` を消す
- [ ] （任意）`LEAD_NOTIFY_FROM` を、Resend で認証（verify）済みのドメインのアドレスに設定する。未設定だと既定の `onboarding@resend.dev` になり、これは Resend アカウントの持ち主にしか届かないため、info@kanata.careers への通知が届かない可能性がある（申し込み自体は DB に保存される）
- [ ] プライバシーポリシーの最終更新日（`src/app/privacy/page.tsx`）を実際の本番公開日に直す（現在は作業日の 2026年10月28日）
- [ ] 面談申し込みのリクエストには `shownPartners`（同意画面に出した提携先名）が必須。サーバーは今の提携先と違うと 409 を返す（提携先を変えたときは画面の再読み込みが必要）
- [ ] 自己PRの例文（6タイプ）と同意文面を、社労士・弁護士・CAに確認してもらう

## 実装済みの機能

### 画面の流れ（診断先行・2つの出口。2026-10-28 に作り直し）
- 入口（landing）→ 診断（10問＋経験の質問）→ 結果（「営業マン、いける！」と伝える）→ 自己PRづくり（自由回答3問＋AI）→ 出口の選択
- 出口B「自分で完成」: 基本情報 → 職務経歴の入力 → ダウンロード（履歴書＋職務経歴書のPDF。同意モーダルで `/api/register` に保存）
- 出口A「プロと一緒に仕上げる」: 面談申し込みフォーム → `/api/leads` に保存＋kanata へ通知メール → 完了画面で BEPRIDE の LINE を案内。`PARTNER_READY` が false のときは出さない
- 診断結果・自由回答・自己PRは、出口を選ぶまでブラウザ（`sessionStorage` の `rirekito_flow_v1`。タブを閉じると消える）にだけ置く。AI 生成のための送信を除き、サーバーには保存しない
- 最初の画面では名前・住所・電話・メールを聞かない。連絡先は出口で初めて聞く
- API: `/api/self-pr`（自由回答から自己PR）、`/api/career-summary`（職務要約）、`/api/leads`（面談申し込み）、`/api/register`（ダウンロード時の保存）。旧 `/api/brushup-pr` は `/api/self-pr` に置き換えて削除した
- 営業向けの10問・6タイプの診断（信頼ビルダー／開拓ハンター／課題ソルバー／数字ストラテジスト／寄り添いカウンセラー／チーム推進エンジン）。ルールベースで、6タイプがほぼ均等に出るよう配点を調整済み。
- 結果画面に「このタイプが狙える求人例」（イメージ表記）を表示（提携先の案内は出さない。提携先は出口画面と同意モーダルでだけ案内する）
- 自己PRは自由回答3問から AI が作る（本人の回答に無い数字・実績・固有名詞は入れない）
- PDF出力（履歴書：JIS規格スタイル＋証明写真、ズーム調整あり。職務経歴書もあわせて出力）
- PDFダウンロード時の同意モーダル（必須：規約・ポリシー／任意：提携先への提供・メルマガ）とアンケート3問
- 流入元トラッキング（`?ref=`）

### ページ
- `/` トップ・アプリ本体
- `/partners` 提携先一覧
- `/privacy` プライバシーポリシー
- `/terms` 利用規約

### セキュリティ
- HTTPセキュリティヘッダー（HSTS、X-Frame-Options など）
- AIプロンプトインジェクション対策（入力の無害化・長さ制限・ホワイトリスト検証）
- レート制限（5/分・10/時・20/日、IP単位、Upstash Redis）
- robots.txt（`/api/` と AIクローラーを除外）
- 依存部品の既知の脆弱性：本番分は 0 件（2026-10-22 時点。`npm audit --omit=dev`）

### Phase 1（2026-05-08〜10）で入れたもの
- Supabase 連携（users・resumes テーブル、RLS、service_role 権限）
- `/api/register`：電話番号・メアド・同意フラグ・履歴書データを保存
- 電話番号の入力チェック（数字のみ・10〜11桁、PDF表示時にハイフンを自動挿入）、メアドの形式チェック
- スマホUIの改善（入力欄を縦並びに統一）、OGP 設定、SYSTEM.md の追加

---

## 次にやること

### CAフィードバックの反映（2026-10-21 受領）：実装済み・本番未公開
- 診断先行、自由回答からの自己PR、職務経歴書、面談（出口A）への導線は実装済み（上の「画面の流れ」）。本番公開前のチェックリストを済ませてから公開する
- ペルソナの絞り込み・訴求の具体化は、CAへの追加ヒアリング結果で調整する
- CAへの追加ヒアリング中（ペルソナ、強みを引き出す質問、予約が入りやすい訴求など）

### 送客の運用
- 同意した人を提携先に渡す仕組み（CSV出力など）と、第三者提供の記録
- 提携先が2社以上になったら、同意時点の提携先リストを残す仕組みを検討する

### 将来
- マイページ（Supabase Auth の Magic Link ログイン、過去の履歴書の再編集、退会・データ削除のセルフサービス）
- 「for 施工管理」版

---

## 残課題（技術）

### 中
- Vercel の環境変数を Sensitive 設定にする（ANTHROPIC_API_KEY・SUPABASE_SERVICE_ROLE_KEY）。要確認。
- `npm run lint` が既存のエラー1件で失敗する（`ResumePDFDownload.tsx` の useEffect 内の setState）
- `SYSTEM.md` のDB定義に、`users` のアンケート・流入元の列がまだ反映されていない（`sales_leads` と新しい API は反映済み）

### 低
- E2Eテスト（Playwright）
- 監視（Sentry）、Anthropic API の予算アラート
- カスタムドメイン（rirekito.com / .jp は取得可能、未取得）
- SEO 強化、アクセス解析（Vercel Analytics など）
- OGP キャッシュの確認（https://www.opengraph.xyz で `rirekito.vercel.app` を確認）

---

## 開発の流儀

- ローカル: `cd ~/resume-app && npm run dev`
- テスト: `npm test`（vitest）、型チェック: `npx tsc --noEmit`
- 本番反映: `main` に push すると Vercel が自動デプロイする（**main への push = 本番公開**）
- 環境変数: `.env.local`（gitignore 済み）と Vercel ダッシュボードの両方を更新する必要あり
- 動作確認: ブラウザで確認できる（モバイル実機でのテストはユーザーに依頼）
- Git の名義: `nao-svg <nao@kanata.careers>`
