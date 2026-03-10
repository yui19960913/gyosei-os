import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const reviewers = await prisma.reviewer.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json(reviewers)
}

export async function POST(req: NextRequest) {
  const data = await req.json() as { name: string; title: string; company: string; experience: string; speciality: string; bio?: string }
  const reviewer = await prisma.reviewer.create({ data })
  return NextResponse.json(reviewer)
}
