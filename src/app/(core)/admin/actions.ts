"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: UserRole) {
  // BOLA/IDOR protection: Check if current user is ADMIN
  await requireAdmin();

  if (!userId || !newRole) {
    return { error: "Geçersiz parametreler." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "Rol güncellenirken bir hata oluştu." };
  }
}

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
