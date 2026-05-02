"use client";

import Link from "next/link";
import { UserRole } from "@prisma/client";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Truck, 
  Package, 
  ShieldCheck, 
  Landmark, 
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { AuthSession } from "@/lib/auth-utils";
import { motion } from "framer-motion";

interface SidebarProps {
  session: AuthSession;
}

export default function Sidebar({ session }: SidebarProps) {
  const { role } = session;
  const pathname = usePathname();

  const roleRoutes: Record<string, string> = {
    ADMIN: "/admin",
    EXPORTER: "/ihracatci",
    LOGISTICS: "/lojistik",
    ICC_EXPERT: "/icc-uzmani",
    FINANCIAL_ADV: "/mali-musavir",
    INSURER: "/sigorta",
  };

  const roleNames: Record<string, string> = {
    ADMIN: "Yönetici Paneli",
    EXPORTER: "İhracatçı Paneli",
    LOGISTICS: "Lojistik Paneli",
    ICC_EXPERT: "ICC Uzmanı Paneli",
    FINANCIAL_ADV: "Mali Müşavir Paneli",
    INSURER: "Sigorta Paneli",
  };

  const mainRoute = roleRoutes[role] || "/";
  const mainName = roleNames[role] || "Ana Panel";

  const isMainActive = pathname === mainRoute;
  const isAdminUsersActive = pathname === "/admin";

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800"
    >
      <div className="h-16 flex items-center px-6 border-b border-white/5 relative overflow-hidden">
        <motion.div 
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-brand-secondary to-transparent"
        />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <ShieldCheck className="w-5 h-5 text-brand-secondary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Hubify</h1>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
          Operasyonlar
        </div>

        <Link href={mainRoute} className="block relative">
          {isMainActive && (
            <motion.div 
              layoutId="activeTab"
              className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <motion.div 
            whileHover={{ x: 5 }}
            className={`flex items-center justify-between px-3 py-3 rounded-xl relative z-10 transition-colors ${isMainActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`h-5 w-5 ${isMainActive ? 'text-brand-secondary' : 'text-slate-500'}`} />
              <span className="text-sm font-medium">{mainName}</span>
            </div>
            {isMainActive && <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />}
          </motion.div>
        </Link>

        {role === "ADMIN" && (
          <Link href="/admin" className="block relative mt-2">
            {isAdminUsersActive && !isMainActive && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <motion.div 
              whileHover={{ x: 5 }}
              className={`flex items-center justify-between px-3 py-3 rounded-xl relative z-10 transition-colors ${isAdminUsersActive && !isMainActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <Users className={`h-5 w-5 ${isAdminUsersActive && !isMainActive ? 'text-brand-secondary' : 'text-slate-500'}`} />
                <span className="text-sm font-medium">Kullanıcı Yönetimi</span>
              </div>
              {isAdminUsersActive && !isMainActive && <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />}
            </motion.div>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-white/5 bg-slate-900/50">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 shadow-inner"
        >
          <div className="h-9 w-9 rounded-full bg-brand-primary/20 border border-brand-primary/50 flex items-center justify-center text-brand-secondary font-bold shadow-[0_0_10px_rgba(14,165,233,0.2)]">
            {session.fullName.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium leading-none truncate text-slate-200">{session.fullName}</span>
            <span className="text-[11px] text-brand-secondary/80 mt-1.5 font-medium tracking-wide uppercase">{role}</span>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
