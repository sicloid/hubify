"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { TicketType, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

/** Alıcı — Taleplerim veya sipariş detayından admin destek kuyruğuna mesaj */
export async function submitBuyerSupportTicket(
  description: string,
  orderContext?: { referenceNumber: string; tradeRequestId: string },
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return { success: false as const, error: "Oturum bulunamadı; lütfen tekrar giriş yapın." };
    }
    if (session.role !== UserRole.BUYER) {
      return { success: false as const, error: "Bu işlem yalnızca alıcı hesapları içindir." };
    }

    const trimmed = description.trim();
    if (trimmed.length < 10) {
      return { success: false as const, error: "Mesaj en az 10 karakter olmalıdır." };
    }

    if (orderContext) {
      const allowed = await prisma.tradeRequest.findFirst({
        where: {
          id: orderContext.tradeRequestId,
          buyerId: session.id,
        },
        select: { id: true },
      });
      if (!allowed) {
        return { success: false as const, error: "Bu sipariş için mesaj gönderme yetkiniz yok." };
      }
    }

    const prefix = orderContext
      ? `[Alıcı destek — Sipariş ${orderContext.referenceNumber}]\n\n`
      : "[Alıcı destek — Taleplerim]\n\n";

    await prisma.supportTicket.create({
      data: {
        type: TicketType.FEATURE,
        description: `${prefix}${trimmed}`,
        userId: session.id,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/destek-ve-hata-bildirileri");
    return { success: true as const };
  } catch (error) {
    console.error("Buyer support ticket failed:", error);
    return { success: false as const, error: "Mesaj gönderilirken bir hata oluştu." };
  }
}

export async function submitSupportTicket(type: "BUG" | "FEATURE", description: string) {
  try {
    const session = await getSession();
    
    // We allow anonymous support tickets as well just in case session is lost during a crash
    const ticket = await prisma.supportTicket.create({
      data: {
        type: type as TicketType,
        description,
        userId: session?.id || null,
      }
    });
    
    revalidatePath("/admin");
    revalidatePath("/admin/destek-ve-hata-bildirileri");
    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Support ticket creation failed:", error);
    return { success: false, error: "Bildirim gönderilirken bir hata oluştu." };
  }
}
