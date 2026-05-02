import Link from "next/link";
import { UserRole } from "@prisma/client";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Truck, 
  Package, 
  ShieldCheck, 
  Landmark, 
  ShieldAlert
} from "lucide-react";
import { AuthSession } from "@/lib/auth-utils";

interface SidebarProps {
  session: AuthSession;
}

export default function Sidebar({ session }: SidebarProps) {
  const { role } = session;

  const roleRoutes: Record<string, string> = {
    ADMIN: "/admin",
    EXPORTER: "/ihracatci",
    MANUFACTURER: "/uretici",
    SELLER: "/satici",
    LOGISTICS: "/lojistik",
    WAREHOUSE: "/depo",
    TRADE_EXPERT: "/dis-ticaret-uzmani",
    ICC_EXPERT: "/icc-uzmani",
    FINANCIAL_ADV: "/mali-musavir",
    ACCOUNTING: "/muhasebe",
    INSURER: "/sigorta",
  };

  const roleNames: Record<string, string> = {
    ADMIN: "Yönetici Paneli",
    EXPORTER: "İhracatçı Paneli",
    MANUFACTURER: "Üretici Paneli",
    SELLER: "Satıcı Paneli",
    LOGISTICS: "Lojistik Paneli",
    WAREHOUSE: "Depo Paneli",
    TRADE_EXPERT: "Dış Ticaret Uzmanı Paneli",
    ICC_EXPERT: "ICC Uzmanı Paneli",
    FINANCIAL_ADV: "Mali Müşavir Paneli",
    ACCOUNTING: "Muhasebe Paneli",
    INSURER: "Sigorta Paneli",
  };

  const mainRoute = roleRoutes[role] || "/";
  const mainName = roleNames[role] || "Ana Panel";

  return (
    <aside className="w-64 bg-brand-primary text-white flex flex-col min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight">Hubify</h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        <Link 
          href={mainRoute} 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
        >
          <LayoutDashboard className="h-5 w-5 text-brand-secondary" />
          {mainName}
        </Link>

        {role === "ADMIN" && (
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors mt-2"
          >
            <Users className="h-5 w-5 text-brand-secondary" />
            Kullanıcı Yönetimi
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-brand-secondary flex items-center justify-center text-brand-primary font-bold">
            {session.fullName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none truncate">{session.fullName}</span>
            <span className="text-xs text-brand-secondary mt-1">{role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
