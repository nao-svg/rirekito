# リレキト システム概要書

最終更新: 2026-10-28

---

## 1. サービス概要

| 項目 | 内容 |
|------|------|
| サービス名 | リレキト |
| 本番URL | https://rirekito.vercel.app |
| リポジトリ | https://github.com/nao-svg/rirekito |
| 運営者 | 土元 直（nao.t19970205@gmail.com） |
| コンセプト | 営業職転職希望者向け、スマホ完結の履歴書作成ツール「リレキト for 営業職」 |

### ビジネスモデル

```
[無料履歴書ツール] ← SNS・インフルエンサー集客
        ↓
   診断 → 結果 → 出口を選ぶ
        ├ 出口B：自分で完成（ダウンロード時に連絡先＋同意取得 → users / resumes）
        └ 出口A：プロと一緒に仕上げる（面談申し込み＋同意 → sales_leads、kanata へ通知メール）
        ↓
[B2B] 有料職業紹介許可を持つ提携先企業に求職者を紹介（面談課金）
```

---

## 2. 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 16.4.2（App Router、Turbopack） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| PDF生成 | @react-pdf/renderer（ブラウザ側レンダリング） |
| AI | @ai-sdk/anthropic + Claude Haiku 4.5（自己PR・職務要約の生成） |
| メール | Resend（面談申し込みの通知。HTTP API を fetch で呼ぶ） |
| DB | Supabase（PostgreSQL、ap-northeast-1） |
| ホスティング | Vercel |
| フォント | Sawarabi Mincho（PDF日本語用） |

---

## 3. ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                  # メインページ（画面の切り替えと途中経過の保存）
│   ├── layout.tsx                # ルートレイアウト
│   ├── privacy/page.tsx          # プライバシーポリシー
│   ├── terms/page.tsx            # 利用規約
│   ├── partners/                 # 提携先一覧
│   └── api/
│       ├── career-summary/route.ts # 職務要約を作る（Claude API）
│       ├── leads/route.ts        # 面談申し込みの保存＋通知メール（出口A）
│       └── register/route.ts     # ユーザー登録・同意保存（出口Bのダウンロード時）
├── components/
│   ├── ResumePDFDownload.tsx     # PDF生成・ダウンロード＋同意モーダル
│   ├── CareerSheetPDF.tsx        # 職務経歴書PDF
│   └── steps/
│       ├── Step2Diagnosis.tsx    # 診断
│       ├── Step3Result.tsx       # 診断結果
│       ├── ExitChoice.tsx        # 2つの出口の選択
│       ├── LeadForm.tsx          # 出口A：面談申し込みフォーム
│       ├── Step1BasicInfo.tsx    # 出口B：基本情報入力
│       ├── CareerInput.tsx       # 出口B：職務経歴の入力
│       └── Step4Resume.tsx       # 出口B：プレビュー＋ダウンロード
├── data/
│   ├── site.ts / partners.ts     # ブランド名・文言／提携先（PARTNERS, PARTNER_READY）
│   ├── types.ts                  # 診断タイプ定義
│   ├── questions.ts / scoring.ts # 診断の質問・配点
│   ├── experience.ts             # 経験を聞く質問
│   └── jobs.ts                   # 求人例データ
├── lib/
│   ├── supabase.ts               # Supabase admin クライアント（サーバー専用）
│   ├── rate-limit.ts             # レート制限
│   ├── flow-storage.ts           # 途中経過のブラウザ保存（sessionStorage）
│   ├── lead.ts                   # 面談申し込みの検証・同意文・通知メール
│   ├── prompts.ts / ai.ts        # AI へのプロンプトと共通処理
│   └── sanitize.ts               # AI への入力の無害化
└── types/
    └── index.ts                  # 型定義
supabase/migrations/              # DB の定義（SQL エディタで手動実行）
```

---

## 4. ユーザーフロー（診断先行）

```
landing 入口
  └─ 名前・連絡先は聞かない

diagnosis 診断（10問・三択＋経験の質問）
  └─ ルールベースで6タイプに分類

result 診断結果
  └─ タイプ表示。経験が無い人にも「営業マン、いける！」と伝える

exit 出口の選択
  ├─ 出口B：自分で完成
  │    basic 基本情報 → career 職務経歴（/api/career-summary）→ download
  │    └─ 同意モーダル →「同意してダウンロード」→ /api/register で保存＋PDF取得
  └─ 出口A：プロと一緒に仕上げる（PARTNER_READY のときのみ）
       lead 面談申し込みフォーム＋同意 → /api/leads（leads に保存、kanata へ通知）
       └─ 完了画面で提携先の LINE を案内
```

診断結果は、出口を選ぶまでブラウザの `sessionStorage`（`rirekito_flow_v1`。タブを閉じると消える。流入元 `ref_source` も同じ）にだけ保存し、サーバーには保存しない（AI 生成のための送信を除く）。

---

## 5. データモデル（Supabase / PostgreSQL）

```sql
-- 求職者
CREATE TABLE users (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                    TEXT,                          -- 電話番号（数字のみ）
  email                    TEXT,                          -- メールアドレス
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  consent_partner_referral BOOLEAN DEFAULT FALSE,         -- 提携先への求人案内同意
  consent_marketing        BOOLEAN DEFAULT FALSE          -- メルマガ同意
);

