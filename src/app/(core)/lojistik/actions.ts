'use server';

import { prisma } from "@/lib/prisma";
import { serializeDecimal } from "@/lib/serialize";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

const getCachedAvailableRequests = unstable_cache(
  async () => {
    return prisma.tradeRequest.findMany({
      where: {
        status: {
          in: [TradeStatus.ORDERED, TradeStatus.QUOTING]
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        exporter: {
          select: { fullName: true }
        },
        buyer: {
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
  await requireRole([UserRole.LOGISTICS, UserRole.ADMIN, UserRole.EXPORTER, UserRole.ICC_EXPERT, UserRole.FINANCIAL_ADV]);
  
  try {
    const data = await getCachedAvailableRequests();
    return serializeDecimal(data);
  } catch (error) {
    console.error("Havuz verileri çekilirken hata:", error);
    return [];
  }
}

export async function getRequestDetail(idOrRef: string) {
  const session = await requireAuth();

  try {
    const request = await prisma.tradeRequest.findFirst({
      where: {
        OR: [
          { id: idOrRef.length === 36 ? idOrRef : undefined },
          { referenceNumber: idOrRef }
        ]
      },
      include: {
        exporter: { select: { fullName: true } },
        quotes: {
          include: {
            logistics: { select: { fullName: true } }
          },
          orderBy: { price: 'asc' }
        }
      }
    });

    if (!request) return null;

    return serializeDecimal(request);
  } catch (error) {
    console.error("Talep detay hatası:", error);
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
    revalidatePath(`/lojistik/${data.tradeRequestId}`);
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
      where: { status: TradeStatus.ORDERED },
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
    const data = await prisma.tradeRequest.findMany({
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
    return serializeDecimal(data);
  } catch (error) {
    console.error("Aktif sevkiyat hatası:", error);
    return [];
  }
}

export async function markAsDelivered(tradeRequestId: string) {
  await requireRole([UserRole.LOGISTICS, UserRole.ADMIN]);

  try {
    const updated = await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: { status: TradeStatus.COMPLETED }
    });

    revalidatePath("/lojistik", "layout");
    revalidatePath("/pazaryeri", "layout");
    revalidatePath("/sigorta", "layout");
    revalidateTag('trade-requests');
    
    return { success: true };
  } catch (error) {
    console.error("Teslimat onaylama hatası:", error);
    return { success: false, error: "İşlem tamamlanamadı." };
  }
}

export async function getMyQuotes() {
  const session = await requireRole([UserRole.LOGISTICS, UserRole.ADMIN]);

  try {
    const quotes = await prisma.$queryRawUnsafe<any[]>(
      `SELECT q.*, t.title as "tradeTitle", t."referenceNumber", t.status as "tradeStatus"
       FROM "LogisticsQuote" q
       JOIN "TradeRequest" t ON q."tradeRequestId" = t.id
       WHERE q."logisticsId" = $1::uuid
       ORDER BY q."createdAt" DESC`,
      session.id
    );

    return serializeDecimal(quotes);
  } catch (error) {
    console.error("Tekliflerim çekilirken hata:", error);
    return [];
  }
}

export async function getApprovedHistory() {
  await requireRole([UserRole.ICC_EXPERT, UserRole.FINANCIAL_ADV, UserRole.ADMIN]);

  try {
    const history = await prisma.tradeRequest.findMany({
      where: {
        status: {
          in: [
            TradeStatus.DOCUMENTS_APPROVED,
            TradeStatus.IN_TRANSIT,
            TradeStatus.COMPLETED
          ]
        }
      },
      include: {
        exporter: { select: { fullName: true } },
        _count: { select: { documents: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    return serializeDecimal(history);
  } catch (error) {
    console.error("Onay geçmişi hatası:", error);
    return [];
  }
}

