import { BarChart } from "lucide-react";

export default function SigortaRaporlarPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <BarChart className="h-6 w-6 text-sky-300" />
              Raporlar & Analiz
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Sigorta istatistikleri ve analiz raporlarına buradan ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center py-10">
          <p className="text-slate-500">Henüz rapor bulunmamaktadır.</p>
        </div>
      </section>
    </div>
  );
}
