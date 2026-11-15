"use client";

import React, { useState } from "react";
import { RotateCw } from "lucide-react";

interface FlashcardDeckProps {
  topicTitle?: string;
  flashcards: any[];
}

export default function FlashcardDeck({ topicTitle, flashcards }: FlashcardDeckProps) {
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});
  const [now] = useState(() => Date.now());

  if (flashcards.length === 0) return null;

  const toggleFlip = (cardId: string) => {
    setFlippedIds((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const getDueBadge = (nextReviewDate: string) => {
    const dueTime = new Date(nextReviewDate).getTime();
    if (dueTime <= now) {
      return {
        label: "Due on Dashboard",
        style: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      };
    }
    const daysLeft = Math.max(1, Math.ceil((dueTime - now) / 86400000));
    return {
      label: `Reminds in ${daysLeft}d`,
      style: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    };
  };

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          Your Memory Deck for {topicTitle || "This Topic"} ({flashcards.length})
        </h3>
        <span className="text-xs text-slate-400">Click any card to flip &amp; test recall</span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((card) => {
          const isFlipped = Boolean(flippedIds[card._id]);
          const badge = getDueBadge(card.nextReviewDate);

          return (
            <div
              key={card._id}
              onClick={() => toggleFlip(card._id)}
              className={`rounded-xl p-4 border transition cursor-pointer flex flex-col justify-between min-h-38.75 ${
                isFlipped
                  ? "bg-emerald-950/20 border-emerald-500/40"
                  : "bg-slate-950 border-slate-800 hover:border-purple-500/40"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isFlipped
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-purple-500/15 text-purple-300"
                    }`}
                  >
                    {isFlipped ? "Answer / Note" : "Question Prompt"}
                  </span>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>

                <p className="text-sm text-slate-100 leading-snug pt-1">
                  {isFlipped ? card.backAnswer : card.frontQuestion}
                </p>
              </div>

              <footer className="pt-3 mt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500">
                <span>Interval: {card.intervalDays}d</span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <RotateCw className="w-3 h-3" /> Flip
                </span>
              </footer>
            </div>
          );
        })}
      </div>
    </article>
  );
}
