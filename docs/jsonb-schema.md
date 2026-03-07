# JSONBスキーマ定義（固定）

## 設計方針

1. **今持っているデータだけ入れる** → 計算できない値は入れない（例: CV率はGA連携前は不要）
2. **キー名は変えない** → snake_case で統一、略語禁止
3. **ネストは2階層まで** → それ以上は配列で表現
4. **全フィールドはオプショナル扱い** → 空でもUIが壊れない設計にする
5. **`top_keywords_organic` の指標は `clicks` のみ** → Search Console には clicks/impressions/ctr/position があるが、MVPは clicks だけ保存する。clicks が CV に最も近い指標であり、シンプルさを優先する。他指標は将来 JSONB に追加可能。
6. **`top_user_phrases` は保存前に正規化する** → leads INSERT 時にアプリ側で `trim()` + 連続空白を単一スペースに正規化してから `user_keyword` カラムに保存すること。DB・スキーマは変えない。集計 SQL でも `TRIM(user_keyword)` を使う。

---

## 1. `landing_pages.content`

```json
{
  "hero": {
    "headline":    "飲食店開業なら○○行政書士事務所",
    "subheadline": "最短5日で許可取得。年間200件以上の実績。",
    "cta_text":    "今すぐ無料相談",
    "cta_note":    "相談料0円・全国対応"
  },

  "problems": {
    "title": "こんなお悩みありませんか？",
    "items": [
      "書類が多くて何から始めればいいか分からない",
      "仕事が忙しくて申請に時間が取れない",
      "他の行政書士に断られた"
    ]
  },

  "features": {
    "title": "選ばれる3つの理由",
    "items": [
      {
        "title": "圧倒的な実績",
        "body":  "年間200件以上の許可取得実績。難しいケースも対応可能。"
      },
      {
        "title": "最短5日で許可取得",
        "body":  "書類収集から申請まで一括サポート。スピード対応が強みです。"
      },
      {
        "title": "全国対応・オンライン完結",
        "body":  "来所不要。メール・電話・Zoomで全国対応しています。"
      }
    ]
  },

  "flow": {
    "title": "申請の流れ",
    "steps": [
      "無料相談（ヒアリング）",
      "必要書類の案内・収集サポート",
      "書類作成・申請",
      "許可取得・ご連絡"
    ]
  },

  "faq": {
    "title": "よくある質問",
    "items": [
      {
        "question": "費用はいくらですか？",
        "answer":   "基本料金は○○円〜です。物件の状況により変動します。まずはご相談ください。"
      },
      {
        "question": "どのくらいの期間がかかりますか？",
        "answer":   "書類が揃ってから最短5営業日で申請できます。許可まで約2〜4週間が目安です。"
      }
    ]
  },

  "profile": {
    "title":          "事務所紹介",
    "body":           "○○行政書士事務所は東京都新宿区を拠点に...",
    "representative": "山田 太郎",
    "license_number": "第○○号",
    "image_url":      "https://..."
  },

  "cta_bottom": {
    "headline":    "まずは無料相談から",
    "subheadline": "お気軽にお問い合わせください",
    "cta_text":    "無料相談を申し込む",
    "cta_note":    "24時間受付・返信は1営業日以内"
  }
}
```

### フィールド一覧

| キーパス | 型 | 必須 | 説明 |
|---------|-----|------|------|
| `hero.headline` | string | ◎ | メインキャッチコピー |
| `hero.subheadline` | string | ◎ | サブコピー |
| `hero.cta_text` | string | ◎ | CTAボタンのテキスト |
| `hero.cta_note` | string | — | CTAボタン下の補足 |
| `problems.title` | string | — | セクションタイトル |
| `problems.items` | string[] | ◎ | 悩みリスト（2〜4個推奨） |
| `features.title` | string | — | セクションタイトル |
| `features.items[].title` | string | ◎ | 強みの見出し |
| `features.items[].body` | string | ◎ | 強みの説明文 |
| `flow.title` | string | — | セクションタイトル |
| `flow.steps` | string[] | ◎ | 申請ステップ（3〜5個推奨） |
| `faq.title` | string | — | セクションタイトル |
| `faq.items[].question` | string | ◎ | 質問文 |
| `faq.items[].answer` | string | ◎ | 回答文 |
| `profile.body` | string | ◎ | 事務所説明文 |
| `profile.representative` | string | — | 代表者名 |
| `profile.license_number` | string | — | 行政書士登録番号 |
| `profile.image_url` | string | — | プロフィール画像URL |
| `cta_bottom.headline` | string | ◎ | 最終CTAの見出し |
| `cta_bottom.cta_text` | string | ◎ | ボタンテキスト |
| `cta_bottom.cta_note` | string | — | ボタン下の補足 |

---

## 2. `monthly_reports.stats`

