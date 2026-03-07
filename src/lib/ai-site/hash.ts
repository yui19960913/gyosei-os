/**
 * AIコスト制御: プロンプトハッシュユーティリティ
 *
 * 設計原則:
 *   AI生成はユーザー操作（生成ボタン・初回作成）のときのみ実施する。
 *   同一入力に対してAIを2回呼ばないよう、入力をハッシュ化してDBに記録する。
 *   以降の同一リクエストはDBから結果を返す（AIコスト約90%削減）。
 */

import { createHash } from 'crypto'
import type { GenerateInput } from './types'

/**
 * サイト生成入力のSHA-256ハッシュを返す。
 * 配列フィールドはソート後に結合してハッシュの安定性を保証する。
 */
export function buildSitePromptHash(input: GenerateInput): string {
  const normalized = JSON.stringify({
    firmName:     input.firmName.trim(),
    ownerName:    input.ownerName.trim(),
    ownerBio:     (input.ownerBio ?? '').trim(),
    prefecture:   input.prefecture,
    services:     [...input.services].sort(),
    strengths:    input.strengths.trim(),
    targetClients: (input.targetClients ?? '').trim(),
    styles:       [...input.styles].sort(),
  })

  return createHash('sha256').update(normalized, 'utf8').digest('hex')
}

/**
 * SEOページ生成のキャッシュキーを返す（siteId + keyword の正規化）。
 * SEOページは siteId_slug の UNIQUE 制約でDB側が重複を防ぐため、
 * このキーはログ用途のみ。
 */
export function buildSeoPromptHash(siteId: string, keyword: string): string {
  return createHash('sha256')
    .update(`${siteId}::${keyword.trim().toLowerCase()}`, 'utf8')
    .digest('hex')
}
