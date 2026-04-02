# DB設計: webseisei.com（AI集客OS）

## ビジネスモデル前提

| 項目 | 内容 |
|------|------|
| 形態 | SaaS（行政書士向けAI集客サイト自動生成） |
| 利用者 | 行政書士（顧客）がセルフサインアップ |
| 月額 | ¥4,980（月払い）/ ¥49,800（年払い） |
| 決済 | Stripe サブスクリプション |

---

## テーブル構成

```
ai_sites（コア）
    │
    ├──── ai_site_leads（問い合わせ）
    ├──── ai_seo_pages（SEOページ）
    └──── review_requests ──── reviewers

magic_tokens（マジックリンク認証）
```

> ※ `clients` / `landing_pages` / `leads` / `invoices` 等の旧受託モデル用テーブルは
>    スキーマに残存しているが現行フローでは未使用。将来的に削除予定。

---

## テーブル定義

### 1. ai_sites（顧客サイト — コアテーブル）

```sql
CREATE TABLE ai_sites (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  VARCHAR(100) NOT NULL UNIQUE,     -- URL識別子 例: tokyo-ab12cd
  firm_name             VARCHAR(200) NOT NULL,            -- 事務所名
  owner_email           VARCHAR(255),                     -- オーナーのメールアドレス（認証・通知に使用）
  owner_name            VARCHAR(100),                     -- 代表者名
  prefecture            VARCHAR(20) NOT NULL,             -- 都道府県
  services              TEXT[],                           -- 業務内容
  strengths             TEXT NOT NULL,                    -- 強み
  target_clients        TEXT,                             -- ターゲット顧客像
  styles                TEXT[],                           -- デザインスタイル
  site_content          JSONB NOT NULL DEFAULT '{}',      -- AIが生成したサイトコンテンツ全体
  seo_keywords          JSONB NOT NULL DEFAULT '[]',      -- SEOキーワード候補
  editor_overlay        JSONB NOT NULL DEFAULT '[]',      -- エディタオーバーレイデータ
  template_id           VARCHAR(50),                      -- 使用テンプレートID
  status                VARCHAR(20) NOT NULL DEFAULT 'draft',
                        -- 'draft' | 'published' | 'paused'
  auto_reply            BOOLEAN NOT NULL DEFAULT true,    -- 問い合わせ自動返信ON/OFF
  prompt_hash           VARCHAR(64),                      -- AIキャッシュキー（SHA-256）
  -- Stripe
  plan                  VARCHAR(20),                      -- 'monthly' | 'annual' | null
  stripe_customer_id    VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  -- チャットクレジット（コインパック購入で加算）
  chat_credits          INTEGER NOT NULL DEFAULT 0,
  -- LINE通知
  line_user_id          VARCHAR(100),               -- 行政書士のLINE User ID（Messaging API）
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_sites_status      ON ai_sites(status);
CREATE INDEX idx_ai_sites_prompt_hash ON ai_sites(prompt_hash);
```

**statusの遷移:**
```
draft ──[Stripe決済完了]──► published ──[解約/サブスク削除]──► paused
```

**chatCreditsのルール:**
- `isPaidPlan=true`（planがmonthly/annual）の場合: クレジット不要（無制限）
- `isPaidPlan=false` の場合: 無料10回 + chatCredits回まで利用可
- コインパック購入（¥300/20回）で `chatCredits += 20`（Stripe webhook経由）

---

### 2. ai_site_leads（問い合わせ）

```sql
CREATE TABLE ai_site_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID NOT NULL REFERENCES ai_sites(id),
  name            VARCHAR(100),
  email           VARCHAR(255),
  phone           VARCHAR(20),
  message         TEXT,
  utm_source      VARCHAR(100),
  utm_medium      VARCHAR(100),
  utm_campaign    VARCHAR(200),
  referrer_url    TEXT,
  auto_reply_sent BOOLEAN NOT NULL DEFAULT false,
  auto_reply_at   TIMESTAMPTZ,
  auto_reply_text TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'new',
                  -- 'new' | 'notified' | 'converted'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_site_leads_site_id    ON ai_site_leads(site_id);
CREATE INDEX idx_ai_site_leads_created_at ON ai_site_leads(created_at);
```

---

### 3. ai_seo_pages（SEOページ）

```sql
CREATE TABLE ai_seo_pages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id    UUID NOT NULL REFERENCES ai_sites(id),
  slug       VARCHAR(200) NOT NULL,
  keyword    VARCHAR(200) NOT NULL,
  title      VARCHAR(300) NOT NULL,
  content    JSONB NOT NULL DEFAULT '{}',
  status     VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

CREATE INDEX idx_ai_seo_pages_site_id ON ai_seo_pages(site_id);
```

---

### 4. magic_tokens（マジックリンク認証）

```sql
CREATE TABLE magic_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL,
  token      VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,              -- 発行から15分
  used_at    TIMESTAMPTZ,                       -- 使用済みにするとNULL以外になる
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_magic_tokens_token ON magic_tokens(token);
```

**トークンライフサイクル:**
1. POST `/api/auth/magic` → 新規トークン発行（既存の未使用トークンは削除）
2. GET `/api/auth/verify?token=xxx` → `used_at = NOW()` にセット → セッションCookie発行
3. 期限切れトークンはDBに残存するため、定期的なクリーンアップが必要（TODO）

---

### 5. review_requests（レビュー依頼）

```sql
CREATE TABLE review_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id          UUID NOT NULL REFERENCES ai_sites(id),
  plan             VARCHAR(20) NOT NULL,
  reviewer_type    VARCHAR(20) NOT NULL,
  reviewer_id      UUID REFERENCES reviewers(id),
  status           VARCHAR(20) NOT NULL DEFAULT 'pending',
                   -- 'pending' | 'in_review' | 'approved' | 'rejected'
  approved_by_name  VARCHAR(100),
  approved_by_title VARCHAR(200),
  approved_at      TIMESTAMPTZ,
  note             TEXT,
  amount_jpy       INTEGER,
  client_name      VARCHAR(100),
  client_email     VARCHAR(255),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_requests_site_id    ON review_requests(site_id);
CREATE INDEX idx_review_requests_status     ON review_requests(status);
CREATE INDEX idx_review_requests_created_at ON review_requests(created_at);
```

---

### 6. reviewers（レビュアー）

```sql
CREATE TABLE reviewers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  company    VARCHAR(200) NOT NULL,
  experience VARCHAR(100) NOT NULL,
  speciality VARCHAR(300) NOT NULL,
  bio        TEXT,
  photo_url  VARCHAR(500),
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Prismaモデルとテーブルのマッピング

| Prismaモデル | テーブル | 用途 |
|-------------|---------|------|
| `AiSite` | `ai_sites` | 顧客サイト（コア） |
| `AiSiteLead` | `ai_site_leads` | 問い合わせ |
| `AiSeoPage` | `ai_seo_pages` | SEOページ |
| `MagicToken` | `magic_tokens` | マジックリンク認証 |
| `ReviewRequest` | `review_requests` | レビュー依頼 |
| `Reviewer` | `reviewers` | レビュアー |

---

## スキーマ変更ルール

- 変更前に必ずこのファイルを確認・更新すること
- `prisma/schema.prisma` の変更は常にこのファイルと同期する
- 開発時: `npx prisma db push`
- 本番デプロイ時: `npx prisma migrate deploy`
