"use client";

import React, { useState } from "react";

interface LogStudyModalProps {
  roadmaps: any[];
  topics: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function LogStudyModal({
  roadmaps,
  topics,
  onClose,
  onSuccess,
}: LogStudyModalProps) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [subtopicTitle, setSubtopicTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);

  const filteredTopics = topics.filter((t) => t.roadmapId === selectedRoadmapId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoadmapId || !selectedTopicId) return;

    await fetch("/api/study-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roadmapId: selectedRoadmapId,
        topicId: selectedTopicId,
        subtopicTitle: subtopicTitle || undefined,
        durationMinutes: Number(durationMinutes),
      }),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-white">Log Study Session</h3>

        <label className="block text-xs text-slate-400">
          Select Roadmap
          <select
            required
            value={selectedRoadmapId}
            onChange={(e) => {
              setSelectedRoadmapId(e.target.value);
              setSelectedTopicId("");
            }}
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
          >
            <option value="">-- Choose Roadmap --</option>
            {roadmaps.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Select Topic
          <select
            required
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={!selectedRoadmapId}
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white disabled:opacity-50"
          >
            <option value="">-- Choose Topic --</option>
            {filteredTopics.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title} ({t.difficulty})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          Sub-topic Name (Optional)
          <input
            type="text"
            value={subtopicTitle}
            onChange={(e) => setSubtopicTitle(e.target.value)}
            placeholder="e.g., Flexbox, Hooks, Indexing..."
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
          />
        </label>

        <label className="block text-xs text-slate-400">
          Duration (Minutes)
          <input
            type="number"
            min={5}
            step={5}
            required
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white cursor-pointer"
          >
            Save Log
          </button>
        </div>
      </form>
    </div>
  );
}
