"use client";

import React from "react";
import { CheckSquare, Square, CornerDownRight } from "lucide-react";

interface NestedSubtopicListProps {
  subtopics: any[];
  onToggle: (path: number[]) => void;
  parentPath?: number[];
}

export default function NestedSubtopicList({
  subtopics,
  onToggle,
  parentPath = [],
}: NestedSubtopicListProps) {
  if (!subtopics || subtopics.length === 0) return null;

  return (
    <ul className={parentPath.length > 0 ? "pl-5 border-l border-slate-800 space-y-2 mt-2" : "space-y-2"}>
      {subtopics.map((sub, idx) => {
        const currentPath = [...parentPath, idx];
        return (
          <li key={sub._id || idx} className="space-y-1.5">
            <button
              type="button"
              onClick={() => onToggle(currentPath)}
              className="flex items-center gap-2 text-left text-sm hover:text-indigo-300 transition cursor-pointer group"
            >
              {parentPath.length > 0 && (
                <CornerDownRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
              {sub.isCompleted ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              )}
              <span className={sub.isCompleted ? "line-through text-slate-500" : "text-slate-200"}>
                {sub.title}
              </span>
            </button>

            {sub.subtopics && sub.subtopics.length > 0 && (
              <NestedSubtopicList
                subtopics={sub.subtopics}
                onToggle={onToggle}
                parentPath={currentPath}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
