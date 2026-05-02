'use server';

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { TradeStatus, UserRole } from "@prisma/client";
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
    return await getCachedProducts();
  } catch (error) {
    console.error("Ürünler çekilirken hata:", error);
    return [];
  }
}

export async function placeOrder(tradeRequestId: string) {
  const session = await requireRole([UserRole.BUYER, UserRole.ADMIN]);

  try {
    // Verify the request is still available
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
    return await getCachedMyOrders();
  } catch (error) {
    console.error("Siparişler çekilirken hata:", error);
    return [];
  }
}
