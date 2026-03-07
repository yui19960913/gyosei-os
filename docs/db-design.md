# DB設計: 行政書士向けAI集客支援サービス

## ビジネスモデル前提

| 項目 | 内容 |
|------|------|
| 形態 | SaaSではなく**受託型マーケ支援** |
| 利用者 | **自社のみ**（クライアント=行政書士はログインしない） |
| クライアントが受け取るもの | LP・問い合わせ・月次PDFレポートのみ |
| 月額 | 10〜15万円固定 |
| MVP優先事項 | AI LP量産エンジン＋月次レポート自動生成 |

---

## テーブル構成（7テーブル）

```
practice_areas
      │
      └──── landing_pages ────┐
      │           │           │
   clients ──── leads      ai_generation_logs
      │
   invoices
      │
monthly_reports
```

> ※ユーザー認証・プラン管理・カスタムドメイン等のSaaS機能は不要

---

## テーブル定義

### 1. clients（クライアント事務所）

```sql
CREATE TABLE clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(100) NOT NULL UNIQUE,  -- URLに使用 例: yamada-office
                                                   -- /lp/{slug}/{practice_area_slug}
  firm_name         VARCHAR(200) NOT NULL,         -- 事務所名
  owner_name        VARCHAR(100) NOT NULL,          -- 代表行政書士名
  prefecture        VARCHAR(20),                    -- 都道府県
  email             VARCHAR(255) NOT NULL,          -- 報告・連絡先
  phone             VARCHAR(20),
  -- 契約情報
  status            VARCHAR(20) NOT NULL DEFAULT 'active',
                    -- 'active' | 'paused' | 'churned'
  monthly_fee       INTEGER NOT NULL,              -- 月額(円) 例: 100000
  contract_started_at DATE NOT NULL,
  contract_ended_at   DATE,
  -- AI生成のための基本情報
  pr_text           TEXT,                          -- 事務所の強み・PR（AI入力）
  target_clients    TEXT,                          -- ターゲット顧客像（AI入力）
  -- 内部管理
  notes             TEXT,                          -- 社内メモ
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 2. practice_areas（業務マスタ）

```sql
CREATE TABLE practice_areas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,               -- '飲食店営業許可'
  category    VARCHAR(50) NOT NULL,
              -- 'permit' | 'immigration' | 'corporate' | 'inheritance' | 'other'
  description TEXT,                               -- AI生成時のコンテキスト補完用
  sort_order  INTEGER NOT NULL DEFAULT 0
);

INSERT INTO practice_areas (slug, name, category) VALUES
  ('restaurant_permit',  '飲食店営業許可',        'permit'),
  ('construction',       '建設業許可',            'permit'),
  ('transport',          '運送業許可',            'permit'),
  ('liquor',             '酒類販売免許',           'permit'),
  ('visa_zairyu',        '在留資格・ビザ申請',     'immigration'),
  ('naturalization',     '帰化申請',              'immigration'),
  ('corporation_set',    '会社設立',              'corporate'),
  ('inheritance',        '相続手続き',            'inheritance'),
  ('will',               '遺言書作成',            'inheritance'),
  ('subsidy',            '補助金・助成金申請',    'other');
```

---

### 3. landing_pages（LP管理）

```sql
CREATE TABLE landing_pages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id),
  practice_area_id UUID NOT NULL REFERENCES practice_areas(id),
  -- 公開URLは /lp/{clients.slug}/{practice_areas.slug} で導出
  -- このテーブルにURLカラムは持たない
  -- LP基本情報
  title            VARCHAR(300) NOT NULL,          -- 管理画面表示用タイトル
  status           VARCHAR(20) NOT NULL DEFAULT 'draft',
                   -- 'draft' | 'published' | 'archived'
  -- AI生成コンテンツ（構造化）
  -- ⚠️ キー構造は /docs/jsonb-schema.md に準拠。ここを変えるな
  content          JSONB NOT NULL DEFAULT '{}',
  -- content構造（必ずネスト形式で保存すること）:
  -- {
  --   "hero":      { "headline": "...", "subheadline": "...", "cta_text": "...", "cta_note": "..." },
  --   "problems":  { "title": "...", "items": ["..."] },
  --   "features":  { "title": "...", "items": [{ "title": "...", "body": "..." }] },
  --   "flow":      { "title": "...", "steps": ["..."] },
  --   "faq":       { "title": "...", "items": [{ "question": "...", "answer": "..." }] },
  --   "profile":   { "title": "...", "body": "...", "representative": "...", "license_number": "..." },
  --   "cta_bottom":{ "headline": "...", "cta_text": "...", "cta_note": "..." }
  -- }
  -- SEO
  meta_description VARCHAR(500),
  target_keywords  TEXT[],                        -- ['飲食店 営業許可 東京', ...]
  -- 集計（非正規化）
  -- ⚠️ 更新ルール: leads INSERT時にトランザクション内で +1 する
  --               SELECT COUNT で再計算する場合は必ずトランザクション内で上書き
  total_leads      INTEGER NOT NULL DEFAULT 0,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 1クライアント × 1業務 = 1LP（ビジネスルールをDBで強制）
  UNIQUE(client_id, practice_area_id)
);

