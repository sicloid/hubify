"use client";

import { Truck } from "lucide-react";
import { AnimatedPageWrapper, EmptyState } from "@/components/operasyon/AnimatedWrappers";

export default function SigortaYoldaPage() {
  return (
    <AnimatedPageWrapper>
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <Truck className="h-6 w-6 text-sky-300" />
                Yolda Sigortalı Yük
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Canlı sevkiyat kartlarınızı ve durumlarını buradan takip edebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <EmptyState
            icon={Truck}
            title="Yolda Sevkiyat Yok"
            description="Aktif sigortalı sevkiyat bulunmuyor. Transit başladığında burada canlı takip edebilirsiniz."
          />
        </section>
      </div>
    </AnimatedPageWrapper>
  );
}
