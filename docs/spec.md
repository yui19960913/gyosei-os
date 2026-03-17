# AI集客OS — 技術仕様書

> バージョン: 1.0
> 作成日: 2026-03-10
> 対象システム: gyosei-os（webseisei.com）

---

## 1. アーキテクチャ概要

### 1.1 全体構成図（テキスト）

```
┌─────────────────────────────────────────────────────────────────────┐
│                         クライアント (ブラウザ)                        │
│    webseisei.com  │  app.webseisei.com  │  {slug}.webseisei.com       │
│    admin.webseisei.com                                               │
└────────────┬───────────────┬──────────────────┬─────────────────────┘
             │               │                  │
             ▼               ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Vercel Edge Network (CDN)                          │
│              Next.js 16 App Router (サーバーレス関数)                  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  /onboard    │  │  /dashboard  │  │  /[slug] (公開サイト)     │  │
│  │  /login      │  │  /admin      │  │  /{slug}.webseisei.com    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────────┘  │
│         │                 │                      │                   │
│  ┌──────▼─────────────────▼──────────────────────▼───────────────┐  │
│  │                    API Route Handlers                          │  │
│  │  /api/onboard/*  /api/auth/*  /api/editor/*  /api/site/*      │  │
│  │  /api/dashboard/*  /api/seo/*  /api/admin/*  /api/leads/*     │  │
│  └──────┬───────────────────┬──────────────────────┬─────────────┘  │
└─────────┼───────────────────┼──────────────────────┼─────────────────┘
          │                   │                      │
          ▼                   ▼                      ▼
┌─────────────────┐  ┌────────────────┐  ┌────────────────────────────┐
│  Neon (PostgreSQL)│  │  Claude API    │  │  Resend (メール)            │
│  + Prisma ORM    │  │  (Anthropic)   │  │  - マジックリンク            │
│  - サーバーレス接続│  │  claude-haiku  │  │  - リード通知              │
│  - 接続プール    │  │  AI生成        │  │  - 自動返信                │
└─────────────────┘  └────────────────┘  └────────────────────────────┘
```

### 1.2 サブドメインルーティング

```
リクエスト Host ヘッダー       →  Next.js ルート
──────────────────────────────────────────────────
webseisei.com                  →  /app/page.tsx（LP）
app.webseisei.com              →  /app/* （ユーザー管理画面）
admin.webseisei.com            →  /app/admin/* （管理画面）
{slug}.webseisei.com           →  /app/[slug]/page.tsx（公開サイト）
localhost:3000/{slug}          →  /app/[slug]/page.tsx（開発環境）
```

ミドルウェア（`src/middleware.ts`）でホスト名を解析してリライトする。

---

## 2. 技術スタック詳細

| カテゴリ | 技術 | バージョン・詳細 |
|---------|------|----------------|
| フレームワーク | Next.js | 16.x（App Router、Server Components） |
| 言語 | TypeScript | 5.x（strict mode） |
| スタイリング | Tailwind CSS + インラインスタイル | ページコンポーネントは Tailwind、エディタ部分はインラインスタイル |
| ORM | Prisma | 最新版、クライアントは `src/lib/prisma.ts` でシングルトン管理 |
| データベース | Neon（サーバーレス PostgreSQL） | `DATABASE_URL`（プーリング）/ `DIRECT_URL`（migrate用） |
| AI | Anthropic Claude API | `claude-haiku-4-5-20251001`、`@anthropic-ai/sdk` |
| メール | Resend | `resend` パッケージ、`FROM` は `RESEND_FROM` 環境変数 |
| 認証（ユーザー） | カスタム HMAC-SHA256 JWT | Web Crypto API、Edge Runtime 対応、`src/lib/session.ts` |
| 認証（管理者） | NextAuth.js v5 + Credentials | bcryptjs、`src/auth.ts` |
| ホスティング | Vercel | サーバーレス関数、Edge Network、自動デプロイ |
| ハッシュ | Node.js crypto（SHA-256） | AIコスト制御用プロンプトハッシュ |

