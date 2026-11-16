"use client";

import React from "react";
import { Plus, Trash2, CornerDownRight, Clock } from "lucide-react";

export interface SubtopicDraft {
  title: string;
  estimatedHours: number;
  subtopics: SubtopicDraft[];
}

interface SubtopicTreeInputProps {
  items: SubtopicDraft[];
  onChange: (updated: SubtopicDraft[]) => void;
  depth?: number;
}

export default function SubtopicTreeInput({
  items,
  onChange,
  depth = 0,
}: SubtopicTreeInputProps) {
  const updateItem = (index: number, patch: Partial<SubtopicDraft>) => {
    onChange(items.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const handleAddNested = (index: number) => {
    const target = items[index];
    updateItem(index, {
      subtopics: [...target.subtopics, { title: "", estimatedHours: 1, subtopics: [] }],
    });
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  return (
    <div className={depth > 0 ? "pl-5 border-l border-slate-800 space-y-2.5 mt-2" : "space-y-2.5"}>
      {items.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-900/70 p-2 rounded-lg border border-slate-800/80">
            {depth > 0 && <CornerDownRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}

            <input
              type="text"
              required
              value={item.title}
              onChange={(e) => updateItem(idx, { title: e.target.value })}
              placeholder={depth === 0 ? "Subtopic name (e.g., Flexbox)" : "Nested subtopic name"}
              className="flex-1 min-w-35 rounded-md bg-slate-950 border border-slate-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />

            <label className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Est. Hrs:</span>
              <input
                type="number"
                min={0.5}
                step={0.5}
                required
                value={item.estimatedHours}
                onChange={(e) =>
                  updateItem(idx, { estimatedHours: Math.max(0.5, Number(e.target.value)) })
                }
                className="w-12 bg-transparent text-white font-medium focus:outline-none text-right"
              />
            </label>

            {depth < 2 && (
              <button
                type="button"
                onClick={() => handleAddNested(idx)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] text-indigo-300 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Sub
              </button>
            )}

            <button
              type="button"
              onClick={() => handleRemove(idx)}
              aria-label="Remove subtopic"
              className="p-1.5 rounded-md bg-slate-800 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {item.subtopics.length > 0 && (
            <SubtopicTreeInput
              items={item.subtopics}
              onChange={(nested) => updateItem(idx, { subtopics: nested })}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
