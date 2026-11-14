"use client";

import React, { useState } from "react";
import { Plus, Award } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface QuizScoreSectionProps {
  roadmapId: string;
  topicId: string;
  scores: any[];
  onAdded: () => void;
}

export default function QuizScoreSection({
  roadmapId,
  topicId,
  scores,
  onAdded,
}: QuizScoreSectionProps) {
  const [testName, setTestName] = useState("");
  const [score, setScore] = useState(8);
  const [totalMarks, setTotalMarks] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleLogScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim() || totalMarks <= 0) return;
    setSaving(true);

    try {
      await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryType: "quiz",
          roadmapId,
          topicId,
          testName: testName.trim(),
          score: Number(score),
          totalMarks: Number(totalMarks),
        }),
      });
      setTestName("");
      onAdded();
    } finally {
      setSaving(false);
    }
  };

  const chartData = scores.map((s) => ({
    name: s.testName,
    Percentage: Math.round((s.score / s.totalMarks) * 100),
  }));

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Quiz & Practice Scores
        </h2>
        <p className="text-xs text-slate-400">
          Log practice tests or coding challenge scores to track mastery over time.
        </p>
      </header>

      <form onSubmit={handleLogScore} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <input
          type="text"
          required
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="Test name (e.g., Hooks Practice Quiz)"
          className="sm:col-span-6 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <input
          type="number"
          min={0}
          required
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          placeholder="Score"
          className="sm:col-span-2 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <input
          type="number"
          min={1}
          required
          value={totalMarks}
          onChange={(e) => setTotalMarks(Number(e.target.value))}
          placeholder="Total"
          className="sm:col-span-2 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-sm font-semibold text-white py-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log Score
        </button>
      </form>

      {chartData.length > 0 && (
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="Percentage"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
