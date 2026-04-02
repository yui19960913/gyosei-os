# gyosei-os (AI集客OS) — CLAUDE.md

## プロジェクト概要

行政書士事務所の集客Webサイトを、AIが5分以内に自動生成するSaaSプラットフォーム。
ブランド名: **webseisei.com**

---

## ドメイン構成

| ドメイン | 用途 | Next.js ルート |
|----------|------|---------------|
| `webseisei.com` | LP | `/app/page.tsx` |
| `app.webseisei.com` | ユーザー管理画面 | `/app/dashboard/*` |
| `admin.webseisei.com` | スーパー管理画面（オーナーのみ） | `/app/admin/*` |
| `{slug}.webseisei.com` | 顧客の公開サイト | `/app/[slug]/page.tsx` |
| `localhost:3000/{slug}` | 開発環境の公開サイト | `/app/[slug]/page.tsx` |

サブドメインルーティング: `src/middleware.ts`（Host ヘッダーを解析してリライト）
URLヘルパー: `src/lib/urls.ts` の `siteUrl()`, `appUrl()`, `adminUrl()` を必ず使う

---

## ページ一覧と実装状況

このシステムには **3種類のユーザー** が存在する。

| ユーザー種別 | 誰か | 使うURL |
|------------|------|---------|
| エンドユーザー | 行政書士に相談したい一般の人 | `{slug}.webseisei.com` |
| 顧客（行政書士） | AIでサイトを作った行政書士 | `webseisei.com`, `app.webseisei.com` |
| オーナー（運営者） | このSaaSを運営する自分 | `admin.webseisei.com` |

### webseisei.com（行政書士向け集客・登録）

| パス | 状態 | 説明 |
|------|------|------|
| `/` | ❌ 未作成 | トップページ。現在はNext.jsのデフォルト画面が表示される。`/onboard`へリダイレクト予定 |
| `/onboard` | ✅ 完成 | 「サイトをお持ちですか？」の分岐画面。「持っていない」→`/onboard/create`、「持っている」→`/onboard/existing` |
| `/onboard/create` | ✅ 完成 | サービス紹介LP。「無料でサイトを作る」ボタンで質問ウィザードへ |
| `/onboard/questions` | ✅ 完成 | 9ステップの質問ウィザード（事務所名・業務内容・エリアなど） |
| `/onboard/preview/[slug]` | ✅ 完成 | AI生成サイトのプレビュー・インライン編集・公開申込 |
| `/onboard/existing` | ✅ 完成 | 「すでにサイトを持っている」人向けのページ |
| `/onboard/success` | ✅ 完成 | Stripe決済完了後の申込完了ページ |
| `/privacy` | ✅ 完成 | プライバシーポリシー |
| `/terms` | ✅ 完成 | 利用規約 |
| `/legal` | ✅ 完成 | 特定商取引法に基づく表記 |

### app.webseisei.com（行政書士のダッシュボード）

行政書士がログインして自分のサイトを管理する画面。パスワード不要のマジックリンク認証。

| パス | 状態 | 説明 |
|------|------|------|
| `/login` | ✅ 完成 | メールアドレスを入力するとマジックリンクが届く |
| `/dashboard/[slug]` | ✅ 完成 | サイト編集・公開/非公開切替・問い合わせ（リード）確認 |

### admin.webseisei.com（オーナー専用管理画面）

このSaaSを運営するオーナー（自分）だけがアクセスできる。メール+パスワード認証。

| パス | 状態 | 説明 |
|------|------|------|
| `/admin/login` | ✅ 完成 | オーナーのみログイン可 |
| `/admin/reviews` | ✅ 完成 | 顧客からのレビュー依頼一覧（pending→in_review→approved/rejected） |
| `/admin/reviews/[id]` | ✅ 完成 | レビュー依頼の詳細・ステータス更新 |
| `/admin/reviewers` | ✅ 完成 | レビュアーの追加・管理 |

### {slug}.webseisei.com（顧客の公開サイト）

行政書士が作ったサイトが公開されるURL。各行政書士ごとに異なるslugが割り当てられる（例: `tanaka-ab12cd.webseisei.com`）。エンドユーザー（相談したい一般の人）がアクセスする。