---

## 3. ディレクトリ構成（主要部分）

```
gyosei-os/
├── prisma/
│   └── schema.prisma              # DBスキーマ定義
├── src/
│   ├── middleware.ts              # サブドメインルーティング
│   ├── auth.ts                   # NextAuth.js 管理者認証設定
│   ├── app/
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # LP（webseisei.com）
│   │   ├── [slug]/
│   │   │   └── page.tsx          # 公開サイト（{slug}.webseisei.com）
│   │   ├── onboard/
│   │   │   ├── page.tsx          # オンボーディング LP
│   │   │   ├── questions/page.tsx # 質問ウィザード
│   │   │   └── preview/[slug]/
│   │   │       ├── page.tsx      # プレビュー（Server Component）
│   │   │       └── PreviewClient.tsx # プレビュー（Client Component）
│   │   ├── login/page.tsx        # ユーザーログイン
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # ダッシュボード一覧
│   │   │   └── [slug]/
│   │   │       ├── layout.tsx    # ダッシュボードレイアウト（サイドバー）
│   │   │       ├── page.tsx      # ダッシュボード概要
│   │   │       ├── leads/page.tsx   # 問い合わせ管理
│   │   │       ├── seo/page.tsx    # SEOページ管理
│   │   │       └── ads/page.tsx    # 広告管理
│   │   ├── admin/
│   │   │   ├── layout.tsx        # 管理画面レイアウト
│   │   │   ├── page.tsx          # 管理ダッシュボード
│   │   │   ├── login/page.tsx    # 管理者ログイン
│   │   │   ├── users/page.tsx    # ユーザー管理
│   │   │   ├── reviews/          # レビュー依頼管理
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── reviewers/page.tsx # レビュアー管理
│   │   └── api/
│   │       ├── onboard/
│   │       │   ├── generate/route.ts  # AI生成エンドポイント
│   │       │   └── register/route.ts  # ユーザー登録
│   │       ├── auth/
│   │       │   ├── magic/route.ts     # マジックリンク送信
│   │       │   ├── verify/route.ts    # トークン検証・セッション発行
│   │       │   └── logout/route.ts    # ログアウト
│   │       ├── editor/[slug]/route.ts # コンテンツ保存（PATCH）
│   │       ├── site/[slug]/leads/route.ts # 公開サイトからのリード受信
│   │       ├── dashboard/[slug]/
│   │       │   ├── publish/route.ts   # 公開
│   │       │   └── unpublish/route.ts # 非公開
│   │       ├── seo/generate/route.ts  # SEOページ生成
│   │       └── admin/
│   │           ├── clients/route.ts
│   │           ├── reviews/[id]/route.ts
│   │           └── reviewers/route.ts
│   ├── components/
│   │   ├── editor/
│   │   │   ├── SiteTemplate.tsx   # 公開サイトテンプレート（編集可能）
│   │   │   └── siteToCanvas.ts
│   │   ├── site/
│   │   │   ├── SitePageRenderer.tsx
│   │   │   └── ContactForm.tsx    # 問い合わせフォーム
│   │   ├── onboard/
│   │   │   ├── QuestionWizard.tsx # 9ステップウィザード
│   │   │   ├── AiAvatar.tsx
│   │   │   └── GeneratingProgress.tsx
│   │   └── dashboard/
│   │       ├── PublishButton.tsx
│   │       ├── UnpublishButton.tsx
│   │       ├── SeoGenerateButton.tsx
│   │       └── LogoutButton.tsx
│   └── lib/
│       ├── prisma.ts              # Prisma クライアントシングルトン
│       ├── session.ts             # HMAC-SHA256 セッション管理
│       ├── urls.ts                # URLヘルパー（siteUrl / appUrl / adminUrl）
│       └── ai-site/
│           ├── generator.ts       # Claude API 呼び出し・コンテンツ生成
│           ├── hash.ts            # プロンプトハッシュ（AIコスト制御）
│           ├── areas.ts           # 対応エリアユーティリティ
│           └── types.ts           # 型定義（GenerateInput / SiteContent）
├── docs/
│   ├── requirements.md           # 要件定義書（本書と対）
│   ├── spec.md                   # 技術仕様書（本書）
│   ├── db-design.md
│   └── jsonb-schema.md
└── prisma/schema.prisma
```