```json
{
  "period": {
    "year":  2026,
    "month": 3
  },

  "leads": {
    "total":       12,
    "prev_total":  8
  },

  "leads_by_area": [
    {
      "area_slug": "restaurant_permit",
      "area_name": "飲食店営業許可",
      "count":     7
    },
    {
      "area_slug": "visa_zairyu",
      "area_name": "在留資格・ビザ申請",
      "count":     5
    }
  ],

  "top_keywords_paid": [
    { "keyword": "飲食店 営業許可 東京", "count": 4 },
    { "keyword": "飲食店 開業 許可 申請", "count": 3 }
  ],

  "top_keywords_organic": [
    { "keyword": "飲食店 許可 必要書類", "clicks": 42 },
    { "keyword": "飲食店 営業許可 東京", "clicks": 31 }
  ],

  "top_user_phrases": [
    { "phrase": "初めてで何も分からない", "count": 4 },
    { "phrase": "急ぎで許可が欲しい",    "count": 2 }
  ],

  "leads_by_source": [
    { "source": "google",    "count": 9 },
    { "source": "yahoo",     "count": 2 },
    { "source": "instagram", "count": 1 }
  ]
}
```

### フィールド一覧

| キーパス | 型 | 説明 | 集計元 |
|---------|-----|------|-------|
| `period.year` | number | 対象年 | 固定値 |
| `period.month` | number | 対象月 | 固定値 |
| `leads.total` | number | 今月の問い合わせ数 | `leads` COUNT |
| `leads.prev_total` | number | 前月の問い合わせ数 | `leads` COUNT |
| `leads_by_area[].area_slug` | string | 業務のslug | `practice_areas.slug` |
| `leads_by_area[].area_name` | string | 業務名 | `practice_areas.name` |
| `leads_by_area[].count` | number | 業務別件数 | `leads` GROUP BY |
| `top_keywords_paid[].keyword` | string | 広告キーワード | `leads.utm_term`（utm_medium='cpc'のみ） |
| `top_keywords_paid[].count` | number | キーワード別件数 | `leads` GROUP BY |
| `leads_by_source[].source` | string | 流入元 | `leads.utm_source` |
| `leads_by_source[].count` | number | 流入元別件数 | `leads` GROUP BY |
| `top_keywords_organic[].keyword` | string | SEO流入クエリ | Search Console 手動入力 |
| `top_keywords_organic[].clicks` | number | クリック数 | Search Console 手動入力 |
| `top_user_phrases[].phrase` | string | 顧客の生の言葉 | `leads.user_keyword` GROUP BY |
| `top_user_phrases[].count` | number | 件数 | `leads` GROUP BY |
| ~~`top_keywords`~~ | — | 廃止 | utm_term と user_keyword を混在させると分析が濁るため分離 |

### 意図的に入れなかったもの

| 項目 | 理由 |
|------|------|
| CV率（CV/PV） | ページビューをDBに保存しない（GA任せ）ため計算不能 |
| LP別成績 | LP = practice_area なので `leads_by_area` で代替できる |
| gclid / msclkid / fbclid | クリックIDはMVPスコープ外。utm_term で十分 |

---

## キーワード取得の設計方針

| 流入経路 | キーワード | 取得元 |
|---------|-----------|-------|
| Google Ads 等（有料） | ✅ `utm_term` | ValueTrack `{keyword}` で自動付与 |
| オーガニック（個別） | ❌ 取得不可 | Google が暗号化済み |
| オーガニック（集計） | ⚠️ 集計のみ | **③ Google Search Console 月次エクスポート** |
| ② LP単位のクラスタ | ✅ 実務的に有効 | `/lp/{client}/{practice_area}` のslugが即キーワード群 |
| ④ ユーザー任意入力 | ✅ 高精度 | フォーム「何と検索しましたか？（任意）」 |

### UTMパラメータ消失の防止（フロントエンド必須実装）

```javascript
// LP表示時に実行 — URLパラメータをsessionStorageに退避
const p = new URLSearchParams(window.location.search)
;['utm_source','utm_medium','utm_campaign','utm_term'].forEach(k => {
  if (p.get(k)) sessionStorage.setItem(k, p.get(k))
})
if (!sessionStorage.getItem('referrer_url')) {
  sessionStorage.setItem('referrer_url', document.referrer)
}
// フォーム送信時に hidden input として読み取りPOSTに含める
```

### `top_keywords` の集計対象

`COALESCE(utm_term, user_keyword)` を使う。DBに正規化フィールドは持たない。

---

## 集計SQL（monthly_reports生成時に実行）

