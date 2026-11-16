"use client";

import React, { useState } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import SubtopicTreeInput, { SubtopicDraft } from "./SubtopicTreeInput";
import { Spinner } from "@/components/ui/Loader";

interface EditableSubtopic extends SubtopicDraft {
  isCompleted?: boolean;
  subtopics: EditableSubtopic[];
}

interface EditTopicModalProps {
  topic: any;
  onClose: () => void;
  onSuccess: () => void;
}

function toDrafts(list: any[] = []): EditableSubtopic[] {
  return list.map((s) => ({
    title: s.title || "",
    estimatedHours: Number(s.estimatedHours) || 1,
    isCompleted: Boolean(s.isCompleted),
    subtopics: toDrafts(s.subtopics || []),
  }));
}

function fromDrafts(list: EditableSubtopic[]): any[] {
  return list
    .filter((s) => s.title.trim())
    .map((s) => ({
      title: s.title.trim(),
      estimatedHours: Number(s.estimatedHours) || 1,
      isCompleted: Boolean(s.isCompleted),
      subtopics: fromDrafts(s.subtopics || []),
    }));
}

// Helper: Check if any nested subtopic is unchecked
function hasIncompleteSubtopics(list: any[] = []): boolean {
  return list.some(
    (s) => !s.isCompleted || hasIncompleteSubtopics(s.subtopics || [])
  );
}

export default function EditTopicModal({ topic, onClose, onSuccess }: EditTopicModalProps) {
  const [title, setTitle] = useState(topic.title || "");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
    topic.difficulty || "Beginner"
  );
  const [estimatedHours, setEstimatedHours] = useState(topic.estimatedHours || 2);
  const [subtopics, setSubtopics] = useState<EditableSubtopic[]>(() =>
    toDrafts(topic.subtopics || [])
  );
  const [actionState, setActionState] = useState<"idle" | "saving" | "reopening" | "deleting">(
    "idle"
  );

  const isBusy = actionState !== "idle";
  const isCurrentlyCompleted = topic.status === "Completed";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setActionState("saving");

    try {
      const formattedSubtopics = fromDrafts(subtopics);

      // If topic was Completed, automatically switch back to "In Progress" if new incomplete subtopics were added
      const nextStatus =
        isCurrentlyCompleted && hasIncompleteSubtopics(formattedSubtopics)
          ? "In Progress"
          : topic.status;

      await fetch(`/api/topics/${topic._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          difficulty,
          estimatedHours: Math.max(0.5, Number(estimatedHours) || 2),
          subtopics: formattedSubtopics,
          status: nextStatus,
        }),
      });
      onSuccess();
      onClose();
    } finally {
      setActionState("idle");
    }
  };

  const handleReopenTopic = async () => {
    setActionState("reopening");
    try {
      await fetch(`/api/topics/${topic._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "In Progress" }),
      });
      onSuccess();
      onClose();
    } finally {
      setActionState("idle");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete topic "${topic.title}"?`)) return;
    setActionState("deleting");

    try {
      await fetch(`/api/topics/${topic._id}`, { method: "DELETE" });
      onSuccess();
      onClose();
    } finally {
      setActionState("idle");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[88vh] overflow-y-auto shadow-2xl"
      >
        <header className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-white">Edit Topic &amp; Subtopics</h3>

          <div className="flex items-center gap-3">
            {isCurrentlyCompleted && (
              <button
                type="button"
                disabled={isBusy}
                onClick={handleReopenTopic}
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 cursor-pointer disabled:opacity-50"
              >
                {actionState === "reopening" ? (
                  <Spinner label="Reopening..." size="xs" />
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" /> Undo Completion
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              disabled={isBusy}
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 cursor-pointer disabled:opacity-50"
            >
              {actionState === "deleting" ? (
                <Spinner label="Deleting..." size="xs" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> Delete Topic
                </>
              )}
            </button>
          </div>
        </header>

        <label className="block text-xs font-medium text-slate-300">
          Topic Name <span className="text-rose-400">*</span>
          <input
            type="text"
            required
            disabled={isBusy}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium text-slate-300">
            Difficulty Level
            <select
              disabled={isBusy}
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
              disabled={isBusy}
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
              disabled={isBusy}
              onClick={() =>
                setSubtopics([...subtopics, { title: "", estimatedHours: 1, subtopics: [] }])
              }
              className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subtopic
            </button>
          </div>
          <SubtopicTreeInput
            items={subtopics}
            onChange={(updated) => setSubtopics(updated as EditableSubtopic[])}
          />
        </div>

        <footer className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            {actionState === "saving" ? <Spinner label="Saving..." /> : "Save Changes"}
          </button>
        </footer>
      </form>
    </div>
  );
}
