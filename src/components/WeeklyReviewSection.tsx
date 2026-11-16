"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { Spinner } from "@/components/ui/Loader";

interface WeeklyReviewProps {
  recentTopicsStudied: string[];
  reviews: any[];
  weekStartDate: Date;
  onSaved: () => void;
}

export default function WeeklyReviewSection({
  recentTopicsStudied,
  reviews,
  weekStartDate,
  onSaved,
}: WeeklyReviewProps) {
  const [keyLearnings, setKeyLearnings] = useState("");
  const [biggestStruggle, setBiggestStruggle] = useState("");
  const [saving, setSaving] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);

  const handleSaveWeeklyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyLearnings.trim() || !biggestStruggle.trim()) return;
    setSaving(true);

    try {
      await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryType: "review",
          weekStartDate,
          topicsCovered: recentTopicsStudied,
          keyLearnings,
          biggestStruggle,
        }),
      });

      setKeyLearnings("");
      setBiggestStruggle("");
      setReviewSaved(true);
      setTimeout(() => setReviewSaved(false), 3000);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form
        onSubmit={handleSaveWeeklyReview}
        className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4"
      >
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Weekly Review Prompt
          </h2>
          {reviewSaved && (
            <span className="text-xs text-emerald-400 font-medium">Saved!</span>
          )}
        </header>

        <div>
          <p className="text-xs text-slate-400 mb-1.5">Topics studied in the last 7 days:</p>
          <div className="flex flex-wrap gap-2">
            {recentTopicsStudied.length > 0 ? (
              recentTopicsStudied.map((t, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-md"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">
                Log study time to auto-populate this week&apos;s topics.
              </span>
            )}
          </div>
        </div>

        <label className="block text-xs font-medium text-slate-300">
          What did you learn well this week?
          <textarea
            rows={2}
            required
            disabled={saving}
            value={keyLearnings}
            onChange={(e) => setKeyLearnings(e.target.value)}
            placeholder="e.g., Understood MongoDB aggregation and Next.js App Router..."
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </label>

        <label className="block text-xs font-medium text-slate-300">
          Which topic or concept did you struggle with the most?
          <textarea
            rows={2}
            required
            disabled={saving}
            value={biggestStruggle}
            onChange={(e) => setBiggestStruggle(e.target.value)}
            placeholder="e.g., Recursive TypeScript types and CSS Grid alignment..."
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold transition cursor-pointer disabled:opacity-50"
        >
          {saving ? <Spinner label="Saving Reflection..." /> : "Save Weekly Reflection"}
        </button>
      </form>

      <article className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Recent Weekly Reflections</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400">
            Your saved weekly reviews will appear here so you can track your growth over time.
          </p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {reviews.map((rev: any) => (
              <div
                key={rev._id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2"
              >
                <p className="text-xs text-slate-400">
                  Week of {new Date(rev.weekStartDate).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="text-emerald-400 font-medium">Learned: </span>
                  {rev.keyLearnings}
                </p>
                <p className="text-sm">
                  <span className="text-amber-400 font-medium">Struggled: </span>
                  {rev.biggestStruggle}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
