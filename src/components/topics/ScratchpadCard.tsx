"use client";

import { useState } from "react";
import { StickyNote, Check, ArrowUpRight } from "lucide-react";

interface ScratchpadCardProps {
  topicId: string;
  initialNotes: string;
  onCopyToFlashcard: (text: string) => void;
}

export default function ScratchpadCard({
  topicId,
  initialNotes,
  onCopyToFlashcard,
}: ScratchpadCardProps) {
  const [scratchpad, setScratchpad] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scratchpadNotes: scratchpad }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              <StickyNote className="w-5 h-5" />
            </span>
            Quick Scratchpad
          </h2>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">
          Jot down sudden doubts, rough code snippets, or follow-up tasks mid-lesson.
        </p>
      </header>

      <textarea
        value={scratchpad}
        onChange={(e) => setScratchpad(e.target.value)}
        placeholder="Jot down quick doubts, tasks, or ideas while studying..."
        className="flex-1 min-h-43.75 w-full rounded-xl bg-amber-950/15 border border-amber-500/20 focus:border-amber-400/50 p-3.5 text-sm text-amber-100/90 placeholder-slate-600 focus:outline-none leading-relaxed"
      />

      <footer className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => scratchpad.trim() && onCopyToFlashcard(scratchpad.trim())}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-purple-300 transition cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5" /> Copy to Flashcard
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Notes"}
        </button>
      </footer>
    </article>
  );
}
