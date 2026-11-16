"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  FolderKanban,
  BookOpen,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { Spinner } from "@/components/ui/Loader";
import CascadingSubtopicSelect from "./CascadingSubtopicSelect";

interface LogStudyModalProps {
  roadmaps: any[];
  topics: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_MINUTES: number[] = Array.of(30, 45, 60, 90, 120);


// Helper: Build readable breadcrumb path e.g. "Responsive Layouts > Flexbox Alignment"
function resolveSubtopicBreadcrumb(rootList: any[] = [], path: number[]): string {
  const names: string[] = [];
  let current = rootList;
  for (const idx of path) {
    const node = current?.at(idx);
    if (!node) break;
    names.push(node.title);
    current = node.subtopics || [];
  }
  return names.join(" > ");
}

export default function LogStudyModal({
  roadmaps,
  topics,
  onClose,
  onSuccess,
}: LogStudyModalProps) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [subtopicPath, setSubtopicPath] = useState<number[]>([]);
  const [studyNotes, setStudyNotes] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTopics = topics.filter((t) => t.roadmapId === selectedRoadmapId);
  const activeTopic = filteredTopics.find((t) => t._id === selectedTopicId);
  const rootSubtopics = activeTopic?.subtopics || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoadmapId || !selectedTopicId) return;
    setSaving(true);

    try {
      const breadcrumb = resolveSubtopicBreadcrumb(rootSubtopics, subtopicPath);

      await fetch("/api/study-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId: selectedRoadmapId,
          topicId: selectedTopicId,
          subtopicTitle: breadcrumb || undefined,
          notes: studyNotes.trim() || undefined,
          durationMinutes: Number(durationMinutes),
        }),
      });

      onSuccess();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl transition-all duration-200 ${
          mounted ? "scale-100 translate-y-0" : "scale-95 translate-y-2"
        }`}
      >
        {/* Header */}
        <header className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Log Study Session</h3>
              <p className="text-xs text-slate-400">
                Track progress toward your topic hours &amp; daily streak
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Step 1: Roadmap */}
          <label className="block text-xs font-medium text-slate-300">
            <span className="inline-flex items-center gap-1.5 mb-1">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              Select Roadmap <span className="text-rose-400">*</span>
            </span>
            <select
              required
              disabled={saving}
              value={selectedRoadmapId}
              onChange={(e) => {
                setSelectedRoadmapId(e.target.value);
                setSelectedTopicId("");
                setSubtopicPath([]);
              }}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-sm text-white transition focus:outline-none"
            >
              <option value="">-- Choose Roadmap --</option>
              {roadmaps.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title}
                </option>
              ))}
            </select>
          </label>

          {/* Step 2: Topic */}
          <label className="block text-xs font-medium text-slate-300">
            <span className="inline-flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Select Topic <span className="text-rose-400">*</span>
            </span>
            <select
              required
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value);
                setSubtopicPath([]);
              }}
              disabled={!selectedRoadmapId || saving}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-sm text-white transition focus:outline-none disabled:opacity-50"
            >
              <option value="">-- Choose Topic --</option>
              {filteredTopics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title} ({t.difficulty})
                </option>
              ))}
            </select>
          </label>

          {/* Step 3: Cascading Subtopics (Auto-appears only if topic has subtopics) */}
          {selectedTopicId && rootSubtopics.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
              <CascadingSubtopicSelect
                rootSubtopics={rootSubtopics}
                selectedPath={subtopicPath}
                onChangePath={setSubtopicPath}
                disabled={saving}
              />
            </div>
          )}

          {/* Step 4: What did you study? */}
          <label className="block text-xs font-medium text-slate-300">
            <span className="inline-flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              What did you study in this session?
            </span>
            <textarea
              rows={2}
              disabled={saving}
              value={studyNotes}
              onChange={(e) => setStudyNotes(e.target.value)}
              placeholder="e.g., Built custom hook for debounced search and tested edge cases..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 p-2.5 text-sm text-white placeholder-slate-600 transition focus:outline-none resize-none"
            />
          </label>

          {/* Step 5: Duration + Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duration (Minutes) <span className="text-rose-400">*</span>
              </span>
              <span className="text-xs font-semibold text-cyan-300">
                {(durationMinutes / 60).toFixed(2)} hrs
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_MINUTES.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  disabled={saving}
                  onClick={() => setDurationMinutes(mins)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    durationMinutes === mins
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}

              <input
                type="number"
                min={5}
                step={5}
                required
                disabled={saving}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(5, Number(e.target.value)))}
                className="w-24 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 px-3 py-1.5 text-xs text-white text-right focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950/40 rounded-b-2xl">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-linear-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-sm font-semibold text-white shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            {saving ? <Spinner label="Saving..." /> : "Save Log"}
          </button>
        </footer>
      </form>
    </div>
  );
}