---

## 4. 主要API一覧

### 4.1 オンボーディング系

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | `/api/onboard/generate` | AI生成・AiSite作成 | 不要 |
| POST | `/api/onboard/register` | ユーザー登録・サイト公開 | 不要 |

#### POST /api/onboard/generate

```
リクエストボディ:
{
  firmName: string          // 事務所名（必須）
  ownerName: string         // 代表者名（必須）
  ownerEmail: string        // メールアドレス（必須）
  ownerBio?: string         // 経歴（任意）
  services: string[]        // 業務内容（必須、1件以上）
  serviceAreas: string[]    // 対応エリア（必須、1件以上）
  strengths: string         // 強み（必須）
  styles: string[]          // スタイル（任意）
  userTestimonials?: Array<{ name: string; content: string }>
}

レスポンス（201 Created）:
{
  slug: string
  siteId: string
  cached: boolean           // キャッシュヒットかどうか
}

処理フロー:
1. バリデーション
2. SHA-256 ハッシュ計算 → キャッシュ検索
3. キャッシュヒット時: 既存レコードの slug を返す
4. キャッシュミス時:
   a. スラッグ生成（都道府県スラッグ + 6文字ランダム）
   b. Claude API 呼び出し（generateSiteContent + generateSeoKeywords 並行）
   c. DB保存（ai_sites テーブル）
5. { slug, siteId, cached } を返す

Vercel maxDuration: 60秒
```

### 4.2 認証系

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | `/api/auth/magic` | マジックリンクメール送信 | 不要 |
| GET | `/api/auth/verify` | トークン検証・セッション発行 | 不要 |
| POST | `/api/auth/logout` | ログアウト（Cookie削除） | セッション |

#### POST /api/auth/magic

```
リクエストボディ: { email: string }
処理フロー:
1. ownerEmail で AiSite を検索（存在しない場合も成功レスポンス: セキュリティ上）
2. 既存の未使用トークンを削除
3. 32バイトランダムトークンを生成（crypto.randomBytes）
4. MagicToken レコードを作成（有効期限15分）
5. Resend でマジックリンクメールを送信
```

#### GET /api/auth/verify?token=xxx

```
処理フロー:
1. MagicToken をトークンで検索
2. 有効期限・未使用であることを確認
3. usedAt を更新（使用済みにする）
4. HMAC-SHA256 セッショントークンを生成
5. HttpOnly Cookie にセット
6. /dashboard/[slug] にリダイレクト
```

### 4.3 エディタ系

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| PATCH | `/api/editor/[slug]` | サイトコンテンツ保存 | 不要（要検討） |
| POST | `/api/dashboard/[slug]/publish` | サイト公開 | セッション |
| POST | `/api/dashboard/[slug]/unpublish` | サイト非公開 | セッション |

### 4.4 公開サイト系

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | `/api/site/[slug]/leads` | 問い合わせ送信・メール通知 | 不要 |

#### POST /api/site/[slug]/leads

```
リクエストボディ:
{
  name?: string
  email?: string
  phone?: string
  message?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

処理フロー:
1. AiSite を slug で検索（status=published であること）
2. AiSiteLead レコードを作成
3. Resend でオーナー通知メールを送信（ownerEmail 宛）
4. autoReply=true の場合、Resend で自動返信メールを送信（問い合わせ者宛）
```

### 4.5 SEO系

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | `/api/seo/generate` | SEOページ生成（Claude API） | セッション |

### 4.6 管理系

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | `/api/admin/clients` | クライアント一覧 | 管理者 |
| GET/PATCH | `/api/admin/reviews/[id]` | レビュー依頼詳細・更新 | 管理者 |
| GET/POST | `/api/admin/reviewers` | レビュアー一覧・作成 | 管理者 |

