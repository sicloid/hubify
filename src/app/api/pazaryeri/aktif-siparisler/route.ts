import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth-utils";
import { TradeStatus, UserRole } from "@prisma/client";
import { serializeDecimal } from "../../../../lib/serialize";

export async function GET() {
  const session = await getSession();
  
  if (!session || (session.role !== UserRole.BUYER && session.role !== UserRole.ADMIN)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.tradeRequest.findMany({
      where: {
        buyerId: session.id,
        status: {
          not: TradeStatus.PENDING
        }
      },
      include: {
        exporter: { select: { fullName: true } },
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(serializeDecimal(orders));
  } catch (error) {
    console.error("Siparişler API hatası:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
