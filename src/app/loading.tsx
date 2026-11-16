import React from "react";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-9 h-9 text-indigo-500 animate-spin" />
      <p className="text-sm text-slate-400 font-medium animate-pulse">
        Loading workspace...
      </p>
    </div>
  );
}
