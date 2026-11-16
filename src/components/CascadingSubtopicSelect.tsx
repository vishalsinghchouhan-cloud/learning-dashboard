"use client";

import React from "react";
import { GitBranch, CornerDownRight } from "lucide-react";

interface CascadingSubtopicSelectProps {
  rootSubtopics: any[];
  selectedPath: number[];
  onChangePath: (newPath: number[]) => void;
  disabled?: boolean;
}

export default function CascadingSubtopicSelect({
  rootSubtopics,
  selectedPath,
  onChangePath,
  disabled = false,
}: CascadingSubtopicSelectProps) {
  if (!rootSubtopics || rootSubtopics.length === 0) return null;

  // Build array of dropdown levels based on the currently selected indices
  const levels: { options: any[]; selectedIndex: number }[] = [];
  let currentList = rootSubtopics;

  for (let depth = 0; depth <= selectedPath.length; depth++) {
    if (!currentList || currentList.length === 0) break;
    const chosenIdx = selectedPath.at(depth) ?? -1;
    levels.push({ options: currentList, selectedIndex: chosenIdx });

    if (chosenIdx >= 0 && currentList.at(chosenIdx)?.subtopics?.length > 0) {
      currentList = currentList.at(chosenIdx).subtopics;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-2.5 animate-in fade-in duration-200">
      {levels.map((lvl, depth) => (
        <label key={depth} className="block text-xs font-medium text-slate-300">
          <span className="inline-flex items-center gap-1.5 mb-1">
            {depth === 0 ? (
              <>
                <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sub-topic (Optional)</span>
              </>
            ) : (
              <>
                <CornerDownRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Nested Sub-topic (Level {depth + 1})</span>
              </>
            )}
          </span>

          <select
            disabled={disabled}
            value={lvl.selectedIndex}
            onChange={(e) => {
              const val = Number(e.target.value);
              const nextPath = selectedPath.slice(0, depth);
              if (val >= 0) nextPath.push(val);
              onChangePath(nextPath);
            }}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-sm text-white transition focus:outline-none disabled:opacity-50"
          >
            <option value={-1}>
              {depth === 0 ? "-- All / General Topic --" : "-- Select Deeper Sub-topic --"}
            </option>
            {lvl.options.map((sub, idx) => (
              <option key={sub._id || idx} value={idx}>
                {sub.title} {sub.isCompleted ? "✓" : ""}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