---

## 5. DBスキーマ概要

### 5.1 主要テーブル一覧

```
┌────────────────────┐
│      ai_sites      │ ← AI集客OSのコアテーブル
│──────────────────  │
│ id (UUID PK)       │
│ slug (UNIQUE)      │─────────────────────────────────┐
│ firmName           │                                 │
│ ownerEmail         │                                 │
│ prefecture         │                                 │
│ services (array)   │                                 │
│ strengths          │                                 │
│ styles (array)     │                                 │
│ siteContent (JSON) │  ← AIが生成したコンテンツ全体     │
│ seoKeywords (JSON) │  ← SEOキーワード候補             │
│ editorOverlay(JSON)│                                 │
│ status             │  draft | published | paused     │
│ ownerEmail         │                                 │
│ autoReply (bool)   │                                 │
│ promptHash         │  ← AIキャッシュキー（SHA-256）    │
└────────┬───────────┘                                 │
         │                                             │
         ├──────────────────────────────────────┐      │
         │                                      │      │
         ▼                                      ▼      │
┌─────────────────────┐          ┌──────────────────┐  │
│    ai_site_leads    │          │   ai_seo_pages   │  │
│─────────────────────│          │──────────────────│  │
│ id (UUID PK)        │          │ id (UUID PK)     │  │
│ siteId (FK)         │          │ siteId (FK)      │  │
│ name                │          │ slug             │  │
│ email               │          │ keyword          │  │
│ phone               │          │ title            │  │
│ message             │          │ content (JSON)   │  │
│ utmSource/Medium/.. │          │ status           │  │
│ autoReplySent       │          └──────────────────┘  │
│ status              │                                 │
└─────────────────────┘                                 │
                                                        │
┌────────────────────────┐                              │
│    review_requests     │◄─────────────────────────────┘
│────────────────────────│
│ id (UUID PK)           │
│ siteId (FK → ai_sites) │
│ plan                   │
│ reviewerType           │
│ reviewerId (FK)        │──────► reviewers
│ status                 │  pending|in_review|approved|rejected
│ approvedByName         │
│ approvedAt             │
│ amountJpy              │
│ clientName / Email     │
└────────────────────────┘

┌──────────────┐   ┌────────────────┐
│ magic_tokens │   │   reviewers    │
│──────────────│   │────────────────│
│ id (UUID)    │   │ id (UUID)      │
│ email        │   │ name           │
│ token (UNIQ) │   │ title          │
│ expiresAt    │   │ company        │
│ usedAt       │   │ experience     │
└──────────────┘   │ speciality     │
                   │ active (bool)  │
                   └────────────────┘
```

### 5.2 siteContent JSON構造

`ai_sites.siteContent` フィールドのスキーマ:

```typescript
type SiteContent = {
  hero: {
    headline: string        // メインキャッチコピー（25字以内）
    subheadline: string     // 詳細説明（50字以内）
    ctaText: string         // CTAボタンテキスト（12字以内）
    ctaNote: string         // 補足テキスト
  }
  services: Array<{
    name: string
    description: string
    icon: string            // 絵文字
    price: string
  }>
  profile: {
    title: string
    body: string
    strengths: string[]     // 強み3つ
  }
  pricing: Array<{
    name: string
    price: string
    features: string[]
  }>
  testimonials: Array<{
    name: string
    role: string
    content: string
  }>
  faq: Array<{
    question: string
    answer: string
  }>
  cta: {
    headline: string
    subheadline: string
    ctaText: string
  }
  area?: {
    description: string
    areas: string[]
  }
  prefectureLabel?: string
}
```

### 5.3 インデックス戦略

| テーブル | インデックス | 用途 |
|---------|------------|------|
| ai_sites | `status` | 公開サイト一覧取得 |
| ai_sites | `promptHash` | キャッシュ検索（AIコスト制御） |
| ai_site_leads | `siteId` | リード一覧取得 |
| ai_site_leads | `createdAt` | 時系列ソート |
| magic_tokens | `token` | トークン検索 |
| review_requests | `siteId`, `status`, `createdAt` | 管理画面フィルタ |

