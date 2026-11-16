"use client";

import React, { useState } from "react";
import { Trophy, Sparkles, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/Loader";

interface CompleteTopicModalProps {
  topic: any;
  alreadyLoggedMinutes: number;
  onClose: () => void;
  onSuccess: () => void;
}

// Helper: Recursively mark all nested subtopics as completed
function markAllSubtopicsComplete(list: any[] = []): any[] {
  return list.map((item) => ({
    ...item,
    isCompleted: true,
    subtopics: markAllSubtopicsComplete(item.subtopics || []),
  }));
}

export default function CompleteTopicModal({
  topic,
  alreadyLoggedMinutes,
  onClose,
  onSuccess,
}: CompleteTopicModalProps) {
  const [learnedTakeaway, setLearnedTakeaway] = useState("");
  const [struggledWith, setStruggledWith] = useState("");
  const [additionalMinutes, setAdditionalMinutes] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const alreadyHours = +(alreadyLoggedMinutes / 60).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnedTakeaway.trim() || !struggledWith.trim()) return;
    setSubmitting(true);

    try {
      const requests: Promise<any>[] = [
        fetch(`/api/topics/${topic._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Completed",
            subtopics: markAllSubtopicsComplete(topic.subtopics || []),
            reflection: {
              learnedTakeaway: learnedTakeaway.trim(),
              struggledWith: struggledWith.trim(),
            },
          }),
        }),
      ];

      // If user entered extra consumed minutes, create a StudyLog so charts & streaks update
      if (Number(additionalMinutes) > 0) {
        requests.push(
          fetch("/api/study-logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roadmapId: topic.roadmapId,
              topicId: topic._id,
              durationMinutes: Number(additionalMinutes),
            }),
          })
        );
      }

      await Promise.all(requests);
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl"
      >
        <header className="flex items-start gap-3.5 border-b border-slate-800 pb-4">
          <span className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
            <Trophy className="w-6 h-6" />
          </span>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              Milestone Achieved
            </span>
            <h3 className="text-xl font-bold text-white leading-snug">
              Complete &ldquo;{topic.title}&rdquo;
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reflect on what you learned and log any final study time before locking this topic.
            </p>
          </div>
        </header>

        <div className="space-y-4">
          {/* Key Takeaway */}
          <label className="block bg-slate-950 border border-slate-800 focus-within:border-emerald-500/60 rounded-xl p-3.5 transition">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Key Takeaway Learned <span className="text-rose-400">*</span>
            </span>
            <textarea
              rows={2}
              required
              disabled={submitting}
              value={learnedTakeaway}
              onChange={(e) => setLearnedTakeaway(e.target.value)}
              placeholder="e.g., Learned how server actions eliminate extra API boilerplate..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
            />
          </label>

          {/* Biggest Struggle */}
          <label className="block bg-slate-950 border border-slate-800 focus-within:border-amber-500/60 rounded-xl p-3.5 transition">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> What Did You Struggle With Most? <span className="text-rose-400">*</span>
            </span>
            <textarea
              rows={2}
              required
              disabled={submitting}
              value={struggledWith}
              onChange={(e) => setStruggledWith(e.target.value)}
              placeholder="e.g., Handling cache revalidation and optimistic UI updates..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none resize-none"
            />
          </label>

          {/* Additional Consumed Time */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Additional Time Consumed (Minutes)
              </span>
              <span className="text-[11px] text-slate-400">
                Already logged: <strong className="text-slate-200">{alreadyHours}h</strong> / {topic.estimatedHours}h
              </span>
            </div>
            <input
              type="number"
              min={0}
              step={5}
              disabled={submitting}
              value={additionalMinutes}
              onChange={(e) => setAdditionalMinutes(Math.max(0, Number(e.target.value)))}
              placeholder="0 (if already logged)"
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500">
              Any minutes entered here are added to your study logs, charts, and daily streak.
            </p>
          </div>
        </div>

        <footer className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <Spinner label="Completing..." />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Complete Topic
              </>
            )}
          </button>
        </footer>
      </form>
    </div>
  );
}
