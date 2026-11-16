"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Upload, BookOpen, Search } from "lucide-react";
import RoadmapCard from "@/components/roadmaps/RoadmapCard";
import CreateRoadmapModal from "@/components/roadmaps/CreateRoadmapModal";
import ImportJsonModal from "@/components/roadmaps/ImportJsonModal";
import InfiniteScrollTrigger from "@/components/ui/InfiniteScrollTrigger";
import { useInfiniteList } from "@/hooks/useInfiniteList";

export default function RoadmapsPage() {
  const [search, setSearch] = useState("");
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const {
    items: roadmaps,
    loading,
    loadingMore,
    hasMore,
    loadNextPage,
    refresh,
  } = useInfiniteList<any>(
    (p) => `/api/roadmaps?page=${p}&limit=9&search=${encodeURIComponent(search)}`,
    [search]
  );

  const fetchTopicsForProgress = async () => {
    const res = await fetch("/api/topics");
    const data = await res.json();
    setAllTopics(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchTopicsForProgress();
  }, []);

  const handleRefreshAll = () => {
    refresh();
    fetchTopicsForProgress();
  };

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

          <div className="flex items-center gap-3 flex-wrap">
            <label className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roadmaps..."
                className="pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 text-sm text-white focus:outline-none"
              />
            </label>

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
            <h2 className="text-lg font-semibold">No roadmaps found</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {search
                ? "Try clearing your search filter."
                : "Start by creating a custom roadmap or uploading a JSON file."}
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <RoadmapCard key={roadmap._id} roadmap={roadmap} topics={allTopics} />
              ))}
            </section>

            <InfiniteScrollTrigger
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadNextPage}
            />
          </>
        )}
      </main>

      {showManualModal && (
        <CreateRoadmapModal
          onClose={() => setShowManualModal(false)}
          onSuccess={handleRefreshAll}
        />
      )}

      {showImportModal && (
        <ImportJsonModal
          onClose={() => setShowImportModal(false)}
          onSuccess={handleRefreshAll}
        />
      )}
    </div>
  );
}
