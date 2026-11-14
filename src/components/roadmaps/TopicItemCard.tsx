"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, FolderOpen, ChevronDown, ChevronUp } from "lucide-react";
import NestedSubtopicList from "./NestedSubtopicList";

interface TopicItemCardProps {
  topic: any;
  loggedMinutes: number;
  onUpdated: () => void;
}

const BADGE_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Intermediate: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Advanced: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

export default function TopicItemCard({ topic, loggedMinutes, onUpdated }: TopicItemCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [learnedTakeaway, setLearnedTakeaway] = useState("");
  const [struggledWith, setStruggledWith] = useState("");

  const consumedHours = +(loggedMinutes / 60).toFixed(1);
  const isCompleted = topic.status === "Completed";

  // Helper: Immutably toggle a nested subtopic at a given index path
  const toggleAtPath = (list: any[], path: number[]): any[] => {
    const [head, ...rest] = path;
    return list.map((item, idx) => {
      if (idx !== head) return item;
      if (rest.length === 0) return { ...item, isCompleted: !item.isCompleted };
      return { ...item, subtopics: toggleAtPath(item.subtopics || [], rest) };
    });
  };

  const handleToggleSubtopic = async (path: number[]) => {
    const updatedSubtopics = toggleAtPath(topic.subtopics || [], path);
    await fetch(`/api/topics/${topic._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subtopics: updatedSubtopics,
        status: topic.status === "Not Started" ? "In Progress" : topic.status,
      }),
    });
    onUpdated();
  };

  const handleCompleteTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/topics/${topic._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Completed",
        reflection: { learnedTakeaway, struggledWith },
      }),
    });
    setShowReflectionForm(false);
    onUpdated();
  };

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <h3 className={`text-lg font-semibold ${isCompleted ? "text-emerald-400" : "text-white"}`}>
            {topic.title}
          </h3>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border ${
              BADGE_STYLES[topic.difficulty] || BADGE_STYLES.Beginner
            }`}
          >
            {topic.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            {consumedHours}h / {topic.estimatedHours}h
          </span>

          {!isCompleted ? (
            <button
              type="button"
              onClick={() => setShowReflectionForm(!showReflectionForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 font-medium cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}

          <Link
            href={`/topics/${topic._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Workspace
          </Link>
        </div>
      </div>

      {/* Topic Completion Reflection Prompt */}
      {showReflectionForm && (
        <form
          onSubmit={handleCompleteTopic}
          className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3"
        >
          <p className="text-xs font-semibold text-emerald-300">
            Topic Wrap-Up Reflection (Before Marking Complete)
          </p>
          <input
            type="text"
            required
            value={learnedTakeaway}
            onChange={(e) => setLearnedTakeaway(e.target.value)}
            placeholder="Key takeaway you learned in this topic..."
            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-xs text-white"
          />
          <input
            type="text"
            required
            value={struggledWith}
            onChange={(e) => setStruggledWith(e.target.value)}
            placeholder="What did you struggle with most?"
            className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2 text-xs text-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReflectionForm(false)}
              className="px-3 py-1.5 rounded bg-slate-800 text-xs text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer"
            >
              Complete Topic
            </button>
          </div>
        </form>
      )}

      {/* Nested Subtopics Tree */}
      {expanded && topic.subtopics?.length > 0 && (
        <div className="pt-2 border-t border-slate-800/70">
          <NestedSubtopicList subtopics={topic.subtopics} onToggle={handleToggleSubtopic} />
        </div>
      )}
    </article>
  );
}
