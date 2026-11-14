"use client";

import React from "react";
import { Plus, Trash2, CornerDownRight } from "lucide-react";

export interface SubtopicDraft {
  title: string;
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
  const handleTitleChange = (index: number, title: string) => {
    const updated = items.map((item, idx) =>
      idx === index ? { ...item, title } : item
    );
    onChange(updated);
  };

  const handleNestedChange = (index: number, nested: SubtopicDraft[]) => {
    const updated = items.map((item, idx) =>
      idx === index ? { ...item, subtopics: nested } : item
    );
    onChange(updated);
  };

  const handleAddNested = (index: number) => {
    const updated = items.map((item, idx) =>
      idx === index
        ? { ...item, subtopics: [...item.subtopics, { title: "", subtopics: [] }] }
        : item
    );
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, idx) => idx !== index));
  };

  return (
    <div className={depth > 0 ? "pl-5 border-l border-slate-800 space-y-2 mt-2" : "space-y-2"}>
      {items.map((item, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="flex items-center gap-2">
            {depth > 0 && <CornerDownRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
            <input
              type="text"
              required
              value={item.title}
              onChange={(e) => handleTitleChange(idx, e.target.value)}
              placeholder={depth === 0 ? "Subtopic (e.g., Flexbox)" : "Nested subtopic (e.g., Align Items)"}
              className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white"
            />
            {depth < 2 && (
              <button
                type="button"
                onClick={() => handleAddNested(idx)}
                title="Add nested subtopic"
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              title="Remove"
              className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {item.subtopics.length > 0 && (
            <SubtopicTreeInput
              items={item.subtopics}
              onChange={(nested) => handleNestedChange(idx, nested)}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
