"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { TradeStatus } from "@prisma/client";

export async function getLiveSystemLogs() {
  await requireAdmin();

  const logs = await prisma.systemLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: {
        select: { fullName: true }
      }
    }
  });

  return logs.map((log) => ({
    id: log.id,
    message: log.user ? `${log.user.fullName}: ${log.message}` : log.message,
    type: log.type as "success" | "warning" | "info",
    time: log.createdAt.toLocaleTimeString("tr-TR"),
  }));
}

export async function getLiveRadarStats() {
  await requireAdmin();

  const [pending, reviewing, docsPending, inTransit] = await Promise.all([
    prisma.tradeRequest.count({ where: { status: TradeStatus.PENDING } }),
    prisma.tradeRequest.count({ where: { status: { in: [TradeStatus.REVIEWING, TradeStatus.QUOTING] } } }),
    prisma.tradeRequest.count({ where: { status: { in: [TradeStatus.DOCUMENTS_PENDING, TradeStatus.LOGISTICS_APPROVED] } } }),
    prisma.tradeRequest.count({ where: { status: TradeStatus.IN_TRANSIT } }),
  ]);

  return {
    pending,
    reviewing,
    docsPending,
    inTransit,
  };
}
