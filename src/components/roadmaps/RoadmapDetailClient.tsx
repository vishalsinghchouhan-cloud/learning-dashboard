"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import TopicItemCard from "./TopicItemCard";
import AddTopicModal from "./AddTopicModal";
import { Pencil } from "lucide-react";
import EditRoadmapModal from "./EditRoadmapModal";

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"] as const;

export default function RoadmapDetailClient({ id }: { id: string }) {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditRoadmap, setShowEditRoadmap] = useState(false);

  const loadRoadmapDetails = async () => {
    try {
      const [rmRes, topRes, logRes] = await Promise.all([
        fetch("/api/roadmaps"),
        fetch(`/api/topics?roadmapId=${id}`),
        fetch(`/api/study-logs?roadmapId=${id}`),
      ]);

      const [rmList, topList, logData] = await Promise.all([
        rmRes.json(),
        topRes.json(),
        logRes.json(),
      ]);

      setRoadmap(Array.isArray(rmList) ? rmList.find((r) => r._id === id) : null);
      setTopics(Array.isArray(topList) ? topList : []);
      setLogs(logData.logs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadRoadmapDetails();
  }, [id]);

  const visibleTopics =
    filter === "All" ? topics : topics.filter((t) => t.difficulty === filter);

  const getLoggedMinutes = (topicId: string) =>
    logs
      .filter((l) => (l.topicId?._id || l.topicId) === topicId)
      .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        Loading roadmap...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <main className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/roadmaps"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Roadmaps
            </Link>
            <h1 className="text-3xl font-bold">{roadmap?.title || "Roadmap Details"}</h1>
            {roadmap?.description && (
              <p className="text-sm text-slate-400 mt-1">{roadmap.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {roadmap && (
              <button
                onClick={() => setShowEditRoadmap(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 cursor-pointer"
              >
                <Pencil className="w-4 h-4" /> Edit Roadmap
              </button>
            )}
            <button
              onClick={() => setShowAddTopic(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Topic
            </button>
          </div>

        </header>

        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${filter === level
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
            >
              {level}
            </button>
          ))}
        </div>

        {visibleTopics.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-10 text-center text-sm text-slate-400">
            No topics match this filter yet.
          </div>
        ) : (
          <section className="space-y-4">
            {visibleTopics.map((topic) => (
              <TopicItemCard
                key={topic._id}
                topic={topic}
                loggedMinutes={getLoggedMinutes(topic._id)}
                onUpdated={loadRoadmapDetails}
              />
            ))}
          </section>
        )}
      </main>

      {showAddTopic && (
        <AddTopicModal
          roadmapId={id}
          onClose={() => setShowAddTopic(false)}
          onSuccess={loadRoadmapDetails}
        />
      )}
      {showEditRoadmap && roadmap && 
      <EditRoadmapModal 
        roadmap={roadmap} 
        onClose={() => setShowEditRoadmap(false)} 
        onSuccess={loadRoadmapDetails} 
      />}
    </div>
  );
}
