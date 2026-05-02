'use server';

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { TradeStatus, UserRole, PaymentStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

const getCachedProducts = unstable_cache(
  async () => {
    return prisma.tradeRequest.findMany({
      where: {
        status: TradeStatus.PENDING,
        buyerId: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        exporter: {
          select: { fullName: true }
        }
      }
    });
  },
  ['available-products'],
  { tags: ['trade-requests'], revalidate: 15 }
);

export async function getAvailableProducts() {
  await requireAuth();

  try {
    const products = await getCachedProducts();
    return products.map(p => ({
      ...p,
      unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
      totalPrice: p.totalPrice ? Number(p.totalPrice) : null,
    }));
  } catch (error) {
    console.error("Ürünler çekilirken hata:", error);
    return [];
  }
}

// Sipariş ver — ödeme bekleniyor
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

// Ödeme simülasyonu — escrow'a al
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

  const getCachedMyOrders = unstable_cache(
    async () => {
      return prisma.tradeRequest.findMany({
        where: { buyerId: session.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          exporter: {
            select: { fullName: true }
          }
        }
      });
    },
    [`my-orders-${session.id}`],
    { tags: ['trade-requests'], revalidate: 30 }
  );

  try {
    const orders = await getCachedMyOrders();
    return orders.map(o => ({
      ...o,
      unitPrice: o.unitPrice ? Number(o.unitPrice) : null,
      totalPrice: o.totalPrice ? Number(o.totalPrice) : null,
    }));
  } catch (error) {
    console.error("Siparişler çekilirken hata:", error);
    return [];
  }
}