---

## 6. 認証フロー

### 6.1 ユーザー認証（マジックリンク方式）

```
[ブラウザ]          [Next.js API]          [DB]              [Resend]
    │                    │                   │                  │
    │ POST /api/auth/magic│                   │                  │
    │ { email }          │                   │                  │
    │──────────────────►│                   │                  │
    │                    │ findFirst(ownerEmail)                 │
    │                    │──────────────────►│                  │
    │                    │◄──────────────────│                  │
    │                    │ deleteMany(未使用トークン)             │
    │                    │──────────────────►│                  │
    │                    │ create(MagicToken, exp=+15min)        │
    │                    │──────────────────►│                  │
    │                    │                   │                  │
    │                    │ send(loginUrl)     │                  │
    │                    │─────────────────────────────────────►│
    │◄──────────────────│ { success: true }  │                  │
    │                    │                   │                  │
    │（メール受信→リンククリック）             │                  │
    │                    │                   │                  │
    │ GET /api/auth/verify?token=xxx         │                  │
    │──────────────────►│                   │                  │
    │                    │ findUnique(token)  │                  │
    │                    │──────────────────►│                  │
    │                    │◄──────────────────│                  │
    │                    │ 有効期限・usedAt チェック              │
    │                    │ update(usedAt=now) │                  │
    │                    │──────────────────►│                  │
    │                    │ createSessionToken(HMAC-SHA256)       │
    │ Set-Cookie: session=<token>            │                  │
    │ Redirect: /dashboard/[slug]            │                  │
    │◄──────────────────│                   │                  │
```

### 6.2 セッション検証フロー（ダッシュボードアクセス時）

```
[ブラウザ]          [Next.js Server Component]
    │                    │
    │ GET /dashboard/[slug]
    │──────────────────►│
    │                    │ cookies().get('session')
    │                    │ verifySessionToken(token)
    │                    │   → HMAC-SHA256 署名検証
    │                    │   → exp 検証
    │                    │ session.email === site.ownerEmail チェック
    │                    │ 不一致の場合: redirect('/login')
    │◄──────────────────│ ダッシュボード HTML
```

### 6.3 管理者認証（NextAuth.js + パスワード）

```
[管理者ブラウザ]     [NextAuth.js]          [環境変数]
    │                    │                   │
    │ POST /api/auth/[...nextauth]           │
    │ { email, password } │                  │
    │──────────────────►│                   │
    │                    │ ADMIN_EMAIL 比較   │
    │                    │──────────────────►│
    │                    │ bcrypt.compare(password, ADMIN_PASSWORD)
    │                    │ → JWT セッション発行
    │◄──────────────────│ Set-Cookie: next-auth.session-token
```

---

## 7. AI生成フロー

### 7.1 サイトコンテンツ生成フロー

```
[クライアント]       [POST /api/onboard/generate]      [Claude API]
    │                    │                               │
    │ 質問ウィザード回答  │                               │
    │──────────────────►│                               │
    │                    │ ① バリデーション               │
    │                    │                               │
    │                    │ ② SHA-256ハッシュ計算          │
    │                    │   buildSitePromptHash(input)  │
    │                    │                               │
    │                    │ ③ キャッシュ検索               │
    │                    │   findFirst({ promptHash })   │
    │                    │                               │
    │ ┌─────────────────────────────────────────────────┐│
    │ │キャッシュヒット時: 既存 slug を返す（AI呼び出し不要）││
    │ └─────────────────────────────────────────────────┘│
    │                    │                               │
    │ ┌─────────────────────────────────────────────────┐│
    │ │キャッシュミス時:                                  ││
    │ │④ スラッグ生成（都道府県スラッグ + 6文字ランダム）  ││
    │ │                                                  ││
    │ │⑤ Claude API 並行呼び出し（Promise.all）          ││
    │ │  generateSiteContent(input)  ────────────────►  ││
    │ │  generateSeoKeywords(input)  ────────────────►  ││
    │ │                              ◄────────────────  ││
    │ │  モデル: claude-haiku-4-5-20251001              ││
    │ │  max_tokens: 4000（コンテンツ）/ 500（SEO）     ││
    │ │                                                  ││
    │ │⑥ ユーザー提供のお客様の声で testimonials を上書き ││
    │ │                                                  ││
    │ │⑦ DB保存（ai_sites テーブル、promptHash 含む）   ││
    │ └─────────────────────────────────────────────────┘│
    │                    │                               │
    │◄──────────────────│ { slug, siteId, cached }      │
    │ → /onboard/preview/[slug] へ遷移                   │
```

