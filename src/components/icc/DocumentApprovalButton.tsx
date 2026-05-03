"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AnimatedApprovalButton from "@/components/operasyon/AnimatedApprovalButton";
import { FileCheck, Undo2 } from "lucide-react";

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

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await action(documentId, nextValue);
          setApproved(nextValue);
          router.refresh();
          resolve();
        } catch {
          reject();
        }
      });
    });
  };

  if (approved) {
    return (
      <button
        type="button"
        onClick={() => {
          startTransition(async () => {
            try {
              await action(documentId, false);
              setApproved(false);
              router.refresh();
            } catch {
              /* noop */
            }
          });
        }}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 transition-all hover:bg-amber-200 hover:scale-[1.02] disabled:opacity-70"
      >
        <Undo2 className="h-3.5 w-3.5" />
        {isPending ? "İşleniyor..." : "Onayı Geri Al"}
      </button>
    );
  }

  return (
    <AnimatedApprovalButton
      onApprove={handleToggle}
      disabled={isPending}
      label="Belgeyi Onayla"
      processingLabel="Onaylanıyor..."
      approvedLabel="Onaylandı ✓"
      icon={FileCheck}
      color="emerald"
      compact
    />
  );
}
