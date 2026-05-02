"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { FileStack, Landmark, Shield } from "lucide-react";

const linkClass =
  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-transparent transition-colors";
const inactive = "text-slate-600 hover:bg-slate-100 hover:border-slate-200";
const active =
  "text-brand-primary bg-white border-slate-200 shadow-sm ring-1 ring-slate-200/60";

interface FinBelgeSubnavProps {
  role: UserRole;
}

export default function FinBelgeSubnav({ role }: FinBelgeSubnavProps) {
  const pathname = usePathname();

  const canDocuments = ["ICC_EXPERT", "FINANCIAL_ADV", "ADMIN"].includes(role);
  const canFinance = ["FINANCIAL_ADV", "ADMIN"].includes(role);
  const canInsurance = ["INSURER", "ADMIN"].includes(role);

  if (!canDocuments && !canFinance && !canInsurance) {
    return null;
  }

  const items: { href: string; label: string; icon: typeof FileStack; show: boolean }[] = [
    { href: "/evraklar", label: "Evraklar", icon: FileStack, show: canDocuments },
    { href: "/para-akisi", label: "Para akışı", icon: Landmark, show: canFinance },
    { href: "/sigorta", label: "Sigorta & teminat", icon: Shield, show: canInsurance },
  ].filter((i) => i.show);

  return (
    <div className="border-b border-slate-200 bg-slate-100/80 backdrop-blur-sm">
      <div className="px-6 py-3 flex flex-wrap items-center gap-2">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`${linkClass} ${isActive ? active : inactive}`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-brand-secondary" : "text-slate-400"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
