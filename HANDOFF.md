# リレキト ハンドオフメモ

最終更新: 2026-10-22

このドキュメントは、新しいセッションに作業を引き継ぐためのメモです。仕組みの詳細は `SYSTEM.md` を参照。

---

## アプリ概要

- **名称**: リレキト for 営業職（文言は `src/data/site.ts` の `SITE` に集約）
- **本番URL**: https://rirekito.vercel.app/
- **リポジトリ**: https://github.com/nao-svg/rirekito（public）
- **ローカルパス**: `~/resume-app`
- **運営**: 株式会社kanata（神奈川県横浜市南区新川町5-30-2／代表取締役 土元直／info@kanata.careers）
- **概要**: 営業職への転職（特に未経験から営業）向けの履歴書作成ツール。診断 → 自己PR自動生成 → 履歴書PDF出力。
- **状態**: 本番デプロイ済み。営業職版・提携先への送客の同意取得まで稼働中。

## 技術スタック

- Next.js 16.4.2 (App Router, Turbopack) / React 19 / TypeScript / Tailwind CSS
- @react-pdf/renderer（PDF生成）、Sawarabi Mincho フォント（履歴書PDF用）
- AI SDK + @ai-sdk/anthropic、Claude Haiku 4.5（自己PRブラッシュアップ）
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
3. 送客先は `src/data/partners.ts` の `PARTNERS` で管理し、`/partners`（提携先一覧）・同意文・プライバシーポリシー・結果画面の案内に反映される。提携中の会社が0社のときは同意チェックボックスと案内が非表示になる（`PARTNER_READY`）。
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

## 実装済みの機能

### 画面の流れ
- 4ステップ（基本情報 → 診断 → 結果 → 履歴書PDF）
- 営業向けの10問・6タイプの診断（信頼ビルダー／開拓ハンター／課題ソルバー／数字ストラテジスト／寄り添いカウンセラー／チーム推進エンジン）。ルールベースで、6タイプがほぼ均等に出るよう配点を調整済み。
- 結果画面に「このタイプが狙える求人例」（イメージ表記）と提携先の案内を表示
- 自己PRテンプレート + AIブラッシュアップ
- PDF出力（JIS規格スタイル + 証明写真、ズーム調整あり）
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

### 最優先：CAフィードバックの反映（2026-10-21 受領）
- 診断を先にし、履歴書にしたい人だけ基本情報を入力する流れに変える（SNSからの離脱を防ぐ）
- 自由回答を組み合わせて、その人の言葉で自己PRを作る。架空の数字（成約率など）が自己PRに入る問題も、この作り直しの中で解消する。
- ペルソナを絞る（営業未経験・接客経験あり）、訴求を具体化する
- 面談（キャリアプラン作成会・面接対策など）への導線を作る
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
- `SYSTEM.md` のDB定義に、`users` のアンケート・流入元の列が反映されていない

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
