"use client";

import React from "react";
import { CheckSquare, Square, CornerDownRight, Lock } from "lucide-react";

interface NestedSubtopicListProps {
  subtopics: any[];
  onToggle: (path: number[]) => void;
  disabled?: boolean;
  parentPath?: number[];
}

export default function NestedSubtopicList({
  subtopics,
  onToggle,
  disabled = false,
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
              disabled={disabled}
              onClick={() => !disabled && onToggle(currentPath)}
              className={`flex items-center gap-2 text-left text-sm transition group ${
                disabled ? "cursor-not-allowed opacity-75" : "hover:text-indigo-300 cursor-pointer"
              }`}
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
              {sub.estimatedHours && (
                <span className="text-[11px] text-slate-500">({sub.estimatedHours}h)</span>
              )}
              {disabled && idx === 0 && parentPath.length === 0 && (
                <Lock className="w-3 h-3 text-slate-600 ml-1" />
              )}
            </button>

            {sub.subtopics && sub.subtopics.length > 0 && (
              <NestedSubtopicList
                subtopics={sub.subtopics}
                onToggle={onToggle}
                disabled={disabled}
                parentPath={currentPath}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
