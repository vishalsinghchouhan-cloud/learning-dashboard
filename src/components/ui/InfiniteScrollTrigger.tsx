"use client";

import React, { useEffect, useRef } from "react";
import { Spinner } from "./Loader";

interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function InfiniteScrollTrigger({
  hasMore,
  loadingMore,
  onLoadMore,
}: InfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.at(0)?.isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  if (!hasMore && !loadingMore) return null;

  return (
    <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2">
      {loadingMore ? (
        <span className="text-xs text-slate-400">
          <Spinner label="Loading more..." size="xs" />
        </span>
      ) : (
        <button
          type="button"
          onClick={onLoadMore}
          className="px-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 cursor-pointer"
        >
          Load More
        </button>
      )}
    </div>
  );
}
