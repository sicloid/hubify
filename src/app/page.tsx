import Link from "next/link";
import {
  ArrowRight,
  Box,
  Shield,
  LineChart,
  FileText,
  Anchor,
  ArrowUpRight,
} from "lucide-react";

export default function HubifyLandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-200">
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              Hubify
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Çözümler
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Müşteriler
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Fiyatlandırma
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/login"
              prefetch={false}
              className="text-slate-600 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-md"
            >
              Giriş yap
            </Link>
            <Link
              href="/register"
              prefetch={false}
              className="h-9 px-4 inline-flex items-center justify-center bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              Kaydol
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24">
        <section className="max-w-6xl mx-auto px-6 mb-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold mb-6 border border-slate-200/50">
              <span className="flex h-1.5 w-1.5 rounded-full bg-brand-secondary" aria-hidden />
              Hackathon v1.0 Yayında
            </div>
            <h1 className="text-5xl md:text-6xl leading-[1.1] font-semibold tracking-tight text-slate-900 mb-6">
              Esnaf ve KOBİ&apos;ler için
              <br />
              mikro-ihracat ekosistemi.
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-xl leading-relaxed">
              Üreticileri, satıcıları ve lojistik şirketlerini tek bir çatı altında birleştiriyoruz.
              Küçük hacimli ürünlerinizi lojistik konsolidasyon sayesinde en düşük maliyetle dünyaya
              ulaştırın, ICC uzmanlarıyla güvenli ticaret yapın.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                prefetch={false}
                className="h-10 px-6 inline-flex items-center justify-center gap-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors font-medium"
              >
                Kaydol <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                prefetch={false}
                className="h-10 px-6 inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors font-medium"
              >
                Giriş yap
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <div className="max-w-md relative z-10">
                <div className="h-10 w-10 bg-white border border-slate-200 shadow-sm rounded-lg flex items-center justify-center mb-6">
                  <Box className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Akıllı Lojistik Konsolidasyonu
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Hubify, parçalı mikro-ihracat hacimlerini gelişmiş ağ mimarisiyle konsolide ederek
                  tedarik zincirinde maksimum kapasite kullanımı sağlar; her ölçekten işletmeye büyük
                  hacimli global operasyonların maliyet avantajlarını sunar.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <div className="relative z-10">
                <div className="h-10 w-10 bg-white border border-slate-200 shadow-sm rounded-lg flex items-center justify-center mb-6">
                  <Shield className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">ICC Uzman Arabuluculuğu</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  ICC uzmanları üreticiler ve satıcılar arasında direkt köprü kurar. Ticari prosedürleri
                  ve belgeleri uzman desteğiyle güvenle aşın.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl p-8">
              <div className="relative z-10">
                <div className="h-10 w-10 bg-white border border-slate-200 shadow-sm rounded-lg flex items-center justify-center mb-6">
                  <FileText className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Tek Noktadan Evrak &amp; Muhasebe</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Mikro-ihracatın getirdiği faturalandırma, gümrük ve yasal prosedür yüklerini platform
                  üzerinde otomatik halledin.
                </p>
              </div>
            </div>

            <div className="md:col-span-2 relative overflow-hidden bg-brand-primary text-white border border-slate-800 rounded-2xl p-8">
              <div className="max-w-md relative z-10">
                <div className="h-10 w-10 bg-slate-800 border border-slate-700 shadow-sm rounded-lg flex items-center justify-center mb-6">
                  <LineChart className="h-5 w-5 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Küresel Pazar Entegrasyonu</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Geleneksel aracıları devreden çıkararak üretim hattınızı doğrudan uluslararası
                  alıcılarla buluşturun. Uçtan uca dijitalleştirilmiş tedarik ağımız sayesinde kâr
                  marjınızı maksimize edin ve küresel rekabette öne çıkın.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <span className="font-semibold text-slate-900 flex items-center gap-2 mb-6">
                <Anchor className="h-4 w-4" /> Hubify
              </span>
              <p className="text-xs text-slate-500">
                Uluslararası ticaret için
                <br />
                modern operasyon sistemi.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-900 mb-4">Ürün</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors">
                    Talepler
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors">
                    Lojistik
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors">
                    Finans
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-900 mb-4">Geliştiriciler</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors flex items-center gap-1">
                    API <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors">
                    Dokümantasyon
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-slate-900 mb-4">Şirket</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors">
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors">
                    Kariyer
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-slate-900 transition-colors">
                    İletişim
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Sistem Durumu
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">
                Şartlar
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link
                href="/login"
                prefetch={false}
                className="font-medium text-brand-secondary hover:underline"
              >
                Giriş yap
              </Link>
              <span className="text-slate-300" aria-hidden>
                ·
              </span>
              <Link
                href="/register"
                prefetch={false}
                className="font-medium text-brand-secondary hover:underline"
              >
                Kaydol
              </Link>
              <span>&copy; {new Date().getFullYear()} Hubify Inc.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
