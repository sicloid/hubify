"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Stamp, ShieldCheck } from "lucide-react";

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
    await wait(600);

    setPhase("approved");
    await action(new FormData(formRef.current ?? undefined));
    await wait(900);

    setPhase("exiting");
    animateCardOut();
  };

  return (
    <form action={action} ref={formRef} className="relative">
      {/* Main Button */}
      <motion.button
        type="button"
        onClick={handleStamp}
        disabled={disabled || phase !== "idle"}
        whileHover={!disabled && phase === "idle" ? { scale: 1.04, transition: { duration: 0.2 } } : {}}
        whileTap={!disabled && phase === "idle" ? { scale: 0.96 } : {}}
        className={`relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all ${
          disabled
            ? "bg-slate-400 cursor-not-allowed"
            : phase === "approved"
            ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
            : "bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20"
        } disabled:opacity-80`}
      >
        {/* Stamp Icon with slam animation */}
        <motion.span
          animate={
            phase === "stamping"
              ? { y: [0, -14, 2, 0], scale: [1, 1.3, 0.85, 1], rotate: [0, -8, 4, 0] }
              : phase === "approved"
              ? { rotate: [0, -5, 5, 0], transition: { duration: 0.3 } }
              : {}
          }
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {phase === "approved" ? (
            <ShieldCheck className="h-4.5 w-4.5" />
          ) : (
            <Stamp className="h-4.5 w-4.5" />
          )}
        </motion.span>

        <span>
          {phase === "stamping"
            ? "Damgalanıyor..."
            : phase === "approved"
            ? "Onaylandı ✓"
            : "ICC Onayını Tamamla"}
        </span>

        {/* Shine sweep on approval */}
        <motion.span
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-120%" }}
          animate={phase === "approved" ? { x: "120%" } : { x: "-120%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </motion.button>

      {/* Stamp Impact Ring — radiates outward on stamp */}
      <AnimatePresence>
        {phase === "stamping" && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute rounded-full border-2 border-sky-400"
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 120, height: 120, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <motion.div
              className="absolute rounded-full border-2 border-sky-300"
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 80, height: 80, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Approval Badge */}
      <AnimatePresence>
        {phase === "approved" && (
          <motion.div
            className="pointer-events-none absolute -right-3 -top-3 rounded-full bg-emerald-500 p-1.5 shadow-lg shadow-emerald-500/40"
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <CheckCircle2 className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
