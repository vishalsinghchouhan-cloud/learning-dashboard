"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function Spinner({
  label,
  size = "sm",
}: {
  label?: string;
  size?: "xs" | "sm" | "md";
}) {
  const sizeClass =
    size === "xs" ? "w-3.5 h-3.5" : size === "md" ? "w-6 h-6" : "w-4 h-4";

  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className={`${sizeClass} animate-spin shrink-0`} />
      {label && <span>{label}</span>}
    </span>
  );
}

export function ActionOverlay({ label = "Processing..." }: { label?: string }) {
  return (
    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-20">
      <div className="bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white">
        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}
