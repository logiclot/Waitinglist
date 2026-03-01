import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "@/hooks/usePagination";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate an array of N numbers: [1, 2, ..., N] */
function makeItems(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i + 1);
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("usePagination", () => {
  it("returns all items when fewer than pageSize", () => {
    const { result } = renderHook(() => usePagination(makeItems(5), 10));

    expect(result.current.items).toEqual([1, 2, 3, 4, 5]);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(5);
  });

  it("paginates correctly with 25 items and pageSize 10", () => {
    const { result } = renderHook(() => usePagination(makeItems(25), 10));

    // Page 1: items 1-10
    expect(result.current.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalItems).toBe(25);
  });

  it("nextPage advances to next page", () => {
    const { result } = renderHook(() => usePagination(makeItems(25), 10));

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe(2);
    expect(result.current.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("prevPage goes back to previous page", () => {
    const { result } = renderHook(() => usePagination(makeItems(25), 10));

    // Go to page 2 first
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.page).toBe(2);

    // Go back to page 1
    act(() => {
      result.current.prevPage();
    });
    expect(result.current.page).toBe(1);
    expect(result.current.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("prevPage on page 1 stays at page 1", () => {
    const { result } = renderHook(() => usePagination(makeItems(25), 10));

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(1);
  });

  it("nextPage on last page stays on last page", () => {
    const { result } = renderHook(() => usePagination(makeItems(25), 10));

    // Navigate to last page (page 3)
    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.page).toBe(3);

    // Try to go beyond last page
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.page).toBe(3);
  });

  it("totalPages calculates correctly", () => {
    // 20 items / 10 per page = 2 pages
    const { result: r1 } = renderHook(() => usePagination(makeItems(20), 10));
    expect(r1.current.totalPages).toBe(2);

    // 21 items / 10 per page = 3 pages
    const { result: r2 } = renderHook(() => usePagination(makeItems(21), 10));
    expect(r2.current.totalPages).toBe(3);

    // 1 item / 10 per page = 1 page
    const { result: r3 } = renderHook(() => usePagination(makeItems(1), 10));
    expect(r3.current.totalPages).toBe(1);

    // 10 items / 10 per page = 1 page
    const { result: r4 } = renderHook(() => usePagination(makeItems(10), 10));
    expect(r4.current.totalPages).toBe(1);
  });

  it("empty array returns page 1 with no items", () => {
    const { result } = renderHook(() => usePagination([], 10));

    expect(result.current.items).toEqual([]);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(0);
  });

  it("setPage to specific page works", () => {
    const { result } = renderHook(() => usePagination(makeItems(30), 10));

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.page).toBe(3);
    expect(result.current.items).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
  });

  it("page auto-corrects if set beyond totalPages", () => {
    const { result } = renderHook(() => usePagination(makeItems(25), 10));

    // totalPages is 3, set page to 10
    act(() => {
      result.current.setPage(10);
    });

    // safeCurrentPage should clamp to totalPages (3)
    expect(result.current.page).toBe(3);
    expect(result.current.items).toEqual([21, 22, 23, 24, 25]);
  });

  it("uses default pageSize of 20", () => {
    const { result } = renderHook(() => usePagination(makeItems(50)));

    expect(result.current.items).toHaveLength(20);
    expect(result.current.totalPages).toBe(3);
  });

  it("exposes search and setSearch", () => {
    const { result } = renderHook(() => usePagination(makeItems(10), 5));

    expect(result.current.search).toBe("");

    act(() => {
      result.current.setSearch("test query");
    });

    expect(result.current.search).toBe("test query");
  });
});
