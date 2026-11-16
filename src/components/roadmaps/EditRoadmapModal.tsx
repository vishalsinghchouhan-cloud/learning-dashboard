"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/Loader";

interface EditRoadmapModalProps {
  roadmap: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditRoadmapModal({
  roadmap,
  onClose,
  onSuccess,
}: EditRoadmapModalProps) {
  const router = useRouter();
  const initialDate = roadmap?.targetFinishDate
    ? new Date(roadmap.targetFinishDate).toISOString().split("T").at(0) || ""
    : "";

  const [title, setTitle] = useState(roadmap?.title || "");
  const [description, setDescription] = useState(roadmap?.description || "");
  const [weeklyStudyTargetHours, setWeeklyStudyTargetHours] = useState(
    roadmap?.weeklyStudyTargetHours || 10
  );
  const [targetFinishDate, setTargetFinishDate] = useState(initialDate);
  const [actionState, setActionState] = useState<"idle" | "saving" | "deleting">("idle");

  const isBusy = actionState !== "idle";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setActionState("saving");

    try {
      await fetch("/api/roadmaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId: roadmap._id,
          title: title.trim(),
          description: description.trim(),
          weeklyStudyTargetHours,
          targetFinishDate: targetFinishDate || undefined,
        }),
      });
      onSuccess();
      onClose();
    } finally {
      setActionState("idle");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this roadmap and all its topics? This cannot be undone.")) return;
    setActionState("deleting");
    try {
      await fetch(`/api/roadmaps?roadmapId=${roadmap._id}`, { method: "DELETE" });
      router.push("/roadmaps");
    } finally {
      setActionState("idle");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
      >
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Edit Roadmap Details</h3>
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
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </>
            )}
          </button>
        </header>

        <label className="block text-xs font-medium text-slate-300">
          Roadmap Title <span className="text-rose-400">*</span>
          <input
            type="text"
            required
            disabled={isBusy}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </label>

        <label className="block text-xs font-medium text-slate-300">
          Description
          <textarea
            rows={2}
            disabled={isBusy}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium text-slate-300">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Weekly Target (1–168h)
            </span>
            <input
              type="number"
              min={1}
              max={168}
              required
              disabled={isBusy}
              value={weeklyStudyTargetHours}
              onChange={(e) => {
                const val = Number(e.target.value);
                setWeeklyStudyTargetHours(val > 168 ? 168 : val);
              }}
              className="mt-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </label>

          <label className="block text-xs font-medium text-slate-300">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Target Finish Date
            </span>
            <input
              type="date"
              required
              disabled={isBusy}
              value={targetFinishDate}
              onChange={(e) => setTargetFinishDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </label>
        </div>

        <footer className="flex justify-end gap-3 pt-2">
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