| 状態 | 説明 |
|------|------|
| ✅ 完成 | Hero・強み・About・サービス・料金・エリア・FAQ・問い合わせフォームなど全セクション実装済み |
| ✅ 完成 | 問い合わせ送信時に行政書士へメール通知・相談者へ自動返信メール |
| ✅ 完成 | `status: draft` のサイトは404を返す（公開前は見られない） |

---

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Framework | Next.js 16 (App Router, TypeScript strict mode) |
| DB | PostgreSQL (Neon サーバーレス) + Prisma ORM |
| Auth (ユーザー) | カスタム HMAC-SHA256 JWT — `src/lib/session.ts` |
| Auth (管理者) | NextAuth.js v5 + Credentials (bcryptjs) — `src/auth.ts` |
| AI | Anthropic SDK `claude-haiku-4-5-20251001` — `src/lib/ai-site/generator.ts` |
| Mail | Resend (`RESEND_FROM` 環境変数) |
| 決済 | Stripe — `src/app/api/stripe/` |
| Styling | Tailwind CSS v4（ページ）+ インラインスタイル（エディタ） |
| Deploy | Vercel (サーバーレス, maxDuration=60) |

---

## ディレクトリ構成

```
src/
  middleware.ts              # サブドメインルーティング
  auth.ts                    # NextAuth.js 管理者認証
  app/
    page.tsx                 # LP (webseisei.com)
    [slug]/page.tsx          # 公開サイト
    onboard/                 # オンボーディング（質問ウィザード → AI生成 → プレビュー）
    dashboard/[slug]/        # ユーザー管理画面
    admin/                   # スーパー管理画面
    api/
      onboard/generate/      # AI生成 (POST, maxDuration=60)
      onboard/register/      # ユーザー登録 (POST)
      auth/magic/            # マジックリンク送信 (POST)
      auth/verify/           # トークン検証・セッション発行 (GET)
      auth/logout/           # ログアウト (POST)
      editor/[slug]/         # コンテンツ保存 (PATCH, セッション必須)
      editor/[slug]/credits/ # チャットクレジット取得・消費
      contact/               # LP問い合わせ (POST)
      stripe/checkout/       # サブスクリプション決済 (POST)
      stripe/coins/checkout/ # コインパック決済 (POST)
      stripe/portal/         # カスタマーポータル (POST)
      stripe/webhook/        # Stripe Webhook受信 (POST)
      site/[slug]/leads/     # 問い合わせ受信 (POST)
      dashboard/[slug]/publish|unpublish/
      seo/generate/          # SEOページ生成 (POST, セッション必須)
      admin/clients/ reviews/[id]/ reviewers/
  components/
    editor/SiteTemplate.tsx  # 公開サイトテンプレート（編集可能）
    site/ContactForm.tsx
    onboard/QuestionWizard.tsx
  lib/
    prisma.ts                # Prisma シングルトン
    session.ts               # HMAC-SHA256 セッション
    urls.ts                  # URLヘルパー
    ai-site/
      generator.ts           # Claude API 呼び出し（ここだけ）
      hash.ts                # プロンプトハッシュ（AIコスト制御）
      types.ts               # GenerateInput / SiteContent 型
prisma/schema.prisma         # DBスキーマ（変更前に docs/db-design.md を確認・同期すること）
docs/
  requirements.md            # 要件定義
  spec.md                    # 技術仕様
  db-design.md               # DBスキーマ設計（変更時は必ず同期）
  jsonb-schema.md            # JSONBフィールド構造
```

---

## 開発コマンド

```bash
npm run dev      # 開発サーバー (localhost:3000)
npm run build    # prisma generate && next build
npm run lint     # ESLint
```

## DB操作

```bash
npx prisma studio       # GUI確認
npx prisma db push      # スキーマ同期（開発時）
npx prisma migrate dev  # マイグレーション作成
npx prisma db seed      # シードデータ
```

環境変数: `DATABASE_URL`（プーリング）, `DIRECT_URL`（migrate 用直接接続）

---

## 主要DBモデル

