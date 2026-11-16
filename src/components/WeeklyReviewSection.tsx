"use client";

import React, { useEffect, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Spinner } from "@/components/ui/Loader";

interface WeeklyReviewProps {
  recentTopicsStudied: string[];
  reviews: any[];
  weekStartDate: Date;
  onSaved: () => void;
}

export default function WeeklyReviewSection({
  recentTopicsStudied,
  reviews: initialReviews,
  weekStartDate,
  onSaved,
}: WeeklyReviewProps) {
  const [keyLearnings, setKeyLearnings] = useState("");
  const [biggestStruggle, setBiggestStruggle] = useState("");
  const [saving, setSaving] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);

  // Pagination state for past weekly reflections
  const [allReviews, setAllReviews] = useState<any[]>(initialReviews);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(initialReviews.length >= 5);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setAllReviews(initialReviews);
    setReviewPage(1);
    setHasMoreReviews(initialReviews.length >= 5);
  }, [initialReviews]);

  const handleLoadMoreReviews = async () => {
    if (loadingMore || !hasMoreReviews) return;
    setLoadingMore(true);

    try {
      const nextPage = reviewPage + 1;
      const res = await fetch(`/api/performance?reviewPage=${nextPage}&reviewLimit=5`);
      const data = await res.json();
      const incoming = Array.isArray(data.reviews) ? data.reviews : [];

      setAllReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r._id));
        return [...prev, ...incoming.filter((r: any) => !existingIds.has(r._id))];
      });
      setReviewPage(nextPage);
      setHasMoreReviews(Boolean(data.hasMoreReviews));
    } finally {
      setLoadingMore(false);
    }
  };

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
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
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
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
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
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition cursor-pointer disabled:opacity-50"
        >
          {saving ? <Spinner label="Saving Reflection..." /> : "Save Weekly Reflection"}
        </button>
      </form>

      <article className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Weekly Reflections</h2>
          {allReviews.length === 0 ? (
            <p className="text-sm text-slate-400">
              Your saved weekly reviews will appear here so you can track your growth over time.
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {allReviews.map((rev: any) => (
                <div
                  key={rev._id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2"
                >
                  <p className="text-xs text-slate-400">
                    Week of {new Date(rev.weekStartDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-200">
                    <span className="text-emerald-400 font-medium">Learned: </span>
                    {rev.keyLearnings}
                  </p>
                  <p className="text-sm text-slate-200">
                    <span className="text-amber-400 font-medium">Struggled: </span>
                    {rev.biggestStruggle}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {hasMoreReviews && (
          <button
            type="button"
            disabled={loadingMore}
            onClick={handleLoadMoreReviews}
            className="w-full py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? (
              <Spinner label="Loading older reflections..." size="xs" />
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Load Older Reflections
              </>
            )}
          </button>
        )}
      </article>
    </section>
  );
}
