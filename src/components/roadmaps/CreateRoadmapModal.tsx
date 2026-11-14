"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import SubtopicTreeInput, { SubtopicDraft } from "./SubtopicTreeInput";

interface TopicDraft {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  subtopics: SubtopicDraft[];
}

interface CreateRoadmapModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRoadmapModal({ onClose, onSuccess }: CreateRoadmapModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weeklyStudyTargetHours, setWeeklyStudyTargetHours] = useState(10);
  const [targetFinishDate, setTargetFinishDate] = useState("");
  const [topics, setTopics] = useState<TopicDraft[]>([
    { title: "", difficulty: "Beginner", estimatedHours: 4, subtopics: [] },
  ]);
  const [submitting, setSubmitting] = useState(false);

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
        isCompleted: false,
        subtopics: formatSubtopics(s.subtopics),
      }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    try {
      // 1. Create the Roadmap
      const rmRes = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          weeklyStudyTargetHours: Number(weeklyStudyTargetHours),
          targetFinishDate: targetFinishDate || undefined,
        }),
      });
      const roadmap = await rmRes.json();

      // 2. Create all Topics & Nested Subtopics in parallel
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
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">Create Manual Roadmap</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Define your roadmap, topics, difficulty levels, and nested subtopics.
          </p>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Roadmap Metadata */}
          <div className="space-y-3">
            <label className="block text-xs text-slate-400">
              Roadmap Title *
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Full Stack Web Development"
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
              />
            </label>

            <label className="block text-xs text-slate-400">
              Description (Optional)
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Frontend, Backend, and Deployment"
                className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs text-slate-400">
                Weekly Target (Hours)
                <input
                  type="number"
                  min={1}
                  value={weeklyStudyTargetHours}
                  onChange={(e) => setWeeklyStudyTargetHours(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
                />
              </label>

              <label className="block text-xs text-slate-400">
                Target Finish Date
                <input
                  type="date"
                  value={targetFinishDate}
                  onChange={(e) => setTargetFinishDate(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
                />
              </label>
            </div>
          </div>

          {/* Topics & Nested Subtopics Builder */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">Topics & Subtopics</h4>
              <button
                type="button"
                onClick={addTopic}
                className="inline-flex items-center gap-1 text-xs bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 px-2.5 py-1.5 rounded-lg font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Topic
              </button>
            </div>

            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <input
                    type="text"
                    required
                    value={topic.title}
                    onChange={(e) => updateTopic(idx, { title: e.target.value })}
                    placeholder={`Topic #${idx + 1} (e.g., React, CSS)`}
                    className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white"
                  />

                  <select
                    value={topic.difficulty}
                    onChange={(e) =>
                      updateTopic(idx, {
                        difficulty: e.target.value as TopicDraft["difficulty"],
                      })
                    }
                    className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-2 text-xs text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={topic.estimatedHours}
                    onChange={(e) =>
                      updateTopic(idx, { estimatedHours: Number(e.target.value) })
                    }
                    title="Expected Hours"
                    className="w-20 rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-2 text-xs text-white"
                  />

                  {topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopic(idx)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Subtopics Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Subtopics</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateTopic(idx, {
                          subtopics: [...topic.subtopics, { title: "", subtopics: [] }],
                        })
                      }
                      className="text-[11px] text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Subtopic
                    </button>
                  </div>

                  {topic.subtopics.length > 0 && (
                    <SubtopicTreeInput
                      items={topic.subtopics}
                      onChange={(updated) => updateTopic(idx, { subtopics: updated })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
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
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Roadmap"}
          </button>
        </div>
      </form>
    </div>
  );
}
