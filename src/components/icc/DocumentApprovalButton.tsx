"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type DocumentApprovalButtonProps = {
  documentId: string;
  initialApproved: boolean;
  action: (documentId: string, nextApproved: boolean) => Promise<void>;
};

export default function DocumentApprovalButton({
  documentId,
  initialApproved,
  action,
}: DocumentApprovalButtonProps) {
  const [approved, setApproved] = useState(initialApproved);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    const nextValue = !approved;
    setApproved(nextValue);

    startTransition(async () => {
      try {
        await action(documentId, nextValue);
        router.refresh();
      } catch {
        setApproved(!nextValue);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-70 ${
        approved
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
      }`}
    >
      {isPending ? "Isleniyor..." : approved ? "Onayi Geri Al" : "Belgeyi Onayla"}
    </button>
  );
}
