"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { TicketStatus as SupportTicketStatusEnum, TradeStatus, UserRole } from "@prisma/client";
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

  try {
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
  } catch (error) {
    // Fallback Mock Data for Hackathon
    return [
      { id: "mock-1", message: "Sistem: Veritabanı bağlantısı koptu, simülasyon moduna geçildi.", type: "warning", time: new Date().toLocaleTimeString("tr-TR") },
      { id: "mock-2", message: "Ahmet Yılmaz: Yeni kargo talebi oluşturuldu (#TR-1025).", type: "info", time: new Date().toLocaleTimeString("tr-TR") },
      { id: "mock-3", message: "Lojistik A.Ş.: TR-1025 için konteyner ataması yapıldı.", type: "success", time: new Date().toLocaleTimeString("tr-TR") },
    ];
  }
}

export async function getLiveRadarStats() {
  await requireAdmin();

  try {
    const [pending, reviewing, docsPending, inTransit] = await Promise.all([
      prisma.tradeRequest.count({ where: { status: TradeStatus.PENDING } }),
      prisma.tradeRequest.count({ where: { status: { in: [TradeStatus.ORDERED, TradeStatus.QUOTING] } } }),
      prisma.tradeRequest.count({ where: { status: { in: [TradeStatus.DOCUMENTS_PENDING, TradeStatus.LOGISTICS_APPROVED] } } }),
      prisma.tradeRequest.count({ where: { status: TradeStatus.IN_TRANSIT } }),
    ]);

    return {
      pending,
      reviewing,
      docsPending,
      inTransit,
    };
  } catch (error) {
    // Fallback Mock Data for Hackathon
    return {
      pending: 4,
      reviewing: 2,
      docsPending: 3,
      inTransit: 5,
    };
  }
}

export async function updateSupportTicketStatus(
  ticketId: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED",
) {
  await requireAdmin();

  if (!ticketId?.trim()) {
    return { success: false as const, error: "Geçersiz kayıt." };
  }

  try {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: status as SupportTicketStatusEnum },
    });
    revalidatePath("/admin/destek-ve-hata-bildirileri");
    revalidatePath("/admin");
    return { success: true as const };
  } catch (e) {
    console.error("updateSupportTicketStatus", e);
    return { success: false as const, error: "Durum güncellenemedi." };
  }
}

export async function getSupportTickets() {
  await requireAdmin();

  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: { fullName: true, role: true, email: true },
        },
      },
    });

    const fmt = (d: Date) =>
      d.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    return tickets.map((ticket) => ({
      id: ticket.id,
      type: ticket.type,
      description: ticket.description,
      status: ticket.status,
      createdAtLabel: fmt(ticket.createdAt),
      updatedAtLabel: fmt(ticket.updatedAt),
      user: ticket.user ? `${ticket.user.fullName} (${ticket.user.role})` : "Anonim",
      userFullName: ticket.user?.fullName ?? null,
      userRole: ticket.user?.role ?? null,
      userEmail: ticket.user?.email ?? null,
      userId: ticket.userId,
    }));
  } catch (error) {
    console.error("Fetch support tickets error:", error);
    return [];
  }
}
