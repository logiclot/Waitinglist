"use client";

import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safeCurrentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safeCurrentPage, pageSize]);

  return {
    items: paginatedItems,
    page: safeCurrentPage,
    totalPages,
    totalItems: items.length,
    setPage,
    search,
    setSearch,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
