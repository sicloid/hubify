"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { TicketType } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
    
    revalidatePath("/admin"); // refresh admin dashboard to show new ticket
    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Support ticket creation failed:", error);
    return { success: false, error: "Bildirim gönderilirken bir hata oluştu." };
  }
}
