'use server';

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

export async function createTradeRequest(data: {
  title: string;
  description: string;
  weight: number;
}) {
  const session = await requireRole([UserRole.EXPORTER, UserRole.ADMIN]);
  
  const referenceNumber = `HUB-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const request = await prisma.tradeRequest.create({
      data: {
        referenceNumber,
        title: data.title,
        description: data.description,
        weight: data.weight,
        status: TradeStatus.PENDING,
        exporterId: session.id,
      },
    });

    revalidatePath("/ihracatci");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true, id: request.id };
  } catch (error) {
    console.error("Talep oluşturma hatası:", error);
    return { success: false, error: "Talep oluşturulamadı." };
  }
}

export async function getTradeRequests() {
  const session = await requireAuth();
  
  const getCachedTradeRequests = unstable_cache(
    async () => {
      return prisma.tradeRequest.findMany({
        where: {
          exporterId: session.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: { quotes: true }
          }
        }
      });
    },
    [`trade-requests-${session.id}`],
    { tags: ['trade-requests'], revalidate: 30 }
  );

  try {
    return await getCachedTradeRequests();
  } catch (error) {
    console.error("Talepler çekilirken hata oluştu:", error);
    return [];
  }
}
export async function getTradeRequestDetail(id: string) {
  const session = await requireAuth();
  
  const getCachedDetail = unstable_cache(
    async () => {
      const request = await prisma.tradeRequest.findUnique({
        where: { id, exporterId: session.id },
        include: {
          quotes: {
            include: {
              logistics: {
                select: { fullName: true }
              }
            }
          }
        }
      });

      if (!request) return null;

      return {
        ...request,
        quotes: request.quotes.map(q => ({
          ...q,
          price: Number(q.price)
        }))
      };
    },
    [`trade-detail-${id}-${session.id}`],
    { tags: ['trade-requests'], revalidate: 30 }
  );

  try {
    return await getCachedDetail();
  } catch (error) {
    return null;
  }
}

export async function acceptQuote(quoteId: string, tradeRequestId: string) {
  const session = await requireRole([UserRole.EXPORTER, UserRole.ADMIN]);
  
  try {
    // 1. Tüm teklifleri reddet (isAccepted = false) - opsiyonel, zaten default false
    // 2. Seçilen teklifi kabul et
    await prisma.logisticsQuote.update({
      where: { id: quoteId },
      data: { isAccepted: true }
    });

    // 3. Talebin durumunu güncelle
    await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: { status: TradeStatus.LOGISTICS_APPROVED }
    });

    revalidatePath(`/ihracatci/${tradeRequestId}`);
    revalidatePath("/ihracatci");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Teklif onaylama hatası:", error);
    return { success: false };
  }
}
