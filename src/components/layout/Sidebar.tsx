"use client";

import Link from "next/link";
import { UserRole } from "@prisma/client";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Archive,
  Users,
  FileText,
  Truck,
  Package,
  ShieldCheck,
  Landmark,
  ShoppingCart,
  ChevronRight,
  BarChart,
  Settings,
  Files,
  ClipboardList,
  CheckCircle2,
  LifeBuoy,
  ShoppingBag,
  History,
  Send,
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
  const isAdminSupportTicketsActive =
    pathname === "/admin/destek-ve-hata-bildirileri";
  const reportsHref =
    role === "ADMIN"
      ? "/admin/raporlar"
      : role === "ICC_EXPERT"
        ? "/icc-uzmani/raporlar"
        : role === "INSURER"
          ? "/sigorta/raporlar"
          : role === "FINANCIAL_ADV"
            ? "/mali-musavir/raporlar"
            : role === "BUYER"
              ? "/pazaryeri/raporlar"
              : role === "EXPORTER"
                ? "/ihracatci/raporlar"
                : role === "LOGISTICS"
                  ? "/lojistik/raporlar"
                  : "#raporlar";

  const reportsActive =
    (role === "ADMIN" && pathname === "/admin/raporlar") ||
    (role === "ICC_EXPERT" && pathname === "/icc-uzmani/raporlar") ||
    (role === "INSURER" && pathname === "/sigorta/raporlar") ||
    (role === "FINANCIAL_ADV" && pathname === "/mali-musavir/raporlar") ||
    (role === "BUYER" && pathname === "/pazaryeri/raporlar") ||
    (role === "EXPORTER" && pathname === "/ihracatci/raporlar") ||
    (role === "LOGISTICS" && pathname === "/lojistik/raporlar");

  const modulerItems =
    role === "ADMIN"
      ? [
          { name: "Taleplerim", icon: FileText, route: "/admin/taleplerim" },
          { name: "Kargo & Lojistik", icon: Truck, route: "/admin/kargo-lojistik" },
          { name: "Gümrük Belgeleri", icon: Files, route: "/admin/gumruk-belgeleri" },
          { name: "Fatura & Finans", icon: Landmark, route: "/admin/fatura-finans" },
        ]
      : role === "EXPORTER"
      ? [
          { name: "Taleplerim", icon: FileText, route: "/taleplerim" },
          { name: "Kargo & Lojistik", icon: Truck, route: "/ihracatci/kargo-lojistik" },
          { name: "Gümrük Belgeleri", icon: Files, route: "/ihracatci/gumruk-belgeleri" },
          { name: "Fatura & Finans", icon: Landmark, route: "/ihracatci/fatura-finans" },
        ]
      : role === "LOGISTICS"
        ? [
            { name: "Yoldaki Ürünler", icon: Truck, route: "/lojistik/yoldaki" },
          ]
      : role === "BUYER"
        ? [
            { name: "Pazaryeri", icon: ShoppingCart, route: "/pazaryeri" },
            { name: "Siparişlerim", icon: ShoppingBag, route: "/pazaryeri/siparisler" },
          ]
        : [
            { name: "Taleplerim", icon: FileText, route: "/taleplerim" },
            { name: "Kargo & Lojistik", icon: Truck, route: "#lojistik" },
            { name: "Gümrük Belgeleri", icon: Files, route: "#belgeler" },
            { name: "Fatura & Finans", icon: Landmark, route: "#finans" },
          ];

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
                href: "/sigorta/ulasmayan-police",
                label: "Ulaşmamış poliçeler",
                sublabel: "Kesimden tamamlanana kadar süreç",
                icon: Send,
              },
              {
                href: "/sigorta/tamamlanan",
                label: "Tamamlanan Sevkiyatlar",
                sublabel: "Arşiv ve poliçe kayıtları",
                icon: Archive,
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
            {[
              { name: "Onayladığım İşlemler", icon: FileText, route: "/taleplerim" },
            ].map((item, idx) => (
              <Link key={idx} href={item.route} className="block relative mt-2">
                {pathname === item.route && (
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
                    pathname === item.route
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-5 w-5 ${
                        pathname === item.route ? "text-brand-secondary" : "text-slate-500"
                      }`}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {pathname === item.route && (
                    <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />
                  )}
                </motion.div>
              </Link>
            ))}
          </>
        ) : role === "INSURER" ? null : role === "FINANCIAL_ADV" ? (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3 mt-6">
              Modüller
            </div>
            {[
              {
                name: "Geçmiş İşlemler",
                icon: History,
                route: "/mali-musavir/gecmis-islemler",
              },
            ].map((item, idx) => (
              <Link key={idx} href={item.route} className="block relative mt-2">
                {pathname === item.route && (
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
                    pathname === item.route
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-5 w-5 ${
                        pathname === item.route ? "text-brand-secondary" : "text-slate-500"
                      }`}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {pathname === item.route && (
                    <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />
                  )}
                </motion.div>
              </Link>
            ))}
          </>
        ) : (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3 mt-6">
              Modüller
            </div>
            {modulerItems.map((item, idx) => (
              <Link key={idx} href={item.route} className="block relative mt-2">
                {pathname === item.route && (
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
                    pathname === item.route
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-5 w-5 ${
                        pathname === item.route ? "text-brand-secondary" : "text-slate-500"
                      }`}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {pathname === item.route && (
                    <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />
                  )}
                </motion.div>
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
          <>
            <Link href="/admin" className="block relative">
              {isAdminUsersActive && !isMainActive && !isAdminSupportTicketsActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div 
                whileHover={{ x: 5 }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl relative z-10 transition-colors ${isAdminUsersActive && !isMainActive && !isAdminSupportTicketsActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`h-5 w-5 ${isAdminUsersActive && !isMainActive && !isAdminSupportTicketsActive ? 'text-brand-secondary' : 'text-slate-500'}`} />
                  <span className="text-sm font-medium">Kullanıcı Yönetimi</span>
                </div>
                {isAdminUsersActive && !isMainActive && !isAdminSupportTicketsActive && <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />}
              </motion.div>
            </Link>

            <Link href="/admin/destek-ve-hata-bildirileri" className="block relative">
              {isAdminSupportTicketsActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-brand-primary/20 border border-brand-primary/30 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div 
                whileHover={{ x: 5 }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl relative z-10 transition-colors ${isAdminSupportTicketsActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3">
                  <LifeBuoy className={`h-5 w-5 ${isAdminSupportTicketsActive ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span className="text-sm font-medium">Destek ve Hata Bildirileri</span>
                </div>
                {isAdminSupportTicketsActive && <ChevronRight className="w-4 h-4 text-brand-secondary opacity-50" />}
              </motion.div>
            </Link>
          </>
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
