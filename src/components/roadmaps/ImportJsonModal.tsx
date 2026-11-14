"use client";

import React, { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";

interface ImportJsonModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportJsonModal({ onClose, onSuccess }: ImportJsonModalProps) {
  const [fileName, setFileName] = useState("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [weeklyStudyTargetHours, setWeeklyStudyTargetHours] = useState(10);
  const [targetFinishDate, setTargetFinishDate] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(String(event.target?.result));
        setParsedJson(json);
      } catch {
        setError("Invalid JSON file. Please upload a valid .json file.");
        setParsedJson(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedJson) {
      setError("Please select a valid JSON file first.");
      return;
    }

    setImporting(true);
    setError("");

    try {
      const res = await fetch("/api/roadmaps/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonData: parsedJson,
          fileName,
          weeklyStudyTargetHours: Number(weeklyStudyTargetHours),
          targetFinishDate: targetFinishDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to import roadmap.");
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Network error while importing JSON.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleImport}
        className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-white">Smart JSON Roadmap Import</h3>
        <p className="text-xs text-slate-400">
          Upload any <code className="text-indigo-300">roadmap.sh</code> JSON or nested topic tree.
          Difficulty levels and estimated hours are assigned automatically.
        </p>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 cursor-pointer transition bg-slate-950">
          <Upload className="w-7 h-7 text-indigo-400 mb-2" />
          <span className="text-sm font-medium text-slate-200">
            {fileName || "Click to choose a .json file"}
          </span>
          <span className="text-xs text-slate-500 mt-1">Supports roadmap.sh & generic trees</span>
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </label>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-slate-400">
            Weekly Target (Hours)
            <input
              type="number"
              min={1}
              value={weeklyStudyTargetHours}
              onChange={(e) => setWeeklyStudyTargetHours(Number(e.target.value))}
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
            />
          </label>

          <label className="block text-xs text-slate-400">
            Target Finish Date
            <input
              type="date"
              value={targetFinishDate}
              onChange={(e) => setTargetFinishDate(e.target.value)}
              className="mt-1 w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-sm text-white"
            />
          </label>
        </div>

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
            disabled={importing || !parsedJson}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            {importing ? "Importing..." : "Import Roadmap"}
          </button>
        </div>
      </form>
    </div>
  );
}
