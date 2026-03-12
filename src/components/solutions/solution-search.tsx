"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SolutionSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") || "");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams, value]
  );

  return (
    <form onSubmit={handleSearch} className="w-full relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
        search
      </span>
      <input
        type="search"
        placeholder='Search solutions... (e.g., "reduce churn", "fraud detection")'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
      />
    </form>
  );
}
