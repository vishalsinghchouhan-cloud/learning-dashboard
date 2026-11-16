"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface StudyHoursChartProps {
  roadmaps: any[];
  topics: any[];
  studyLogs: any[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload.at(0)?.payload;
  if (!data) return null;

  const pct =
    data.Expected > 0 ? Math.min(100, Math.round((data.Consumed / data.Expected) * 100)) : 0;

  return (
    <div className="bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl min-w-[220px] space-y-2">
      <div>
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 mb-1">
          {data.roadmapTitle}
        </span>
        <p className="text-sm font-bold text-white leading-snug">{data.fullTitle}</p>
      </div>

      <div className="space-y-1 pt-1 border-t border-slate-800 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />
            Expected:
          </span>
          <span className="font-semibold text-slate-200">{data.Expected} hrs</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-indigo-500 to-cyan-400 inline-block" />
            Consumed:
          </span>
          <span className="font-bold text-cyan-300">{data.Consumed} hrs</span>
        </div>
      </div>

      <div className="pt-1">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
          <span>Time Progress</span>
          <span className="text-emerald-400 font-semibold">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function CustomXAxisTick({ x, y, payload, chartData, showRoadmapTag }: any) {
  const item = chartData.find((d: any) => d.uniqueKey === payload.value);
  if (!item) return null;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight={500}>
        {item.shortName}
      </text>
      {showRoadmapTag && (
        <text x={0} y={0} dy={28} textAnchor="middle" fill="#818cf8" fontSize={10}>
          {item.shortRoadmap}
        </text>
      )}
    </g>
  );
}

export default function StudyHoursChart({
  roadmaps,
  topics,
  studyLogs,
}: StudyHoursChartProps) {
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>("ALL");

  const filteredTopics =
    selectedRoadmap === "ALL"
      ? topics
      : topics.filter((t) => String(t.roadmapId) === String(selectedRoadmap));

  // Include ALL topics (removed the 8-item slice limit)
  const chartData = filteredTopics.map((topic) => {
    const topicMinutes = studyLogs
      .filter((l) => String(l.topicId?._id || l.topicId) === String(topic._id))
      .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

    const parentRoadmap = roadmaps.find((r) => String(r._id) === String(topic.roadmapId));
    const rmTitle = parentRoadmap?.title || "Roadmap";

    return {
      uniqueKey: topic._id,
      shortName: topic.title.length > 13 ? topic.title.slice(0, 13) + "…" : topic.title,
      shortRoadmap: rmTitle.length > 14 ? rmTitle.slice(0, 14) + "…" : rmTitle,
      fullTitle: topic.title,
      roadmapTitle: rmTitle,
      Expected: topic.estimatedHours || 0,
      Consumed: +(topicMinutes / 60).toFixed(1),
    };
  });

  const showRoadmapTag = selectedRoadmap === "ALL";
  const dynamicMinWidth = chartData.length > 7 ? `${chartData.length * 95}px` : "100%";

  return (
    <article className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Expected vs. Consumed Study Hours
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {showRoadmapTag
              ? `Showing all ${chartData.length} topics across ${roadmaps.length} roadmaps`
              : `Showing ${chartData.length} topics in selected roadmap`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" /> Expected
            </span>
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-tr from-indigo-500 to-cyan-400" />
              Consumed
            </span>
          </div>

          {roadmaps.length > 0 && (
            <select
              value={selectedRoadmap}
              onChange={(e) => setSelectedRoadmap(e.target.value)}
              className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Roadmaps ({roadmaps.length})</option>
              {roadmaps.map((rm) => (
                <option key={rm._id} value={rm._id}>
                  {rm.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      {chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm border border-dashed border-slate-800 rounded-lg">
          <p>No topics found for this selection.</p>
          <Link href="/roadmaps" className="text-indigo-400 hover:underline mt-2">
            Create or import a roadmap to see your chart →
          </Link>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-2">
          <div className="h-80" style={{ minWidth: dynamicMinWidth }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                barGap={6}
                barCategoryGap="22%"
                margin={{ bottom: showRoadmapTag ? 22 : 8 }}
              >
                <defs>
                  <linearGradient id="consumedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#475569" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity={0.85} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="uniqueKey"
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: "#1e293b" }}
                  tick={<CustomXAxisTick chartData={chartData} showRoadmapTag={showRoadmapTag} />}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  unit="h"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(99, 102, 241, 0.08)", radius: 8 }}
                />
                <Bar
                  dataKey="Expected"
                  fill="url(#expectedGradient)"
                  radius={Array.of(6, 6, 0, 0) as [number, number, number, number]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="Consumed"
                  fill="url(#consumedGradient)"
                  radius={Array.of(6, 6, 0, 0) as [number, number, number, number]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </article>
  );
}
