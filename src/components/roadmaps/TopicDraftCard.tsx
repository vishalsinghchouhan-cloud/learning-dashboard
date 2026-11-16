"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import SubtopicTreeInput, { SubtopicDraft } from "./SubtopicTreeInput";

export interface TopicDraft {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: number;
  subtopics: SubtopicDraft[];
}

interface TopicDraftCardProps {
  topic: TopicDraft;
  index: number;
  canRemove: boolean;
  onUpdate: (patch: Partial<TopicDraft>) => void;
  onRemove: () => void;
}

export default function TopicDraftCard({
  topic,
  index,
  canRemove,
  onUpdate,
  onRemove,
}: TopicDraftCardProps) {
  return (
    <article className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span className="text-xs font-semibold text-indigo-400">Topic #{index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove Topic
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <label className="sm:col-span-6 block text-[11px] font-medium text-slate-400">
          Topic Name <span className="text-rose-400">*</span>
          <input
            type="text"
            required
            value={topic.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="e.g., React Hooks & State"
            className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </label>

        <label className="sm:col-span-3 block text-[11px] font-medium text-slate-400">
          Difficulty Level
          <select
            value={topic.difficulty}
            onChange={(e) =>
              onUpdate({ difficulty: e.target.value as TopicDraft["difficulty"] })
            }
            className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </label>

        <label className="sm:col-span-3 block text-[11px] font-medium text-slate-400">
          Expected Hours <span className="text-rose-400">*</span>
          <input
            type="number"
            min={0.5}
            step={0.5}
            required
            value={topic.estimatedHours}
            onChange={(e) =>
              onUpdate({ estimatedHours: Math.max(0.5, Number(e.target.value)) })
            }
            className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </label>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Subtopics ({topic.subtopics.length})
          </span>
          <button
            type="button"
            onClick={() =>
              onUpdate({
                subtopics: [
                  ...topic.subtopics,
                  { title: "", estimatedHours: 1, subtopics: [] },
                ],
              })
            }
            className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Subtopic
          </button>
        </div>

        <SubtopicTreeInput
          items={topic.subtopics}
          onChange={(updated) => onUpdate({ subtopics: updated })}
        />
      </div>
    </article>
  );
}
