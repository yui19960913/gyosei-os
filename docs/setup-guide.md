# セットアップ手順

## 1. Next.js プロジェクト初期化

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

## 2. 依存パッケージのインストール

```bash
npm install prisma @prisma/client
npm install @anthropic-ai/sdk
npm install next-auth@beta
npm install resend
npm install -D tsx
```

## 3. Prisma 初期化（既に schema.prisma があるのでスキップ）

```bash
# 初期化済み。以下だけ確認
cat prisma/schema.prisma | head -10
```

## 4. .env を作成

```bash
cp .env.example .env
```

`.env` に以下を記入:

```env
# Neon PostgreSQL
# PoolerのURLをDATABASE_URL、直接接続URLをDIRECT_URLに設定
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# NextAuth
AUTH_SECRET="openssl rand -base64 32 で生成"

# Resend
RESEND_API_KEY="re_..."
```

## 5. マイグレーション実行（db push は使わない）

```bash
npx prisma migrate dev --name init
```

これで:
- `prisma/migrations/` にマイグレーションファイルが生成される
- DBにテーブルが作成される
- Prisma Client が生成される

## 6. seed 実行（package.json に設定が必要）

`package.json` に以下を追加:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

その後:

```bash
npx prisma db seed
```

`practice_areas` に10件入ればOK。

## 7. GUI 確認

```bash
npx prisma studio
```

`practice_areas` テーブルに10件、他は空でOK。

---

## 実装順序（最短で動く形にする順番）

```
① clients CRUD（管理画面の起点）
   └ 一覧・登録・編集

② practice_areas 一覧表示
   └ seed確認を兼ねる

③ landing_pages 作成
   └ client × practice_area を選択 → AI生成 → content JSONB保存

④ 公開LP表示
   └ /lp/[client_slug]/[practice_area_slug]
   └ content JSONB をレンダリング
   └ UTM sessionStorage 保存スクリプト

⑤ フォーム送信 → leads INSERT
   └ utm_term / user_keyword / utm_medium を保存
   └ landing_pages.total_leads を +1（トランザクション）
   └ クライアントへメール通知（Resend）
```

③完了でAIが使える。⑤完了で実際のクライアントに使い始められる。

---

## 注意事項

| 項目 | ルール |
|------|--------|
| スキーマ変更 | 必ず `prisma migrate dev --name 変更内容` を使う |
| `db push` | 使わない（履歴が残らない） |
| `db pull` | 直接DBを変更した後の同期にのみ使う（通常は不要） |
| マイグレーションファイル | git にコミットする（チームへの共有・本番反映に使う） |
