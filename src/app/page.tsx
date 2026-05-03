"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  Shield,
  LineChart,
  FileText,
  Globe,
  Truck,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  ShoppingCart,
  FileCheck,
  Anchor,
  ArrowUpRight,
  Users,
  Zap,
  Radar,
} from "lucide-react";

/* ── animation helpers ── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const fadeSlide = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

/* ── data ── */
const FEATURES = [
  {
    title: "Akıllı Lojistik Konsolidasyonu",
    desc: "Farklı satıcıların küçük yüklerini aynı rotada tek konteynere birleştirerek nakliye maliyetlerini dramatik şekilde düşürün.",
    icon: Box,
    bg: "bg-emerald-100",
    fg: "text-emerald-600",
    img: "/images/landing/feature-consolidation.png",
  },
  {
    title: "ICC Uzman Arabuluculuğu",
    desc: "Uluslararası ticaret kurallarına hakim ICC uzmanlarıyla güvenli, uyumlu ihracat yapın.",
    icon: Shield,
    bg: "bg-purple-100",
    fg: "text-purple-600",
    img: "/images/landing/feature-compliance.png",
  },
  {
    title: "Dijital Evrak & Gümrük",
    desc: "Gümrük beyannameleri, ticari faturalar ve sigorta poliçeleri tek platformda dijital olarak yönetilir.",
    icon: FileText,
    bg: "bg-sky-100",
    fg: "text-sky-600",
    img: "/images/landing/feature-digital.png",
  },
  {
    title: "Küresel Pazar Erişimi",
    desc: "Geleneksel aracıları devreden çıkararak üretiminizi doğrudan uluslararası alıcılarla buluşturun.",
    icon: LineChart,
    bg: "bg-amber-100",
    fg: "text-amber-600",
    img: "/images/landing/feature-market.png",
  },
];

const STEPS = [
  { n: "01", title: "Listeleme", desc: "İhracatçı ürün ekler", icon: Box },
  { n: "02", title: "Sipariş", desc: "Alıcı sipariş verir", icon: ShoppingCart },
  { n: "03", title: "Konsolidasyon", desc: "Lojistik teklif & birleştirme", icon: Truck },
  { n: "04", title: "ICC Onayı", desc: "Gümrük uygunluk denetimi", icon: ShieldCheck },
  { n: "05", title: "Finans", desc: "Fatura, KDV, poliçe", icon: Landmark },
  { n: "06", title: "Teslimat", desc: "Güvenli sevk & ödeme", icon: CheckCircle2 },
];

const ROLES = [
  { label: "İhracatçı", icon: Box, bg: "bg-blue-100", fg: "text-blue-600" },
  { label: "Alıcı", icon: ShoppingCart, bg: "bg-teal-100", fg: "text-teal-600" },
  { label: "Lojistik", icon: Truck, bg: "bg-emerald-100", fg: "text-emerald-600" },
  { label: "ICC Uzmanı", icon: FileCheck, bg: "bg-purple-100", fg: "text-purple-600" },
  { label: "Mali Müşavir", icon: Landmark, bg: "bg-amber-100", fg: "text-amber-600" },
  { label: "Sigortacı", icon: Shield, bg: "bg-rose-100", fg: "text-rose-600" },
  { label: "Admin", icon: ShieldCheck, bg: "bg-slate-200", fg: "text-slate-700" },
];

