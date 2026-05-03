"use client";

import { ClipboardList, Shield } from "lucide-react";
import { AnimatedPageWrapper, EmptyState } from "@/components/operasyon/AnimatedWrappers";

export default function PoliceBekleyenPage() {
  return (
    <AnimatedPageWrapper>
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

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <EmptyState
            icon={Shield}
            title="Aktif Poliçe Talebi Yok"
            description="Sigorta onayı bekleyen dosya bulunmuyor. Pipeline'dan yeni dosya geldiğinde burada listelenecektir."
          />
        </section>
      </div>
    </AnimatedPageWrapper>
  );
}
