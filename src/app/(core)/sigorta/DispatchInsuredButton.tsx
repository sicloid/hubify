"use client";

import { Loader2, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { dispatchInsuredShipment } from "./actions";

export default function DispatchInsuredButton({ tradeRequestId }: { tradeRequestId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const result = await dispatchInsuredShipment(tradeRequestId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error ?? "İşlem tamamlanamadı.");
      }
    } catch {
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          İşleniyor...
        </>
      ) : (
        <>
          <Truck className="h-4 w-4" />
          Sevkiyatı başlat
        </>
      )}
    </button>
  );
}
