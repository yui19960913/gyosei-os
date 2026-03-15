import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 })
  }

  if (file.type && !file.type.startsWith('image/')) {
    return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 })
  }

  const url = new URL(req.url)
  const slug = url.searchParams.get('slug') ?? 'unknown'
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `profiles/${slug}/${Date.now()}.${ext}`

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN が設定されていません' }, { status: 500 })
  }

  const blob = await put(filename, file, { access: 'public', token })

  return NextResponse.json({ url: blob.url })
}
