"use client";

import React, { useState } from "react";
import { Brain, Sparkles, CalendarClock, HelpCircle, Lightbulb } from "lucide-react";
import ScratchpadCard from "./ScratchpadCard";
import FlashcardDeck from "./FlashcardDeck";

interface FlashcardSectionProps {
  topicId: string;
  topicTitle?: string;
  initialScratchpad?: string;
  flashcards: any[];
  onAdded: () => void;
}

export default function FlashcardSection({
  topicId,
  topicTitle,
  initialScratchpad = "",
  flashcards,
  onAdded,
}: FlashcardSectionProps) {
  const [frontQuestion, setFrontQuestion] = useState("");
  const [backAnswer, setBackAnswer] = useState("");
  const [savingCard, setSavingCard] = useState(false);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontQuestion.trim() || !backAnswer.trim()) return;
    setSavingCard(true);

    try {
      await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          frontQuestion: frontQuestion.trim(),
          backAnswer: backAnswer.trim(),
        }),
      });
      setFrontQuestion("");
      setBackAnswer("");
      onAdded();
    } finally {
      setSavingCard(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <article className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <header className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
                  <Brain className="w-5 h-5" />
                </span>
                Spaced Repetition Memory Cards
              </h2>
              <span className="text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full">
                {flashcards.length} Active Cards
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Turn key concepts from <strong className="text-slate-200">{topicTitle || "this topic"}</strong> into
              Q&amp;A reminder cards. They automatically surface on your dashboard at smart intervals (
              <span className="text-purple-300">1d &rarr; 3d &rarr; 7d &rarr; 18d</span>) right before you forget them.
            </p>
          </header>

          <form onSubmit={handleCreateCard} className="space-y-3">
            <label className="block bg-slate-950 border border-slate-800 focus-within:border-purple-500/60 rounded-xl p-3.5 transition">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-400 mb-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Front — Question or Concept Prompt
              </span>
              <input
                type="text"
                required
                value={frontQuestion}
                onChange={(e) => setFrontQuestion(e.target.value)}
                placeholder="e.g., When does useEffect run with an empty dependency array?"
                className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
              />
            </label>

            <label className="block bg-slate-950 border border-slate-800 focus-within:border-emerald-500/60 rounded-xl p-3.5 transition">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Back — Key Note or Answer to Remember
              </span>
              <textarea
                rows={2}
                required
                value={backAnswer}
                onChange={(e) => setBackAnswer(e.target.value)}
                placeholder="e.g., It runs only once right after the initial component mount."
                className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
              />
            </label>

            <footer className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                <CalendarClock className="w-3.5 h-3.5 text-purple-400" />
                First dashboard reminder scheduled for <strong className="text-slate-200">Tomorrow</strong>
              </span>

              <button
                type="submit"
                disabled={savingCard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {savingCard ? "Scheduling..." : "Create Reminder Card"}
              </button>
            </footer>
          </form>
        </article>

        <ScratchpadCard
          topicId={topicId}
          initialNotes={initialScratchpad}
          onCopyToFlashcard={(text) => setBackAnswer(text)}
        />
      </div>

      <FlashcardDeck topicTitle={topicTitle} flashcards={flashcards} />
    </section>
  );
}