export default function HubifyLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
      {/* ── NAV ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg shadow-brand-primary/20">
                <img src="/hubify-logo.png" alt="Hubify" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-800">
                Hubify<span className="text-brand-secondary">.</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <a href="#features" className="hover:text-slate-900 transition-colors">Özellikler</a>
              <a href="#pipeline" className="hover:text-slate-900 transition-colors">Süreç</a>
              <a href="#roles" className="hover:text-slate-900 transition-colors">Roller</a>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
              Giriş
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="h-9 px-5 inline-flex items-center gap-1.5 bg-brand-primary text-white rounded-xl shadow-md shadow-brand-primary/20 font-medium"
              >
                Demoyu İncele <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Sol: İçerik */}
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="flex-1 max-w-xl"
              >
                <motion.div variants={fadeSlide} className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30 mb-6">
                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                  >
                    <Globe className="w-7 h-7 text-white" />
                  </motion.div>
                </motion.div>

                <motion.h1
                  variants={fadeSlide}
                  className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-900 mb-6"
                >
                  Küçük Üretici,{" "}
                  <span className="text-brand-secondary">Büyük Dünya.</span>
                </motion.h1>

                <motion.p variants={fadeSlide} className="text-lg text-slate-500 leading-relaxed mb-8 font-medium">
                  Esnaf ve KOBİ&apos;lerin ürünlerini lojistik konsolidasyon, ICC uzman
                  desteği ve dijital evrak yönetimiyle en düşük maliyetle dünyaya
                  ulaştıran operasyon platformu.
                </motion.p>

                <motion.div variants={fadeSlide} className="flex items-center gap-3 mb-10">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/login"
                      className="h-11 px-7 inline-flex items-center gap-2 bg-brand-primary text-white rounded-xl font-medium shadow-lg shadow-brand-primary/20"
                    >
                      Platformu Deneyin <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <a
                      href="#pipeline"
                      className="h-11 px-6 inline-flex items-center gap-2 text-slate-600 bg-white border border-slate-200 rounded-xl font-medium shadow-sm"
                    >
                      Nasıl Çalışır?
                    </a>
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeSlide} className="flex flex-wrap gap-6 text-sm">
                  {[
                    { bold: "7 Rol", light: "entegre panel", icon: Users },
                    { bold: "%60", light: "maliyet azaltma", icon: Zap },
                    { bold: "Uçtan Uca", light: "dijital süreç", icon: Radar },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <m.icon className="w-4 h-4 text-brand-secondary" />
                      <span className="font-bold text-slate-800">{m.bold}</span>
                      <span className="text-slate-400">{m.light}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Sağ: Hero Görsel */}
              <motion.div
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
                className="flex-1 w-full max-w-lg lg:max-w-none"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200">
                  <Image
                    src="/images/landing/hero-trade.png"
                    alt="Hubify — Global ticaret liman operasyonu"
                    width={640}
                    height={640}
                    className="w-full h-auto object-cover"
                    priority
                  />
                  {/* Overlay badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg border border-slate-100 flex items-center gap-3"
                  >
                    <div className="p-2.5 bg-emerald-100 rounded-lg shrink-0">
                      <Truck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Paylaşımlı Konteyner Havuzu</p>
                      <p className="text-[10px] text-slate-500">Parçalı yükleriniz tek konteynerde buluşur.</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── FEATURES (Görsel + Metin, Alternating) ── */}
        <section id="features" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-2">Platform Özellikleri</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Uçtan Uca İhracat Altyapısı
              </h2>
            </motion.div>

            <div className="space-y-16">
              {FEATURES.map((f, i) => {
                const isEven = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5 }}
                    className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10`}
                  >
                    {/* Görsel */}
                    <motion.div
                      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                      className="w-full md:w-1/2 shrink-0"
                    >
                      <div className="rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
                        <Image
                          src={f.img}
                          alt={f.title}
                          width={560}
                          height={400}
                          className="w-full h-64 md:h-72 object-cover"
                        />
                      </div>
                    </motion.div>

                    {/* İçerik */}
                    <div className="w-full md:w-1/2">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.bg} ${f.fg}`}>
                        <f.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── PIPELINE ── */}
        <section id="pipeline" className="py-20 bg-slate-900">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-2">İş Akışı</p>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">
                Üründen Teslimat&apos;a 6 Adım
              </h2>
              <p className="text-sm text-slate-400 mb-10 max-w-lg font-medium">
                Her adım platformda gerçek zamanlı takip edilir. Tüm roller kendi panellerinden süreci yönetir.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center group hover:border-brand-secondary/40 transition-colors"
                >
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.n}</span>
                  <div className="w-10 h-10 mx-auto mt-3 mb-3 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center group-hover:bg-brand-secondary/20 group-hover:border-brand-secondary/30 transition-colors">
                    <s.icon className="w-5 h-5 text-slate-400 group-hover:text-brand-secondary transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{s.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROLES ── */}
        <section id="roles" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-2">Rol Tabanlı Mimari</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Her Paydaşa Özel Panel
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {ROLES.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3, type: "spring" }}
                  whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
                >
                  <div className={`p-2.5 rounded-lg ${r.bg} ${r.fg}`}>
                    <r.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{r.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
            >
              <div className="max-w-md">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                  Sistemi Keşfedin
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Tüm rolleri test edebileceğiniz demo hesaplarıyla platformu hemen deneyin.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/login"
                    className="h-11 px-7 inline-flex items-center gap-2 bg-brand-primary text-white rounded-xl font-medium shadow-lg shadow-brand-primary/20"
                  >
                    Giriş Yap <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/register"
                    className="h-11 px-6 inline-flex items-center text-slate-600 bg-white border border-slate-200 rounded-xl font-medium shadow-sm"
                  >
                    Kayıt Ol
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
            <div>
              <span className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                <img src="/hubify-logo.png" alt="Hubify" className="h-5 w-5 rounded" /> Hubify
              </span>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Esnaf ve KOBİ&apos;ler için mikro-ihracat operasyon platformu.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-3">Platform</h4>
                <ul className="space-y-2 text-slate-500">
                  <li><a href="#features" className="hover:text-slate-900 transition-colors">Özellikler</a></li>
                  <li><a href="#pipeline" className="hover:text-slate-900 transition-colors">Süreç</a></li>
                  <li><a href="#roles" className="hover:text-slate-900 transition-colors">Roller</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-3">Geliştirici</h4>
                <ul className="space-y-2 text-slate-500">
                  <li><Link href="#" className="hover:text-slate-900 transition-colors inline-flex items-center gap-1">API Docs <ArrowUpRight className="h-3 w-3" /></Link></li>
                  <li><Link href="#" className="hover:text-slate-900 transition-colors">GitHub</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} Hubify</p>
            <p className="hidden sm:block font-medium italic">&ldquo;Küçük Üretici, Büyük Dünya.&rdquo;</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
