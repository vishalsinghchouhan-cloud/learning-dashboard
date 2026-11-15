"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Clock, BookOpen, Brain, Plus, ArrowRight } from "lucide-react";
import LogStudyModal from "@/components/LogStudyModal";
import ReviewQueue from "@/components/ReviewQueue";
import WeeklyReviewSection from "@/components/WeeklyReviewSection";
import StreakHeatmap from "@/components/StreakHeatmap";
import StudyHoursChart from "@/components/StudyHoursChart";

export default function MainDashboard() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [studyLogs, setStudyLogs] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [sevenDaysAgo, setSevenDaysAgo] = useState<Date | null>(null);


  const fetchDashboardData = async () => {
    try {
      const [rmRes, topRes, logRes, cardRes, perfRes] = await Promise.all([
        fetch("/api/roadmaps"),
        fetch("/api/topics"),
        fetch("/api/study-logs"),
        fetch("/api/flashcards?dueOnly=true"),
        fetch("/api/performance"),
      ]);

      const [rmData, topData, logData, cardData, perfData] = await Promise.all([
        rmRes.json(),
        topRes.json(),
        logRes.json(),
        cardRes.json(),
        perfRes.json(),
      ]);

      setRoadmaps(Array.isArray(rmData) ? rmData : []);
      setTopics(Array.isArray(topData) ? topData : []);
      setStudyLogs(logData.logs || []);
      setStreak(logData.streak || 0);
      setDueCards(Array.isArray(cardData) ? cardData : []);
      setReviews(perfData.reviews || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSevenDaysAgo(new Date(Date.now() - 7 * 86400000));
    fetchDashboardData();
  }, []);

  const weeklyLogs = sevenDaysAgo
  ? studyLogs.filter((l) => new Date(l.date) >= sevenDaysAgo)
  : [];
  const weeklyHoursTotal = +(
    weeklyLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0) / 60
  ).toFixed(1);

  const recentTopicsStudied = Array.from(
    new Set(weeklyLogs.map((l) => l.topicId?.title).filter(Boolean))
  ) as string[];

  const chartData = topics.slice(0, 8).map((topic) => {
    const topicMinutes = studyLogs
      .filter((l) => (l.topicId?._id || l.topicId) === topic._id)
      .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

    return {
      name: topic.title.length > 14 ? topic.title.slice(0, 14) + "…" : topic.title,
      Expected: topic.estimatedHours || 0,
      Consumed: +(topicMinutes / 60).toFixed(1),
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <p className="text-lg animate-pulse">Loading your learning dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <main className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Command Center</h1>
            <p className="text-slate-400 text-sm mt-1">
              Track roadmaps, study hours, spaced repetition, and weekly reflections.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/roadmaps"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
            >
              Manage Roadmaps <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setShowLogModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Study Time
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <span className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
              <Flame className="w-6 h-6" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Study Streak</p>
              <p className="text-2xl font-bold">{streak} Days</p>
            </div>
          </article>

          <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <span className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-6 h-6" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Last 7 Days</p>
              <p className="text-2xl font-bold">{weeklyHoursTotal} hrs</p>
            </div>
          </article>

          <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <span className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Active Roadmaps</p>
              <p className="text-2xl font-bold">{roadmaps.length}</p>
            </div>
          </article>

          <article className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <span className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
              <Brain className="w-6 h-6" />
            </span>
            <div>
              <p className="text-sm text-slate-400">Due for Review</p>
              <p className="text-2xl font-bold">{dueCards.length} Cards</p>
            </div>
          </article>
        </section>
      <StreakHeatmap studyLogs={studyLogs} streak={streak} />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <StudyHoursChart roadmaps={roadmaps} topics={topics} studyLogs={studyLogs} />

          <ReviewQueue
            dueCards={dueCards}
            onReviewed={(id) => setDueCards((prev) => prev.filter((c) => c._id !== id))}
          />
        </section>

        <WeeklyReviewSection
          recentTopicsStudied={recentTopicsStudied}
          reviews={reviews}
          weekStartDate={sevenDaysAgo ?? new Date(0)}
          onSaved={fetchDashboardData}
        />
      </main>

      {showLogModal && (
        <LogStudyModal
          roadmaps={roadmaps}
          topics={topics}
          onClose={() => setShowLogModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
}
