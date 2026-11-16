"use client";

import React, { useState } from "react";
import {
  Plus,
  ExternalLink,
  Video,
  FileText,
  BookOpen,
  File,
  PlayCircle,
  Globe,
} from "lucide-react";
import { Spinner } from "@/components/ui/Loader";

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

function extractYoutubeId(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.replace(/^(www\.|m\.)/, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean).at(0);
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com") {
      // Standard ?v=VIDEO_ID
      const vParam = parsed.searchParams.get("v");
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;

      // /shorts/ID, /embed/ID, /live/ID
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && ["shorts", "embed", "live", "v"].includes(parts.at(0) || "")) {
        const id = parts.at(1);
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    // Fallback regex if URL constructor fails
  }

  const fallback = rawUrl.match(/([a-zA-Z0-9_-]{11})/);
  return fallback?.at(1) ?? null;
}


function getYoutubeThumbnail(url: string): string | null {
  const videoId = extractYoutubeId(url);
  return videoId ? `/api/youtube-thumb?v=${videoId}` : null;
}

function getDomainLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "External Link";
  }
}

export default function ResourceSection({ topicId, resources, onAdded }: ResourceSectionProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"Video" | "Article" | "PDF" | "Docs">("Article");
  const [saving, setSaving] = useState(false);
  const [failedThumbs, setFailedThumbs] = useState<Record<string, boolean>>({});

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (extractYoutubeId(newUrl)) {
      setType("Video");
    }
  };

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
          disabled={saving}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resource title (e.g., Official Docs)"
          className="sm:col-span-4 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <input
          type="url"
          required
          disabled={saving}
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://..."
          className="sm:col-span-4 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm text-white"
        />
        <select
          disabled={saving}
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
          className="sm:col-span-2 inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white py-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <Spinner label="Adding..." size="xs" />
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add
            </>
          )}
        </button>
      </form>

      {resources.length === 0 ? (
        <p className="text-sm text-slate-500 border border-dashed border-slate-800 rounded-lg p-6 text-center">
          No resources saved for this topic yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => {
            const thumb = !failedThumbs[res._id] ? getYoutubeThumbnail(res.url) : null;
            const domain = getDomainLabel(res.url);

            return (
              <a
                key={res._id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl overflow-hidden flex flex-col justify-between transition"
              >
                                {thumb ? (
                  <div className="relative">
                    <img
                      src={thumb}
                      alt={res.title}
                      onError={() =>
                        setFailedThumbs((prev) => ({ ...prev, [res._id]: true }))
                      }
                      className="w-full h-36 object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                      <PlayCircle className="w-3 h-3 text-rose-500" /> YouTube
                    </span>
                  </div>
                ) : res.type === "Video" ? (
                  <div className="h-36 w-full bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 flex flex-col items-center justify-center gap-2 border-b border-slate-800/80 px-4 text-center">
                    <div className="p-2.5 rounded-full bg-rose-500/15 border border-rose-500/30 group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-7 h-7 text-rose-400" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">
                      Watch on {domain}
                    </span>
                  </div>
                ) : null}


                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {TYPE_ICONS[res.type] || TYPE_ICONS.Article}
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                        {res.title}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <span>{res.type}</span>
                        <span>&bull;</span>
                        <Globe className="w-2.5 h-2.5 inline shrink-0" />
                        <span className="truncate">{domain}</span>
                      </p>
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
