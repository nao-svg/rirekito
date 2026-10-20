# リレキト システム概要書

最終更新: 2026-05-08

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
   PDFダウンロード時に電話番号・メアド＋同意取得
        ↓
   求職者リスト構築（電話番号・メアド・診断タイプ）
        ↓
[B2B] 有料職業紹介許可を持つ提携先企業に求職者を紹介
```

---

## 2. 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 16.2.5（App Router、Turbopack） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| PDF生成 | @react-pdf/renderer（ブラウザ側レンダリング） |
| AI | @ai-sdk/anthropic + Claude Haiku 4.5（自己PRブラッシュアップ） |
| DB | Supabase（PostgreSQL、ap-northeast-1） |
| ホスティング | Vercel |
| フォント | Sawarabi Mincho（PDF日本語用） |

---

## 3. ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                  # メインページ（4ステップフロー制御）
│   ├── layout.tsx                # ルートレイアウト
│   ├── privacy/page.tsx          # プライバシーポリシー
│   ├── terms/page.tsx            # 利用規約
│   └── api/
│       ├── brushup-pr/route.ts   # 自己PRブラッシュアップ（Claude API）
│       └── register/route.ts     # ユーザー登録・同意保存
├── components/
│   ├── ResumePDFDownload.tsx     # PDF生成・ダウンロード＋同意モーダル
│   └── steps/
│       ├── Step1BasicInfo.tsx    # 基本情報入力
│       ├── Step2Diagnosis.tsx    # 自己診断（10問）
│       ├── Step3Result.tsx       # 診断結果＋求人表示
│       └── Step4Resume.tsx       # 履歴書プレビュー＋自己PR
├── data/
│   ├── site.ts                   # ブランド名・文言・提携先名（SITE, PARTNER_READY）
│   ├── types.ts                  # 診断タイプ定義
│   ├── questions.ts / scoring.ts # 診断の質問・配点
│   └── jobs.ts                   # 求人例データ
├── lib/
│   ├── supabase.ts               # Supabase admin クライアント（サーバー専用）
│   └── rate-limit.ts             # レート制限（インメモリ）
└── types/
    └── index.ts                  # 型定義
```

---

## 4. ユーザーフロー

```
Step1 基本情報入力
  └─ 氏名・生年月日・住所・電話番号（必須）・メアド（必須）・学歴・職歴 等

Step2 自己診断
  └─ 10問・三択（A/B/C）→ ルールベースで6タイプ（信頼ビルダー等）に分類

Step3 診断結果
  └─ タイプ表示（信頼ビルダー等）＋求人例3件表示（イメージ用ダミー。提携先が確定するまで送客案内は非表示）

Step4 履歴書プレビュー
  └─ 自己PRテンプレート表示
  └─ AIブラッシュアップ（任意・Claude Haiku）
  └─ PDFダウンロードボタン押下
       └─ 同意モーダル表示（電話番号・メアドを確認＋同意チェック）
            └─ 「同意してダウンロード」→ DB保存＋PDF取得
            └─ 「戻る」→ モーダルを閉じる（ダウンロードなし）
```

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
  "diagnosisType": "信頼ビルダー"
}
```

**Response**
```json
{ "ok": true }
```

---

### POST `/api/brushup-pr`

自己PRをClaudeでブラッシュアップ。ストリーミングレスポンス。

**Request Body**
```json
{
  "userStrengths": "前職でExcelを使った請求書処理...",
  "staffType": "信頼ビルダー"
}
```

**Response**: `text/plain` ストリーム

**制限**: IPベースのレート制限（5回/分・10回/時・20回/日）。現状インメモリ実装のため Vercel 再起動でリセットされる。

---

## 7. 環境変数

| 変数名 | 用途 | 公開 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API認証 | サーバーのみ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL | 公開可 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公開キー | 公開可（RLS有効のため） |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 管理キー | **サーバーのみ・要秘匿** |

---

## 8. セキュリティ対策

| 対策 | 内容 |
|------|------|
| HTTPセキュリティヘッダー | HSTS・X-Frame-Options・X-Content-Type-Options・Referrer-Policy |
| AIプロンプトインジェクション対策 | 入力サニタイズ・長さ制限・ホワイトリスト検証 |
| レート制限 | IPベース（インメモリ）。**本番強化推奨: Upstash Redis** |
| Supabase RLS | service_role 以外からのDB直接アクセスを全拒否 |
| service_role キー | サーバーサイド（`/api/*`）のみで使用。クライアントバンドルに含まれない |

---

## 9. 既知の課題・今後の対応

| 優先度 | 内容 |
|--------|------|
| 中 | レート制限の永続化（Upstash Redis）。現状はVercel再起動でリセット |
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
