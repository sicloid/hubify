"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

/**
 * Reusable animated wrapper for any page content.
 * Wraps children in a staggered fade-in-up animation.
 */
export function AnimatedPageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" as const }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated list that staggers children in.
 */
export function AnimatedList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated list item.
 */
export function AnimatedListItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Premium empty state with animated illustration.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" as const }}
        className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 shadow-sm"
      >
        <Icon className="w-7 h-7 text-slate-400" />
      </motion.div>
      <h3 className="text-base font-bold text-slate-600 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 text-center max-w-xs">{description}</p>
    </motion.div>
  );
}
