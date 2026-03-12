"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SolutionGrid } from "@/components/solutions/solution-grid";
import { SolutionFilters } from "@/components/solutions/solution-filters";
import { SolutionSearch } from "@/components/solutions/solution-search";
import { Button } from "@/components/ui/button";
import { SORT_OPTIONS } from "@/lib/constants";
import type { SolutionWithTags } from "@/types";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [solutions, setSolutions] = useState<SolutionWithTags[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSort = searchParams.get("sort") || "mau_desc";

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/solutions?${searchParams.toString()}`);
      const data = await res.json();
      setSolutions(data.solutions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setLastSyncedAt(data.lastSyncedAt);
    } catch (err) {
      console.error("Failed to fetch solutions:", err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`/browse?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-xl">explore</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Browse AI Solutions</h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-500">
                  Discover and explore {total} AI solutions across the company
                </p>
                {lastSyncedAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                    Synced from Jira {formatTimeAgo(lastSyncedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 card-static p-5 custom-scrollbar">
              <SolutionFilters />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-5">
            {/* Search + Sort */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <SolutionSearch />
              </div>
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="h-11 px-4 pr-10 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">
                  unfold_more
                </span>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card-static h-52 animate-pulse bg-slate-50" />
                ))}
              </div>
            ) : (
              <>
                <SolutionGrid solutions={solutions} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-[16px] mr-1">chevron_left</span>
                      Previous
                    </Button>
                    <span className="text-sm text-slate-500 px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                    >
                      Next
                      <span className="material-symbols-outlined text-[16px] ml-1">chevron_right</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-[1440px] mx-auto px-6 py-8 text-slate-500">Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
