"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Stamp } from "lucide-react";

type FinalizeStampButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  disabled: boolean;
};

export default function FinalizeStampButton({ action, disabled }: FinalizeStampButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [phase, setPhase] = useState<"idle" | "stamping" | "approved" | "exiting">("idle");

  const animateCardOut = () => {
    const card = formRef.current?.closest("section");
    if (!card) return;

    const currentHeight = card.getBoundingClientRect().height;
    card.style.maxHeight = `${currentHeight}px`;
    card.style.overflow = "hidden";
    card.style.transition =
      "transform 550ms ease, opacity 550ms ease, max-height 550ms ease, margin 550ms ease, padding 550ms ease";

    requestAnimationFrame(() => {
      card.style.transform = "translateX(120px)";
      card.style.opacity = "0";
      card.style.maxHeight = "0px";
      card.style.marginTop = "0";
      card.style.marginBottom = "0";
      card.style.paddingTop = "0";
      card.style.paddingBottom = "0";
    });

    setTimeout(() => {
      card.remove();
    }, 600);
  };

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleStamp = async () => {
    if (disabled || phase !== "idle") return;
    setPhase("stamping");
    await wait(450);

    setPhase("approved");
    await action(new FormData(formRef.current ?? undefined));
    await wait(650);

    setPhase("exiting");
    animateCardOut();
  };

  return (
    <form action={action} ref={formRef} className="relative">
      <button
        type="button"
        onClick={handleStamp}
        disabled={disabled || phase !== "idle"}
        className={`relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all ${
          disabled
            ? "bg-slate-400"
            : "bg-sky-600 hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98]"
        } disabled:opacity-80`}
      >
        <Stamp className={`h-4 w-4 ${phase === "stamping" ? "animate-bounce" : ""}`} />
        {phase === "stamping" ? "Damgalaniyor..." : phase === "approved" ? "Onaylandi" : "ICC Onayini Tamamla"}

        <span
          className={`pointer-events-none absolute left-[-40%] top-0 h-full w-1/3 bg-white/30 blur-md transition-transform duration-700 ${
            phase === "approved" ? "translate-x-[300%]" : "translate-x-0"
          }`}
        />
      </button>

      {(phase === "stamping" || phase === "approved") && (
        <div className="pointer-events-none absolute -right-2 -top-2 animate-ping rounded-full bg-emerald-500/80 p-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        </div>
      )}
    </form>
  );
}