| モデル | テーブル | 概要 |
|--------|---------|------|
| `AiSite` | `ai_sites` | 顧客サイト（slug, siteContent JSON, status, plan, chatCredits, promptHash） |
| `AiSiteLead` | `ai_site_leads` | 問い合わせリード |
| `AiSeoPage` | `ai_seo_pages` | SEOページ |
| `ReviewRequest` | `review_requests` | レビュー依頼（pending→in_review→approved/rejected） |
| `Reviewer` | `reviewers` | レビュアー |
| `MagicToken` | `magic_tokens` | マジックリンクトークン（有効期限15分） |

`ai_sites.siteContent` の型: `src/lib/ai-site/types.ts` の `SiteContent`
`ai_sites.status`: `draft` | `published` | `paused`

---

## 環境変数

| 変数名 | 説明 |
|-------|------|
| `DATABASE_URL` | Neon 接続文字列（プーリング）|
| `DIRECT_URL` | Neon 直接接続（migrate 用）|
| `ANTHROPIC_API_KEY` | Claude API キー |
| `RESEND_API_KEY` | Resend API キー |
| `RESEND_FROM` | 送信元メールアドレス |
| `AUTH_SECRET` | HMAC-SHA256 セッション署名シークレット（32バイト以上）|
| `ADMIN_EMAIL` | 管理者メールアドレス |
| `ADMIN_PASSWORD` | 管理者パスワード（bcrypt ハッシュ推奨）|
| `STRIPE_SECRET_KEY` | Stripe シークレットキー |
| `STRIPE_PRICE_MONTHLY` | 月額プランの価格ID |
| `STRIPE_PRICE_ANNUAL` | 年額プランの価格ID |
| `STRIPE_PRICE_COINS` | コインパック（20回/¥300）の価格ID |
| `STRIPE_WEBHOOK_SECRET` | Webhook 署名シークレット |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API チャネルアクセストークン |

---

## コーディング規約

- **Server/Client Component**: データフェッチは Server Component。インタラクションのある部分のみ `'use client'`
- **Prisma**: `src/lib/prisma.ts` のシングルトンを使う（`new PrismaClient()` は直接使わない）
- **AI呼び出し**: `src/lib/ai-site/generator.ts` のみ。他の場所から Anthropic SDK を直接呼ばない
- **URLヘルパー**: ハードコードせず `siteUrl()` / `appUrl()` / `adminUrl()` を使う
- **エラーハンドリング**: API Route は try-catch で囲み、`console.error` でログ → 適切なステータスコードを返す
- **環境変数**: `process.env.XXX` で参照、undefined の場合は早期エラー
- **型安全**: TypeScript strict mode、`any` は最小限
- **スラッグ生成**: `{都道府県スラッグ}-{6文字ランダム}` 形式、衝突時は最大5回リトライ
- **AIコスト制御**: 同一入力の SHA-256 ハッシュでキャッシュ（`hash.ts`）。重複 Claude API 呼び出し禁止

---

## コードレビュー時のチェック観点

仕様書との整合性・事故リスクを確認するときに使う観点。

**仕様書との整合性**
- `src/app/api/` のルートが `docs/spec.md` セクション4のAPI一覧と一致しているか
- `prisma/schema.prisma` が `docs/spec.md` セクション5のDBスキーマと一致しているか

**認証・セキュリティ**
- 認証が必要なAPIルートにセッション検証が抜けていないか（仕様書セクション4の「認証」列を参照）
- 外部入力（リクエストボディ）のバリデーションが抜けていないか

**DB操作**
- `new PrismaClient()` を `src/lib/prisma.ts` 以外で直接呼んでいないか（接続数爆発のリスク）
- 複数テーブルを更新する処理でトランザクションを使っているか

---

## 凍結ルール

- **DBスキーマ変更前**: `docs/db-design.md` と `docs/jsonb-schema.md` を必ず確認
- **`prisma/schema.prisma`** 変更は `docs/db-design.md` と同期してから行う
- テストデータは `testClient: true` フラグで識別・一括削除可能

---

## 認証パターン

**ユーザーセッション検証（ダッシュボード）**:
```ts
const session = await getSession()
if (!session || session.email !== site.ownerEmail) redirect('/login')
```

**管理者認証**: NextAuth.js セッション（`src/auth.ts`）

**マジックリンク**: POST `/api/auth/magic` → メール送信 → GET `/api/auth/verify?token=xxx` → Cookie セット → `/dashboard/[slug]` にリダイレクト