```sql
-- leads.total / prev_total
SELECT
  COUNT(*) FILTER (
    WHERE created_at >= date_trunc('month', $target_date)
      AND created_at <  date_trunc('month', $target_date) + interval '1 month'
  ) AS total,
  COUNT(*) FILTER (
    WHERE created_at >= date_trunc('month', $target_date) - interval '1 month'
      AND created_at <  date_trunc('month', $target_date)
  ) AS prev_total
FROM leads
WHERE client_id = $client_id;

-- ② leads_by_area（LP単位 = キーワードクラスタ単位）
SELECT
  pa.slug  AS area_slug,
  pa.name  AS area_name,
  COUNT(*) AS count
FROM leads l
JOIN practice_areas pa ON pa.id = l.practice_area_id
WHERE l.client_id = $client_id
  AND l.created_at >= date_trunc('month', $target_date)
  AND l.created_at <  date_trunc('month', $target_date) + interval '1 month'
GROUP BY pa.slug, pa.name
ORDER BY count DESC;

-- ① top_keywords_paid（広告キーワード専用。utm_medium='cpc' のみ）
SELECT
  utm_term AS keyword,
  COUNT(*) AS count
FROM leads
WHERE client_id  = $client_id
  AND utm_medium = 'cpc'
  AND utm_term   IS NOT NULL
  AND created_at >= date_trunc('month', $target_date)
  AND created_at <  date_trunc('month', $target_date) + interval '1 month'
GROUP BY utm_term
ORDER BY count DESC
LIMIT 10;

-- ④ top_user_phrases（顧客の生の言葉。stats に保存 + AI要約にも渡す）
-- ⚠️ MVPフェーズは件数が少ない可能性が高い。0件でも stats に空配列で保存してOK
-- ⚠️ アプリ側で INSERT 前に trim していても念のため TRIM で GROUP BY する
SELECT
  TRIM(user_keyword) AS phrase,
  COUNT(*)           AS count
FROM leads
WHERE client_id  = $client_id
  AND TRIM(user_keyword) IS NOT NULL
  AND TRIM(user_keyword) != ''
  AND created_at >= date_trunc('month', $target_date)
  AND created_at <  date_trunc('month', $target_date) + interval '1 month'
GROUP BY TRIM(user_keyword)
ORDER BY count DESC
LIMIT 10;

-- leads_by_source
SELECT
  COALESCE(utm_source, 'direct') AS source,
  COUNT(*) AS count
FROM leads
WHERE client_id = $client_id
  AND created_at >= date_trunc('month', $target_date)
  AND created_at <  date_trunc('month', $target_date) + interval '1 month'
GROUP BY source
ORDER BY count DESC;
```

---

## ③ Google Search Console 連携（月次手動運用）

`top_keywords_organic` として **stats JSONB に保存する**。これにより前月比・推移が追える。

```
月初作業:
1. Search Console → 検索パフォーマンス → 先月分をCSVエクスポート
2. 上位クエリ（クリック数順）を管理画面の入力欄に貼り付け
3. stats.top_keywords_organic に保存
4. AI要約生成時に一緒に渡す → ai_suggestions に「SEO施策の根拠」として反映
```

## レポートにおけるキーワードの最終定義

| データ | stats（数値） | AI本文（解釈） | 比較可能 |
|--------|-------------|-------------|---------|
| `top_keywords_paid` | utm_term（cpc限定）のCOUNT | 広告費対効果の解釈 | ✅ 前月比あり |
| `top_keywords_organic` | Search Console クリック数 | SEO施策の根拠・提案 | ✅ 前月比あり |
| `top_user_phrases` | user_keyword のCOUNT | 顧客インサイト・言葉の変化 | ✅ 前月比あり（件数少なくてもOK） |

これにより営業でこう言える：
> 「広告では"飲食店 営業許可 東京"が3件CV。
> SEOでは"飲食店 許可 必要書類"が今月+12クリック。
> お客様の生の声では"初めてで不安"が最多。」

---

## 表示ルール（UI / PDF 共通）

### 空配列の非表示ルール

| フィールド | 0件のとき | 1件以上のとき |
|-----------|---------|------------|
| `top_keywords_paid` | セクション非表示 | 「広告キーワード TOP」として掲載 |
| `top_keywords_organic` | セクション非表示 | 「SEO流入キーワード TOP」として掲載 |
| `top_user_phrases` | セクション非表示（「0件」も出さない） | 「今月のお客様の言葉」として掲載 |

> データは stats に残るので将来の前月比比較には使える。表示しないだけ。

---

## Search Console 入力規約（毎月同じ条件で取得すること）

前月比が壊れないよう、取得条件を固定する。

| 項目 | 設定値 |
|------|--------|
| 対象 | クライアントのドメイン全体（例: `example.com`） |
| 期間 | **先月1ヶ月（カレンダー月）** |
| 指標 | クリック数 |
| 並び順 | クリック数降順 |
| 件数 | Top 10 |
| デバイス | All（絞らない） |
| 国 | 日本のみ（可能なら） |

> 「先月28日間」や「先月30日間」ではなく必ず「カレンダー月」で揃えること。
> 条件がズレると月次比較が無意味になる。
