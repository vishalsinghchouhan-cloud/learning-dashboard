"use client";

import React, { useState } from "react";
import { Plus, Brain } from "lucide-react";

interface FlashcardSectionProps {
  topicId: string;
  flashcards: any[];
  onAdded: () => void;
}

export default function FlashcardSection({ topicId, flashcards, onAdded }: FlashcardSectionProps) {
  const [frontQuestion, setFrontQuestion] = useState("");
  const [backAnswer, setBackAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontQuestion.trim() || !backAnswer.trim()) return;
    setSaving(true);

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
      setSaving(false);
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" /> Notes & Spaced Repetition Flashcards
          </h2>
          <p className="text-xs text-slate-400">
            Cards created here automatically appear on your dashboard when due for review.
          </p>
        </div>
        <span className="text-xs bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-full">
          {flashcards.length} Cards
        </span>
      </header>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <input
          type="text"
          required
          value={frontQuestion}
          onChange={(e) => setFrontQuestion(e.target.value)}
          placeholder="Front: Concept or Question..."
          className="sm:col-span-5 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <input
          type="text"
          required
          value={backAnswer}
          onChange={(e) => setBackAnswer(e.target.value)}
          placeholder="Back: Key takeaway or Answer..."
          className="sm:col-span-5 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white py-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Save Card
        </button>
      </form>

      {flashcards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {flashcards.map((card) => (
            <div
              key={card._id}
              className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5"
            >
              <p className="text-sm font-medium text-slate-200">{card.frontQuestion}</p>
              <p className="text-xs text-slate-400">{card.backAnswer}</p>
              <p className="text-[11px] text-purple-400 pt-1">
                Next review: {new Date(card.nextReviewDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
