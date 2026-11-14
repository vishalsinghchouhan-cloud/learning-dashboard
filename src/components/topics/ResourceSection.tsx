"use client";

import React, { useState } from "react";
import { Plus, ExternalLink, Video, FileText, BookOpen, File } from "lucide-react";

interface ResourceSectionProps {
  topicId: string;
  resources: any[];
  onAdded: () => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Video: <Video className="w-4 h-4 text-rose-400" />,
  Article: <FileText className="w-4 h-4 text-sky-400" />,
  PDF: <File className="w-4 h-4 text-amber-400" />,
  Docs: <BookOpen className="w-4 h-4 text-emerald-400" />,
};

// Helper: Extract YouTube thumbnail URL without needing an API key
function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
  return match ? `https://youtube.com{match}/mqdefault.jpg` : null;
}

export default function ResourceSection({ topicId, resources, onAdded }: ResourceSectionProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"Video" | "Article" | "PDF" | "Docs">("Article");
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setSaving(true);

    try {
      await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, title: title.trim(), url: url.trim(), type }),
      });
      setTitle("");
      setUrl("");
      onAdded();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
      <header>
        <h2 className="text-lg font-semibold text-white">Topic Resource Library</h2>
        <p className="text-xs text-slate-400">
          Save helpful tutorials, documentation, articles, and PDFs for this topic.
        </p>
      </header>

      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resource title (e.g., Official Docs)"
          className="sm:col-span-4 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="sm:col-span-4 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="sm:col-span-2 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        >
          <option value="Article">Article</option>
          <option value="Video">Video</option>
          <option value="Docs">Docs</option>
          <option value="PDF">PDF</option>
        </select>
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white py-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>

      {resources.length === 0 ? (
        <p className="text-sm text-slate-500 border border-dashed border-slate-800 rounded-lg p-6 text-center">
          No resources saved for this topic yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => {
            const thumb = res.type === "Video" ? getYoutubeThumbnail(res.url) : null;
            return (
              <a
                key={res._id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl overflow-hidden flex flex-col justify-between transition"
              >
                {thumb && (
                  <img src={thumb} alt={res.title} className="w-full h-32 object-cover" />
                )}
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {TYPE_ICONS[res.type] || TYPE_ICONS.Article}
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                        {res.title}
                      </p>
                      <p className="text-[11px] text-slate-500">{res.type}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
