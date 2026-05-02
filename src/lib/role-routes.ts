import type { UserRole } from "@prisma/client";

/** Her rol için oturum sonrası varsayılan panel (middleware + landing ile senkron). */
export const ROLE_DEFAULT_PATH: Record<UserRole, string> = {
  ADMIN: "/admin",
  EXPORTER: "/ihracatci",
  LOGISTICS: "/lojistik",
  ICC_EXPERT: "/icc-uzmani",
  FINANCIAL_ADV: "/mali-musavir",
  INSURER: "/sigorta",
};

/**
 * Bilinmeyen / eski JWT rolü veya eksik `role` için `/` yerine `/login` döner;
 * aksi halde "Panele git" tıklanınca kullanıcı ana sayfada kalıyor gibi görünür.
 */
export function dashboardPathForRole(role: string | undefined | null): string {
  if (!role) return "/login";
  if (Object.prototype.hasOwnProperty.call(ROLE_DEFAULT_PATH, role)) {
    return ROLE_DEFAULT_PATH[role as UserRole];
  }
  return "/login";
}
