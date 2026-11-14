"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ResourceSection from "./ResourceSection";
import FlashcardSection from "./FlashcardSection";
import QuizScoreSection from "./QuizScoreSection";

export default function TopicWorkspaceClient({ id }: { id: string }) {
  const [topic, setTopic] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkspace = async () => {
    try {
      const [topRes, resRes, cardRes, perfRes] = await Promise.all([
        fetch(`/api/topics/${id}`),
        fetch(`/api/resources?topicId=${id}`),
        fetch(`/api/flashcards?topicId=${id}`),
        fetch("/api/performance"),
      ]);

      const [topData, resData, cardData, perfData] = await Promise.all([
        topRes.json(),
        resRes.json(),
        cardRes.json(),
        perfRes.json(),
      ]);

      setTopic(topData);
      setResources(Array.isArray(resData) ? resData : []);
      setFlashcards(Array.isArray(cardData) ? cardData : []);

      const topicScores = (perfData.scores || []).filter(
        (s: any) => (s.topicId?._id || s.topicId) === id
      );
      setScores(topicScores);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadWorkspace();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        Loading topic workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <main className="max-w-5xl mx-auto space-y-6">
        <header className="border-b border-slate-800 pb-6">
          <Link
            href={topic?.roadmapId ? `/roadmaps/${topic.roadmapId}` : "/roadmaps"}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Roadmap
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{topic?.title || "Topic Workspace"}</h1>
            {topic?.difficulty && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {topic.difficulty}
              </span>
            )}
          </div>
          {topic?.reflection?.learnedTakeaway && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs space-y-1">
              <p className="text-emerald-300">
                <strong>Key Takeaway:</strong> {topic.reflection.learnedTakeaway}
              </p>
              <p className="text-amber-300">
                <strong>Struggled With:</strong> {topic.reflection.struggledWith}
              </p>
            </div>
          )}
        </header>

        <ResourceSection topicId={id} resources={resources} onAdded={loadWorkspace} />
        <FlashcardSection topicId={id} flashcards={flashcards} onAdded={loadWorkspace} />
        {topic?.roadmapId && (
          <QuizScoreSection
            roadmapId={topic.roadmapId}
            topicId={id}
            scores={scores}
            onAdded={loadWorkspace}
          />
        )}
      </main>
    </div>
  );
}
