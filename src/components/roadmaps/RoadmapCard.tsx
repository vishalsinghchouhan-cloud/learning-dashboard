import React from "react";
import Link from "next/link";
import { Calendar, Clock, FileJson, PenTool, ArrowRight } from "lucide-react";

interface RoadmapCardProps {
  roadmap: any;
  topics: any[];
}

export default function RoadmapCard({ roadmap, topics }: RoadmapCardProps) {
  const roadmapTopics = topics.filter((t) => t.roadmapId === roadmap._id);
  const completedCount = roadmapTopics.filter((t) => t.status === "Completed").length;
  const totalCount = roadmapTopics.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isJson = roadmap.source === "json_import";

  return (
    <article className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-6 flex flex-col justify-between transition">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              isJson
                ? "bg-purple-500/10 text-purple-300"
                : "bg-indigo-500/10 text-indigo-300"
            }`}
          >
            {isJson ? <FileJson className="w-3.5 h-3.5" /> : <PenTool className="w-3.5 h-3.5" />}
            {isJson ? "JSON Import" : "Manual"}
          </span>

          <span className="text-xs text-slate-400">
            {completedCount}/{totalCount} Topics
          </span>
        </div>

        <h2 className="text-xl font-semibold text-white">{roadmap.title}</h2>
        {roadmap.description && (
          <p className="text-sm text-slate-400 line-clamp-2">{roadmap.description}</p>
        )}

        <div className="pt-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {roadmap.weeklyStudyTargetHours}h/wk
          </span>
          {roadmap.targetFinishDate && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(roadmap.targetFinishDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <Link
          href={`/roadmaps/${roadmap._id}`}
          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
        >
          Open <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
