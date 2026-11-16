"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import SubtopicTreeInput, { SubtopicDraft } from "./SubtopicTreeInput";

interface AddTopicModalProps {
  roadmapId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTopicModal({ roadmapId, onClose, onSuccess }: AddTopicModalProps) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [estimatedHours, setEstimatedHours] = useState(4);
  const [subtopics, setSubtopics] = useState<SubtopicDraft[]>([]);
  const [saving, setSaving] = useState(false);

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
    if (!title.trim()) return;
    setSaving(true);

    try {
      await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId,
          title: title.trim(),
          difficulty,
          estimatedHours: Math.max(0.5, Number(estimatedHours) || 2),
          subtopics: formatSubtopics(subtopics),
        }),
      });
      onSuccess();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[88vh] overflow-y-auto shadow-2xl"
      >
        <h3 className="text-lg font-bold text-white">Add New Topic</h3>

        <label className="block text-xs font-medium text-slate-300">
          Topic Name <span className="text-rose-400">*</span>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Next.js App Router"
            className="mt-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium text-slate-300">
            Difficulty Level
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="mt-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>

          <label className="block text-xs font-medium text-slate-300">
            Expected Hours <span className="text-rose-400">*</span>
            <input
              type="number"
              min={0.5}
              step={0.5}
              required
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Math.max(0.5, Number(e.target.value)))}
              className="mt-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </label>
        </div>

        <div className="space-y-2 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">
              Nested Subtopics ({subtopics.length})
            </span>
            <button
              type="button"
              onClick={() =>
                setSubtopics([...subtopics, { title: "", estimatedHours: 1, subtopics: [] }])
              }
              className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subtopic
            </button>
          </div>
          <SubtopicTreeInput items={subtopics} onChange={setSubtopics} />
        </div>

        <footer className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white cursor-pointer"
          >
            {saving ? "Adding..." : "Save Topic"}
          </button>
        </footer>
      </form>
    </div>
  );
}