CREATE INDEX idx_lp_client_id        ON landing_pages(client_id);
CREATE INDEX idx_lp_status           ON landing_pages(status);
```

---

### 4. leads（問い合わせ＝成果証明の核）

```sql
CREATE TABLE leads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id),
  -- landing_pages.practice_area_id から導出できるが、JOIN不要な集計のために非正規化
  -- ⚠️ INSERT時は必ず landing_pages.practice_area_id と同じ値をセットすること
  practice_area_id UUID NOT NULL REFERENCES practice_areas(id),
  landing_page_id  UUID NOT NULL REFERENCES landing_pages(id),
  -- 問い合わせ内容
  name             VARCHAR(100),
  email            VARCHAR(255),
  phone            VARCHAR(20),
  message          TEXT,
  -- ④ フォーム任意入力（「何と検索してこのページを見つけましたか？」）
  user_keyword     VARCHAR(300),

  -- ■ UTMパラメータ
  -- ⚠️ LP表示時に sessionStorage に保存 → hidden input 経由で送信
  --    （ページ遷移でURLのパラメータが消えるため sessionStorage 保存は必須）
  utm_source       VARCHAR(100),   -- 'google' | 'yahoo' | 'instagram'
  utm_medium       VARCHAR(100),   -- 'cpc' | 'organic' | 'social'
  utm_campaign     VARCHAR(200),
  utm_term         VARCHAR(300),   -- ① 広告キーワード（Google Ads ValueTrack: {keyword}）
  referrer_url     TEXT,

  -- ■ ステータス（クライアントへの引き継ぎ状況）
  status           VARCHAR(20) NOT NULL DEFAULT 'new',
                   -- 'new' | 'notified' | 'converted' | 'invalid'
  notified_at      TIMESTAMPTZ,
  -- 月次集計に使うため created_at は必須
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_client_id        ON leads(client_id);
CREATE INDEX idx_leads_landing_page_id  ON leads(landing_page_id);
CREATE INDEX idx_leads_practice_area_id ON leads(practice_area_id);
CREATE INDEX idx_leads_created_at       ON leads(created_at);
CREATE INDEX idx_leads_status           ON leads(status);
-- 集計SQLは /docs/jsonb-schema.md に一元管理
```

---

### 5. invoices（請求管理）

```sql
CREATE TABLE invoices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES clients(id),
  year        INTEGER NOT NULL,
  month       INTEGER NOT NULL,                  -- 1-12
  amount      INTEGER NOT NULL,                  -- 請求額(円)
  status      VARCHAR(20) NOT NULL DEFAULT 'draft',
              -- 'draft' | 'issued' | 'paid' | 'overdue'
  issued_at   TIMESTAMPTZ,
  due_date    DATE,
  paid_at     TIMESTAMPTZ,
  pdf_url     VARCHAR(500),                      -- 請求書PDF格納先
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, year, month)
);

CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status    ON invoices(status);
```

---

### 6. ai_generation_logs（AI生成履歴・コスト管理）

```sql
CREATE TABLE ai_generation_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID NOT NULL REFERENCES clients(id),
  landing_page_id  UUID REFERENCES landing_pages(id),
  -- 生成種別
  generation_type  VARCHAR(50) NOT NULL,
                   -- 'lp_full' | 'lp_revision' | 'report_summary' | 'copy_variation'
  -- 入出力
  prompt_snapshot  TEXT NOT NULL,                -- 実際に送ったプロンプト
  output           TEXT,                         -- AIの出力テキスト
  -- コスト管理
  model_name       VARCHAR(100) NOT NULL DEFAULT 'claude-sonnet-4-6',
  input_tokens     INTEGER,
  output_tokens    INTEGER,
  cost_usd         NUMERIC(10,6),               -- 1回あたりコスト
  -- ステータス
  -- ⚠️ INSERT時は 'pending'。AI呼び出し完了後に 'completed' / 'failed' に更新すること
  status           VARCHAR(20) NOT NULL DEFAULT 'pending',
                   -- 'pending' | 'completed' | 'failed'
  error_message    TEXT,
  duration_ms      INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_client_id  ON ai_generation_logs(client_id);
CREATE INDEX idx_ai_logs_created_at ON ai_generation_logs(created_at);

-- コスト確認クエリ例:
-- SELECT
--   date_trunc('month', created_at) AS month,
--   SUM(cost_usd) AS total_cost_usd,
--   COUNT(*) AS generation_count
-- FROM ai_generation_logs
-- GROUP BY 1 ORDER BY 1 DESC;
```

---

### 7. monthly_reports（月次レポート）

> ※仕様で6テーブルとしているが、レポートワークフローの管理に必須のため追加を推奨

```sql
CREATE TABLE monthly_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients(id),
  year            INTEGER NOT NULL,
  month           INTEGER NOT NULL,
  -- ステータス（ワークフロー管理）
  status          VARCHAR(20) NOT NULL DEFAULT 'generating',
                  -- 'generating' | 'draft' | 'reviewed' | 'sent'
  -- 集計データ（月初に自動生成）
  -- ⚠️ キー構造は /docs/jsonb-schema.md に準拠。ここを変えるな
  stats           JSONB NOT NULL DEFAULT '{}',
  -- stats構造（詳細は /docs/jsonb-schema.md 参照）:
  -- {
  --   "period":               { "year": 2026, "month": 3 },
  --   "leads":                { "total": 12, "prev_total": 8 },
  --   "leads_by_area":        [{ "area_slug": "restaurant_permit", "area_name": "飲食店営業許可", "count": 7 }],
  --   "top_keywords_paid":    [{ "keyword": "飲食店 営業許可 東京", "count": 4 }],
  --   "top_keywords_organic": [{ "keyword": "飲食店 許可 必要書類", "clicks": 42 }],
  --   "top_user_phrases":     [{ "phrase": "初めてで不安", "count": 4 }],
  --   "leads_by_source":      [{ "source": "google", "count": 9 }]
  -- }
  -- AIが生成した要約・施策提案テキスト
  ai_summary      TEXT,                          -- 今月の総評（AI生成）
  ai_suggestions  TEXT,                          -- 来月の改善施策（AI生成）
  -- 自分が編集した最終版
  reviewed_summary TEXT,
  reviewed_suggestions TEXT,
  -- PDF・送信管理
  pdf_url         VARCHAR(500),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, year, month)
);
```

---

## 月次レポートのワークフロー

```
月初 cron実行
    │
    ▼
leads集計 → stats生成 → monthly_reports INSERT (status='generating')
    │
    ▼
AI呼び出し → ai_summary / ai_suggestions 生成 → status='draft'
    │
    ▼
管理画面で確認・修正 → status='reviewed'
    │
    ▼
PDF生成 → pdf_url保存
    │
    ▼
ワンクリック送信 → sent_at記録 → status='sent'
```

---

## 削除した概念（SaaS設計との差分）

| SaaS設計にあったもの | 削除理由 |
|--------------------|---------|
| `users` テーブル | クライアントはログインしない |
| `plans` / `subscriptions` | 固定単価の受託モデルなので不要 |
| `lp_templates` | 内部ツールなので管理画面で直接操作 |
| `lp_sections` | contentをJSONBで一括管理で十分 |
| `custom_domains` | MVPスコープ外 |
| `lp_analytics_events` | MVPはリード数で価値証明。GAで代替 |
| `usage_summaries` | monthly_reportsのstatsに統合 |
