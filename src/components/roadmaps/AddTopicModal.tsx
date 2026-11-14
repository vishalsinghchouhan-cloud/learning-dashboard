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
          estimatedHours: Number(estimatedHours) || 2,
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
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold text-white">Add New Topic</h3>

        <label className="block text-xs text-slate-400">
          Topic Title *
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Next.js App Router"
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-slate-400">
            Difficulty Level
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>

          <label className="block text-xs text-slate-400">
            Expected Hours
            <input
              type="number"
              min={1}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
            />
          </label>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Nested Subtopics</span>
            <button
              type="button"
              onClick={() => setSubtopics([...subtopics, { title: "", subtopics: [] }])}
              className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subtopic
            </button>
          </div>
          <SubtopicTreeInput items={subtopics} onChange={setSubtopics} />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-sm text-white cursor-pointer"
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
        </div>
      </form>
    </div>
  );
}
