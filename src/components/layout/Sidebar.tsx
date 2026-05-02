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
  ChevronRight,
  BarChart,
  Settings,
  Files,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { AuthSession } from "@/lib/auth-utils";
import { motion } from "framer-motion";

interface SidebarProps {
  session: AuthSession;
}

export default function Sidebar({ session }: SidebarProps) {
  const { role } = session;
  const pathname = usePathname();
  const profileRoute = "/profil";

  const roleRoutes: Record<string, string> = {
    ADMIN: "/admin",
    EXPORTER: "/ihracatci",
    BUYER: "/pazaryeri",
    LOGISTICS: "/lojistik",
    ICC_EXPERT: "/icc-uzmani",
    FINANCIAL_ADV: "/mali-musavir",
    INSURER: "/sigorta/bekleyen",
  };

  const roleNames: Record<string, string> = {
    ADMIN: "Yönetici Paneli",
    EXPORTER: "İhracatçı Paneli",
    BUYER: "Alıcı Pazaryeri",
    LOGISTICS: "Lojistik Paneli",
    ICC_EXPERT: "ICC Uzmanı Paneli",
    FINANCIAL_ADV: "Mali Müşavir Paneli",
    INSURER: "Sigorta Paneli",
  };

  const mainRoute = roleRoutes[role] || "/";
  const mainName = roleNames[role] || "Ana Panel";

  const isMainActive = pathname === mainRoute;
  const isAdminUsersActive = pathname === "/admin";
  const reportsHref =
    role === "ICC_EXPERT" ? "/icc-uzmani/raporlar" : 
    role === "INSURER" ? "/sigorta/raporlar" : 
    role === "FINANCIAL_ADV" ? "/mali-musavir/raporlar" : 
    "#raporlar";
    
  const reportsActive =
    (role === "ICC_EXPERT" && pathname === "/icc-uzmani/raporlar") ||
    (role === "INSURER" && pathname === "/sigorta/raporlar") ||
    (role === "FINANCIAL_ADV" && pathname === "/mali-musavir/raporlar");

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

      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
          {role === "INSURER" ? "Sigorta" : "Ana Ekran"}
        </div>

        {role === "INSURER" ? (
          <div className="relative mb-6 space-y-1">
            {[
              {
                href: "/sigorta/bekleyen",
                label: "Poliçe bekleyen",
                sublabel: "Poliçe sırasında bekleyen dosyalar",
                icon: ClipboardList,
              },
              {
                href: "/sigorta/yolda",
                label: "Yolda sigortalı yük",
                sublabel: "Canlı sevkiyat kartları",
                icon: Truck,
              },
              {
                href: "/sigorta/tamamlanan",
                label: "Tamamlanan sigortalı sevkiyat",
                sublabel: "Arşiv ve poliçe bağlantıları",
                icon: CheckCircle2,
              },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="block relative">
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ x: 5 }}
                    className={`relative z-10 flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <item.icon className={`h-5 w-5 shrink-0 mt-0.5 ${isActive ? "text-brand-secondary" : "text-slate-500"}`} aria-hidden />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium leading-snug">{item.label}</span>
                        <span className={`mt-1 block text-[10px] font-medium leading-snug uppercase tracking-wide ${isActive ? "text-slate-200/85" : "text-slate-500"}`}>
                          {item.sublabel}
                        </span>
                      </span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 shrink-0 text-brand-secondary opacity-60 mt-0.5" />}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ) : (
          <Link href={mainRoute} className="block relative mb-6">
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
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl relative z-10 transition-colors ${isMainActive ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`h-5 w-5 ${isMainActive ? "text-brand-secondary" : "text-slate-500"}`} />
                <span className="text-sm font-medium">{mainName}</span>
              </div>
              {isMainActive && <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />}
            </motion.div>
          </Link>
        )}

        {role === "ICC_EXPERT" ? (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3 mt-6">
              Modüller
            </div>
            <Link href="/icc-uzmani/onaylananlar" className="block relative mt-2">
              {pathname === "/icc-uzmani/onaylananlar" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                whileHover={{ x: 5 }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl relative z-10 transition-colors ${
                  pathname === "/icc-uzmani/onaylananlar"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Files
                    className={`h-5 w-5 ${
                      pathname === "/icc-uzmani/onaylananlar" ? "text-brand-secondary" : "text-slate-500"
                    }`}
                  />
                  <span className="text-sm font-medium">Onaylanan Belgeler</span>
                </div>
                {pathname === "/icc-uzmani/onaylananlar" && (
                  <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />
                )}
              </motion.div>
            </Link>
          </>
        ) : role === "INSURER" || role === "FINANCIAL_ADV" ? null : (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3 mt-6">
              Modüller
            </div>
            {[
              { name: "Taleplerim", icon: FileText, route: "#talepler" },
              { name: "Kargo & Lojistik", icon: Truck, route: "#lojistik" },
              { name: "Gümrük Belgeleri", icon: Files, route: "#belgeler" },
              { name: "Fatura & Finans", icon: Landmark, route: "#finans" },
            ].map((item, idx) => (
              <Link key={idx} href={item.route} className="block group">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
                  <item.icon className="h-5 w-5 text-slate-500 group-hover:text-slate-300" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              </Link>
            ))}
          </>
        )}

        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3 mt-8">
          Sistem
        </div>

        <Link href={reportsHref} className="block relative group">
          {reportsActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <motion.div
            whileHover={{ x: 5 }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative z-10 ${
              reportsActive ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <BarChart
              className={`h-5 w-5 ${reportsActive ? "text-brand-secondary" : "text-slate-500 group-hover:text-slate-300"}`}
            />
            <span className="text-sm font-medium">Raporlar & Analiz</span>
          </motion.div>
        </Link>

        {role === "ADMIN" && (
          <Link href="/admin" className="block relative">
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
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl relative z-10 transition-colors ${isAdminUsersActive && !isMainActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <Users className={`h-5 w-5 ${isAdminUsersActive && !isMainActive ? 'text-brand-secondary' : 'text-slate-500'}`} />
                <span className="text-sm font-medium">Kullanıcı Yönetimi</span>
              </div>
              {isAdminUsersActive && !isMainActive && <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />}
            </motion.div>
          </Link>
        )}

        <Link href={profileRoute ?? "#ayarlar"} className="block relative group">
          {profileRoute && pathname === profileRoute && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <motion.div
            whileHover={{ x: 5 }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative z-10 ${
              profileRoute && pathname === profileRoute
                ? "text-white"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <Settings
              className={`h-5 w-5 ${
                profileRoute && pathname === profileRoute
                  ? "text-brand-secondary"
                  : "text-slate-500 group-hover:text-slate-300"
              }`}
            />
            <span className="text-sm font-medium">Profil Ayarı</span>
          </motion.div>
        </Link>
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
