"use client";

import { useCallback, useEffect, useState } from "react";

export function useInfiniteList<T extends { _id: string }>(
  buildUrl: (page: number) => string,
  deps: any[] = []
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (targetPage: number, replace = false) => {
      if (targetPage === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await fetch(buildUrl(targetPage));
        const data = await res.json();
        const incoming: T[] = Array.isArray(data.items) ? data.items : [];

        setItems((prev) => {
          if (replace) return incoming;
          const existingIds = new Set(prev.map((i) => i._id));
          return [...prev, ...incoming.filter((i) => !existingIds.has(i._id))];
        });

        setHasMore(Boolean(data.hasMore));
        setPage(targetPage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(() => {
    fetchPage(1, true);
  }, [fetchPage]);

  const loadNextPage = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchPage(page + 1, false);
    }
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  const refresh = useCallback(() => fetchPage(1, true), [fetchPage]);

  return { items, loading, loadingMore, hasMore, loadNextPage, refresh };
}
