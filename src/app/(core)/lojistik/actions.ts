'use server';

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

const getCachedAvailableRequests = unstable_cache(
  async () => {
    return prisma.tradeRequest.findMany({
      where: {
        status: {
          in: [TradeStatus.PENDING, TradeStatus.QUOTING]
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        exporter: {
          select: { fullName: true }
        },
        _count: {
          select: { quotes: true }
        }
      }
    });
  },
  ['available-requests'],
  { tags: ['trade-requests'], revalidate: 30 }
);

export async function getAvailableRequests() {
  await requireRole([UserRole.LOGISTICS, UserRole.ADMIN, UserRole.EXPORTER]);
  
  try {
    return await getCachedAvailableRequests();
  } catch (error) {
    console.error("Havuz verileri çekilirken hata:", error);
    return [];
  }
}

export async function getRequestDetail(id: string) {
  await requireAuth();
  
  try {
    const request = await prisma.tradeRequest.findUnique({
      where: { id },
      include: {
        exporter: {
          select: { fullName: true }
        },
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

    // Convert Decimal price to Number for client-side serialization
    return {
      ...request,
      quotes: request.quotes.map(q => ({
        ...q,
        price: Number(q.price)
      }))
    };
  } catch (error) {
    return null;
  }
}

export async function createQuote(data: {
  tradeRequestId: string;
  price: number;
  estimatedDays: number;
  notes?: string;
}) {
  const session = await requireRole([UserRole.LOGISTICS, UserRole.ADMIN]);
  
  try {
    await prisma.logisticsQuote.create({
      data: {
        tradeRequestId: data.tradeRequestId,
        price: data.price,
        estimatedDays: data.estimatedDays,
        notes: data.notes,
        logisticsId: session.id,
      },
    });

    await prisma.tradeRequest.update({
      where: { id: data.tradeRequestId },
      data: { status: TradeStatus.QUOTING }
    });

    revalidatePath("/lojistik");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Teklif hatası:", error);
    return { success: false, error: "Teklif iletilemedi." };
  }
}

export async function autoConsolidate() {
  await requireRole([UserRole.LOGISTICS, UserRole.ADMIN]);
  
  try {
    await prisma.tradeRequest.updateMany({
      where: { status: TradeStatus.PENDING },
      data: { status: TradeStatus.QUOTING }
    });
    
    revalidatePath("/lojistik");
    revalidateTag('trade-requests', { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Otomatik konsolidasyon hatası:", error);
    return { success: false };
  }
}

const getCachedPoolStats = unstable_cache(
  async () => {
    const poolRequests = await prisma.tradeRequest.findMany({
      where: { 
        status: {
          in: [TradeStatus.QUOTING, TradeStatus.LOGISTICS_APPROVED]
        }
      },
      select: { weight: true }
    });
    
    const totalWeight = poolRequests.reduce((acc, curr) => acc + (curr.weight || 0), 0);
    const capacity = 20000;
    
    return {
      totalWeight,
      capacity,
      occupancyRate: Math.min(Math.round((totalWeight / capacity) * 100), 100)
    };
  },
  ['pool-stats'],
  { tags: ['trade-requests'], revalidate: 30 }
);

export async function getPoolStats() {
  await requireAuth();
  
  try {
    return await getCachedPoolStats();
  } catch (error) {
    return { totalWeight: 0, capacity: 20000, occupancyRate: 0 };
  }
}

const getCachedActiveShipments = unstable_cache(
  async () => {
    return prisma.tradeRequest.findMany({
      where: {
        status: {
          in: [
            TradeStatus.LOGISTICS_APPROVED,
            TradeStatus.DOCUMENTS_PENDING,
            TradeStatus.DOCUMENTS_APPROVED,
            TradeStatus.IN_TRANSIT
          ]
        },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        title: true
      }
    });
  },
  ['active-shipments'],
  { tags: ['trade-requests'], revalidate: 15 }
);

export async function getActiveShipments() {
  await requireAuth();
  
  try {
    return await getCachedActiveShipments();
  } catch (error) {
    console.error("Aktif sevkiyat hatası:", error);
    return [];
  }
}


