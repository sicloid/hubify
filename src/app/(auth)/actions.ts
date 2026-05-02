"use server";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "E-posta ve şifre zorunludur." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Geçersiz e-posta veya şifre." };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return { error: "Geçersiz e-posta veya şifre." };
  }

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });

  const roleRoutes: Record<string, string> = {
    ADMIN: "/admin",
    EXPORTER: "/ihracatci",
    LOGISTICS: "/lojistik",
    ICC_EXPERT: "/icc-uzmani",
    FINANCIAL_ADV: "/mali-musavir",
    INSURER: "/sigorta",
  };

  const targetRoute = roleRoutes[user.role] || "/";
  redirect(targetRoute);
}

export async function registerAction(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("fullName")?.toString();

  if (!email || !password || !fullName) {
    return { error: "Tüm alanları doldurunuz." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Bu e-posta adresi zaten kullanımda." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // İlk kullanıcıyı otomatik ADMIN yapma mantığı eklenebilir veya varsayılan EXPORTER
  const isFirstUser = (await prisma.user.count()) === 0;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: isFirstUser ? "ADMIN" : "EXPORTER",
    },
  });

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });

  redirect(isFirstUser ? "/admin" : "/ihracatci");
}
