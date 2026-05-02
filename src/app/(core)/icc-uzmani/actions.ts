'use server';

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { TradeStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getIccRequests() {
  await requireRole([UserRole.ICC_EXPERT, UserRole.ADMIN]);
  
  try {
    return await prisma.tradeRequest.findMany({
      where: {
        status: {
          in: [TradeStatus.LOGISTICS_APPROVED, TradeStatus.DOCUMENTS_PENDING, TradeStatus.DOCUMENTS_APPROVED]
        }
      },
      include: {
        exporter: {
          select: { fullName: true }
        },
        quotes: {
          where: { isAccepted: true },
          include: {
            logistics: {
              select: { fullName: true }
            }
          }
        },
        _count: {
          select: { documents: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  } catch (error) {
    console.error("ICC talepleri çekilirken hata:", error);
    return [];
  }
}

export async function approveDocuments(tradeRequestId: string) {
  await requireRole([UserRole.ICC_EXPERT, UserRole.ADMIN]);
  
  try {
    await prisma.tradeRequest.update({
      where: { id: tradeRequestId },
      data: { status: TradeStatus.DOCUMENTS_APPROVED }
    });
    
    revalidatePath("/icc-uzmani");
    revalidatePath(`/ihracatci/${tradeRequestId}`);
    return { success: true };
  } catch (error) {
    console.error("Belge onaylama hatası:", error);
    return { success: false };
  }
}