-- 履歴書データ
CREATE TABLE resumes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  data           JSONB NOT NULL,     -- BasicInfo 全項目（写真除く）
  diagnosis_type TEXT,               -- StaffType
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

```sql
-- 面談の申し込み（出口A）。定義の正本は supabase/migrations/20261028_create_sales_leads.sql
CREATE TABLE sales_leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  display_name      TEXT NOT NULL,      -- 氏名
  phone             TEXT NOT NULL,
  contact_method    TEXT NOT NULL,      -- 'phone' | 'line'
  contact_time      TEXT NOT NULL,      -- つながりやすい時間帯
  current_job       TEXT NOT NULL,
  desired_job       TEXT NOT NULL,
  diagnosis_type    TEXT NOT NULL,
  free_answers      JSONB NOT NULL,     -- 旧・自己PRづくりの自由回答（2026-10-28 に画面を廃止。今は空で入る）
  self_pr           TEXT NOT NULL,
  consent_text      TEXT NOT NULL,      -- 同意いただいた文面
  partners_at_consent TEXT[] NOT NULL,  -- 同意時点の提携先名
  ref_source        TEXT,
  provided_at       TIMESTAMPTZ,        -- 提携先に渡した日時（kanata が記入）
  provided_to       TEXT                -- 渡した会社名（kanata が記入）
);
```

**セキュリティ**: 全テーブルに Row Level Security（RLS）有効。直接アクセス不可。`service_role` キーを持つサーバーサイドのみ読み書き可能。

---

## 6. APIエンドポイント

### POST `/api/register`

ユーザーの同意取得時に呼ばれる。PDFダウンロードと非同期で実行（ダウンロードをブロックしない）。

**Request Body**
```json
{
  "phone": "09012345678",
  "email": "user@example.com",
  "consentPartnerReferral": false,
  "consentMarketing": false,
  "resumeData": { /* BasicInfo */ },
  "diagnosisType": "コツコツ信頼型"
}
```

**Response**
```json
{ "ok": true }
```

---

### POST `/api/career-summary`

職務経歴の入力内容から職務要約を作る（出口B）。本人の入力に無い数字・実績は入れない。

### POST `/api/leads`

面談の申し込み（出口A）を `sales_leads` テーブルに保存し、`RESEND_API_KEY` で kanata（info@kanata.careers）へ通知メールを送る。

- 入力は zod で検証する。リクエストには同意画面に表示した提携先名 `shownPartners` を含める。サーバーは現在の提携先と一致しなければ 409 を返す（同意が成立していないため）
- `PARTNER_READY` が false のときは 403
- 通知メールの成否にかかわらず、DB に保存できていれば `{ "ok": true }` を返す

**共通の制限**: IPベースのレート制限（`rate-limit.ts`）。Upstash Redis を設定していればそれを使い、未設定のときはインメモリ（再起動でリセット）。

---

## 7. 環境変数

| 変数名 | 用途 | 公開 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API認証 | サーバーのみ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL | 公開可 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公開キー | 公開可（RLS有効のため） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 管理キー | **サーバーのみ・要秘匿** |
| `RESEND_API_KEY` | 面談申し込みの通知メール送信（Resend） | **サーバーのみ・要秘匿** |
| `LEAD_NOTIFY_FROM` | 通知メールの差出人。Resend で認証済みのドメインのアドレスにする（未設定だと `onboarding@resend.dev` になり、Resend アカウントの持ち主にしか届かない） | サーバーのみ |
| `LEAD_NOTIFY_TO` | 通知メールの宛先。未設定なら info@kanata.careers。`LEAD_NOTIFY_FROM` が未設定の間は、Resend アカウントの登録アドレス（現在 nao@kanata.careers）にしないと届かない | サーバーのみ |

---

## 8. セキュリティ対策

| 対策 | 内容 |
|------|------|
| HTTPセキュリティヘッダー | HSTS・X-Frame-Options・X-Content-Type-Options・Referrer-Policy |
| AIプロンプトインジェクション対策 | 入力サニタイズ・長さ制限・ホワイトリスト検証 |
| レート制限 | IPベース。Upstash Redis を設定していればそれを使い、未設定のときはインメモリ（再起動でリセット） |
| Supabase RLS | service_role 以外からのDB直接アクセスを全拒否 |
| service_role キー | サーバーサイド（`/api/*`）のみで使用。クライアントバンドルに含まれない |

---

## 9. 既知の課題・今後の対応

| 優先度 | 内容 |
|--------|------|
| 中 | 本番で Upstash Redis が設定されているか確認（未設定だとインメモリで再起動のたびリセット） |
| 中 | 求人データがハードコード。提携先決定後に実データへ差し替え |
| 低 | テスト未整備（Playwright等） |
| 低 | 監視ツール未導入（Sentry等） |
| 低 | カスタムドメイン未取得（rirekito.com/.jp 取得可能） |

---

## 10. ローカル開発

```bash
git clone https://github.com/nao-svg/rirekito.git
cd rirekito
npm install

# .env.local を作成（値は運営者から取得）
cp .env.local.example .env.local

npm run dev
# → http://localhost:3000

npm test    # vitest（診断ロジック・SITE/PARTNER_READY）
```

本番デプロイは `main` ブランチへの push で Vercel が自動実行。
