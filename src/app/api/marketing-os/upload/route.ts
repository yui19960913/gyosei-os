import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'ファイルがありません' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: '画像ファイルのみアップロード可能です' }, { status: 400 })
  }

  const url = new URL(req.url)
  const slug = url.searchParams.get('slug') ?? 'unknown'
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `profiles/${slug}/${Date.now()}.${ext}`

  const blob = await put(filename, file, { access: 'public' })

  return NextResponse.json({ url: blob.url })
}
