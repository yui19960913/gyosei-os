import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    firmName,
    ownerName,
    slug,
    email,
    monthlyFee,
    contractStartedAt,
    status = "active",
    phone,
    prefecture,
    notes,
  } = body;

  if (!firmName || !ownerName || !slug || !email || !monthlyFee || !contractStartedAt) {
    return NextResponse.json(
      { error: "必須項目が不足しています" },
      { status: 400 }
    );
  }

  try {
    const client = await prisma.client.create({
      data: {
        firmName,
        ownerName,
        slug,
        email,
        monthlyFee: Number(monthlyFee),
        contractStartedAt: new Date(contractStartedAt),
        status,
        phone: phone || null,
        prefecture: prefecture || null,
        notes: notes || null,
      },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "このslugはすでに使用されています" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
