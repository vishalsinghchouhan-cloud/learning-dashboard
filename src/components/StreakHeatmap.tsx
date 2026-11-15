"use client";

import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";

interface DayCell {
  iso: string;
  label: string;
  mins: number;
}

export default function StreakHeatmap({
  studyLogs,
  streak,
}: {
  studyLogs: any[];
  streak: number;
}) {
  const [days, setDays] = useState<DayCell[]>([]);

  useEffect(() => {
    const now = Date.now();
    const computed = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now - (13 - i) * 86400000);
      const iso = d.toISOString().split("T")[0];
      const mins = studyLogs
        .filter((l) => new Date(l.date).toISOString().split("T")[0] === iso)
        .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

      return {
        iso,
        label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        mins,
      };
    });
    setDays(computed);
  }, [studyLogs]);

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400">
          <Flame className="w-5 h-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">
            14-Day Consistency Tracker ({streak}-Day Streak)
          </h3>
          <p className="text-xs text-slate-400">
            Hover over any box to see the date and total minutes studied.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {days.map((day) => (
          <div key={day.iso} className="flex flex-col items-center gap-1">
            <div
              title={`${day.iso}: ${day.mins} mins`}
              className={`w-6 h-6 rounded-md border transition ${
                day.mins >= 60
                  ? "bg-emerald-500 border-emerald-400"
                  : day.mins > 0
                  ? "bg-emerald-500/40 border-emerald-500/50"
                  : "bg-slate-950 border-slate-800"
              }`}
            />
            <span className="text-[10px] text-slate-500">{day.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