### 7.2 プロンプト設計

**システムプロンプト**:
```
あなたは行政書士事務所専門のプロコピーライターです。
提供された情報をもとに、集客力の高いWebサイトコンテンツをJSON形式で生成してください。
出力はJSONのみ。
```

**ユーザープロンプト構造**:
- 事務所名・代表者名・経歴・エリア・業務・強み・スタイルを構造化テキストで渡す
- 出力JSONのスキーマを明示的に指定（hero / services / profile / pricing / testimonials / faq / cta）
- 文字数制限・件数を明示してAIの出力を制御

**AIコスト制御**:
- 同一の入力（firmName / ownerName / ownerBio / serviceAreas / services / strengths / styles）に対して SHA-256 ハッシュを計算
- 同一ハッシュが DB に存在する場合、Claude API を呼ばずに DB から返す
- 生成後は DB に保存し、以降のすべての表示は DB から読む（AI再呼び出しなし）

### 7.3 SEOページ生成フロー

```
[ダッシュボード]     [POST /api/seo/generate]          [Claude API]
    │                    │                               │
    │ キーワード選択       │                               │
    │──────────────────►│                               │
    │                    │ siteId × slug で UNIQUE確認   │
    │                    │ Claude API 呼び出し            │
    │                    │  → { headline, body, faq, cta }
    │                    │◄──────────────────────────────│
    │                    │ ai_seo_pages に保存            │
    │◄──────────────────│ { pageId }                    │
```

---

## 8. デプロイフロー

### 8.1 環境一覧

