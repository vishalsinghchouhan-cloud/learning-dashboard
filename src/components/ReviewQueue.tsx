"use client";

import React, { useState } from "react";
import { Brain, CheckCircle2, RotateCcw } from "lucide-react";

interface ReviewQueueProps {
  dueCards: any[];
  onReviewed: (cardId: string) => void;
}

export default function ReviewQueue({ dueCards, onReviewed }: ReviewQueueProps) {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const currentCard = dueCards.at(0);

  const handleCardReview = async (cardId: string, rating: "hard" | "good" | "easy") => {
    await fetch("/api/flashcards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, rating }),
    });
    setFlippedCardId(null);
    onReviewed(cardId);
  };

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" /> Review Queue
        </h2>
        <span className="text-xs bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-full">
          {dueCards.length} due
        </span>
      </header>

      {!currentCard ? (
        <div className="h-56 flex flex-col items-center justify-center text-center text-slate-400 text-sm border border-dashed border-slate-800 rounded-lg p-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="font-medium text-slate-300">All caught up!</p>
          <p className="text-xs mt-1">
            Add flashcards inside any topic to build your spaced repetition queue.
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 min-h-52.5 flex flex-col justify-between">
          <div>
            <span className="text-xs text-indigo-400 font-medium">
              {currentCard.topicId?.title || "Topic Flashcard"}
            </span>
            <p className="text-base font-medium mt-2">
              {flippedCardId === currentCard._id
                ? currentCard.backAnswer
                : currentCard.frontQuestion}
            </p>
          </div>

          {flippedCardId !== currentCard._id ? (
            <button
              type="button"
              onClick={() => setFlippedCardId(currentCard._id)}
              className="mt-4 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Show Answer
            </button>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCardReview(currentCard._id, "hard")}
                className="py-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold cursor-pointer"
              >
                Hard (1d)
              </button>
              <button
                type="button"
                onClick={() => handleCardReview(currentCard._id, "good")}
                className="py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold cursor-pointer"
              >
                Good
              </button>
              <button
                type="button"
                onClick={() => handleCardReview(currentCard._id, "easy")}
                className="py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold cursor-pointer"
              >
                Easy
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
