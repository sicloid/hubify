"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type AnimatedApprovalButtonProps = {
  /** Action to run on click */
  onApprove: () => void | Promise<void>;
  /** Button disabled? */
  disabled?: boolean;
  /** Label while idle */
  label: string;
  /** Label while processing */
  processingLabel?: string;
  /** Label after approval */
  approvedLabel?: string;
  /** Icon component to show while idle */
  icon?: LucideIcon;
  /** Base color theme — controls bg, shadow, and ring colors */
  color?: "sky" | "emerald" | "slate" | "indigo" | "amber";
  /** Full width */
  fullWidth?: boolean;
  /** Compact / small size */
  compact?: boolean;
};

const colorMap = {
  sky: {
    idle: "bg-sky-600 hover:bg-sky-700 shadow-sky-600/20",
    approved: "bg-emerald-500 shadow-emerald-500/30",
    ring: "border-sky-400",
    ring2: "border-sky-300",
  },
  emerald: {
    idle: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
    approved: "bg-emerald-500 shadow-emerald-500/30",
    ring: "border-emerald-400",
    ring2: "border-emerald-300",
  },
  slate: {
    idle: "bg-slate-900 hover:bg-slate-800 shadow-slate-200",
    approved: "bg-emerald-500 shadow-emerald-500/30",
    ring: "border-slate-400",
    ring2: "border-slate-300",
  },
  indigo: {
    idle: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20",
    approved: "bg-emerald-500 shadow-emerald-500/30",
    ring: "border-indigo-400",
    ring2: "border-indigo-300",
  },
  amber: {
    idle: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
    approved: "bg-emerald-500 shadow-emerald-500/30",
    ring: "border-amber-400",
    ring2: "border-amber-300",
  },
};

export default function AnimatedApprovalButton({
  onApprove,
  disabled = false,
  label,
  processingLabel = "İşleniyor...",
  approvedLabel = "Onaylandı ✓",
  icon: Icon,
  color = "slate",
  fullWidth = false,
  compact = false,
}: AnimatedApprovalButtonProps) {
  const [phase, setPhase] = useState<"idle" | "processing" | "approved">("idle");
  const colors = colorMap[color];

  const handleClick = useCallback(async () => {
    if (disabled || phase !== "idle") return;

    setPhase("processing");

    try {
      await onApprove();
    } catch (e) {
      setPhase("idle");
      return;
    }

    setPhase("approved");
    setTimeout(() => setPhase("idle"), 2000);
  }, [disabled, phase, onApprove]);

  const sizeClasses = compact
    ? "px-4 py-2 text-xs"
    : "px-6 py-3 text-sm";

  return (
    <div className="relative inline-flex">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled || phase !== "idle"}
        whileHover={
          !disabled && phase === "idle"
            ? { scale: 1.04, transition: { duration: 0.2 } }
            : {}
        }
        whileTap={
          !disabled && phase === "idle" ? { scale: 0.96 } : {}
        }
        className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-bold text-white transition-all ${sizeClasses} ${
          fullWidth ? "w-full" : ""
        } ${
          disabled
            ? "bg-slate-400 cursor-not-allowed"
            : phase === "approved"
            ? colors.approved
            : colors.idle
        } shadow-lg disabled:opacity-70`}
      >
        {/* Icon with slam animation */}
        <motion.span
          animate={
            phase === "processing"
              ? {
                  y: [0, -10, 2, 0],
                  scale: [1, 1.3, 0.85, 1],
                  rotate: [0, -8, 4, 0],
                }
              : phase === "approved"
              ? { rotate: [0, -5, 5, 0], transition: { duration: 0.3 } }
              : {}
          }
          transition={{ duration: 0.45, ease: "easeInOut" as const }}
        >
          {phase === "approved" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : Icon ? (
            <Icon className="h-4 w-4" />
          ) : null}
        </motion.span>

        <span>
          {phase === "processing"
            ? processingLabel
            : phase === "approved"
            ? approvedLabel
            : label}
        </span>

        {/* Shine sweep on approval */}
        <motion.span
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-120%" }}
          animate={phase === "approved" ? { x: "120%" } : { x: "-120%" }}
          transition={{ duration: 0.6, ease: "easeInOut" as const }}
        />
      </motion.button>

      {/* Impact Rings */}
      <AnimatePresence>
        {phase === "processing" && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`absolute rounded-full border-2 ${colors.ring}`}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 100, height: 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" as const }}
            />
            <motion.div
              className={`absolute rounded-full border-2 ${colors.ring2}`}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: 60, height: 60, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" as const }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Badge */}
      <AnimatePresence>
        {phase === "approved" && (
          <motion.div
            className="pointer-events-none absolute -right-2 -top-2 rounded-full bg-emerald-500 p-1 shadow-lg shadow-emerald-500/40"
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