| 環境 | ブランチ | URL | DB |
|------|---------|-----|-----|
| 本番 | main | webseisei.com / *.webseisei.com | Neon 本番ブランチ |
| 開発 | feature/* | localhost:3000 | Neon 開発ブランチ または ローカル |

### 8.2 デプロイ手順

```
1. git push origin main
   ↓
2. Vercel が自動ビルド（next build）
   ↓
3. Prisma クライアント生成（prisma generate）
   ↓
4. Vercel へのデプロイ（ゼロダウンタイム）
   ↓
5. スキーマ変更がある場合のみ手動実行:
   npx prisma migrate deploy --preview-feature
   （Neon の DIRECT_URL を使用）
```

### 8.3 必要な環境変数

| 変数名 | 説明 |
|-------|------|
| `DATABASE_URL` | Neon 接続文字列（プーリング）|
| `DIRECT_URL` | Neon 直接接続文字列（migrate用） |
| `ANTHROPIC_API_KEY` | Claude API キー |
| `RESEND_API_KEY` | Resend API キー |
| `RESEND_FROM` | 送信元メールアドレス（例: noreply@webseisei.com） |
| `AUTH_SECRET` | HMAC-SHA256 セッション署名シークレット（32バイト以上） |
| `ADMIN_EMAIL` | 管理者メールアドレス |
| `ADMIN_PASSWORD` | 管理者パスワード（bcrypt ハッシュ推奨） |

### 8.4 Vercel DNS・ドメイン設定

| ドメイン | Vercel プロジェクト | 設定状況 |
|---------|-----------------|---------|
| `webseisei.com` | gyosei-os | 設定済み |
| `*.webseisei.com` | gyosei-os | 設定済み（ワイルドカード） |
| `app.webseisei.com` | gyosei-os | 設定済み |
| `admin.webseisei.com` | gyosei-os | gyosei-os への付け替えが必要 |

さくらインターネット DNS でワイルドカード CNAME（`*.webseisei.com` → Vercel）設定済み。

### 8.5 開発環境セットアップ

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数の設定
cp .env.example .env.local
# .env.local を編集して必要な値を設定

# 3. DBマイグレーション
npx prisma migrate dev

# 4. 開発サーバー起動
npm run dev
# → http://localhost:3000
```

---

## 9. URLヘルパー（src/lib/urls.ts）

```typescript
// 公開サイトURL
siteUrl(slug: string): string
// 本番: https://{slug}.webseisei.com
// 開発: /{slug}

// ユーザー管理画面URL
appUrl(path: string): string
// 本番: https://app.webseisei.com{path}
// 開発: {path}

// 管理画面URL
adminUrl(path: string): string
// 本番: https://admin.webseisei.com{path}
// 開発: /admin{path}
```

---

## 10. コーディング規約・設計方針

| 項目 | 方針 |
|------|------|
| Server Component / Client Component | データフェッチは Server Component で行い、インタラクションが必要な部分のみ `'use client'` を付与する |
| Prisma クライアント | `src/lib/prisma.ts` のシングルトンを使用する（`new PrismaClient()` を直接使わない） |
| エラーハンドリング | API Route では try-catch で囲み、エラーは `console.error` でログ出力後、適切なステータスコードを返す |
| AI呼び出し | `src/lib/ai-site/generator.ts` のみで行う。他の場所から直接 Anthropic SDK を呼ばない |
| 環境変数 | `process.env.XXX` で参照し、undefined の場合は早期エラーを出す |
| 型安全 | TypeScript strict mode を有効にし、`any` の使用は最小限に留める |
| スラッグ生成 | `{都道府県スラッグ}-{6文字ランダム}` 形式、衝突時は最大5回リトライ |

---

## 11. Stripe決済

### 11.1 環境変数

| 変数名 | 説明 |
|--------|------|
| `STRIPE_SECRET_KEY` | Stripeシークレットキー（テスト: `sk_test_xxx` / 本番: `sk_live_xxx`） |
| `STRIPE_PRICE_MONTHLY` | 月額プランの価格ID（`price_xxx`） |
| `STRIPE_PRICE_ANNUAL` | 年額プランの価格ID（`price_xxx`） |
| `STRIPE_WEBHOOK_SECRET` | Webhookの署名シークレット（`whsec_xxx`） |

### 11.2 APIルート

| ルート | メソッド | 説明 |
|--------|---------|------|
| `/api/stripe/checkout` | POST | Checkoutセッション作成 → StripeのURL返却 |
| `/api/stripe/webhook` | POST | 決済完了・解約イベントを受信してDBを更新 |
| `/api/stripe/portal` | POST | カスタマーポータル（解約・プラン変更）URL発行 |

### 11.3 Webhookイベント

| イベント | 処理 |
|---------|------|
| `checkout.session.completed` | `plan`を更新・`status`を`published`に変更・公開完了メール送信 |
| `customer.subscription.deleted` | `plan`をnullに・`status`を`paused`に変更 |
| `customer.subscription.updated` | `plan`・`status`をサブスクリプション状態に同期 |

### 11.4 テスト用カード番号

ローカル開発・テストモードでのみ使用可。

| カード番号 | 動作 |
|-----------|------|
| `4242 4242 4242 4242` | 常に成功 |
| `4000 0000 0000 0002` | 常に拒否（カード拒否のテスト用） |
| `4000 0025 0000 3155` | 3Dセキュア認証が必要 |

有効期限: 将来の日付であれば何でもOK（例: `12/34`）
CVC: 任意の3桁（例: `123`）

### 11.5 ローカルWebhookテスト

```bash
# Stripe CLIでWebhookをローカルに転送
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

`whsec_xxx` が表示されるので `.env` の `STRIPE_WEBHOOK_SECRET` に設定する。

---

*以上*
