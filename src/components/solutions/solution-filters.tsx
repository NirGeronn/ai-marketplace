"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEPARTMENTS, SOLUTION_TYPES, SOLUTION_STATUSES } from "@/lib/constants";

export function SolutionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getSelected = useCallback(
    (param: string): string[] => {
      return searchParams.get(param)?.split(",").filter(Boolean) || [];
    },
    [searchParams]
  );

  const toggleFilter = useCallback(
    (param: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.get(param)?.split(",").filter(Boolean) || [];

      if (current.includes(value)) {
        const next = current.filter((v) => v !== value);
        if (next.length === 0) {
          params.delete(param);
        } else {
          params.set(param, next.join(","));
        }
      } else {
        params.set(param, [...current, value].join(","));
      }

      params.set("page", "1");
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAll = useCallback(() => {
    router.push("/browse");
  }, [router]);

  const hasFilters =
    getSelected("type").length > 0 ||
    getSelected("status").length > 0 ||
    getSelected("department").length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Filters</label>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories (Type) */}
      <section>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Categories</label>
        <div className="flex flex-wrap gap-2">
          {SOLUTION_TYPES.map((type) => {
            const isActive = getSelected("type").includes(type.value);
            return (
              <button
                key={type.value}
                onClick={() => toggleFilter("type", type.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Status */}
      <section>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Status</label>
        <ul className="space-y-3">
          {SOLUTION_STATUSES.map((status) => {
            const isActive = getSelected("status").includes(status.value);
            return (
              <li key={status.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleFilter("status", status.value)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3 cursor-pointer"
                  id={`status-${status.value}`}
                />
                <label htmlFor={`status-${status.value}`} className="text-sm text-slate-600 cursor-pointer">
                  {status.label}
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Department */}
      <section>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Department</label>
        <ul className="space-y-3">
          {DEPARTMENTS.map((dept) => {
            const isActive = getSelected("department").includes(dept);
            return (
              <li key={dept} className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => toggleFilter("department", dept)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3 cursor-pointer"
                  id={`dept-${dept}`}
                />
                <label htmlFor={`dept-${dept}`} className="text-sm text-slate-600 cursor-pointer">
                  {dept}
                </label>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
