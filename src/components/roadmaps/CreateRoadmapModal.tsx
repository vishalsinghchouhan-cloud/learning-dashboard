"use client";

import React, { useEffect, useState } from "react";
import { Plus, Calendar, Clock, Layers } from "lucide-react";
import { SubtopicDraft } from "./SubtopicTreeInput";
import TopicDraftCard, { TopicDraft } from "./TopicDraftCard";

interface CreateRoadmapModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRoadmapModal({ onClose, onSuccess }: CreateRoadmapModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weeklyStudyTargetHours, setWeeklyStudyTargetHours] = useState(10);
  const [targetFinishDate, setTargetFinishDate] = useState("");
  const [todayStr, setTodayStr] = useState("");
  const [topics, setTopics] = useState<TopicDraft[]>([
    { title: "", difficulty: "Beginner", estimatedHours: 4, subtopics: [] },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split("T").at(0) || "");
  }, []);

  const addTopic = () => {
    setTopics((prev) => [
      ...prev,
      { title: "", difficulty: "Beginner", estimatedHours: 4, subtopics: [] },
    ]);
  };

  const updateTopic = (index: number, patch: Partial<TopicDraft>) => {
    setTopics((prev) => prev.map((t, idx) => (idx === index ? { ...t, ...patch } : t)));
  };

  const removeTopic = (index: number) => {
    setTopics((prev) => prev.filter((_, idx) => idx !== index));
  };

  const formatSubtopics = (list: SubtopicDraft[]): any[] =>
    list
      .filter((s) => s.title.trim())
      .map((s) => ({
        title: s.title.trim(),
        estimatedHours: Number(s.estimatedHours) || 1,
        isCompleted: false,
        subtopics: formatSubtopics(s.subtopics),
      }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetFinishDate) return;
    setSubmitting(true);

    try {
      const clampedWeekly = Math.min(168, Math.max(1, Number(weeklyStudyTargetHours) || 10));

      const rmRes = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          weeklyStudyTargetHours: clampedWeekly,
          targetFinishDate,
        }),
      });
      const roadmap = await rmRes.json();

      const validTopics = topics.filter((t) => t.title.trim());
      await Promise.all(
        validTopics.map((topic) =>
          fetch("/api/topics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roadmapId: roadmap._id,
              title: topic.title.trim(),
              difficulty: topic.difficulty,
              estimatedHours: Number(topic.estimatedHours) || 2,
              subtopics: formatSubtopics(topic.subtopics),
            }),
          })
        )
      );

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
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl"
      >
        <header className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Create Learning Roadmap</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set your target schedule and structure topics with expected study hours.
            </p>
          </div>
          <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full">
            {topics.length} {topics.length === 1 ? "Topic" : "Topics"}
          </span>
        </header>

        <section className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs font-medium text-slate-300">
                Roadmap Title <span className="text-rose-400">*</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Full Stack Web Development"
                  className="mt-1.5 w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-medium text-slate-300">
                Description (Optional)
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Next.js, MongoDB & System Design"
                  className="mt-1.5 w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs font-medium text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Weekly Study Target (Max 168 hrs) <span className="text-rose-400">*</span>
                </span>
                <input
                  type="number"
                  min={1}
                  max={168}
                  required
                  value={weeklyStudyTargetHours}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setWeeklyStudyTargetHours(val > 168 ? 168 : val);
                  }}
                  className="mt-1.5 w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-xs font-medium text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Target Finish Date <span className="text-rose-400">*</span>
                </span>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={targetFinishDate}
                  onChange={(e) => setTargetFinishDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Topics &amp; Nested Subtopics
              </h4>
              <button
                type="button"
                onClick={addTopic}
                className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Topic
              </button>
            </div>

            {topics.map((topic, idx) => (
              <TopicDraftCard
                key={idx}
                topic={topic}
                index={idx}
                canRemove={topics.length > 1}
                onUpdate={(patch) => updateTopic(idx, patch)}
                onRemove={() => removeTopic(idx)}
              />
            ))}
          </div>
        </section>

        <footer className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Roadmap"}
          </button>
        </footer>
      </form>
    </div>
  );
}
