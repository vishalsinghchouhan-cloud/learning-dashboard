"use client";

import React, { useState } from "react";
import { Brain, CheckCircle2, RotateCcw, FolderKanban, BookOpen } from "lucide-react";
import { Spinner } from "@/components/ui/Loader";

interface ReviewQueueProps {
  dueCards: any[];
  onReviewed: (cardId: string) => void;
}

export default function ReviewQueue({ dueCards, onReviewed }: ReviewQueueProps) {
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const toggleFlip = (cardId: string) => {
    if (submittingId === cardId) return;
    setFlippedMap((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const handleCardReview = async (cardId: string, rating: "hard" | "good" | "easy") => {
    setSubmittingId(cardId);
    try {
      await fetch("/api/flashcards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, rating }),
      });
      setFlippedMap((prev) => {
        const copy = { ...prev };
        delete copy[cardId];
        return copy;
      });
      onReviewed(cardId);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-purple-400" /> Review Queue
        </h2>
        <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-medium">
          {dueCards.length} due
        </span>
      </header>

      {dueCards.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 text-sm border border-dashed border-slate-800 rounded-xl p-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="font-medium text-slate-300">All caught up!</p>
          <p className="text-xs mt-1">
            Add flashcards inside any topic to build your spaced repetition queue.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
          {dueCards.map((card) => {
            const isFlipped = Boolean(flippedMap[card._id]);
            const isSubmitting = submittingId === card._id;
            const topicTitle = card?.topicId?.title || "General Topic";
            const roadmapTitle = card?.topicId?.roadmapId?.title || "Learning Roadmap";

            return (
              <div key={card._id} className="space-y-2 pb-3 border-b border-slate-800/70 last:border-none last:pb-0">
                {/* 3D Perspective Container */}
                <div
                  onClick={() => toggleFlip(card._id)}
                  className="relative h-44 w-full cursor-pointer [perspective:1000px]"
                >
                  <div
                    className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
                      isFlipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    {/* FRONT FACE */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-purple-950/30 border border-slate-800 hover:border-purple-500/50 rounded-xl p-4 flex flex-col justify-between [backface-visibility:hidden]">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                            <FolderKanban className="w-2.5 h-2.5" /> {roadmapTitle}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25">
                            <BookOpen className="w-2.5 h-2.5" /> {topicTitle}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-white leading-snug line-clamp-3 pt-1">
                          {card.frontQuestion}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-purple-300 pt-1.5 border-t border-slate-800/80">
                        <span>Click to flip</span>
                        <RotateCcw className="w-3 h-3" />
                      </div>
                    </div>

                    {/* BACK FACE */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <div className="space-y-1 overflow-y-auto">
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                          Answer / Key Note
                        </span>
                        <p className="text-xs text-slate-100 leading-relaxed pt-1">
                          {card.backAnswer}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                        <span>Rate recall below</span>
                        <span>Click to flip back</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating Controls */}
                {!isFlipped ? (
                  <button
                    type="button"
                    onClick={() => toggleFlip(card._id)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Show Answer
                  </button>
                ) : isSubmitting ? (
                  <div className="py-1.5 flex justify-center text-xs text-slate-300">
                    <Spinner label="Updating schedule..." size="xs" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCardReview(card._id, "hard")}
                      className="py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold cursor-pointer"
                    >
                      Hard (1d)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCardReview(card._id, "good")}
                      className="py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold cursor-pointer"
                    >
                      Good
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCardReview(card._id, "easy")}
                      className="py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold cursor-pointer"
                    >
                      Easy
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
