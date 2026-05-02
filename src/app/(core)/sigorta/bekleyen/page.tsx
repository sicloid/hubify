import { ClipboardList } from "lucide-react";

export default function PoliceBekleyenPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ClipboardList className="h-6 w-6 text-sky-300" />
              Poliçe Bekleyen Dosyalar
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Poliçe sırasında bekleyen dosyalarınızı buradan görüntüleyebilirsiniz.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center py-10">
          <p className="text-slate-500">Şu anda bekleyen poliçe dosyası bulunmamaktadır.</p>
        </div>
      </section>
    </div>
  );
}
