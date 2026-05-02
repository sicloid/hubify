"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function updateProfile(formData: FormData) {
  const session = await requireAuth();

  const fullName = String(formData.get("fullName") || "").trim();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!fullName) return;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { passwordHash: true, role: true },
  });

  if (!user) return;

  const dataToUpdate: { fullName: string; passwordHash?: string } = { fullName };

  const hasPasswordChangeInput = currentPassword || newPassword || confirmPassword;
  if (hasPasswordChangeInput) {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    if (newPassword.length < 8) return;

    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) return;

    dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { id: session.id },
    data: dataToUpdate,
  });

  revalidatePath("/profil");
  
  const roleRoutes: Record<string, string> = {
    ADMIN: "/admin",
    EXPORTER: "/ihracatci",
    LOGISTICS: "/lojistik",
    ICC_EXPERT: "/icc-uzmani",
    FINANCIAL_ADV: "/mali-musavir",
    INSURER: "/sigorta/bekleyen",
  };
  
  if (roleRoutes[user.role]) {
    revalidatePath(roleRoutes[user.role]);
  }
}
