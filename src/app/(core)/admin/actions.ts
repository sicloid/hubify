"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

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
