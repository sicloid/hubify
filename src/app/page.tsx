import Link from "next/link";

export default function HubifyLandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-white">
      <h1 className="text-4xl font-extrabold text-brand-primary tracking-tight sm:text-5xl mb-4">
        Hubify
      </h1>
      <p className="text-lg text-slate-600 mb-8 max-w-2xl">
        Dış ticaret süreçlerini tek dijital yüzeyde toplayan global lojistik ve finans platformu.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-brand-primary text-white rounded-lg font-medium shadow-sm hover:bg-slate-800 transition-colors"
        >
          Sisteme Giriş Yap
        </Link>
        <Link
          href="/talepler"
          className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-colors"
        >
          Talepleri Görüntüle
        </Link>
      </div>
    </div>
  );
}
