"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Upload, BookOpen } from "lucide-react";
import RoadmapCard from "@/components/roadmaps/RoadmapCard";
import CreateRoadmapModal from "@/components/roadmaps/CreateRoadmapModal";
import ImportJsonModal from "@/components/roadmaps/ImportJsonModal";

export default function RoadmapsPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchData = async () => {
    try {
      const [rmRes, topRes] = await Promise.all([
        fetch("/api/roadmaps"),
        fetch("/api/topics"),
      ]);
      const [rmData, topData] = await Promise.all([rmRes.json(), topRes.json()]);
      setRoadmaps(Array.isArray(rmData) ? rmData : []);
      setTopics(Array.isArray(topData) ? topData : []);
    } catch (err) {
      console.error("Failed to fetch roadmaps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <main className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Learning Roadmaps</h1>
            <p className="text-slate-400 text-sm">
              Create structured learning paths manually or import raw JSON roadmaps in one click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm font-semibold transition cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Import JSON
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Roadmap
            </button>
          </div>
        </header>

        {loading ? (
          <p className="text-slate-400 animate-pulse">Loading roadmaps...</p>
        ) : roadmaps.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-indigo-400 mx-auto" />
            <h2 className="text-lg font-semibold">No roadmaps yet</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Start by creating a custom roadmap or uploading a JSON file (like from roadmap.sh) to
              auto-populate your topics and subtopics.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap._id} roadmap={roadmap} topics={topics} />
            ))}
          </section>
        )}
      </main>

      {showManualModal && (
        <CreateRoadmapModal
          onClose={() => setShowManualModal(false)}
          onSuccess={fetchData}
        />
      )}

      {showImportModal && (
        <ImportJsonModal
          onClose={() => setShowImportModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
