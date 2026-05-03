'use server';

import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/serialize";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { TradeStatus, UserRole, PaymentStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getAvailableProducts() {
  await requireAuth();

  try {
    const products = await prisma.$queryRawUnsafe<any[]>(
      `SELECT t.*, u."fullName" as "exporterName"
       FROM "TradeRequest" t
       JOIN "User" u ON t."exporterId" = u.id
       WHERE t.status = 'PENDING' AND t."buyerId" IS NULL
       ORDER BY t."createdAt" DESC`
    );

    const formatted = products.map(p => ({
      ...p,
      exporter: { fullName: p.exporterName }
    }));

    return formatted.map(p => serializeDecimal(p));
  } catch (error) {
    console.error("Ürünler çekilirken hata:", error);
    return [];
  }
}

export async function placeOrder(tradeRequestId: string) {
  const session = await requireRole([UserRole.BUYER, UserRole.ADMIN]);

  try {
    const request = await prisma.tradeRequest.findUnique({
      where: { id: tradeRequestId }
    });

    if (!request || request.status !== TradeStatus.PENDING || request.buyerId) {
      return { success: false, error: "Bu ürün artık mevcut değil." };
    }

    await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: {
        buyerId: session.id,
        status: TradeStatus.ORDERED,
        paymentStatus: PaymentStatus.AWAITING_PAYMENT,
      }
    });

    revalidatePath("/pazaryeri");
    revalidatePath("/ihracatci");
    revalidatePath("/lojistik");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Sipariş hatası:", error);
    return { success: false, error: "Sipariş oluşturulamadı." };
  }
}

export async function confirmPayment(tradeRequestId: string) {
  const session = await requireRole([UserRole.BUYER, UserRole.ADMIN]);

  try {
    const request = await prisma.tradeRequest.findUnique({
      where: { id: tradeRequestId }
    });

    if (!request || request.buyerId !== session.id) {
      return { success: false, error: "Bu siparişe erişiminiz yok." };
    }

    if (request.paymentStatus !== PaymentStatus.AWAITING_PAYMENT) {
      return { success: false, error: "Ödeme zaten alınmış." };
    }

    await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: {
        paymentStatus: PaymentStatus.ESCROW_HELD,
        paidAt: new Date(),
      }
    });

    revalidatePath("/pazaryeri");
    revalidatePath("/ihracatci");
    revalidatePath("/icc-uzmani");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Ödeme hatası:", error);
    return { success: false, error: "Ödeme işlemi başarısız." };
  }
}

export async function getMyOrders() {
  const session = await requireRole([UserRole.BUYER, UserRole.ADMIN]);

  try {
    const orders = await prisma.$queryRawUnsafe<any[]>(
      `SELECT t.*, u."fullName" as "exporterName"
       FROM "TradeRequest" t
       JOIN "User" u ON t."exporterId" = u.id
       WHERE t."buyerId" = $1::uuid
       ORDER BY t."updatedAt" DESC`,
      session.id
    );

    const formatted = orders.map(o => ({
      ...o,
      exporter: { fullName: o.exporterName }
    }));

    return formatted.map(o => serializeDecimal(o));
  } catch (error) {
    console.error("Siparişler çekilirken hata:", error);
    return [];
  }
}
